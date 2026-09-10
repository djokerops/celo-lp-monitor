// Refresh pools_allowlist.json from Dune query 8390438 (internal LP TVL per pool).
// Keeps pools with tvl_usd >= threshold. Runs at most once per REFRESH_MAX_AGE_H
// hours (self-throttling so the hourly workflow only hits Dune ~once/day).
//
// The query reports `WHERE day = current_date` and prices positions off the daily
// `prices.day` table with COALESCE(price, 0). Early in the UTC day that table has
// no row for today yet, so every position prices at $0 and the whole result set
// looks like "no pools above threshold". Two defences below: refuse to refresh
// before REFRESH_MIN_UTC_HOUR, and never let a failed refresh take the monitor
// down -- a stale allowlist is far better than no range check at all.
//
// Env:
//   DUNE_API_KEY          required to actually refresh; if unset, exits 0 (keeps file)
//   DUNE_TVL_THRESHOLD    USD threshold (default 100)
//   REFRESH_MAX_AGE_H     skip if file younger than this many hours (default 20)
//   REFRESH_MIN_UTC_HOUR  don't refresh before this UTC hour (default 12)
//   STALE_EXECUTE_H       pay for a fresh execution past this cache age (default 30)
//   DUNE_API_BASE         override API root (tests)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dir, "pools_allowlist.json");
const QUERY_ID = 8390438;
const THRESHOLD = Number(process.env.DUNE_TVL_THRESHOLD ?? 100);
const MAX_AGE_H = Number(process.env.REFRESH_MAX_AGE_H ?? 20);
const MIN_UTC_HOUR = Number(process.env.REFRESH_MIN_UTC_HOUR ?? 12);
const KEY = process.env.DUNE_API_KEY;
const API = process.env.DUNE_API_BASE ?? "https://api.dune.com/api/v1";

const done = (msg) => { console.log(msg); process.exit(0); };

// How many pools the file on disk already carries; 0 means we have no fallback.
let existingCount = 0;
if (existsSync(FILE)) {
  try {
    const cur = JSON.parse(readFileSync(FILE, "utf8"));
    existingCount = Object.keys(cur.pools ?? {}).length;
    // Self-throttle: don't refresh if the current file is still fresh.
    const ageH = (Date.now() - new Date(cur.generatedAt).getTime()) / 3.6e6;
    if (Number.isFinite(ageH) && ageH < MAX_AGE_H) done(`allowlist is ${ageH.toFixed(1)}h old (< ${MAX_AGE_H}h) — skipping refresh`);
  } catch {}
}
if (!KEY) done("DUNE_API_KEY not set — keeping existing allowlist");

// Before MIN_UTC_HOUR, prices.day has no row for current_date and the query
// prices every position at $0. Refreshing now can only produce a bad answer.
if (new Date().getUTCHours() < MIN_UTC_HOUR && existingCount > 0) {
  done(`before ${MIN_UTC_HOUR}:00 UTC — today's prices aren't published yet; deferring refresh (${existingCount} pools kept)`);
}

const STALE_EXECUTE_H = Number(process.env.STALE_EXECUTE_H ?? 30);
const h = { "X-Dune-API-Key": KEY };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function jf(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${url.split("/api/")[1]} -> HTTP ${r.status}`);
  return r.json();
}

// Pools worth tracking out of a Dune result set.
const selectPools = (res) => {
  const pools = {};
  for (const r of res.result?.rows ?? []) {
    const tvl = Number(r.tvl_usd) || 0;
    if (r.version === "v3" && tvl >= THRESHOLD) pools[String(r.pool).toLowerCase()] = { pair: r.pair, tvlUsd: Math.round(tvl * 100) / 100 };
  }
  return pools;
};

async function execute() {
  const exec = await jf(`${API}/query/${QUERY_ID}/execute`, { method: "POST", headers: h });
  const execId = exec.execution_id;
  let state = exec.state;
  for (let i = 0; i < 80 && !["QUERY_STATE_COMPLETED", "QUERY_STATE_FAILED"].includes(state); i++) {
    await sleep(3000);
    state = (await jf(`${API}/execution/${execId}/status`, { headers: h })).state;
  }
  if (state !== "QUERY_STATE_COMPLETED") { console.error(`execution ended in ${state}`); process.exit(existingCount > 0 ? 0 : 1); }
  return jf(`${API}/execution/${execId}/results`, { headers: h });
}

// Prefer the free cached-results endpoint. Only pay for a fresh execution when
// the last cached run is older than STALE_EXECUTE_H.
let res = await jf(`${API}/query/${QUERY_ID}/results?limit=1000`, { headers: h });
const endedAt = res.execution_ended_at ? new Date(res.execution_ended_at).getTime() : 0;
const cacheAgeH = endedAt ? (Date.now() - endedAt) / 3.6e6 : Infinity;
if (cacheAgeH > STALE_EXECUTE_H) {
  console.log(`cached results ${Number.isFinite(cacheAgeH) ? cacheAgeH.toFixed(1) + "h" : "missing"} old — executing fresh`);
  res = await execute();
} else {
  console.log(`using cached Dune results (${cacheAgeH.toFixed(1)}h old)`);
}

let pools = selectPools(res);

// A cached execution that itself ran before MIN_UTC_HOUR is priced at $0 across
// the board and will keep poisoning every run until it ages out. Re-execute once
// rather than serving those zeros for the rest of the cache window.
if (Object.keys(pools).length === 0 && endedAt && new Date(endedAt).getUTCHours() < MIN_UTC_HOUR) {
  console.log(`cached execution ran at ${new Date(endedAt).toISOString()} (before ${MIN_UTC_HOUR}:00 UTC) and priced everything at $0 — re-executing`);
  res = await execute();
  pools = selectPools(res);
}

if (Object.keys(pools).length === 0) {
  const rows = res.result?.rows ?? [];
  const allZero = rows.length > 0 && rows.every(r => !(Number(r.tvl_usd) > 0));
  const why = rows.length === 0 ? "query returned no rows"
    : allZero ? `all ${rows.length} rows priced at $0 (prices.day missing for that day)`
    : `no v3 pool at or above $${THRESHOLD}`;
  // Keeping a stale allowlist beats failing the job: check.mjs still runs.
  if (existingCount > 0) done(`not refreshing: ${why} — keeping existing allowlist (${existingCount} pools)`);
  console.error(`refusing to write empty allowlist: ${why}`);
  process.exit(1);
}

writeFileSync(FILE, JSON.stringify({
  generatedAt: new Date().toISOString(),
  thresholdUsd: THRESHOLD,
  source: `dune query ${QUERY_ID} (uni-internal-liq-per-pool)`,
  pools,
}, null, 2) + "\n");
console.log(`refreshed allowlist: ${Object.keys(pools).length} pools >= $${THRESHOLD}`);
