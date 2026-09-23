// Serves whatever JSON sits in the file named by argv[2], re-read per request so
// a test can change the response between runs. Keys of that file are matched as
// substrings of the request URL; "*" is the fallback. A null value 404s.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const FILE = process.argv[2];
const srv = createServer((req, res) => {
  let routes = {};
  try { routes = JSON.parse(readFileSync(FILE, "utf8")); } catch {}
  const url = decodeURIComponent(req.url);
  const key = Object.keys(routes).find((k) => k !== "*" && url.includes(k)) ?? "*";
  const body = routes[key];
  res.setHeader("content-type", "application/json");
  if (body == null) { res.statusCode = 404; res.end("{}"); return; }
  res.end(JSON.stringify(body));
});
srv.listen(0, () => console.log(srv.address().port));
