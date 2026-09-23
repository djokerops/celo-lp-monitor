// Refreshing the allowlist from Dune. The query reports `WHERE day = current_date`
// and prices positions with COALESCE(price, 0), so early in the UTC day every row
// comes back at $0 -- the failure this suite mostly guards against.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { check, section, startJsonServer, sandbox } from "./helpers.mjs";

const pool = (n) => "0x" + String(n).repeat(40).slice(0, 40);
const rows = (zeroed) => [
  { version: "v3", pool: pool(1), pair: "USD₮/USDC", tvl_usd: zeroed ? 0 : 187000, lp: "APF" },
  { version: "v3", pool: pool(2), pair: "CELO/stCELO", tvl_usd: zeroed ? 0 : 782000, lp: "stabila" },
  { version: "v3", pool: pool(3), pair: "KESm/USD₮", tvl_usd: zeroed ? 0 : 250, lp: "APF" },
  { version: "v3", pool: pool(4), pair: "dust/USD₮", tvl_usd: zeroed ? 0 : 57, lp: "APF" },
  { version: "v4", pool: pool(5), pair: "v4pool", tvl_usd: zeroed ? 0 : 900000, lp: "APF" },
];
// 08:00 UTC: inside the window where prices.day has no row for the current day
const at0800 = () => { const d = new Date(); d.setUTCHours(8, 0, 0, 0);
  if (d.getTime() > Date.now() - 36e5) d.setUTCDate(d.getUTCDate() - 1); return d.toISOString(); };
const results = (zeroed, endedAt) => ({
  execution_id: "X", state: "QUERY_STATE_COMPLETED",
  execution_ended_at: endedAt ?? new Date().toISOString(),
  result: { rows: rows(zeroed) },
});

export default async function run() {
  const routesFile = join(tmpdir(), `dune-routes-${process.pid}.json`);
  writeFileSync(routesFile, "{}");
  const dune = await startJsonServer(routesFile);
  // key order matters: the stub takes the first key the URL contains
  const serve = ({ cached, fresh }) => writeFileSync(routesFile, JSON.stringify({
    "/execute": { execution_id: "X", state: "QUERY_STATE_PENDING" },
    "/status": { state: "QUERY_STATE_COMPLETED" },
    "/execution/": fresh,
    "*": cached,
  }));

  const seeded = { generatedAt: "2020-01-01T00:00:00.000Z", thresholdUsd: 100,
    pools: { [pool(9)]: { pair: "SEED/POOL", tvlUsd: 1234 } } };

  const go = ({ seed = true, seedWith, env = {} } = {}) => {
    const sb = sandbox(seed ? { "pools_allowlist.json": seedWith ?? seeded } : {});
    let exit = 0, out = "";
    try {
      out = execFileSync("node", ["refresh_allowlist.mjs"], {
        cwd: sb.dir, encoding: "utf8", stdio: "pipe",
        env: { ...process.env, DUNE_API_BASE: dune.url, DUNE_API_KEY: "test",
               DUNE_TVL_THRESHOLD: "100", REFRESH_MAX_AGE_H: "0",
               REFRESH_MIN_UTC_HOUR: "12", NOW_UTC_HOUR: "13", ...env },
      });
    } catch (e) { exit = e.status; out = (e.stdout || "") + (e.stderr || ""); }
    const res = { out, exit, allow: sb.json("pools_allowlist.json") };
    sb.cleanup();
    return res;
  };
  const poolCount = (r) => (r.allow ? Object.keys(r.allow.pools).length : 0);

  section("a healthy cached execution");
  serve({ cached: results(false), fresh: results(false) });
  let r = go();
  check("is written straight through", /refreshed allowlist/.test(r.out), true);
  check("keeping v3 rows at or above the threshold", poolCount(r), 3);
  check("and dropping the $57 dust and the v4 row", r.allow.pools[pool(4)] ?? null, null);

  section("running again with nothing changed");
  // each run gets a fresh sandbox, so seed it with exactly what the last run wrote
  const current = { generatedAt: "2020-01-01T00:00:00.000Z", thresholdUsd: 100, pools: {
    [pool(1)]: { pair: "USD\u20ae/USDC", tvlUsd: 187000 },
    [pool(2)]: { pair: "CELO/stCELO", tvlUsd: 782000 },
    [pool(3)]: { pair: "KESm/USD\u20ae", tvlUsd: 250 },
  }};
  r = go({ seedWith: current });
  check("reports it is already current", /already current/.test(r.out), true);
  check("and leaves generatedAt alone, so hourly checks are not hourly commits",
        r.allow.generatedAt, "2020-01-01T00:00:00.000Z");

  section("a cached execution that ran before prices were published");
  serve({ cached: results(true, at0800()), fresh: results(false) });
  r = go();
  check("is re-executed rather than trusted", /re-executing/.test(r.out), true);
  check("and the good result is written", /refreshed allowlist/.test(r.out), true);
  serve({ cached: results(true, at0800()), fresh: results(true) });
  r = go();
  check("if the re-run is also zeroed, the existing allowlist is kept", /keeping existing allowlist/.test(r.out), true);
  check("without failing the job", r.exit, 0);
  check("and the file is untouched", poolCount(r), 1);

  section("with no allowlist to fall back on");
  serve({ cached: results(true, at0800()), fresh: results(true) });
  r = go({ seed: false });
  check("it refuses to write an empty one", /refusing to write empty/.test(r.out), true);
  check("and exits non-zero", r.exit, 1);

  section("before the hour prices land");
  serve({ cached: results(false), fresh: results(false) });
  r = go({ env: { NOW_UTC_HOUR: "3" } });
  check("a usable cached execution is still used", /refreshed allowlist/.test(r.out), true);
  serve({ cached: results(false, "2020-01-01T00:00:00.000Z"), fresh: results(false) });
  r = go({ env: { NOW_UTC_HOUR: "3", STALE_EXECUTE_H: "0" } });
  check("but a stale one defers instead of paying for an execution", /before 12:00 UTC/.test(r.out), true);
  check("keeping what we have", poolCount(r), 1);

  section("without an API key");
  serve({ cached: results(false), fresh: results(false) });
  r = go({ env: { DUNE_API_KEY: "" } });
  check("it keeps the existing allowlist and exits 0", r.exit, 0);
  check("saying why", /DUNE_API_KEY not set/.test(r.out), true);

  dune.stop();
}
