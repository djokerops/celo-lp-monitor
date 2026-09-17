# Celo LP Range Monitor

_Last checked: 2026-09-17T00:00:30.120Z_

_Incident update — 4 new pool flag(s)_

## 🔴 1 position beyond tolerance

| LP | Pair | Fee | Side | % out | % of range | tokenId |
|----|------|-----|------|-------|------------|---------|
| APF | USD₮/USDC | 0.01% | below | 0.03% | 50% | 201522 |

## ⚠️ Pool health — 4 pools flagged: USD₮/USDm, USD₮/USDC, USD₮/GBPm, KESm/USD₮

| Pool | TVL | Price | Balance split | Range | 24h Δ | Status |
|------|-----|-------|---------------|-------|-------|--------|
| CELO/stCELO | $740,237 | $0.08599 | 9% stCELO / 91% CELO | below tolerance | -6.6% | OK |
| USD₮/USDm | $643,460 | $0.9992 | 81% USD₮ / 19% USDm | in range | -0.0% | ⚠️ skew shift |
| USD₮/WBTC ⭑ | $212,928 | $75,970 | 58% WBTC / 42% USD₮ | in range | +0.4% | OK |
| USD₮/WETH ⭑ | $202,092 | $2,415 | 53% WETH / 47% USD₮ | in range | +0.5% | OK |
| CELO/USD₮ ⭑ | $191,447 | $0.9967 | 54% USD₮ / 46% CELO | in range | -1.5% | OK |
| USD₮/USDC ⭑ | $187,239 | $0.9999 | 18% USDC / 82% USD₮ | out 0.03% | -0.0% | ⚠️ skew shift |
| USD₮/cNGN | $168,235 ‡ | — | — | in range | — | OK |
| wARS/USD₮ | $109,127 | $0.0006273 | 68% wARS / 32% USD₮ | — | -0.7% | OK |
| USD₮/GBPm | $106,721 | $1.3400 | 37% GBPm / 63% USD₮ | in range | -0.2% | ⚠️ skew shift |
| USD₮/USAT ⭑ | $105,341 | $0.9994 | 68% USAT / 32% USD₮ | in range | -0.0% | OK |
| USD₮/AUDm | $99,369 ‡ | — | — | in range | -0.0% | OK |
| USD₮/NGNm | $66,246 | $0.0007487 | 32% NGNm / 68% USD₮ | in range | -0.0% | OK |
| USDm/EURm | $48,902 | $1.1500 | 100% EURm / 0% USDm | in range | -0.2% | OK |
| PHPm/USD₮ | $42,480 | $0.01594 | 52% PHPm / 48% USD₮ | in range | -0.0% | OK |
| USD₮/wBRL | $28,376 ‡ | — | — | in range | — | OK |
| USD₮/BRLA | $15,449 ‡ | — | — | in range | -0.2% | OK |
| KESm/USD₮ | $11,523 | $0.007734 | 46% KESm / 54% USD₮ | in range | -0.0% | ⚠️ skew shift |
| USD₮/CELO (shallow) ⭑ | $920 | $0.9963 | 20% USD₮ / 80% CELO | — | -2.5% | OK |
| USD₮/USAT (main) ⭑ | $1 † | $0.9993 | 50% USD₮ / 50% USAT | — | -0.0% | OK |

**USD₮/USDm** — USD₮ share 81% vs 66% baseline (+15 pts, threshold ±15)

**USD₮/USDC** — USDC share 18% vs 41% baseline (-23 pts, threshold ±15)

**USD₮/GBPm** — GBPm share 37% vs 21% baseline (+15 pts, threshold ±15)

**KESm/USD₮** — KESm share 46% vs 14% baseline (+32 pts, threshold ±15)


⭑ = on the daily pool list  
† TVL read from on-chain reserves (Dexscreener does not index this pool)  
‡ our internal TVL from Dune, not pool-wide — no market data available

---
22 open positions checked · 0 error(s) · pools ≥ $100 (17 tracked, 3 dust skipped)
Pool health: 19 pools listed, 4 flagged · 5 priced without Dexscreener
