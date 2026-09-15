// Pool-level health for the pools we actually hold liquidity in.
//
// Two different TVL numbers are in play and must not be confused:
//   * pool-wide TVL  -- every LP's liquidity, from Dexscreener
//   * internal TVL   -- only our seven wallets, from pools_allowlist.json (Dune)
// We are 86-100% of most of these pools, so a pool-wide swing is usually just us
// moving money. Every swing is therefore checked against our own delta and marked
// "explained" when the two move together.
//
// TVL is measured against the previous push (the last daily sample), so the report
// answers "what moved in the last 24h". Reserve skew still uses a rolling median
// over HISTORY_DAYS, since a one-day skew reading is noisy. Both live in
// tvl_history.json. Static baselines go stale within weeks; these don't.
//
// Never exits non-zero: a pool-health failure must not take the range monitor
// down with it. Missing data is reported as a row, not an error.
//
// Env:
//   TVL_SWING_PCT     flag pool TVL this far from baseline (default 20)
//   SKEW_DELTA_PTS    flag reserve split moving this many points (default 15)
//   PEG_WARN_PCT      stablecoin pair this far off $1.00 (default 0.5)
//   PEG_URGENT_PCT    ... and this far is urgent (default 1.0)
//   VOL_H24_PCT       flag |priceChange.h24| above this (default 8)
//   HISTORY_DAYS      rolling baseline window (default 7)
//   MIN_BASELINE_N    suppress baseline flags below this many samples (default 3)
//   DEX_API_BASE      override API root (tests)
//   ONCHAIN_FALLBACK  read reserves on-chain when Dexscreener has no pair (default 1)
//   CELO_RPC          RPC endpoint for that fallback

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ALLOWLIST = join(__dir, "pools_allowlist.json");
const HISTORY = join(__dir, "tvl_history.json");
const OUT = join(__dir, "pool_health.json");

const API = process.env.DEX_API_BASE ?? "https://api.dexscreener.com/latest/dex/pairs/celo";
const TVL_SWING_PCT = Number(process.env.TVL_SWING_PCT ?? 20);
const SKEW_DELTA_PTS = Number(process.env.SKEW_DELTA_PTS ?? 15);
const PEG_WARN_PCT = Number(process.env.PEG_WARN_PCT ?? 0.5);
const PEG_URGENT_PCT = Number(process.env.PEG_URGENT_PCT ?? 1.0);
const VOL_H24_PCT = Number(process.env.VOL_H24_PCT ?? 8);
const HISTORY_DAYS = Number(process.env.HISTORY_DAYS ?? 7);
const MIN_BASELINE_N = Number(process.env.MIN_BASELINE_N ?? 3);
const ONCHAIN_FALLBACK = (process.env.ONCHAIN_FALLBACK ?? "1") !== "0";
const RPC = process.env.CELO_RPC ?? "https://forno.celo.org";

// Pools on Liz's daily list that we hold no position in, so the Dune-derived
// allowlist can never surface them. Pinned so her report stays complete.
const PINNED = [
  { pool: "0xb135ebde27d366b0d62e579bae4118cb991b820e", pair: "USD₮/CELO (shallow)", rule: "redeposit", redepositAbove: 5000 },
  { pool: "0xae073a816117dcd1cc237fe4cb99f89f8f8bff4f", pair: "USD₮/USAT (main)" },
];

// Liz's seven, for the ⭑ marker.
const LIZ = new Set([
  "0x6cde5f5a192fbf3fd84df983aa6dc30dbd9f8fac", "0xb135ebde27d366b0d62e579bae4118cb991b820e",
  "0x1a810e0b6c2dd5629afa2f0c898b9512c6f78846", "0xae073a816117dcd1cc237fe4cb99f89f8f8bff4f",
  "0x070d575a713eaf5025462d0865fb0dac4b14bc38", "0xf55791afbb35ad42984f18d6fe3e1ff73d81900c",
  "0x57332c214e647063bb4c5a73e5a8b7bba79be1e4",
]);

// Peg checks only make sense when both sides are meant to be a dollar; volatility
// checks only when one side actually moves. FX pairs (GBPm, AUDm, wARS...) get
// neither -- they are neither pegged to $1 nor expected to sit still.
const norm = (s) => String(s || "").toUpperCase().replace(/₮/g, "T");
const USD_STABLE = new Set(["USDT", "USDC", "USDM", "USAT", "DAI", "USDGLO", "USDT0"]);
const VOLATILE = new Set(["CELO", "STCELO", "WETH", "WBTC", "AXLWBTC", "AXLETH", "ETH", "BTC"]);

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const readJson = (f, fallback) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return fallback; } };

async function fetchPairs(addresses) {
  const byAddr = new Map();
  const errors = [];
  for (let i = 0; i < addresses.length; i += 30) {           // Dexscreener caps a batch at 30
    const chunk = addresses.slice(i, i + 30);
    try {
      const r = await fetch(`${API}/${chunk.join(",")}`);
      if (!r.ok) { errors.push(`dexscreener HTTP ${r.status} for ${chunk.length} pools`); continue; }
      const body = await r.json();
      for (const p of body.pairs ?? []) byAddr.set(String(p.pairAddress).toLowerCase(), p);
    } catch (e) { errors.push(`dexscreener: ${e.message}`); }
  }
  return { byAddr, errors };
}

// Dexscreener prices the base token directly; the quote token's price falls out of
// the pool's own composition. Collecting both across every covered pool gives a
// token -> USD map good enough to value a pool Dexscreener does not index.
function buildPriceMap(pairs) {
  const acc = new Map();
  const add = (addr, price) => {
    if (!addr || !Number.isFinite(price) || price <= 0) return;
    const k = addr.toLowerCase();
    if (!acc.has(k)) acc.set(k, []);
    acc.get(k).push(price);
  };
  for (const p of pairs) {
    const price = Number(p.priceUsd) || 0;
    const tvl = Number(p.liquidity?.usd) || 0;
    const baseAmt = Number(p.liquidity?.base) || 0;
    const quoteAmt = Number(p.liquidity?.quote) || 0;
    add(p.baseToken?.address, price);
    if (quoteAmt > 0 && tvl > 0) add(p.quoteToken?.address, (tvl - baseAmt * price) / quoteAmt);
  }
  return new Map([...acc].map(([k, v]) => [k, median(v)]));
}

// ethers is loaded lazily: the on-chain fallback is a rare path, and this module
// should still run where only the HTTP path is needed.
let ethers = null;
async function makeProvider() {
  try {
    ({ ethers } = await import("ethers"));
    return new ethers.JsonRpcProvider(RPC, 42220);
  } catch { return null; }
}

const POOL_ABI = ["function token0() view returns (address)", "function token1() view returns (address)"];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)"];

// Actual reserves held by the pool contract, valued with the price map. This is
// real pool-wide TVL, not our share of it.
async function onchainPool(provider, addr, priceMap) {
  const pool = new ethers.Contract(addr, POOL_ABI, provider);
  const [t0, t1] = await Promise.all([pool.token0(), pool.token1()]);
  const side = async (t) => {
    const c = new ethers.Contract(t, ERC20_ABI, provider);
    const [sym, dec, bal] = await Promise.all([c.symbol(), c.decimals(), c.balanceOf(addr)]);
    const amount = Number(bal) / 10 ** Number(dec);
    const price = priceMap.get(t.toLowerCase());
    return { sym, amount, price, usd: price != null ? amount * price : null };
  };
  const [a, b] = await Promise.all([side(t0), side(t1)]);
  if (a.usd == null || b.usd == null) return null;      // can't price both sides
  const tvl = a.usd + b.usd;
  return {
    tvlUsd: tvl,
    priceUsd: a.price,
    skew: { basePct: tvl > 0 ? (a.usd / tvl) * 100 : 0, baseSym: a.sym, quoteSym: b.sym },
  };
}

async function main() {
  const allow = readJson(ALLOWLIST, { pools: {} });
  const universe = new Map();
  for (const [addr, meta] of Object.entries(allow.pools ?? {}))
    universe.set(addr.toLowerCase(), { pair: meta.pair, internalUsd: meta.tvlUsd ?? 0, rule: null });
  for (const p of PINNED)
    if (!universe.has(p.pool)) universe.set(p.pool, { pair: p.pair, internalUsd: 0, rule: p.rule ?? null, redepositAbove: p.redepositAbove });

  const addresses = [...universe.keys()];
  const { byAddr, errors } = await fetchPairs(addresses);
  const priceMap = buildPriceMap([...byAddr.values()]);
  const provider = ONCHAIN_FALLBACK ? await makeProvider() : null;

  const hist = readJson(HISTORY, { days: HISTORY_DAYS, samples: {} });
  hist.samples ??= {};
  const today = new Date().toISOString().slice(0, 10);
  const pools = [];

  for (const [addr, meta] of universe) {
    const d = byAddr.get(addr);
    const row = { pool: addr, pair: meta.pair, liz: LIZ.has(addr), internalUsd: meta.internalUsd, flags: [] };
    let tvl, price, basePct, baseSym, quoteSym, h24 = 0;

    if (d) {
      tvl = Number(d.liquidity?.usd) || 0;
      price = Number(d.priceUsd) || 0;
      const baseAmt = Number(d.liquidity?.base) || 0;
      baseSym = norm(d.baseToken?.symbol);
      quoteSym = norm(d.quoteToken?.symbol);
      basePct = tvl > 0 ? Math.min(100, Math.max(0, ((baseAmt * price) / tvl) * 100)) : 0;
      h24 = Number(d.priceChange?.h24) || 0;
      Object.assign(row, {
        source: "dexscreener", tvlUsd: tvl, priceUsd: price, h24,
        volumeH24: Number(d.volume?.h24) || 0,
        skew: { basePct, baseSym: d.baseToken?.symbol, quoteSym: d.quoteToken?.symbol },
      });
    } else {
      // Dexscreener drops pools it no longer indexes -- including ones that simply
      // ran dry. Falling back to real reserves distinguishes "we cannot see it"
      // from "it is empty", which are very different pieces of news.
      let chain = null;
      if (provider) {
        try { chain = await onchainPool(provider, addr, priceMap); }
        catch (e) { errors.push(`${meta.pair}: on-chain read failed: ${e.message}`); }
      }
      if (chain) {
        ({ tvlUsd: tvl, priceUsd: price } = chain);
        basePct = chain.skew.basePct;
        baseSym = norm(chain.skew.baseSym);
        quoteSym = norm(chain.skew.quoteSym);
        Object.assign(row, { source: "onchain", tvlUsd: tvl, priceUsd: price, h24: 0, skew: chain.skew });
      } else if (meta.internalUsd > 0) {
        // Last resort: our own share of the pool. A different measure from the
        // column's pool-wide TVL, so it is marked rather than passed off as one.
        tvl = meta.internalUsd;
        Object.assign(row, { source: "dune-internal", tvlUsd: tvl, priceUsd: null, h24: 0, skew: null });
      } else {
        row.unavailable = true;
        row.flags.push({ type: "data_unavailable", severity: "info", notify: false, detail: "no Dexscreener pair, no on-chain price, no internal position" });
        pools.push(row);
        continue;
      }
    }

    // --- rolling baseline from prior days only (never compare today to itself) ---
    const samples = hist.samples[addr] ?? [];
    // Only compare like with like. Dexscreener coverage is intermittent, and its
    // pool-wide TVL is a different measure from our internal share; mixing the two
    // across days would read as a swing when only the data source moved.
    const prior = samples.filter(s => s.day !== today && (s.source ?? "dexscreener") === row.source);
    // TVL is compared against the last push, not a multi-day median: with a daily
    // digest the useful question is "what moved since yesterday's report".
    const last = prior.length ? prior[prior.length - 1] : null;
    const baseSkew = median(prior.map(s => s.skewPct).filter(Number.isFinite));
    const haveSkewBaseline = prior.length >= MIN_BASELINE_N;
    row.lastPushDay = last?.day ?? null;
    row.lastPushTvl = last?.tvlUsd ?? null;
    row.devPct = last && last.tvlUsd ? ((tvl - last.tvlUsd) / last.tvlUsd) * 100 : null;

    // Pool 2 is tiny and jitters constantly; its only news is the partner coming back.
    if (meta.rule === "redeposit") {
      if (tvl > (meta.redepositAbove ?? 5000))
        row.flags.push({ type: "partner_redeposit", severity: "info", notify: true, detail: `TVL $${tvl.toLocaleString()} above $${(meta.redepositAbove ?? 5000).toLocaleString()} — partner likely redeposited, TVL recovering` });
    } else if (last && last.tvlUsd) {
      const dev = row.devPct;
      if (Math.abs(dev) > TVL_SWING_PCT) {
        // Did our own liquidity move by roughly the same amount? Then it isn't news.
        const dPool = tvl - last.tvlUsd;
        const dInternal = meta.internalUsd - (last.internalUsd ?? meta.internalUsd);
        const residualPct = Math.abs((dPool - dInternal) / last.tvlUsd) * 100;
        const explained = residualPct <= TVL_SWING_PCT;
        row.flags.push({
          type: "tvl_swing",
          severity: explained ? "info" : (Math.abs(dev) > TVL_SWING_PCT * 2 ? "urgent" : "warn"),
          // Our own deposit is not news. Recorded, but it does not raise a flag.
          notify: !explained,
          explained,
          detail: `TVL $${Math.round(tvl).toLocaleString()} vs $${Math.round(last.tvlUsd).toLocaleString()} at the last push on ${last.day} (${dev >= 0 ? "+" : ""}${dev.toFixed(1)}%, threshold ±${TVL_SWING_PCT}%)`
            + (explained ? ` — our internal TVL moved with it, so this is our own liquidity, not an external event` : ""),
        });
      }
    }

    // Peg: only when both sides are supposed to be a dollar.
    if (baseSym && quoteSym && USD_STABLE.has(baseSym) && USD_STABLE.has(quoteSym) && price > 0) {
      const off = Math.abs(price - 1) * 100;
      if (off > PEG_WARN_PCT)
        row.flags.push({
          type: "peg_break",
          severity: off > PEG_URGENT_PCT ? "urgent" : "warn",
          notify: true,
          detail: `$${price.toFixed(4)}, ${off.toFixed(2)}% off peg (${off > PEG_URGENT_PCT ? `urgent band >${PEG_URGENT_PCT}%` : `warn band >${PEG_WARN_PCT}%`})`,
        });
    }

    // Skew: flag movement, not level. Half our pools are structurally one-sided by
    // design, so an absolute threshold fires on them forever.
    if (meta.rule !== "redeposit" && haveSkewBaseline && baseSkew != null && row.skew) {
      const delta = basePct - baseSkew;
      if (Math.abs(delta) > SKEW_DELTA_PTS)
        row.flags.push({
          type: "skew_shift",
          severity: "warn",
          notify: true,
          detail: `${d.baseToken?.symbol} share ${basePct.toFixed(0)}% vs ${baseSkew.toFixed(0)}% baseline (${delta >= 0 ? "+" : ""}${delta.toFixed(0)} pts, threshold ±${SKEW_DELTA_PTS})`,
        });
    }

    if (baseSym && quoteSym && (VOLATILE.has(baseSym) || VOLATILE.has(quoteSym)) && Math.abs(h24) > VOL_H24_PCT)
      row.flags.push({ type: "volatile_swing", severity: "warn", notify: true, detail: `24h price ${h24 >= 0 ? "+" : ""}${h24.toFixed(1)}% (threshold ±${VOL_H24_PCT}%)` });

    // --- one sample per UTC day ---
    if (!samples.some(s => s.day === today)) samples.push({ day: today, source: row.source, tvlUsd: tvl, skewPct: basePct ?? null, internalUsd: meta.internalUsd });
    hist.samples[addr] = samples.slice(-(HISTORY_DAYS + 1));

    pools.push(row);
  }

  const report = {
    checkedAt: new Date().toISOString(),
    thresholds: { TVL_SWING_PCT, SKEW_DELTA_PTS, PEG_WARN_PCT, PEG_URGENT_PCT, VOL_H24_PCT },
    poolsChecked: pools.length,
    flagged: pools.filter(p => p.flags.some(f => f.notify)).map(p => p.pair),
    pools,
    errors,
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
  hist.days = HISTORY_DAYS;
  writeFileSync(HISTORY, JSON.stringify(hist, null, 2) + "\n");
  const bySource = (k) => pools.filter(p => p.source === k).length;
  console.log(`pool health: ${pools.length} pools, ${report.flagged.length} flagged`
    + ` (${bySource("dexscreener")} dexscreener, ${bySource("onchain")} on-chain, ${bySource("dune-internal")} internal-only,`
    + ` ${pools.filter(p => p.unavailable).length} no data)${errors.length ? `, ${errors.length} error(s)` : ""}`);
}

// Never fail the job: the range monitor matters more than pool health.
main().catch(e => { console.error(`pool health failed (non-fatal): ${e.message}`); process.exit(0); });
