// Celo Uniswap V3 out-of-range LP monitor
// Read-only. Enumerates each watched address's open positions, compares the
// pool's live tick against the position band, and reports which are out of range.
// Emits a JSON report on stdout and maintains state.json to detect transitions.

import { ethers } from "ethers";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dir, "state.json");
const STATUS_MD = join(__dir, "status.md");
const ALERTS_LOG = join(__dir, "alerts.log");
const RUN_LOG = join(__dir, "run.log");
const ALLOWLIST_FILE = join(__dir, "pools_allowlist.json");
const POOL_HEALTH_FILE = join(__dir, "pool_health.json");
const SLACK_PAYLOAD = join(__dir, "slack_payload.json");

// A position's distance past its range edge only means something relative to how
// wide that range is: our ranges span 0.06% to 422%, so a fixed % is simultaneously
// too tight for one and too loose for another. Both thresholds are fractions of the
// position's own width.

// The cron runs hourly, but publishing is deliberately rare: one scheduled digest
// a day, plus an out-of-band update whenever a flag appears or clears. Every other
// run checks and stays silent, leaving status.md untouched so CI sees no diff.
const DIGEST_UTC_HOUR = Number(process.env.DIGEST_UTC_HOUR ?? 11);

const log = (file, line) => { try { appendFileSync(file, line + "\n"); } catch {} };

// Pools worth monitoring: those with internal TVL >= threshold, sourced from the
// Dune query and stored in pools_allowlist.json. Positions in any other pool are
// dust and skipped. Fail-OPEN: if the file is missing/empty, track everything
// (better to over-alert than silently go dark).
function loadAllowlist() {
  try {
    const a = JSON.parse(readFileSync(ALLOWLIST_FILE, "utf8"));
    const pools = new Set(Object.keys(a.pools || {}).map(x => x.toLowerCase()));
    return { pools, thresholdUsd: a.thresholdUsd ?? null, active: pools.size > 0, generatedAt: a.generatedAt ?? null };
  } catch {
    return { pools: new Set(), thresholdUsd: null, active: false, generatedAt: null };
  }
}

const RPC = "https://forno.celo.org";
const NFPM = "0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A";
const FACTORY = "0xAfE208a311B21f13EF87E33A90049fC17A7acDEc";

const WATCHED = [
  ["0x36139e359EAC2b1B2b49B3Dc74161F1814DC0B92", "APF"],
  ["0x87647780180b8f55980c7d3ffefe08a9b29e9ae1", "mento"],
  ["0x470787a48c0325d7ccefd6207fa32128c6d4f1ef", "CCC"],
  ["0x9d7bc0ed7e53c9d8bddac8ce7dff77aba54022d5", "Credit Collective 2"],
  ["0x5f411351e6566409f9b0b8d03873846e0c7201b3", "Credit Collective"],
  ["0x9c257bdc314dc516e673728d70f45444f6e22412", "stabila"],
  ["0xd3d2e5c5af667da817b2d752d86c8f40c22137e1", "Mento 2"],
];

const provider = new ethers.JsonRpcProvider(RPC, 42220);
const nfpm = new ethers.Contract(NFPM, [
  "function balanceOf(address) view returns (uint256)",
  "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
  "function positions(uint256) view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 f0,uint256 f1,uint128 owed0,uint128 owed1)",
], provider);
const factory = new ethers.Contract(FACTORY, [
  "function getPool(address,address,uint24) view returns (address)",
], provider);
const POOL_ABI = ["function slot0() view returns (uint160 sqrtPriceX96,int24 tick,uint16 oi,uint16 oc,uint16 ocn,uint8 fp,bool unlocked)"];
const ERC20_ABI = ["function symbol() view returns (string)"];

// --- tiny caches so shared pools/tokens are fetched once ---
const symCache = new Map();
const poolAddrCache = new Map();
const tickCache = new Map();

async function retry(fn, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; await new Promise(r => setTimeout(r, 300 * (i + 1))); }
  }
  throw last;
}

async function symbol(addr) {
  const key = addr.toLowerCase();
  if (symCache.has(key)) return symCache.get(key);
  let s;
  try { s = await retry(() => new ethers.Contract(addr, ERC20_ABI, provider).symbol()); }
  catch { s = addr.slice(0, 6); }
  symCache.set(key, s);
  return s;
}
async function getPool(t0, t1, fee) {
  const key = `${t0.toLowerCase()}-${t1.toLowerCase()}-${fee}`;
  if (poolAddrCache.has(key)) return poolAddrCache.get(key);
  const a = await retry(() => factory.getPool(t0, t1, fee));
  poolAddrCache.set(key, a);
  return a;
}
async function poolTick(pool) {
  const key = pool.toLowerCase();
  if (tickCache.has(key)) return tickCache.get(key);
  const s = await retry(() => new ethers.Contract(pool, POOL_ABI, provider).slot0());
  const t = Number(s.tick);
  tickCache.set(key, t);
  return t;
}

// Convert a tick gap to an approximate % price gap (1.0001^ticks).
const pct = (ticks) => (Math.pow(1.0001, Math.abs(ticks)) - 1) * 100;

const fmtUsd = (n) => n >= 1 ? `$${Math.round(n).toLocaleString()}` : `$${n.toFixed(4)}`;
// Peg breaks are judged at 0.5%, so a price near $1 must not round to "$1":
// CELO/USD₮ at 1.0014 and the shallow pool at 1.0043 both did exactly that.
const fmtPrice = (n) =>
  n >= 1000 ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  : n >= 10 ? `$${n.toFixed(2)}`
  : n >= 0.1 ? `$${n.toFixed(4)}`
  : `$${n.toPrecision(4)}`;

// Render the repo-committed status.md that the reader automation relays.
// Only flagged items appear: an all-clear run produces a short file, and pools
// that are behaving are not listed at all.
const FLAG_LABEL = {
  out_of_range: "🔴 out of range",
  peg_break: "🔴 peg break",
  tvl_swing: "⚠️ TVL swing",
  skew_shift: "⚠️ skew shift",
  volatile_swing: "⚠️ volatile swing",
  partner_redeposit: "🟢 partner redeposit",
};

// Where our own liquidity sits relative to each pool's price, rolled up per pool.
// Pools we hold nothing in (the pinned ones from the daily list) show no range.
function rangeCell(r, p) {
  const rg = r.poolRange?.[String(p.pool).toLowerCase()];
  if (!rg || !rg.count) return "—";
  if (!rg.outCount) return "in range";
  if (rg.outCount === rg.count) return "out of range";
  return `${rg.outCount} of ${rg.count} out`;
}

// Slack renders no tables at all -- pipes come through literally -- so the table
// is emitted as a fixed-width code block instead, trimmed to the columns that fit
// a phone. Flags go above it as plain lines, since they are the part worth reading.
const shortUsd = (n) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
  : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}k`
  : `$${n.toFixed(n < 10 ? 2 : 0)}`;

const SHORT_FLAG = {
  out_of_range: "OUT of range",
  peg_break: "peg break", tvl_swing: "TVL swing", skew_shift: "skew shift",
  volatile_swing: "volatile", partner_redeposit: "partner redeposit",
};

function renderSlack(r) {
  const ph = r.poolHealth;
  const flaggedPools = ph ? ph.pools.filter(p => p.flags.some(f => f.notify)) : [];
  const outCount = Object.values(r.poolRange || {}).reduce((n, g) => n + g.outCount, 0);
  const clean = flaggedPools.length === 0;

  const head = r.digest
    ? `${clean ? "🟢" : "🔴"} Celo LP — daily digest`
    : `🔴 Celo LP — incident update`;

  const lines = [];
  lines.push(outCount
    ? `${r.totalOpenPositions} positions · *${outCount} out of range* _(earning nothing)_`
    : `*All ${r.totalOpenPositions} positions in range*`);
  lines.push(flaggedPools.length
    ? `*${flaggedPools.length} pool${flaggedPools.length > 1 ? "s" : ""} flagged* — ${flaggedPools.map(p => p.pair).join(", ")}`
    : `*All clear — no pool flags*`);

  const detail = [];
  for (const p of flaggedPools)
    for (const f of p.flags.filter(f => f.notify)) detail.push(`• *${p.pair}* — ${f.detail}`);

  // fixed-width table: pool / TVL / 24h / range. Status lives in the lines above.
  const rows = ph ? [...ph.pools].filter(p => !p.unavailable)
    .sort((a, b) => (b.tvlUsd ?? b.internalUsd ?? 0) - (a.tvlUsd ?? a.internalUsd ?? 0)) : [];
  const cell = (p) => {
    const mark = p.source === "onchain" ? "†" : " ";
    const rg = r.poolRange?.[String(p.pool).toLowerCase()];
    const range = !rg || !rg.count ? "—" : !rg.outCount ? "in range" : rg.outCount === rg.count ? "OUT" : `${rg.outCount}/${rg.count} out`;
    const dev = p.devPct == null ? "—" : `${p.devPct >= 0 ? "+" : ""}${p.devPct.toFixed(1)}%`;
    const flag = p.flags.filter(f => f.notify).map(f => SHORT_FLAG[f.type] || f.type).join(",");
    // plain ASCII star inside the code block: ⭑ is double-width in some monospace
    // fonts, which would shear the column alignment.
    return [(p.pair + (p.liz ? " *" : "")).slice(0, 21),
            p.tvlUsd == null ? "—" : shortUsd(p.tvlUsd) + mark,
            p.internalUsd ? shortUsd(p.internalUsd) : "—",
            dev, flag || range];
  };
  const body = rows.map(cell);
  const head4 = ["POOL", "TVL", "OURS", "24H", "RANGE"];
  const w = head4.map((h, i) => Math.max(h.length, ...body.map(b => b[i].length)));
  const fmtRow = (c) => c.map((v, i) => i === 0 ? v.padEnd(w[i]) : v.padStart(w[i])).join("  ");
  const table = ["```", fmtRow(head4), ...body.map(fmtRow), "```"].join("\n");

  const blocks = [
    { type: "header", text: { type: "plain_text", text: head, emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
  ];
  if (detail.length) blocks.push({ type: "section", text: { type: "mrkdwn", text: detail.join("\n").slice(0, 2900) } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: table.slice(0, 2900) } });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text:
    `${r.checkedAt} · * daily list · † on-chain · ‡ internal only · <https://github.com/djokerops/celo-lp-monitor/blob/main/status.md|full report>` }] });

  // text is the notification preview and the fallback where blocks cannot render
  return { text: `${head} — ${outCount} position(s) out of range, ${flaggedPools.length} pool(s) flagged`, blocks };
}

function renderStatus(r) {
  const out = [`# Celo LP Range Monitor`, ``, `_Last checked: ${r.checkedAt}_`, ``];
  // Say why this update exists, so a Slack reader knows whether it is the scheduled
  // digest or something that just happened.
  if (r.digest || r.reasons?.length) {
    const why = r.reasons?.length ? ` — ${r.reasons.join("; ")}` : "";
    out.push(`_${r.digest ? "Daily digest" : "Incident update"}${why}_`, ``);
  }

  // --- pool health: every pool, every time ---
  // The full table is the point of the daily run, so it is listed in full even on a
  // completely clean day. Flagged pools additionally get a line of detail below it.
  const ph = r.poolHealth;
  const flaggedPools = ph ? ph.pools.filter(p => p.flags.some(f => f.notify)) : [];
  if (ph) {
    while (out.length && out[out.length - 1] === "") out.pop();
    out.push(``, flaggedPools.length
      ? `## ⚠️ Pool health — ${flaggedPools.length} pool${flaggedPools.length > 1 ? "s" : ""} flagged: ${flaggedPools.map(p => p.pair).join(", ")}`
      : `## ✅ Pool health — all clear, no flags`, ``);
    out.push(`| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |`,
             `|------|-----|----------|-------|---------------|-------|-------|--------|`);
    // A pool nothing can price is dropped rather than shown as an empty row.
    const ordered = [...ph.pools].filter(p => !p.unavailable).sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0));
    for (const p of ordered) {
      const star = p.liz ? " ⭑" : "";
      const split = p.skew ? `${p.skew.basePct.toFixed(0)}% ${p.skew.baseSym} / ${(100 - p.skew.basePct).toFixed(0)}% ${p.skew.quoteSym}` : "—";
      const dev = p.devPct == null ? "—" : `${p.devPct >= 0 ? "+" : ""}${p.devPct.toFixed(1)}%`;
      const notified = p.flags.filter(f => f.notify);
      const status = notified.length ? notified.map(f => FLAG_LABEL[f.type] || f.type).join(", ") : "OK";
      const mark = p.source === "onchain" ? " †" : "";
      const price = p.priceUsd == null ? "—" : fmtPrice(p.priceUsd);
      const tvl = p.tvlUsd == null ? "—" : fmtUsd(p.tvlUsd) + mark;
      const internal = p.internalUsd ? fmtUsd(p.internalUsd) : "—";
      out.push(`| ${p.pair}${star} | ${tvl} | ${internal} | ${price} | ${split} | ${rangeCell(r, p)} | ${dev} | ${status} |`);
    }
    if (flaggedPools.length) {
      out.push(``);
      for (const p of flaggedPools)
        for (const f of p.flags.filter(f => f.notify)) out.push(`**${p.pair}** — ${f.detail}`, ``);
    }
    while (out.length && out[out.length - 1] === "") out.pop();
    const notes = [];
    if (ph.pools.some(p => p.liz)) notes.push(`⭑ = on the daily pool list`);
    if (ph.pools.some(p => p.source === "onchain")) notes.push(`† TVL read from on-chain reserves (Dexscreener does not index this pool)`);
    if (ph.pools.some(p => p.source === "internal-only")) notes.push(`TVL "—" = pool-wide figure unavailable; the Internal column is still exact`);
    if (notes.length) out.push(``, notes.join("  \n"));
  }

  // --- footer ---
  while (out.length && out[out.length - 1] === "") out.pop();
  const f = r.tvlFilter || {};
  const filterNote = f.thresholdUsd
    ? ` · pools ≥ $${f.thresholdUsd.toLocaleString()} (${f.poolsTracked} tracked, ${f.positionsSkippedAsDust} dust skipped)`
    : "";
  const outCount = Object.values(r.poolRange || {}).reduce((n, g) => n + g.outCount, 0);
  out.push(``, `---`, `${r.totalOpenPositions} open positions checked · ${outCount} out of range · ${r.errors.length} error(s)${filterNote}`);
  if (ph) {
    const noData = ph.pools.filter(p => p.unavailable);
    const fallback = ph.pools.filter(p => p.source === "onchain");
    out.push(`Pool health: ${ph.poolsChecked - noData.length} pools listed, ${flaggedPools.length} flagged`
      + (fallback.length ? ` · ${fallback.length} priced on-chain` : "")
      + (noData.length ? ` · ${noData.length} omitted, unpriceable by any source (${noData.map(p => p.pair).join(", ")})` : ""));
  }
  if (r.errors.length) out.push(``, "```", ...r.errors.slice(0, 5), "```");
  return out.join("\n") + "\n";
}

async function positionsFor(owner) {
  const bal = Number(await retry(() => nfpm.balanceOf(owner)));
  const ids = [];
  for (let i = 0; i < bal; i++) ids.push(retry(() => nfpm.tokenOfOwnerByIndex(owner, i)));
  return (await Promise.all(ids)).map(x => x.toString());
}

async function main() {
  const results = [];
  const errors = [];
  const allow = loadAllowlist();
  let skippedDust = 0;

  for (const [owner, label] of WATCHED) {
    let ids;
    try { ids = await positionsFor(owner); }
    catch (e) { errors.push(`${label}: enumerate failed: ${e.message}`); continue; }

    for (const id of ids) {
      try {
        const p = await retry(() => nfpm.positions(id));
        if (p.liquidity === 0n) continue; // closed / no liquidity
        const tickLower = Number(p.tickLower);
        const tickUpper = Number(p.tickUpper);
        const pool = await getPool(p.token0, p.token1, p.fee);
        if (allow.active && !allow.pools.has(pool.toLowerCase())) { skippedDust++; continue; } // pool below TVL threshold
        const tick = await poolTick(pool);
        const inRange = tick >= tickLower && tick < tickUpper;
        const side = inRange ? null : (tick < tickLower ? "below" : "above");
        const gapTicks = inRange ? 0 : (side === "below" ? tickLower - tick : tick - tickUpper);
        const [s0, s1] = await Promise.all([symbol(p.token0), symbol(p.token1)]);
        results.push({
          key: `${label}#${id}`,
          label, tokenId: id,
          pair: `${s0}/${s1}`,
          feeTier: `${Number(p.fee) / 10000}%`,
          pool, tick, tickLower, tickUpper,
          inRange, side,
          gapTicks, gapPct: inRange ? 0 : +pct(gapTicks).toFixed(2),
          rangeWidthPct: +pct(tickUpper - tickLower).toFixed(2),
          gapWidthPct: inRange ? 0 : +((pct(gapTicks) / pct(tickUpper - tickLower)) * 100).toFixed(1),
        });
      } catch (e) { errors.push(`${label}#${id}: ${e.message}`); }
    }
  }

  // Our position status, rolled up per pool: a pool inherits the worst state of
  // whichever of our positions sit in it.
  const poolRange = {};
  for (const r of results) {
    const k = String(r.pool).toLowerCase();
    const cur = poolRange[k] ??= { count: 0, outCount: 0 };
    cur.count++;
    // Binary on purpose. A v3 position earns nothing the moment price leaves the
    // band, at any distance, so how far out it is carries no economic information.
    if (!r.inRange) cur.outCount++;
  }

  const outNow = results.filter(r => !r.inRange);

  // --- pool health, produced by pool_health.mjs earlier in the run ---
  let poolHealth = null;
  if (existsSync(POOL_HEALTH_FILE)) {
    try { poolHealth = JSON.parse(readFileSync(POOL_HEALTH_FILE, "utf8")); } catch {}
  }

  // --- transition detection via state file ---
  let prevPoolFlags = [];
  let lastDigestDay = null;
  if (existsSync(STATE_FILE)) {
    try {
      const st = JSON.parse(readFileSync(STATE_FILE, "utf8"));
      prevPoolFlags = st.poolFlags || [];
      lastDigestDay = st.lastDigestDay ?? null;
    } catch {}
  }

  // Out of range is the flag that matters: a v3 position earns nothing at all the
  // moment price leaves its band. Injected here rather than in pool_health.mjs
  // because range comes from on-chain positions, not from market data.
  if (poolHealth) {
    for (const p of poolHealth.pools) {
      const rg = poolRange[String(p.pool).toLowerCase()];
      if (rg?.outCount) p.flags.push({
        type: "out_of_range", severity: "warn", notify: true,
        detail: rg.count === 1
          ? `our only position here is out of range — earning no fees`
          : rg.outCount === rg.count
            ? `all ${rg.count} of our positions here are out of range — earning no fees`
            : `${rg.outCount} of our ${rg.count} positions here ${rg.outCount === 1 ? "is" : "are"} out of range — earning no fees`,
      });
    }
  }

  // If pool_health.mjs could not run, carry the previous flags forward rather than
  // silently clearing them (which would read as "everything recovered").
  const poolFlags = poolHealth
    ? poolHealth.pools.flatMap(p => p.flags.filter(f => f.notify).map(f => `${p.pair}:${f.type}`)).sort()
    : prevPoolFlags;
  const newPoolFlags = poolFlags.filter(f => !prevPoolFlags.includes(f));
  const clearedPoolFlags = prevPoolFlags.filter(f => !poolFlags.includes(f));

  // --- publish decision ---
  // Two reasons to speak: the once-a-day digest, or something actually changed.
  // Not "hour === DIGEST_UTC_HOUR": if that run is missed or cron-job.org is late,
  // the digest should still go out on the next run rather than be skipped for a day.
  const today = new Date().toISOString().slice(0, 10);
  const digestDue = new Date().getUTCHours() >= DIGEST_UTC_HOUR && lastDigestDay !== today;
  const flagChange = newPoolFlags.length > 0 || clearedPoolFlags.length > 0;
  const publish = digestDue || flagChange;

  const reasons = [];
  if (newPoolFlags.length) reasons.push(`${newPoolFlags.length} new pool flag(s)`);
  if (clearedPoolFlags.length) reasons.push(`${clearedPoolFlags.length} pool flag(s) cleared`);

  // No timestamp here on purpose: this file must change ONLY when we publish, so
  // CI can use its git-diff as both the commit and the Slack trigger.
  writeFileSync(STATE_FILE, JSON.stringify({
    poolFlags,
    lastDigestDay: digestDue ? today : lastDigestDay,
  }, null, 2));

  const report = {
    checkedAt: new Date().toISOString(),
    totalOpenPositions: results.length,
    outOfRangeCount: outNow.length,
    outOfRangeCount: outNow.length,
    tvlFilter: allow.active
      ? { thresholdUsd: allow.thresholdUsd, poolsTracked: allow.pools.size, positionsSkippedAsDust: skippedDust }
      : { thresholdUsd: null, note: "allowlist missing/empty — tracking all pools" },
    outOfRange: outNow,
    poolRange,
    poolHealth,
    newPoolFlags,
    clearedPoolFlags,
    publish,
    digest: digestDue,
    reasons,
    errors,
  };
  console.log(JSON.stringify(report, null, 2));

  // --- status.md is rewritten ONLY on a publish ---
  // Leaving the file untouched on a quiet run is what keeps CI from committing and
  // Slack from posting: the hourly check happens, but nothing downstream moves.
  if (publish) {
    writeFileSync(STATUS_MD, renderStatus(report));
    writeFileSync(SLACK_PAYLOAD, JSON.stringify(renderSlack(report), null, 2) + "\n");
  }

  // --- delivery: macOS banner + logs, only on transitions ---
  const ts = new Date().toISOString();
  log(RUN_LOG, `${ts} publish=${publish}${publish ? `(${reasons.join("; ")})` : ""} open=${results.length} out=${outNow.length} poolFlags=${poolFlags.length} errors=${errors.length}`);

  const lines = [];
  for (const f of newPoolFlags) lines.push(`⚠️ POOL: ${f}`);
  for (const f of clearedPoolFlags) lines.push(`🟢 POOL CLEARED: ${f}`);

  // Transitions are recorded to alerts.log (committed by CI) and surfaced via
  // status.md. No desktop banner: delivery is GitHub -> reader -> your app.
  for (const l of lines) log(ALERTS_LOG, `${ts} ${l}`);
}

main().catch(e => { console.error(JSON.stringify({ fatal: e.message })); process.exit(1); });
