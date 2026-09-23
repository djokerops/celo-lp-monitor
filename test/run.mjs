#!/usr/bin/env node
// Runs every suite. Entirely offline: the chain, Dexscreener and Dune are all
// stubbed over loopback, so this needs no network, no RPC and no API keys.
import { tally } from "./helpers.mjs";

const suites = ["price_map", "pool_health", "refresh", "publish"];
for (const name of suites) {
  console.log(`\n=== ${name} ===`);
  const mod = await import(`./${name}.test.mjs`);
  await mod.default();
}
const { pass, fail } = tally();
console.log(`\n${"=".repeat(46)}\n${pass} passed, ${fail} failed\n${"=".repeat(46)}`);
process.exit(fail ? 1 : 0);
