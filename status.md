# Celo LP Range Monitor

_Last checked: 2026-11-14T23:00:31.022Z_

_Incident update — USD₮/WETH volatile_swing_

## ⚠️ Pool health — 5 pools flagged: CELO/stCELO, USD₮/WETH, USD₮/USDC, USD₮/USAT, USDm/EURm

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,895 | $627,491 | $0.9991 | 85.74% USD₮ / 14.26% USDm | in range | +0.0% | OK |
| CELO/stCELO | $590,781 | $609,508 | $0.06143 | 95.22% CELO / 4.78% stCELO | 2 of 3 out | -6.7% | 🔴 out of range |
| USD₮/WBTC | $221,341 | $168,597 | $0.9991 | 36.21% USD₮ / 63.79% WBTC | in range | -10.4% | OK |
| USD₮/USDC | $188,194 | $166,582 | $0.9991 | 79.45% USD₮ / 20.55% USDC | 1 of 2 out | +0.0% | 🔴 out of range |
| USD₮/cNGN | $177,691 | $165,815 | $0.9991 | 36.62% USD₮ / 63.38% cNGN | in range | -0.3% | OK |
| CELO/USD₮ | $163,747 | $154,545 | $0.05745 | 63.25% CELO / 36.75% USD₮ | in range | -7.7% | OK |
| USD₮/WETH | $161,825 | $167,890 | $0.9991 | 32.39% USD₮ / 67.61% WETH | in range | -8.0% | ⚠️ volatile swing |
| USD₮/USAT | $143,417 | $104,914 | $0.9991 | 66.59% USD₮ / 33.41% USAT | 1 of 2 out | -0.8% | 🔴 out of range |
| USD₮/GBPm | $106,034 | $105,093 | $0.9991 | 32.35% USD₮ / 67.65% GBPm | in range | -0.1% | OK |
| USD₮/AUDm | $100,467 | $99,319 | $0.9991 | 88.24% USD₮ / 11.76% AUDm | in range | +0.0% | OK |
| USD₮/NGNm | $65,698 | $65,587 | $0.9991 | 67.57% USD₮ / 32.43% NGNm | in range | +0.0% | OK |
| USDm/EURm | $46,683 | $46,635 | $1.0006 | 0.16% USDm / 99.84% EURm | out of range | -0.9% | 🔴 out of range |
| PHPm/USD₮ | $42,145 | $34,921 | $0.01571 | 52.37% PHPm / 47.63% USD₮ | in range | -0.0% | OK |
| USD₮/BRLA | $29,389 | $14,694 | $0.9991 | 48.82% USD₮ / 51.18% BRLA | in range | -0.9% | OK |
| USD₮/wBRL | $27,648 | $26,083 | $0.9991 | 0.08% USD₮ / 99.92% wBRL | in range | +0.0% | OK |
| KESm/USD₮ | $11,518 | $1,018 | $0.007725 | 94.36% KESm / 5.64% USD₮ | in range | +0.0% | OK |
| USD₮/CELO (shallow) | $795 | — | $0.06533 | 85.47% CELO / 14.53% USD₮ | — | -0.7% | OK |
| USD₮/USAT(no liq) | $1 | — | $0.9991 | 50.34% USD₮ / 49.66% USAT | — | +0.0% | OK |

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/WETH**: 24h price -8.0% (threshold ±8%)

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

---
22 open positions checked · 5 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 5 flagged
