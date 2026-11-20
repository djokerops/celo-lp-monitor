# Celo LP Range Monitor

_Last checked: 2026-11-20T19:00:34.565Z_

_Incident update — USD₮/WETH volatile_swing_

## ⚠️ Pool health — 6 pools flagged: CELO/stCELO, USD₮/USDC, USD₮/WETH, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,602 | $627,429 | $0.9991 | 91.32% USD₮ / 8.68% USDm | in range | -0.0% | OK |
| CELO/stCELO | $519,854 | $540,959 | $0.05406 | 95.33% CELO / 4.67% stCELO | 2 of 3 out | -9.7% | 🔴 out of range |
| USD₮/WBTC | $202,858 | $159,802 | $0.9991 | 32.92% USD₮ / 67.08% WBTC | in range | -5.7% | OK |
| USD₮/USDC | $187,935 | $166,569 | $0.9991 | 82.60% USD₮ / 17.40% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $175,233 | $162,883 | $0.9991 | 26.77% USD₮ / 73.23% cNGN | in range | +0.7% | OK |
| CELO/USD₮ | $157,388 | $143,085 | $0.05407 | 66.96% CELO / 33.04% USD₮ | in range | -6.8% | OK |
| USD₮/WETH | $152,213 | $158,221 | $0.9991 | 27.70% USD₮ / 72.30% WETH | in range | -6.2% | ⚠️ volatile swing |
| USD₮/USAT | $144,337 | $104,910 | $0.9991 | 68.58% USD₮ / 31.42% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,300 | $104,240 | $0.9991 | 10.81% USD₮ / 89.19% GBPm | in range | -0.3% | OK |
| USD₮/AUDm | $100,458 | $99,310 | $0.9991 | 88.24% USD₮ / 11.76% AUDm | in range | +0.0% | OK |
| USD₮/NGNm | $65,116 | $65,356 | $0.9991 | 53.74% USD₮ / 46.26% NGNm | in range | -0.8% | OK |
| USDm/EURm | $46,458 | $46,377 | $1.0003 | 0.15% USDm / 99.85% EURm | out of range | -0.2% | 🔴 out of range |
| PHPm/USD₮ | $42,115 | $34,903 | $0.01569 | 52.36% PHPm / 47.64% USD₮ | in range | +0.0% | OK |
| USD₮/BRLA | $28,627 | $14,356 | $0.9991 | 37.78% USD₮ / 62.22% BRLA | in range | -1.2% | OK |
| USD₮/wBRL | $27,635 | $24,818 | $0.9991 | 0.06% USD₮ / 99.94% wBRL | in range | -0.0% | OK |
| KESm/USD₮ | $11,405 | $1,012 | $0.007646 | 95.16% KESm / 4.84% USD₮ | in range | -1.0% | OK |
| USD₮/CELO (shallow) | $0.8388 | — | $0.05368 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9991 | 46.01% USD₮ / 53.99% USAT | — | -100.0% | ⚠️ TVL swing |

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/WETH**: 24h price -8.3% (threshold ±8%)

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/USAT(no liq)**: TVL $0 vs $1 at the last push on 2026-11-19 (-100.0%, threshold ±20%)

---
22 open positions checked · 5 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 6 flagged
