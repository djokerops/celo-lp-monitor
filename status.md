# Celo LP Range Monitor

_Last checked: 2026-10-26T12:01:05.504Z_

_Incident update — USD₮/wBRL out_of_range; USD₮/wBRL tvl_swing_

## ⚠️ Pool health — 5 pools flagged: CELO/stCELO, USD₮/USDC, USD₮/USAT, USDm/EURm, USD₮/wBRL

| Pool | TVL | Internal | Price | Balance split | Range | 24h Δ | Status |
|------|-----|----------|-------|---------------|-------|-------|--------|
| CELO/stCELO | $747,940 | $725,287 | $0.07729 | 94.11% CELO / 5.89% stCELO | 2 of 3 out | -1.4% | 🔴 out of range |
| USD₮/USDm | $643,553 | $627,177 | $0.9988 | 95.09% USD₮ / 4.91% USDm | in range | -0.0% | OK |
| USD₮/WBTC | $274,647 | $186,206 | $0.9988 | 47.00% USD₮ / 53.00% WBTC | in range | -0.3% | OK |
| CELO/USD₮ | $192,147 | $170,076 | $0.07743 | 47.10% CELO / 52.90% USD₮ | in range | -0.7% | OK |
| USD₮/WETH | $190,706 | $188,229 | $0.9988 | 46.19% USD₮ / 53.81% WETH | in range | -0.8% | OK |
| USD₮/USDC | $187,774 | $166,509 | $0.9988 | 86.31% USD₮ / 13.69% USDC | 1 of 2 out | +0.0% | 🔴 out of range |
| USD₮/cNGN | $180,134 | $168,436 | $0.9988 | 48.49% USD₮ / 51.51% cNGN | in range | -0.4% | OK |
| USD₮/USAT | $143,858 | $104,860 | $0.9988 | 67.35% USD₮ / 32.65% USAT | 1 of 2 out | -0.0% | 🔴 out of range |
| USD₮/GBPm | $106,563 | $105,536 | $0.9988 | 56.12% USD₮ / 43.88% GBPm | in range | -0.0% | OK |
| USD₮/AUDm | $100,434 | $99,304 | $0.9988 | 88.22% USD₮ / 11.78% AUDm | in range | -0.0% | OK |
| USD₮/NGNm | $65,677 | $65,568 | $0.9988 | 67.57% USD₮ / 32.43% NGNm | in range | -0.0% | OK |
| USDm/EURm | $47,498 | $47,427 | $0.9981 | 0.19% USDm / 99.81% EURm | out of range | -0.1% | 🔴 out of range |
| PHPm/USD₮ | $42,107 | $34,924 | $0.01568 | 52.36% PHPm / 47.64% USD₮ | in range | -0.3% | OK |
| USD₮/BRLA | $30,353 | $15,278 | $0.9988 | 65.74% USD₮ / 34.26% BRLA | in range | -1.8% | OK |
| KESm/USD₮ | $11,514 | $1,018 | $0.007722 | 94.64% KESm / 5.36% USD₮ | in range | -0.0% | OK |
| USD₮/CELO (shallow) | $915 | — | $0.07744 | 80.82% CELO / 19.18% USD₮ | — | -1.2% | OK |
| USD₮/wBRL | $23 | $28,148 | $0.9988 | 100.00% USD₮ / 0.00% wBRL | out of range | -99.9% | ⚠️ TVL swing, 🔴 out of range |
| USD₮/USAT(no liq) | $1 | — | $0.9988 | 50.34% USD₮ / 49.66% USAT | — | -0.0% | OK |

**CELO/stCELO**: 2 of our 3 positions here are out of range(earning no fees) -- pool:
`0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966` · out of range: LP - stabila, positionNFT(s) - 198286, 198350

**USD₮/USDC**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` · out of range: LP - APF, positionNFT - 201522

**USD₮/USAT**: 1 of our 2 positions here is out of range(earning no fees) -- pool:
`0x070D575a713EaF5025462D0865Fb0Dac4B14bC38` · out of range: LP - CCC, positionNFT - 202877

**USDm/EURm**: our only position here is out of range(earning no fees) -- pool:
`0x1c8DafD358d308b880F71eDB5170B010b106Ca60` · out of range: LP - APF, positionNFT - 201506

**USD₮/wBRL**: TVL $23 vs $28,956 at the last push on 2026-10-25 (-99.9%, threshold ±20%)

**USD₮/wBRL**: our only position here is out of range(earning no fees) -- pool:
`0x01c3cf91cdf7B34181C7eC8566c0236951FEA40F` · out of range: LP - APF, positionNFT - 201505

---
22 open positions checked · 6 out of range · 0 error(s) · pools ≥ $100 (16 tracked, 3 dust skipped)
Pool health: 18 pools listed, 5 flagged
