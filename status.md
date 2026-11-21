# Celo LP Range Monitor

_Last checked: 2026-11-21T01:00:33.998Z_

_Incident update — USD₮/USDm out_of_range_

## ⚠️ Pool health — 6 pools flagged: USD₮/USDm, CELO/stCELO, USD₮/USDC, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,362 | $627,429 | $0.9987 | 98.78% USD₮ / 1.22% USDm | out of range | -0.1% | 🔴 out of range |
| CELO/stCELO | $521,637 | $540,959 | $0.05424 | 95.33% CELO / 4.67% stCELO | 2 of 3 out | -7.0% | 🔴 out of range |
| USD₮/WBTC | $197,068 | $159,802 | $0.9987 | 34.73% USD₮ / 65.27% WBTC | in range | -7.5% | OK |
| USD₮/USDC | $187,891 | $166,569 | $0.9987 | 94.93% USD₮ / 5.07% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $174,937 | $162,883 | $0.9987 | 25.91% USD₮ / 74.09% cNGN | in range | -0.1% | OK |
| CELO/USD₮ | $158,583 | $143,085 | $0.05469 | 66.26% CELO / 33.74% USD₮ | in range | -4.5% | OK |
| USD₮/WETH | $152,654 | $158,221 | $0.9987 | 27.95% USD₮ / 72.05% WETH | in range | -5.3% | OK |
| USD₮/USAT | $144,280 | $104,910 | $0.9987 | 68.38% USD₮ / 31.62% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,199 | $104,240 | $0.9987 | 9.23% USD₮ / 90.77% GBPm | in range | -0.0% | OK |
| USD₮/AUDm | $100,419 | $99,310 | $0.9987 | 88.24% USD₮ / 11.76% AUDm | in range | -0.0% | OK |
| USD₮/NGNm | $65,091 | $65,356 | $0.9987 | 53.74% USD₮ / 46.26% NGNm | in range | -0.7% | OK |
| USDm/EURm | $46,649 | $46,377 | $0.9996 | 0.15% USDm / 99.85% EURm | out of range | -0.1% | 🔴 out of range |
| PHPm/USD₮ | $42,101 | $34,903 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | -0.0% | OK |
| USD₮/BRLA | $28,464 | $14,356 | $0.9987 | 36.56% USD₮ / 63.44% BRLA | in range | -1.6% | OK |
| USD₮/wBRL | $27,624 | $24,818 | $0.9987 | 0.06% USD₮ / 99.94% wBRL | in range | -0.1% | OK |
| KESm/USD₮ | $11,394 | $1,012 | $0.007639 | 95.16% KESm / 4.84% USD₮ | in range | -0.3% | OK |
| USD₮/CELO (shallow) | $0.8385 | — | $0.05366 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9987 | 46.02% USD₮ / 53.98% USAT | — | -100.0% | ⚠️ TVL swing |

**USD₮/USDm**: our only position here is out of range(earning no fees) -- pool:
`0x5dC631aD6C26BEA1a59fBF2C2680CF3df43d249f` · out of range: LP - mento, positionNFT - 55551

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/USAT(no liq)**: TVL $0 vs $1 at the last push on 2026-11-20 (-100.0%, threshold ±20%)

---
22 open positions checked · 6 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 6 flagged
