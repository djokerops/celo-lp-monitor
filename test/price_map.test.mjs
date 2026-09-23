// Token pricing. Every pool's TVL is computed from on-chain reserves valued with
// this map, so a single bad price silently revalues every pool holding that token.
import { buildPriceMap } from "../pool_health.mjs";
import { check, section } from "./helpers.mjs";

const pair = (b, q, { tvl, price, base, quote }) => ({
  baseToken: { symbol: b, address: "0x" + b }, quoteToken: { symbol: q, address: "0x" + q },
  priceUsd: String(price), liquidity: { usd: tvl, base, quote },
});

export default async function run() {
  section("a quote price is a residual, and only as good as the reserve it divides by");
  // the real shape of USDm/EURm: 87 USDm against 42,324 EURm in a ~$48.7k pool
  let m = buildPriceMap([pair("EURm", "USDm", { tvl: 48690, price: 1.1479, base: 42324, quote: 87 })]);
  check("a trivial quote reserve yields no price at all", m.get("0xusdm"), undefined);
  m = buildPriceMap([pair("USDT", "USDm", { tvl: 643486, price: 0.9993, base: 528682, quote: 115181 })]);
  check("a meaningful one does", Math.round(m.get("0xusdm").price * 1000) / 1000, 1);

  section("a dollar stable must be worth about a dollar");
  m = buildPriceMap([pair("USDm", "EURm", { tvl: 1000, price: 3.02, base: 100, quote: 100 })]);
  check("a 'stable' quoted at $3.02 is refused", m.get("0xusdm"), undefined);

  section("confidence ranking");
  m = buildPriceMap([
    pair("USDT", "CELO", { tvl: 195162, price: 0.9993, base: 108122, quote: 1070943 }),
    pair("stCELO", "CELO", { tvl: 782206, price: 0.08622, base: 734670, quote: 8799598 }),
  ]);
  check("a stable itself ranks highest", m.get("0xusdt").rank, 0);
  check("priced against a stable ranks next", m.get("0xcelo").rank, 1);
  check("priced only against a floater ranks last", m.get("0xstcelo").rank, 2);
}
