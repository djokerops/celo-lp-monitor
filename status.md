# Celo LP Range Monitor

_Last checked: 2026-11-21T04:00:30.129Z_

_Incident update — USD₮/WBTC volatile_swing_

## ⚠️ Pool health — 8 pools flagged: USD₮/USDm, CELO/stCELO, USD₮/USDC, USD₮/WBTC, USD₮/WETH, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,412 | $627,429 | $0.9988 | 98.77% USD₮ / 1.23% USDm | out of range | -0.1% | 🔴 out of range |
| CELO/stCELO | $510,109 | $540,959 | $0.05304 | 95.33% CELO / 4.67% stCELO | 2 of 3 out | -9.0% | 🔴 out of range |
| USD₮/WBTC | $191,863 | $159,802 | $0.9988 | 32.81% USD₮ / 67.19% WBTC | in range | -10.0% | ⚠️ volatile swing |
| USD₮/USDC | $187,914 | $166,569 | $0.9988 | 92.96% USD₮ / 7.04% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $174,994 | $162,883 | $0.9988 | 26.07% USD₮ / 73.93% cNGN | in range | -0.1% | OK |
| CELO/USD₮ | $154,060 | $143,085 | $0.05240 | 68.88% CELO / 31.12% USD₮ | in range | -7.2% | OK |
| USD₮/WETH | $148,763 | $158,221 | $0.9988 | 25.92% USD₮ / 74.08% WETH | in range | -7.7% | ⚠️ volatile swing |
| USD₮/USAT | $144,304 | $104,910 | $0.9988 | 68.36% USD₮ / 31.64% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,208 | $104,240 | $0.9988 | 9.23% USD₮ / 90.77% GBPm | in range | -0.0% | OK |
| USD₮/AUDm | $100,428 | $99,310 | $0.9988 | 88.24% USD₮ / 11.76% AUDm | in range | -0.0% | OK |
| USD₮/NGNm | $65,096 | $65,356 | $0.9988 | 53.74% USD₮ / 46.26% NGNm | in range | -0.7% | OK |
| USDm/EURm | $46,352 | $46,377 | $0.9996 | 0.15% USDm / 99.85% EURm | out of range | -0.7% | 🔴 out of range |
| PHPm/USD₮ | $42,105 | $34,903 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | -0.0% | OK |
| USD₮/BRLA | $28,467 | $14,356 | $0.9988 | 36.56% USD₮ / 63.44% BRLA | in range | -1.6% | OK |
| USD₮/wBRL | $27,627 | $24,818 | $0.9988 | 0.06% USD₮ / 99.94% wBRL | in range | -0.1% | OK |
| KESm/USD₮ | $11,296 | $1,012 | $0.007569 | 95.14% KESm / 4.86% USD₮ | in range | -1.2% | OK |
| USD₮/CELO (shallow) | $0.8385 | — | $0.05366 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9988 | 46.01% USD₮ / 53.99% USAT | — | -100.0% | ⚠️ TVL swing |

**USD₮/USDm**: our only position here is out of range(earning no fees) -- pool:
`0x5dC631aD6C26BEA1a59fBF2C2680CF3df43d249f` · out of range: LP - mento, positionNFT - 55551

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/WBTC**: 24h price -8.2% (threshold ±8%)

**USD₮/WETH**: 24h price -9.6% (threshold ±8%)

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/USAT(no liq)**: TVL $0 vs $1 at the last push on 2026-11-20 (-100.0%, threshold ±20%)

---
22 open positions checked · 6 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 8 flagged
