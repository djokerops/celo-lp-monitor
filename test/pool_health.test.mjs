// Pool-level checks: which conditions raise a flag, which stay quiet, and what
// happens when a data source goes away. Dexscreener is stubbed; the on-chain
// fallback is switched off so the suite needs no RPC.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { check, section, startJsonServer, sandbox } from "./helpers.mjs";

const P = (a) => a.toLowerCase();
const A1 = P("0x1111111111111111111111111111111111111111"); // stable pair
const A2 = P("0x2222222222222222222222222222222222222222"); // volatile pair
const A3 = P("0x3333333333333333333333333333333333333333"); // FX pair
const A4 = P("0x4444444444444444444444444444444444444444"); // absent from Dexscreener
const SHALLOW = P("0xB135EbdE27d366b0D62E579baE4118cB991b820E"); // pinned, partner-drained

const pair = (addr, { tvl, price, baseAmt, baseSym, quoteSym, h24 = 0 }) => ({
  pairAddress: addr, baseToken: { symbol: baseSym }, quoteToken: { symbol: quoteSym },
  priceUsd: String(price), liquidity: { usd: tvl, base: baseAmt }, priceChange: { h24 }, volume: { h24: 1000 },
});
const days = (n, tvl, skew, internal, skewBase) =>
  Array.from({ length: n }, (_, i) => ({
    day: new Date(Date.now() - (n - i) * 864e5).toISOString().slice(0, 10),
    source: "poolwide", tvlUsd: tvl, skewPct: skew, internalUsd: internal, skewBase: skewBase ?? null,
  }));

const allow4 = { thresholdUsd: 100, pools: {
  [A1]: { pair: "USDT/USDC", tvlUsd: 100000 },
  [A2]: { pair: "CELO/USDT", tvlUsd: 100000 },
  [A3]: { pair: "USDT/AUDm", tvlUsd: 100000 },
  [A4]: { pair: "USDT/NGNm", tvlUsd: 100000 },
}};

export default async function run() {
  const routesFile = join(tmpdir(), `dex-routes-${process.pid}.json`);
  writeFileSync(routesFile, "{}");
  const dex = await startJsonServer(routesFile);
  const serve = (pairs) => writeFileSync(routesFile, JSON.stringify({ "*": { pairs } }));

  const go = ({ allow = allow4, history, env = {} }) => {
    const files = { "pools_allowlist.json": allow };
    if (history) files["tvl_history.json"] = history;
    const sb = sandbox(files);
    let exit = 0;
    try {
      execFileSync("node", ["pool_health.mjs"], {
        cwd: sb.dir, stdio: "pipe",
        env: { ...process.env, DEX_API_BASE: dex.url, ONCHAIN_FALLBACK: "0", ...env },
      });
    } catch (e) { exit = e.status; }
    const out = { report: sb.json("pool_health.json"), history: sb.json("tvl_history.json"), exit };
    sb.cleanup();
    return out;
  };
  const row = (o, addr) => o.report.pools.find((p) => p.pool === addr);
  const flags = (o, addr) => row(o, addr).flags.filter((f) => f.notify).map((f) => f.type);
  const allFlags = (o, addr) => row(o, addr).flags.map((f) => f.type);

  section("day one, with no history to compare against");
  serve([
    pair(A1, { tvl: 100000, price: 1.0, baseAmt: 50000, baseSym: "USDC", quoteSym: "USD₮" }),
    pair(A2, { tvl: 100000, price: 0.5, baseAmt: 100000, baseSym: "CELO", quoteSym: "USD₮" }),
    pair(A3, { tvl: 100000, price: 0.7, baseAmt: 100000, baseSym: "AUDm", quoteSym: "USD₮" }),
  ]);
  let o = go({});
  check("nothing is flagged", o.report.flagged, []);
  check("a pool Dexscreener does not list is marked internal-only", row(o, A4).source, "internal-only");
  check("its pool-wide TVL stays null rather than borrowing our share", row(o, A4).tvlUsd, null);
  check("our share is still reported", row(o, A4).internalUsd, 100000);
  check("and it raises no flag", flags(o, A4), []);
  check("history is seeded only for pool-wide readings", Object.keys(o.history.samples).length, 3);

  section("TVL against the last push");
  serve([pair(A1, { tvl: 130000, price: 1.0, baseAmt: 65000, baseSym: "USDC", quoteSym: "USD₮" })]);
  o = go({ history: { samples: { [A1]: days(4, 100000, 50, 100000, "USDC") } } });
  check("a 30% move with our own TVL flat is flagged", flags(o, A1), ["tvl_swing"]);
  const grew = JSON.parse(JSON.stringify(allow4)); grew.pools[A1].tvlUsd = 130000;
  o = go({ allow: grew, history: { samples: { [A1]: days(4, 100000, 50, 100000, "USDC") } } });
  check("the same move is silent when our own liquidity moved with it", flags(o, A1), []);
  check("though still recorded", allFlags(o, A1), ["tvl_swing"]);
  // a median would read +100% here; the last push is what counts
  const drifted = { samples: { [A1]: [
    ...days(3, 100000, 50, 100000, "USDC").slice(0, 3),
    { day: "2026-09-04", source: "poolwide", tvlUsd: 130000, skewPct: 50, internalUsd: 100000, skewBase: "USDC" },
  ]}};
  o = go({ history: drifted });
  check("flat since the last push is silent even after an earlier jump", flags(o, A1), []);

  section("peg, for dollar pairs only");
  serve([
    pair(A1, { tvl: 100000, price: 0.985, baseAmt: 50000, baseSym: "USDC", quoteSym: "USD₮" }),
    pair(A3, { tvl: 100000, price: 0.7, baseAmt: 100000, baseSym: "AUDm", quoteSym: "USD₮" }),
  ]);
  o = go({ history: { samples: { [A1]: days(4, 100000, 50, 100000, "USDC"), [A3]: days(4, 100000, 70, 100000, "AUDm") } } });
  check("a stable pair 1.5% off the dollar is flagged", flags(o, A1), ["peg_break"]);
  check("and past 1% it is urgent", row(o, A1).flags.find((f) => f.type === "peg_break").severity, "urgent");
  check("an FX pair at $0.70 is not a broken peg", flags(o, A3), []);

  section("skew: movement, not level, and never against the wrong token");
  serve([pair(A3, { tvl: 100000, price: 0.7, baseAmt: 128571, baseSym: "AUDm", quoteSym: "USD₮" })]); // 90%
  o = go({ history: { samples: { [A3]: days(4, 100000, 90, 100000, "AUDm") } } });
  check("structurally 90% skewed but steady -> silent", allFlags(o, A3), []);
  o = go({ history: { samples: { [A3]: days(4, 100000, 60, 100000, "AUDm") } } });
  check("a 30pt move is detected", allFlags(o, A3), ["skew_shift"]);
  check("but raises no flag by default", flags(o, A3), []);
  o = go({ history: { samples: { [A3]: days(4, 100000, 60, 100000, "AUDm") } }, env: { SKEW_NOTIFY: "1" } });
  check("SKEW_NOTIFY=1 turns it back into one", flags(o, A3), ["skew_shift"]);
  // valuing on-chain changed which token is "base", so stored percentages flipped sides
  o = go({ history: { samples: { [A3]: days(4, 100000, 10, 100000, "USD₮") } }, env: { SKEW_NOTIFY: "1" } });
  check("a percentage stored against the quote token is converted, not compared raw", flags(o, A3), []);
  o = go({ history: { samples: { [A3]: days(4, 100000, 10, 100000) } }, env: { SKEW_NOTIFY: "1" } });
  check("a sample that does not say which token it means is dropped", flags(o, A3), []);

  section("volatility, for assets that actually move");
  serve([
    pair(A2, { tvl: 100000, price: 0.5, baseAmt: 100000, baseSym: "CELO", quoteSym: "USD₮", h24: -12 }),
    pair(A3, { tvl: 100000, price: 0.7, baseAmt: 100000, baseSym: "AUDm", quoteSym: "USD₮", h24: -12 }),
  ]);
  o = go({ history: { samples: { [A2]: days(4, 100000, 50, 100000, "CELO"), [A3]: days(4, 100000, 70, 100000, "AUDm") } } });
  check("a CELO pair down 12% is flagged", flags(o, A2), ["volatile_swing"]);
  check("an FX pair down 12% is not", flags(o, A3), []);

  section("the pinned partner-drained pool");
  const none = { thresholdUsd: 100, pools: {} };
  serve([pair(SHALLOW, { tvl: 961, price: 1.0, baseAmt: 200, baseSym: "USD₮", quoteSym: "CELO" })]);
  o = go({ allow: none, history: { samples: { [SHALLOW]: days(4, 900, 21, 0, "USD₮") } } });
  check("jitter at $961 stays silent", flags(o, SHALLOW), []);
  serve([pair(SHALLOW, { tvl: 7200, price: 1.0, baseAmt: 1500, baseSym: "USD₮", quoteSym: "CELO" })]);
  o = go({ allow: none, history: { samples: { [SHALLOW]: days(4, 900, 21, 0, "USD₮") } } });
  check("crossing $5k is reported as the partner returning", flags(o, SHALLOW), ["partner_redeposit"]);

  section("history keeps one sample per day");
  serve([pair(A1, { tvl: 100000, price: 1.0, baseAmt: 50000, baseSym: "USDC", quoteSym: "USD₮" })]);
  const today = new Date().toISOString().slice(0, 10);
  o = go({ history: { samples: { [A1]: [{ day: today, source: "poolwide", tvlUsd: 111, skewPct: 1, internalUsd: 1, skewBase: "USDC" }] } } });
  check("today's sample is not duplicated", o.history.samples[A1].length, 1);
  check("nor overwritten", o.history.samples[A1][0].tvlUsd, 111);

  section("when Dexscreener cannot be reached at all");
  o = go({ env: { DEX_API_BASE: "http://127.0.0.1:1" } });
  check("it still exits 0", o.exit, 0);
  check("pools we hold report internal-only", o.report.pools.filter((p) => p.internalUsd > 0).every((p) => p.source === "internal-only"), true);
  check("pinned pools we hold nothing in are unavailable", o.report.pools.filter((p) => p.internalUsd === 0).every((p) => p.unavailable), true);
  check("and the failure is recorded", o.report.errors.length > 0, true);

  dex.stop();
}
