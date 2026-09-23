// When the monitor speaks. The hourly check runs regardless; publishing is rare
// by design: one digest a day, plus a flag that has not already been announced
// since that digest.
import { execFileSync } from "node:child_process";
import { check, section, startEmptyChain, sandbox } from "./helpers.mjs";

const A = "0xaaaa000000000000000000000000000000000001";
const B = "0xbbbb000000000000000000000000000000000002";
const FA = `${A}:peg_break`, FB = `${B}:peg_break`;
const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

const poolHealth = (flagged) => ({
  checkedAt: "x", poolsChecked: 2,
  pools: [A, B].map((pool) => ({
    pool, pair: pool === A ? "POOL/A" : "POOL/B", liz: false, internalUsd: 1000,
    tvlUsd: 1000, priceUsd: 1, skew: { basePct: 50, baseSym: "X", quoteSym: "Y" },
    devPct: null, source: "onchain",
    flags: flagged.includes(pool) ? [{ type: "peg_break", severity: "warn", notify: true, detail: "off peg" }] : [],
  })),
  errors: [],
});

export default async function run() {
  const chain = await startEmptyChain();
  const go = ({ flagged = [], state, env = {} }) => {
    const files = { "pool_health.json": poolHealth(flagged), "pools_allowlist.json": { thresholdUsd: 100, pools: {} } };
    if (state) files["state.json"] = state;
    const sb = sandbox(files);
    execFileSync("node", ["check.mjs"], {
      cwd: sb.dir, stdio: "pipe",
      env: { ...process.env, CELO_RPC: chain.url, DIGEST_UTC_HOUR: "99", ...env },
    });
    const out = { sig: sb.json("run_signal.json"), state: sb.json("state.json"), status: sb.read("status.md") };
    sb.cleanup();
    return out;
  };

  section("the daily digest");
  let r = go({ state: { poolFlags: [], lastDigestDay: yesterday }, env: { DIGEST_UTC_HOUR: "0" } });
  check("publishes once the hour has passed", r.sig.publish, true);
  check("and records the day", r.state.lastDigestDay, today);
  r = go({ state: { poolFlags: [], lastDigestDay: today }, env: { DIGEST_UTC_HOUR: "0" } });
  check("second run the same day stays silent", r.sig.publish, false);
  r = go({ state: { poolFlags: [], lastDigestDay: yesterday }, env: { DIGEST_UTC_HOUR: "99" } });
  check("before the hour, stays silent", r.sig.publish, false);
  r = go({ state: { poolFlags: [], lastDigestDay: today }, env: { FORCE_DIGEST: "1" } });
  check("FORCE_DIGEST overrides both", r.sig.publish, true);

  section("a flag that has not been announced yet");
  r = go({ flagged: [A], state: { poolFlags: [], lastDigestDay: today, announcedSinceDigest: [] } });
  check("publishes", r.sig.publish, true);
  check("and is recorded as announced", r.state.announcedSinceDigest, [FA]);

  section("the same pool flapping");
  r = go({ flagged: [], state: { poolFlags: [FA], lastDigestDay: today, announcedSinceDigest: [FA] } });
  check("clearing stays silent", r.sig.publish, false);
  r = go({ flagged: [A], state: { poolFlags: [], lastDigestDay: today, announcedSinceDigest: [FA] } });
  check("going out again stays silent", r.sig.publish, false);

  section("a different pool");
  r = go({ flagged: [A, B], state: { poolFlags: [FA], lastDigestDay: today, announcedSinceDigest: [FA] } });
  check("publishes", r.sig.publish, true);
  check("naming only the new one", r.sig.reasons, ["POOL/B peg_break"]);
  check("both now announced", r.state.announcedSinceDigest, [FA, FB]);

  section("the digest resets the window");
  r = go({ flagged: [A], state: { poolFlags: [FA], lastDigestDay: yesterday, announcedSinceDigest: [FA, FB] }, env: { FORCE_DIGEST: "1" } });
  check("window reset to what is flagged now", r.state.announcedSinceDigest, [FA]);
  r = go({ flagged: [A, B], state: { poolFlags: [FA], lastDigestDay: today, announcedSinceDigest: [FA] } });
  check("a pool that flapped earlier can speak after the reset", r.sig.publish, true);

  section("a quiet run leaves the report alone");
  r = go({ state: { poolFlags: [], lastDigestDay: today } });
  check("status.md is not rewritten", r.status, null);

  chain.stop();
}
