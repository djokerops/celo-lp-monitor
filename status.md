# Celo LP Range Monitor

_Last checked: 2026-11-21T07:00:41.689Z_

_Incident update — CELO/stCELO volatile_swing_

## ⚠️ Pool health — 5 pools flagged: CELO/stCELO, USD₮/USDC, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,446 | $627,429 | $0.9988 | 98.77% USD₮ / 1.23% USDm | in range | -0.0% | OK |
| CELO/stCELO | $516,304 | $540,959 | $0.05369 | 95.21% CELO / 4.79% stCELO | 2 of 3 out | -7.9% | ⚠️ volatile swing, 🔴 out of range |
| USD₮/WBTC | $193,896 | $159,802 | $0.9988 | 33.54% USD₮ / 66.46% WBTC | in range | -9.0% | OK |
| USD₮/USDC | $187,921 | $166,569 | $0.9988 | 89.64% USD₮ / 10.36% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $174,709 | $162,883 | $0.9988 | 24.96% USD₮ / 75.04% cNGN | in range | -0.3% | OK |
| CELO/USD₮ | $156,351 | $143,085 | $0.05354 | 67.53% CELO / 32.47% USD₮ | in range | -5.8% | OK |
| USD₮/WETH | $152,890 | $158,221 | $0.9988 | 28.06% USD₮ / 71.94% WETH | in range | -5.2% | OK |
| USD₮/USAT | $144,282 | $104,910 | $0.9988 | 68.37% USD₮ / 31.63% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,214 | $104,240 | $0.9988 | 9.23% USD₮ / 90.77% GBPm | in range | -0.0% | OK |
| USD₮/AUDm | $100,433 | $99,310 | $0.9988 | 88.24% USD₮ / 11.76% AUDm | in range | -0.0% | OK |
| USD₮/NGNm | $65,100 | $65,356 | $0.9988 | 53.74% USD₮ / 46.26% NGNm | in range | -0.7% | OK |
| USDm/EURm | $46,480 | $46,377 | $0.9994 | 0.15% USDm / 99.85% EURm | out of range | -0.4% | 🔴 out of range |
| PHPm/USD₮ | $42,107 | $34,903 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | -0.0% | OK |
| USD₮/BRLA | $28,468 | $14,356 | $0.9988 | 36.56% USD₮ / 63.44% BRLA | in range | -1.6% | OK |
| USD₮/wBRL | $27,628 | $24,818 | $0.9988 | 0.06% USD₮ / 99.94% wBRL | in range | -0.1% | OK |
| KESm/USD₮ | $11,404 | $1,012 | $0.007645 | 95.16% KESm / 4.84% USD₮ | in range | -0.2% | OK |
| USD₮/CELO (shallow) | $0.8386 | — | $0.05367 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9988 | 46.03% USD₮ / 53.97% USAT | — | -100.0% | ⚠️ TVL swing |

**CELO/stCELO**: 24h price -9.4% (threshold ±8%)

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
22 open positions checked · 5 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 5 flagged
