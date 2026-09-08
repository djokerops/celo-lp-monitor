// Refresh pools_allowlist.json from Dune query 8390438 (internal LP TVL per pool).
// Keeps pools with tvl_usd >= threshold. Runs at most once per REFRESH_MAX_AGE_H
// hours (self-throttling so the hourly workflow only hits Dune ~once/day).
//
// Env:
//   DUNE_API_KEY          required to actually refresh; if unset, exits 0 (keeps file)
//   DUNE_TVL_THRESHOLD    USD threshold (default 100)
//   REFRESH_MAX_AGE_H     skip if file younger than this many hours (default 20)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dir, "pools_allowlist.json");
const QUERY_ID = 8390438;
const THRESHOLD = Number(process.env.DUNE_TVL_THRESHOLD ?? 100);
const MAX_AGE_H = Number(process.env.REFRESH_MAX_AGE_H ?? 20);
const KEY = process.env.DUNE_API_KEY;
const API = "https://api.dune.com/api/v1";

const done = (msg) => { console.log(msg); process.exit(0); };

// Self-throttle: don't refresh if the current file is still fresh.
if (existsSync(FILE)) {
  try {
    const cur = JSON.parse(readFileSync(FILE, "utf8"));
    const ageH = (Date.now() - new Date(cur.generatedAt).getTime()) / 3.6e6;
    if (Number.isFinite(ageH) && ageH < MAX_AGE_H) done(`allowlist is ${ageH.toFixed(1)}h old (< ${MAX_AGE_H}h) — skipping refresh`);
  } catch {}
}
if (!KEY) done("DUNE_API_KEY not set — keeping existing allowlist");

const STALE_EXECUTE_H = Number(process.env.STALE_EXECUTE_H ?? 30);
const h = { "X-Dune-API-Key": KEY };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function jf(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${url.split("/api/")[1]} -> HTTP ${r.status}`);
  return r.json();
}

// Prefer the free cached-results endpoint. Only pay for a fresh execution when
// the last cached run is older than STALE_EXECUTE_H.
let res = await jf(`${API}/query/${QUERY_ID}/results?limit=1000`, { headers: h });
const endedAt = res.execution_ended_at ? new Date(res.execution_ended_at).getTime() : 0;
const cacheAgeH = endedAt ? (Date.now() - endedAt) / 3.6e6 : Infinity;
if (cacheAgeH > STALE_EXECUTE_H) {
  console.log(`cached results ${Number.isFinite(cacheAgeH) ? cacheAgeH.toFixed(1) + "h" : "missing"} old — executing fresh`);
  const exec = await jf(`${API}/query/${QUERY_ID}/execute`, { method: "POST", headers: h });
  const execId = exec.execution_id;
  let state = exec.state;
  for (let i = 0; i < 80 && !["QUERY_STATE_COMPLETED", "QUERY_STATE_FAILED"].includes(state); i++) {
    await sleep(3000);
    state = (await jf(`${API}/execution/${execId}/status`, { headers: h })).state;
  }
  if (state !== "QUERY_STATE_COMPLETED") { console.error(`execution ended in ${state}`); process.exit(1); }
  res = await jf(`${API}/execution/${execId}/results`, { headers: h });
} else {
  console.log(`using cached Dune results (${cacheAgeH.toFixed(1)}h old)`);
}
const rows = res.result?.rows ?? [];
const pools = {};
for (const r of rows) {
  const tvl = Number(r.tvl_usd) || 0;
  if (r.version === "v3" && tvl >= THRESHOLD) pools[String(r.pool).toLowerCase()] = { pair: r.pair, tvlUsd: Math.round(tvl * 100) / 100 };
}
if (Object.keys(pools).length === 0) { console.error("refusing to write empty allowlist (query returned nothing usable)"); process.exit(1); }

writeFileSync(FILE, JSON.stringify({
  generatedAt: new Date().toISOString(),
  thresholdUsd: THRESHOLD,
  source: `dune query ${QUERY_ID} (uni-internal-liq-per-pool)`,
  pools,
}, null, 2) + "\n");
console.log(`refreshed allowlist: ${Object.keys(pools).length} pools >= $${THRESHOLD}`);
