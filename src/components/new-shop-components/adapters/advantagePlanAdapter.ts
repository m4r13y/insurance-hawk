// Medicare Advantage Adapter (Draft v1)
// ------------------------------------
// Normalizes raw Medicare Advantage quotes into NormalizedQuoteBase shape used by shared UI.
// Focus: premium, MOOP, deductibles, star rating, core visit copays, OTC allowance indicator.

import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types'

// Raw shape (subset); align with getMedicareAdvantageQuotes action.
export interface RawAdvantageQuote {
  key: string
  plan_name: string
  organization_name: string
  plan_type: string
  county: string
  state: string
  overall_star_rating: number
  part_c_rate: number
  part_d_rate: number
  month_rate: number
  in_network_moop: string
  annual_drug_deductible: number
  contract_id: string
  plan_id: string
  segment_id: string
  benefits: Array<{
    benefit_type: string
    full_description: string
    summary_description?: {
      in_network?: string
      out_network?: string
    }
    pd_view_display: boolean
  }>
  drug_benefit_type?: string
  drug_benefit_type_detail?: string
  zero_premium_with_full_low_income_subsidy?: boolean
  additional_coverage_offered_in_the_gap?: boolean
  additional_drug_coverage_offered_in_the_gap?: boolean
  contract_year: string
  effective_date: string
  part_b_reduction?: string
}

// ---------------- Parsing Helpers ----------------

function currency(val: number | undefined | null): number | undefined {
  if (typeof val !== 'number' || isNaN(val) || val < 0) return undefined
  // Heuristic: treat >= 1000 as cents.
  return val >= 1000 ? val / 100 : val
}

interface BenefitLookupResult {
  text: string
  inNetwork?: string
  outNetwork?: string
  raw: string
}

const _benefitCache = new Map<string, BenefitLookupResult | undefined>()

function lookupBenefit(raw: RawAdvantageQuote, keyword: string): BenefitLookupResult | undefined {
  const cacheKey = raw.key + '::' + keyword.toLowerCase()
  if (_benefitCache.has(cacheKey)) return _benefitCache.get(cacheKey)
  const kw = keyword.toLowerCase()
  const found = raw.benefits.find(b => b.benefit_type.toLowerCase().includes(kw))
  if (!found) { _benefitCache.set(cacheKey, undefined); return undefined }
  const cleanFull = found.full_description.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()
  const val: BenefitLookupResult = {
    text: found.summary_description?.in_network || cleanFull || '',
    inNetwork: found.summary_description?.in_network,
    outNetwork: found.summary_description?.out_network,
    raw: found.full_description
  }
  _benefitCache.set(cacheKey, val)
  return val
}

function extractMedicalDeductible(raw: RawAdvantageQuote): string | undefined {
  const b = lookupBenefit(raw, 'medical deductible') || lookupBenefit(raw, 'health plan deductible')
  if (!b) return undefined
  const match = b.text.match(/\$?\d+[\,\d]*/)
  return match ? match[0].startsWith('$') ? match[0] : '$' + match[0] : b.text || undefined
}

function extractDrugDeductible(raw: RawAdvantageQuote): string | undefined {
  if (typeof raw.annual_drug_deductible === 'number') return '$' + (currency(raw.annual_drug_deductible) ?? 0)
  const b = lookupBenefit(raw, 'drug deductible') || lookupBenefit(raw, 'prescription deductible')
  if (!b) return undefined
  const match = b.text.match(/\$?\d+[\,\d]*/)
  return match ? (match[0].startsWith('$') ? match[0] : '$' + match[0]) : b.text || undefined
}

function extractPrimaryCare(raw: RawAdvantageQuote): string | undefined {
  const b = lookupBenefit(raw, "doctor's office visits") || lookupBenefit(raw, 'primary care')
  if (!b) return undefined
  const match = b.text.match(/\$?\d+\s*copay.*Primary/i)
  if (match) return match[0]
  const simple = b.text.match(/\$\d+/)
  return simple ? simple[0] + ' copay (Primary)' : b.text
}

function extractSpecialist(raw: RawAdvantageQuote): string | undefined {
  const b = lookupBenefit(raw, "doctor's office visits") || lookupBenefit(raw, 'specialist')
  if (!b) return undefined
  const match = b.text.match(/\$?\d+\s*copay.*Specialist/i)
  if (match) return match[0]
  const simple = b.text.match(/\$\d+/)
  return simple ? simple[0] + ' copay (Specialist)' : b.text
}

function extractOTC(raw: RawAdvantageQuote): string | undefined {
  const b = lookupBenefit(raw, 'otc items') || lookupBenefit(raw, 'over-the-counter') || lookupBenefit(raw, 'over the counter')
  if (!b) return undefined
  const amt = b.text.match(/\$\d+/)
  if (amt) return amt[0]
  if (/some coverage/i.test(b.text)) return 'Some Coverage'
  if (/not covered|no coverage/i.test(b.text)) return 'Not Covered'
  return b.text
}

function chooseCarrierName(raw: RawAdvantageQuote) {
  return raw.organization_name || 'Unknown Carrier'
}

// ---------------- Adapter Implementation ----------------

export const advantagePlanAdapter: CategoryAdapter<RawAdvantageQuote, NormalizedQuoteBase> = {
  category: 'advantage',
  version: 1,
  normalize(raw: RawAdvantageQuote, ctx: NormalizeContext) {
    // Premium: prefer part_c_rate + part_d_rate aggregate if month_rate unreliable, else month_rate.
    const monthlyBase = currency(raw.month_rate) ?? (currency(raw.part_c_rate) || 0) + (currency(raw.part_d_rate) || 0)
    if (monthlyBase == null) return null
    const carrierName = chooseCarrierName(raw)
    const planKey = `${raw.contract_id || 'X'}-${raw.plan_id}-${raw.segment_id}`
    const id = `advantage:${planKey}`

    const medicalDed = extractMedicalDeductible(raw)
    const drugDed = extractDrugDeductible(raw)
    const primaryCare = extractPrimaryCare(raw)
    const specialist = extractSpecialist(raw)
    const otc = extractOTC(raw)

    return {
      id,
      category: 'advantage',
      carrier: { id: carrierName, name: carrierName },
      pricing: { monthly: monthlyBase },
      plan: { key: planKey, display: raw.plan_name },
      adapter: { category: 'advantage', version: 1 },
      metadata: {
        starRating: raw.overall_star_rating,
        medicalDeductible: medicalDed,
        drugDeductible: drugDed,
        primaryCare,
        specialist,
        otc,
        moop: raw.in_network_moop,
        zeroPremiumLIS: raw.zero_premium_with_full_low_income_subsidy,
        partBReduction: raw.part_b_reduction,
        drugBenefitType: raw.drug_benefit_type || raw.drug_benefit_type_detail,
        effectiveDate: raw.effective_date,
        county: raw.county,
        state: raw.state,
        gapCoverage: raw.additional_drug_coverage_offered_in_the_gap || raw.additional_coverage_offered_in_the_gap
      },
      __raw: process.env.NODE_ENV === 'development' ? raw : undefined,
    }
  },
  derivePricingSummary(quotes) {
    if (!quotes.length) return []
    const map = new Map<string, { carrierName: string; prices: number[]; star?: number }>()
    quotes.forEach(q => {
      const id = q.carrier.id
      let bucket = map.get(id)
      if (!bucket) { bucket = { carrierName: q.carrier.name, prices: [] }; map.set(id, bucket) }
      bucket.prices.push(q.pricing.monthly)
      const star = typeof q.metadata?.starRating === 'number' ? q.metadata.starRating : undefined
      if (star && !bucket.star) bucket.star = star
    })
    const summaries: PricingSummary[] = Array.from(map.entries()).map(([carrierId, agg]) => {
      const min = Math.min(...agg.prices); const max = Math.max(...agg.prices)
      return {
        carrierId,
        carrierName: agg.carrierName,
        plans: { MA: min },
        planRanges: { MA: { min, max, count: agg.prices.length } },
        // @ts-ignore
        _star: agg.star
      } as any
    })
    summaries.sort((a,b) => (a.plans.MA ?? Infinity) - (b.plans.MA ?? Infinity))
    return summaries
  }
}

export default advantagePlanAdapter
