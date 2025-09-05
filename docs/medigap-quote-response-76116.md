# Medigap Quote API Response - ZIP 76116

**Test Date:** September 4, 2025  
**API Function:** `getMedigapQuotes`

## Test Parameters

- **ZIP Code:** 76116 (Fort Worth, TX area)
- **Age:** 65
- **Gender:** Male (M)
- **Tobacco Use:** No (0)
- **Plan:** G (Medicare Supplement Plan G)

## Test Results Summary

- **Function Execution Time:** 6,766ms (~6.8 seconds)
- **Total Quotes Found:** 59 quotes
- **API Call Status:** ✅ SUCCESS

## Top 5 Quotes (by Premium)

| Rank | Carrier | Plan | Monthly Premium | NAIC |
|------|---------|------|----------------|------|
| 1 | MedMutual Protect | Plan G | $126.86 | N/A |
| 2 | Atlantic Capital Life Assur Co | Plan G | $130.14 | N/A |
| 3 | Cigna Ins Co | Plan G | $133.44 | N/A |
| 4 | Medico Life and Health Ins Co | Plan G | $139.57 | N/A |
| 5 | Members Hlth Ins Co | Plan G | $142.73 | N/A |

## Carrier Breakdown

| Carrier | Quote Count |
|---------|-------------|
| UnitedHealthcare Ins Co | 8 quotes |
| Cigna Ins Co | 6 quotes |
| Medico Life and Health Ins Co | 6 quotes |
| AARP Medicare Supplement Insurance Plans, insured by United Healthcare Insurance Company of America | 6 quotes |
| Physicians Mutual (PSIC) | 4 quotes |
| Atlantic Capital Life Assur Co | 2 quotes |
| Humana Insurance Company | 2 quotes |
| BCBS IL/TX/NM/OK | 2 quotes |
| Washington Natl Ins Co | 2 quotes |
| MedMutual Protect | 1 quote |
| Members Hlth Ins Co | 1 quote |
| Royal Arcanum | 1 quote |
| Nassau Life Insurance Company | 1 quote |
| LifeShield Natl Ins Co | 1 quote |
| Insurance Co of N Amer | 1 quote |
| Moda Hlth Plan Inc | 1 quote |
| State Farm Mut Auto Ins Co | 1 quote |
| Old Surety Life Ins Co | 1 quote |
| Universal Fidelity Life Ins Co | 1 quote |
| USAA Life Ins Co | 1 quote |
| American Family Life Assur Co of Col | 1 quote |
| Transamerica Life Ins Co | 1 quote |
| American Benefit Life Ins Co | 1 quote |
| United Amer Ins Co | 1 quote |
| Wisconsin Physicians Serv Ins Corp | 1 quote |
| Mutual Of Omaha Ins Co | 1 quote |
| Aetna Hlth Ins Co | 1 quote |
| Guarantee Trust Life Ins Co | 1 quote |
| Globe Life & Accident Ins Co | 1 quote |
| GPM Health and Life Ins Co | 1 quote |

## Key Findings

### Preferred Carriers Represented
Based on our preferred carriers configuration, the following major carriers appear in the results:
- ✅ **UnitedHealthcare** (8 quotes + 6 AARP quotes = 14 total)
- ✅ **Cigna** (6 quotes)
- ✅ **BCBS** (2 quotes)
- ✅ **Humana** (2 quotes)
- ✅ **Mutual of Omaha** (1 quote)
- ✅ **Aetna** (1 quote)
- ✅ **American Family** (1 quote)
- ✅ **Transamerica** (1 quote)
- ✅ **Guarantee Trust** (1 quote)

### Coverage Analysis
- **Total Coverage:** 29 out of 59 quotes (49.2%) are from preferred carriers
- **Top Tier Carriers:** UnitedHealthcare group dominates with 14 total quotes
- **Competitive Pricing:** Preferred carriers span across various price points
- **Market Presence:** Strong representation from major national carriers

## API Response Structure

The complete raw API response contains detailed information for each quote including:

- **Company Information:** Full carrier details, NAIC codes, parent company data
- **Pricing Details:** Monthly, quarterly, semi-annual, and annual rates
- **Market Data:** Claims, lives covered, market share by state
- **Rate History:** Historical rate increases and trends
- **Coverage Details:** Plan specifics, discounts, fees, riders
- **Geographic Coverage:** ZIP codes and counties served
- **Company Ratings:** AM Best ratings, financial strength indicators

---

## Complete Raw JSON Response

```json
