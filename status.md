# Celo LP Range Monitor

_Last checked: 2026-09-18T01:00:33.280Z_

_Incident update — 1 new pool flag(s)_

## 🔴 1 position beyond tolerance

| LP | Pair | Fee | Side | % out | % of range | tokenId |
|----|------|-----|------|-------|------------|---------|
| APF | USD₮/USDC | 0.01% | below | 0.04% | 66.7% | 201522 |

## ⚠️ Pool health — 3 pools flagged: USD₮/USDC, USD₮/GBPm, KESm/USD₮

| Pool | TVL | Price | Balance split | Range | 24h Δ | Status |
|------|-----|-------|---------------|-------|-------|--------|
| CELO/stCELO | $742,226 | $0.08622 | 9% stCELO / 91% CELO | below tolerance | +0.3% | OK |
| USD₮/USDm | $643,446 | $0.9992 | 82% USD₮ / 18% USDm | in range | -0.0% | OK |
| USD₮/WBTC ⭑ | $212,302 | $76,444 | 57% WBTC / 43% USD₮ | in range | -0.3% | OK |
| USD₮/WETH ⭑ | $203,253 | $2,446 | 52% WETH / 48% USD₮ | in range | +0.6% | OK |
| CELO/USD₮ ⭑ | $192,538 | $0.9958 | 54% USD₮ / 46% CELO | in range | +0.6% | OK |
| USD₮/USDC ⭑ | $187,243 | $0.9999 | 17% USDC / 83% USD₮ | out 0.04% | +0.0% | ⚠️ skew shift |
| USD₮/cNGN | $180,591 | $0.0007279 | 49% cNGN / 51% USD₮ | in range | -0.1% | OK |
| wARS/USD₮ | $109,167 | $0.0006277 | 68% wARS / 32% USD₮ | — | +0.0% | OK |
| USD₮/GBPm | $106,604 | $1.3300 | 43% GBPm / 57% USD₮ | in range | -0.1% | ⚠️ skew shift |
| USD₮/USAT ⭑ | $105,329 | $0.9992 | 70% USAT / 30% USD₮ | in range | -0.0% | OK |
| USD₮/AUDm | $99,369 ‡ | — | — | in range | +0.0% | OK |
| USD₮/NGNm | $66,239 | $0.0007486 | 32% NGNm / 68% USD₮ | in range | -0.0% | OK |
| USDm/EURm | $48,687 | $1.1400 | 99% EURm / 1% USDm | below tolerance | -0.4% | OK |
| PHPm/USD₮ | $35,179 ‡ | — | — | in range | -0.0% | OK |
| USD₮/wBRL | $28,422 | $0.1941 | 77% wBRL / 23% USD₮ | in range | +0.2% | OK |
| USD₮/BRLA | $15,449 ‡ | — | — | in range | +0.0% | OK |
| KESm/USD₮ | $11,520 | $0.007731 | 61% KESm / 39% USD₮ | in range | -0.0% | ⚠️ skew shift |
| USD₮/CELO (shallow) ⭑ | $933 | $1.0006 | 20% USD₮ / 80% CELO | — | +1.3% | OK |
| USD₮/USAT (main) ⭑ | $1 † | $0.9993 | 50% USD₮ / 50% USAT | — | -0.0% | OK |

**USD₮/USDC** — USDC share 17% vs 32% baseline (-16 pts, threshold ±15)

**USD₮/GBPm** — GBPm share 43% vs 21% baseline (+22 pts, threshold ±15)

**KESm/USD₮** — KESm share 61% vs 14% baseline (+47 pts, threshold ±15)


⭑ = on the daily pool list  
† TVL read from on-chain reserves (Dexscreener does not index this pool)  
‡ our internal TVL from Dune, not pool-wide — no market data available

---
22 open positions checked · 0 error(s) · pools ≥ $100 (17 tracked, 3 dust skipped)
Pool health: 19 pools listed, 3 flagged · 4 priced without Dexscreener
