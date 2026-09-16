# Celo LP Range Monitor

_Last checked: 2026-09-16T17:00:32.943Z_

_Incident update — 1 new pool flag(s)_

## 🔴 1 position beyond tolerance

| LP | Pair | Fee | Side | % out | % of range | tokenId |
|----|------|-----|------|-------|------------|---------|
| APF | USD₮/USDC | 0.01% | below | 0.03% | 50% | 201522 |

## ⚠️ Pool health — 1 pool flagged: wARS/USD₮

| Pool | TVL | Price | Balance split | Range | 24h Δ | Status |
|------|-----|-------|---------------|-------|-------|--------|
| CELO/stCELO | $740,237 | $0.08599 | 9% stCELO / 91% CELO | below tolerance | -5.0% | OK |
| USD₮/USDm | $643,504 | $0.9993 | 78% USD₮ / 22% USDm | in range | -0.0% | OK |
| USD₮/WBTC ⭑ | $210,446 | $75,532 | 58% WBTC / 42% USD₮ | in range | -2.7% | OK |
| USD₮/WETH ⭑ | $200,987 | $2,391 | 54% WETH / 46% USD₮ | in range | -2.5% | OK |
| CELO/USD₮ ⭑ | $189,561 | $1.0011 | 52% USD₮ / 48% CELO | in range | -1.8% | OK |
| USD₮/USDC ⭑ | $187,250 | $0.9999 | 18% USDC / 82% USD₮ | out 0.03% | -0.0% | OK |
| USD₮/cNGN | $168,235 ‡ | — | — | in range | — | OK |
| USD₮/GBPm | $106,890 | $1.3400 | 24% GBPm / 76% USD₮ | in range | -0.1% | OK |
| USD₮/USAT ⭑ | $105,352 | $0.9995 | 68% USAT / 32% USD₮ | in range | -0.0% | OK |
| USD₮/AUDm | $99,369 ‡ | — | — | in range | — | OK |
| USD₮/NGNm | $66,246 | $0.0007487 | 32% NGNm / 68% USD₮ | in range | -0.0% | OK |
| USDm/EURm | $48,979 | $1.1500 | 93% EURm / 7% USDm | in range | -0.0% | OK |
| PHPm/USD₮ | $42,480 | $0.01594 | 52% PHPm / 48% USD₮ | in range | -0.0% | OK |
| USD₮/wBRL | $28,358 | $0.1935 | 79% wBRL / 21% USD₮ | in range | -0.1% | OK |
| USD₮/BRLA | $15,449 ‡ | — | — | in range | -0.2% | OK |
| KESm/USD₮ | $11,526 | $0.007740 | 14% KESm / 86% USD₮ | in range | -0.0% | OK |
| USD₮/CELO (shallow) ⭑ | $902 | $0.9981 | 19% USD₮ / 81% CELO | — | -4.1% | OK |
| USD₮/USAT (main) ⭑ | $1 † | $0.9994 | 50% USD₮ / 50% USAT | — | -0.0% | OK |
| wARS/USD₮ | $1 | $0.0006276 | 62% wARS / 38% USD₮ | — | -100.0% | ⚠️ TVL swing |

**wARS/USD₮** — TVL $1 vs $109,964 at the last push on 2026-09-15 (-100.0%, threshold ±20%)


⭑ = on the daily pool list  
† TVL read from on-chain reserves (Dexscreener does not index this pool)  
‡ our internal TVL from Dune, not pool-wide — no market data available

---
22 open positions checked · 0 error(s) · pools ≥ $100 (17 tracked, 3 dust skipped)
Pool health: 19 pools listed, 1 flagged · 4 priced without Dexscreener
