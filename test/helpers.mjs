// Shared test plumbing. Everything here is offline: no RPC, no Dexscreener, no
// Dune, no API keys. The suites stub each dependency over loopback so they run
// anywhere and give the same answer every time.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, copyFileSync, rmSync, symlinkSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
export const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`   ${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`);
  ok ? pass++ : fail++;
  return ok;
};
export const section = (name) => console.log(`  -- ${name}`);
export const tally = () => ({ pass, fail });

// Stub servers run as their own processes. The driver blocks on execFileSync, so
// an in-process server would never get the chance to answer the child.
function startStub(script, args = []) {
  const child = spawn("node", [join(REPO, "test", "stubs", script), ...args], { stdio: ["ignore", "pipe", "inherit"] });
  return new Promise((resolve) => {
    child.stdout.once("data", (d) =>
      resolve({ url: `http://127.0.0.1:${String(d).trim()}`, stop: () => child.kill() }));
  });
}

// An endpoint where every eth_call returns zero: no wallet holds any position, so
// check.mjs runs end to end without a chain.
export const startEmptyChain = () => startStub("chain.mjs");

// An endpoint serving canned JSON, routed by substring of the request URL. Write
// the routes file, then point DEX_API_BASE or DUNE_API_BASE at the returned url.
export const startJsonServer = (routesFile) => startStub("json.mjs", [routesFile]);

// A throwaway copy of the repo scripts, so a test never writes into the project.
export function sandbox(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "lpmon-"));
  for (const f of ["check.mjs", "pool_health.mjs", "refresh_allowlist.mjs"]) copyFileSync(join(REPO, f), join(dir, f));
  symlinkSync(join(REPO, "node_modules"), join(dir, "node_modules"));
  for (const [name, content] of Object.entries(files))
    writeFileSync(join(dir, name), typeof content === "string" ? content : JSON.stringify(content, null, 2));
  return {
    dir,
    read: (n) => (existsSync(join(dir, n)) ? readFileSync(join(dir, n), "utf8") : null),
    json: (n) => (existsSync(join(dir, n)) ? JSON.parse(readFileSync(join(dir, n), "utf8")) : null),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
