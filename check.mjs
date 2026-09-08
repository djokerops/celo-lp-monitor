// Celo Uniswap V3 out-of-range LP monitor
// Read-only. Enumerates each watched address's open positions, compares the
// pool's live tick against the position band, and reports which are out of range.
// Emits a JSON report on stdout and maintains state.json to detect transitions.

import { ethers } from "ethers";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dir, "state.json");
const STATUS_MD = join(__dir, "status.md");
const ALERTS_LOG = join(__dir, "alerts.log");
const RUN_LOG = join(__dir, "run.log");

// macOS desktop banner (no-op / harmless off macOS).
function notify(title, message) {
  const esc = (s) => String(s).replace(/["\\]/g, "\\$&");
  execFile("osascript", ["-e", `display notification "${esc(message)}" with title "${esc(title)}"`], () => {});
}
const log = (file, line) => { try { appendFileSync(file, line + "\n"); } catch {} };

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

// Render the repo-committed status.md that the reader automation relays.
function renderStatus(r) {
  const out = [`# Celo LP Range Monitor`, ``, `_Last checked: ${r.checkedAt}_`, ``];
  if (r.outOfRange.length === 0) {
    out.push(`## ✅ All ${r.totalOpenPositions} positions in range`);
  } else {
    out.push(`## 🔴 ${r.outOfRange.length} position${r.outOfRange.length > 1 ? "s" : ""} OUT OF RANGE`, ``);
    out.push(`| LP | Pair | Fee | Side | % out | tokenId |`, `|----|------|-----|------|-------|---------|`);
    for (const p of r.outOfRange)
      out.push(`| ${p.label} | ${p.pair} | ${p.feeTier} | ${p.side} | ${p.gapPct}% | ${p.tokenId} |`);
  }
  if (r.newlyOutOfRange.length)
    out.push(``, `**⚠️ Newly out this run:** ` + r.newlyOutOfRange.map(p => `${p.label} ${p.pair}`).join(", "));
  if (r.recovered.length)
    out.push(``, `**🟢 Back in range this run:** ` + r.recovered.join(", "));
  out.push(``, `---`, `${r.totalOpenPositions} open positions checked · ${r.errors.length} error(s)`);
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
        });
      } catch (e) { errors.push(`${label}#${id}: ${e.message}`); }
    }
  }

  const outNow = results.filter(r => !r.inRange);
  const outKeys = new Set(outNow.map(r => r.key));

  // --- transition detection via state file ---
  let prev = new Set();
  if (existsSync(STATE_FILE)) {
    try { prev = new Set(JSON.parse(readFileSync(STATE_FILE, "utf8")).outOfRange || []); } catch {}
  }
  const newlyOut = outNow.filter(r => !prev.has(r.key));
  const recovered = [...prev].filter(k => !outKeys.has(k));

  writeFileSync(STATE_FILE, JSON.stringify({
    updatedAt: new Date().toISOString(),
    outOfRange: [...outKeys],
  }, null, 2));

  const report = {
    checkedAt: new Date().toISOString(),
    totalOpenPositions: results.length,
    outOfRangeCount: outNow.length,
    newlyOutOfRange: newlyOut,
    recovered,
    outOfRange: outNow,
    errors,
  };
  console.log(JSON.stringify(report, null, 2));

  // --- write status.md (human-readable, regenerated every run) ---
  writeFileSync(STATUS_MD, renderStatus(report));

  // --- delivery: macOS banner + logs, only on transitions ---
  const ts = new Date().toISOString();
  log(RUN_LOG, `${ts} open=${results.length} out=${outNow.length} newlyOut=${newlyOut.length} recovered=${recovered.length} errors=${errors.length}`);

  const lines = [];
  for (const r of newlyOut) lines.push(`🔴 OUT: ${r.label} ${r.pair} (${r.feeTier}) #${r.tokenId} — price ${r.side} range, ${r.gapPct}% out`);
  for (const k of recovered) lines.push(`🟢 BACK IN RANGE: ${k}`);

  if (lines.length) {
    for (const l of lines) log(ALERTS_LOG, `${ts} ${l}`);
    const title = newlyOut.length
      ? `🔴 ${newlyOut.length} LP position${newlyOut.length > 1 ? "s" : ""} out of range`
      : `🟢 LP position${recovered.length > 1 ? "s" : ""} back in range`;
    const body = (newlyOut.length ? newlyOut : recovered.map(k => ({ label: k })))
      .slice(0, 4).map(r => r.pair ? `${r.label} ${r.pair}` : r.label).join(", ")
      + (lines.length > 4 ? ` +${lines.length - 4} more` : "");
    notify(title, body);
  }
}

main().catch(e => { console.error(JSON.stringify({ fatal: e.message })); process.exit(1); });
