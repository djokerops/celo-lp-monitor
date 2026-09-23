// A JSON-RPC endpoint that answers every eth_call with zero, so
// NonfungiblePositionManager.balanceOf reports no positions for any wallet and
// check.mjs exercises its publish path with no chain behind it.
// Runs as its own process: the test driver blocks on execFileSync, which would
// stop an in-process server from ever answering.
import { createServer } from "node:http";
const ZERO = "0x" + "0".repeat(64);
const answer = (r) => ({
  jsonrpc: "2.0", id: r.id,
  result: r.method === "eth_chainId" ? "0xa4ec" : r.method === "eth_blockNumber" ? "0x1" : ZERO,
});
const srv = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let p; try { p = JSON.parse(body || "{}"); } catch { p = {}; }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(Array.isArray(p) ? p.map(answer) : answer(p)));
  });
});
srv.listen(0, () => console.log(srv.address().port));
