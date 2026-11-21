# Celo LP Range Monitor

_Last checked: 2026-11-21T14:00:34.900Z_

_Incident update — USD₮/USAT out_of_range_

## ⚠️ Pool health — 6 pools flagged: USD₮/USDm, CELO/stCELO, USD₮/USDC, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,183 | $627,228 | $0.9984 | 98.77% USD₮ / 1.23% USDm | out of range | -0.1% | 🔴 out of range |
| CELO/stCELO | $520,326 | $502,478 | $0.05411 | 95.21% CELO / 4.79% stCELO | 2 of 3 out | -7.2% | 🔴 out of range |
| USD₮/WBTC | $199,825 | $151,907 | $0.9984 | 35.73% USD₮ / 64.27% WBTC | in range | -6.2% | OK |
| USD₮/USDC | $187,857 | $166,527 | $0.9984 | 94.74% USD₮ / 5.26% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $174,980 | $162,763 | $0.9984 | 26.25% USD₮ / 73.75% cNGN | in range | -0.1% | OK |
| CELO/USD₮ | $158,142 | $135,895 | $0.05446 | 66.50% CELO / 33.50% USD₮ | in range | -4.7% | OK |
| USD₮/WETH | $157,037 | $148,650 | $0.9984 | 30.18% USD₮ / 69.82% WETH | in range | -2.6% | OK |
| USD₮/USAT | $144,273 | $104,869 | $0.9984 | 78.02% USD₮ / 21.98% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,170 | $104,273 | $0.9984 | 9.23% USD₮ / 90.77% GBPm | in range | -0.1% | OK |
| USD₮/AUDm | $100,392 | $99,282 | $0.9984 | 88.24% USD₮ / 11.76% AUDm | in range | -0.1% | OK |
| USD₮/NGNm | $65,073 | $65,242 | $0.9984 | 53.74% USD₮ / 46.26% NGNm | in range | -0.8% | OK |
| USDm/EURm | $46,649 | $46,470 | $0.9980 | 0.16% USDm / 99.84% EURm | out of range | -0.1% | 🔴 out of range |
| PHPm/USD₮ | $42,096 | $34,894 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | -0.0% | OK |
| USD₮/BRLA | $28,456 | $14,258 | $0.9984 | 36.55% USD₮ / 63.45% BRLA | in range | -1.6% | OK |
| USD₮/wBRL | $27,617 | $24,533 | $0.9984 | 0.06% USD₮ / 99.94% wBRL | in range | -0.1% | OK |
| KESm/USD₮ | $11,431 | $1,011 | $0.007665 | 95.15% KESm / 4.85% USD₮ | in range | +0.0% | OK |
| USD₮/CELO (shallow) | $0.8382 | — | $0.05364 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9984 | 46.00% USD₮ / 54.00% USAT | — | -100.0% | ⚠️ TVL swing |

**USD₮/USDm**: our only position here is out of range(earning no fees) -- pool:
`0x5dC631aD6C26BEA1a59fBF2C2680CF3df43d249f` · out of range: LP - mento, positionNFT - 55551

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - APF, positionNFT - 202461

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/USAT(no liq)**: TVL $0 vs $1 at the last push on 2026-11-20 (-100.0%, threshold ±20%)

---
22 open positions checked · 6 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 6 flagged
