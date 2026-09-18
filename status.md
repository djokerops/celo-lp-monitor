# Celo LP Range Monitor

_Last checked: 2026-09-18T00:00:32.805Z_

_Incident update — 2 pool flag(s) cleared_

## 🔴 1 position beyond tolerance

| LP | Pair | Fee | Side | % out | % of range | tokenId |
|----|------|-----|------|-------|------------|---------|
| APF | USD₮/USDC | 0.01% | below | 0.03% | 50% | 201522 |

## ⚠️ Pool health — 2 pools flagged: USD₮/GBPm, KESm/USD₮

| Pool | TVL | Price | Balance split | Range | 24h Δ | Status |
|------|-----|-------|---------------|-------|-------|--------|
| CELO/stCELO | $742,226 | $0.08622 | 9% stCELO / 91% CELO | below tolerance | +0.3% | OK |
| USD₮/USDm | $643,446 | $0.9992 | 82% USD₮ / 18% USDm | in range | -0.0% | OK |
| USD₮/WBTC ⭑ | $213,880 | $76,259 | 58% WBTC / 42% USD₮ | in range | +0.4% | OK |
| USD₮/WETH ⭑ | $203,152 | $2,444 | 52% WETH / 48% USD₮ | in range | +0.5% | OK |
| CELO/USD₮ ⭑ | $192,537 | $0.9965 | 54% USD₮ / 46% CELO | in range | +0.6% | OK |
| USD₮/USDC ⭑ | $187,241 | $0.9998 | 17% USDC / 83% USD₮ | out 0.03% | +0.0% | OK |
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
| KESm/USD₮ | $11,520 | $0.007731 | 62% KESm / 38% USD₮ | in range | -0.0% | ⚠️ skew shift |
| USD₮/CELO (shallow) ⭑ | $928 | $0.9954 | 20% USD₮ / 80% CELO | — | +0.9% | OK |
| USD₮/USAT (main) ⭑ | $1 † | $0.9993 | 50% USD₮ / 50% USAT | — | -0.0% | OK |

**USD₮/GBPm** — GBPm share 43% vs 21% baseline (+22 pts, threshold ±15)

**KESm/USD₮** — KESm share 62% vs 14% baseline (+48 pts, threshold ±15)


⭑ = on the daily pool list  
† TVL read from on-chain reserves (Dexscreener does not index this pool)  
‡ our internal TVL from Dune, not pool-wide — no market data available

---
22 open positions checked · 0 error(s) · pools ≥ $100 (17 tracked, 3 dust skipped)
Pool health: 19 pools listed, 2 flagged · 4 priced without Dexscreener
