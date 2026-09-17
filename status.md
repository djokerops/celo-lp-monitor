# Celo LP Range Monitor

_Last checked: 2026-09-17T11:00:27.508Z_

_Daily digest_

## 🔴 1 position beyond tolerance

| LP | Pair | Fee | Side | % out | % of range | tokenId |
|----|------|-----|------|-------|------------|---------|
| APF | USD₮/USDC | 0.01% | below | 0.02% | 33.3% | 201522 |

## ⚠️ Pool health — 4 pools flagged: USD₮/USDm, USD₮/USDC, USD₮/GBPm, KESm/USD₮

| Pool | TVL | Price | Balance split | Range | 24h Δ | Status |
|------|-----|-------|---------------|-------|-------|--------|
| CELO/stCELO | $737,355 ‡ | — | — | below tolerance | — | OK |
| USD₮/USDm | $643,459 | $0.9992 | 81% USD₮ / 19% USDm | in range | -0.0% | ⚠️ skew shift |
| USD₮/WBTC ⭑ | $211,827 | $76,208 | 58% WBTC / 42% USD₮ | in range | -0.1% | OK |
| USD₮/WETH ⭑ | $202,860 | $2,433 | 53% WETH / 47% USD₮ | in range | +0.9% | OK |
| CELO/USD₮ ⭑ | $192,227 | $0.9991 | 54% USD₮ / 46% CELO | in range | -1.1% | OK |
| USD₮/USDC ⭑ | $187,237 | $0.9998 | 19% USDC / 81% USD₮ | out 0.02% | -0.0% | ⚠️ skew shift |
| USD₮/cNGN | $180,596 | $0.0007279 | 49% cNGN / 51% USD₮ | in range | -0.1% | OK |
| wARS/USD₮ | $109,126 | $0.0006273 | 68% wARS / 32% USD₮ | — | -0.7% | OK |
| USD₮/GBPm | $106,712 | $1.3400 | 37% GBPm / 63% USD₮ | in range | -0.2% | ⚠️ skew shift |
| USD₮/USAT ⭑ | $105,337 | $0.9993 | 69% USAT / 31% USD₮ | in range | -0.0% | OK |
| USD₮/AUDm | $99,369 ‡ | — | — | in range | -0.0% | OK |
| USD₮/NGNm | $66,239 | $0.0007486 | 32% NGNm / 68% USD₮ | in range | -0.0% | OK |
| USDm/EURm | $48,687 | $1.1400 | 99% EURm / 1% USDm | below tolerance | -0.6% | OK |
| PHPm/USD₮ | $42,480 | $0.01594 | 52% PHPm / 48% USD₮ | in range | -0.0% | OK |
| USD₮/wBRL | $28,376 ‡ | — | — | in range | — | OK |
| USD₮/BRLA | $15,449 ‡ | — | — | in range | -0.2% | OK |
| KESm/USD₮ | $11,520 | $0.007731 | 63% KESm / 37% USD₮ | in range | -0.1% | ⚠️ skew shift |
| USD₮/CELO (shallow) ⭑ | $926 | $1.0018 | 20% USD₮ / 80% CELO | — | -1.9% | OK |
| USD₮/USAT (main) ⭑ | $1 † | $0.9993 | 50% USD₮ / 50% USAT | — | -0.0% | OK |

**USD₮/USDm** — USD₮ share 81% vs 66% baseline (+15 pts, threshold ±15)

**USD₮/USDC** — USDC share 19% vs 41% baseline (-22 pts, threshold ±15)

**USD₮/GBPm** — GBPm share 37% vs 21% baseline (+16 pts, threshold ±15)

**KESm/USD₮** — KESm share 63% vs 14% baseline (+49 pts, threshold ±15)


⭑ = on the daily pool list  
† TVL read from on-chain reserves (Dexscreener does not index this pool)  
‡ our internal TVL from Dune, not pool-wide — no market data available

---
22 open positions checked · 0 error(s) · pools ≥ $100 (17 tracked, 3 dust skipped)
Pool health: 19 pools listed, 4 flagged · 5 priced without Dexscreener
