# Celo LP Range Monitor

_Last checked: 2026-11-20T17:00:42.545Z_

_Incident update — USD₮/USAT(no liq) tvl_swing_

## ⚠️ Pool health — 5 pools flagged: CELO/stCELO, USD₮/USDC, USD₮/USAT, USDm/EURm, USD₮/USAT(no liq)

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| USD₮/USDm | $643,538 | $627,429 | $0.9990 | 91.45% USD₮ / 8.55% USDm | in range | -0.0% | OK |
| CELO/stCELO | $521,032 | $540,959 | $0.05418 | 95.33% CELO / 4.67% stCELO | 2 of 3 out | -9.5% | 🔴 out of range |
| USD₮/WBTC | $204,434 | $159,802 | $0.9990 | 33.45% USD₮ / 66.55% WBTC | in range | -4.9% | OK |
| USD₮/USDC | $187,914 | $166,569 | $0.9990 | 81.65% USD₮ / 18.35% USDC | 1 of 2 out | -0.2% | 🔴 out of range |
| USD₮/cNGN | $175,552 | $162,883 | $0.9990 | 28.07% USD₮ / 71.93% cNGN | in range | +0.9% | OK |
| CELO/USD₮ | $158,571 | $143,085 | $0.05469 | 66.29% CELO / 33.71% USD₮ | in range | -6.1% | OK |
| USD₮/WETH | $153,939 | $158,221 | $0.9990 | 28.59% USD₮ / 71.41% WETH | in range | -5.1% | OK |
| USD₮/USAT | $144,327 | $104,910 | $0.9990 | 68.59% USD₮ / 31.41% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $105,300 | $104,240 | $0.9990 | 11.10% USD₮ / 88.90% GBPm | in range | -0.3% | OK |
| USD₮/AUDm | $100,448 | $99,310 | $0.9990 | 88.24% USD₮ / 11.76% AUDm | in range | +0.0% | OK |
| USD₮/NGNm | $65,109 | $65,356 | $0.9990 | 53.74% USD₮ / 46.26% NGNm | in range | -0.8% | OK |
| USDm/EURm | $46,455 | $46,377 | $1.0003 | 0.15% USDm / 99.85% EURm | out of range | -0.2% | 🔴 out of range |
| PHPm/USD₮ | $42,110 | $34,903 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | +0.0% | OK |
| USD₮/BRLA | $28,654 | $14,356 | $0.9990 | 38.02% USD₮ / 61.98% BRLA | in range | -1.1% | OK |
| USD₮/wBRL | $27,632 | $24,818 | $0.9990 | 0.06% USD₮ / 99.94% wBRL | in range | -0.0% | OK |
| KESm/USD₮ | $11,404 | $1,012 | $0.007646 | 95.16% KESm / 4.84% USD₮ | in range | -1.0% | OK |
| USD₮/CELO (shallow) | $0.8387 | — | $0.05367 | 49.15% CELO / 50.85% USD₮ | — | -99.6% | OK |
| USD₮/USAT(no liq) | $0.0001 | — | $0.9990 | 46.01% USD₮ / 53.99% USAT | — | -100.0% | ⚠️ TVL swing |

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/USAT(no liq)**: TVL $0 vs $1 at the last push on 2026-11-19 (-100.0%, threshold ±20%)

---
22 open positions checked · 5 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 5 flagged
