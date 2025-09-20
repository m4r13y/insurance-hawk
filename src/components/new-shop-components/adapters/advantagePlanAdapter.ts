// Medicare Advantage Adapter (Draft v1)
// ------------------------------------
// Normalizes raw Medicare Advantage quotes into NormalizedQuoteBase shape used by shared UI.
// Focus: premium, MOOP, deductibles, star rating, core visit copays, OTC allowance indicator.

import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types'
// Reuse legacy utilities for Medicare Advantage benefit parsing to ensure consistency with
// existing (non-normalized) Medicare shop components.
import {
  getMedicalDeductible,
  getDrugDeductible,
  getPrimaryCareData,
  getSpecialistCareData,
  getOTCBenefit,
  getMOOPData
} from '@/utils/medicare-advantage-data';
import type { MedicareAdvantageQuote } from '@/types/medicare-advantage';

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
// Advantage upstream premiums appear to be represented in cents (e.g. 600 => $6.00, 2500 => $25.00).
// If a value does NOT end with two zeros (e.g. 47) we assume it's already dollars.
function currency(val: number | undefined | null): number | undefined {
  if (typeof val !== 'number' || isNaN(val) || val < 0) return undefined;
  if (val === 0) return 0;
  return val % 100 === 0 ? val / 100 : val; // safe divide for typical cent-encoded patterns
}

function chooseCarrierName(raw: RawAdvantageQuote) {
  return raw.organization_name || 'Unknown Carrier';
}

// ---------------- Adapter Implementation ----------------

export const advantagePlanAdapter: CategoryAdapter<RawAdvantageQuote, NormalizedQuoteBase> = {
  category: 'advantage',
  version: 1,
  normalize(raw: RawAdvantageQuote, ctx: NormalizeContext) {
    // Premium selection logic:
    // Historically month_rate sometimes already reflected the combined total or appeared in cent form.
    // We normalize each candidate then choose the first non-null signal.
    const monthRateNorm = currency(raw.month_rate);
    const partCNorm = currency(raw.part_c_rate);
    const partDNorm = currency(raw.part_d_rate);
    const aggParts = (partCNorm || 0) + (partDNorm || 0);
    const monthlyBase = monthRateNorm != null ? monthRateNorm : aggParts;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[advantage adapter] premium normalize', { raw_month_rate: raw.month_rate, monthRateNorm, part_c_rate: raw.part_c_rate, partCNorm, part_d_rate: raw.part_d_rate, partDNorm, monthlyBase })
    }
    if (monthlyBase == null) return null
    const carrierName = chooseCarrierName(raw)
  const originalCarrierRaw = carrierName;
    const planKey = `${raw.contract_id || 'X'}-${raw.plan_id}-${raw.segment_id}`
    const id = `advantage:${planKey}`
    // Reuse legacy parsing helpers (ensures consistency with benefits-overview & other legacy UI)
    const legacyPlan = raw as unknown as MedicareAdvantageQuote;
    const medicalDed = getMedicalDeductible(legacyPlan);
    const drugDed = getDrugDeductible(legacyPlan);
    const primaryCare = getPrimaryCareData(legacyPlan);
    const specialist = getSpecialistCareData(legacyPlan);
    const otc = getOTCBenefit(legacyPlan);
    const moopData = getMOOPData(legacyPlan);

    return {
      id,
      category: 'advantage',
      carrier: { id: carrierName, name: carrierName },
      pricing: { monthly: monthlyBase },
      plan: { key: planKey, display: raw.plan_name },
      adapter: { category: 'advantage', version: 1 },
      metadata: {
        originalCarrierRaw,
        starRating: raw.overall_star_rating,
        medicalDeductible: medicalDed,
        drugDeductible: drugDed,
        primaryCare,
        specialist,
        otc,
  moop: moopData.inNetwork || raw.in_network_moop,
  moopCombined: moopData.combined,
        zeroPremiumLIS: raw.zero_premium_with_full_low_income_subsidy,
        partBReduction: raw.part_b_reduction,
        drugBenefitType: raw.drug_benefit_type || raw.drug_benefit_type_detail,
        effectiveDate: raw.effective_date,
        county: raw.county,
        state: raw.state,
        gapCoverage: raw.additional_drug_coverage_offered_in_the_gap || raw.additional_coverage_offered_in_the_gap
        ,benefits: raw.benefits // expose raw benefits for comprehensive details rendering
      },
      __raw: process.env.NODE_ENV === 'development' ? raw : undefined,
    }
  },
  derivePricingSummary(quotes) {
    if (!quotes.length) return []
    const map = new Map<string, { carrierName: string; prices: number[]; star?: number }>()
    const collisionMap: Record<string, Set<string>> = {}
    quotes.forEach(q => {
      const id = q.carrier.id
      let bucket = map.get(id)
      if (!bucket) { bucket = { carrierName: q.carrier.name, prices: [] }; map.set(id, bucket) }
      bucket.prices.push(q.pricing.monthly)
      const orig = (q.metadata as any)?.originalCarrierRaw || q.carrier.name
      ;(collisionMap[id] ||= new Set()).add(orig)
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
    if (process.env.NODE_ENV !== 'production') {
      Object.entries(collisionMap).forEach(([carrierId, set]) => { if (set.size > 1) {
        // eslint-disable-next-line no-console
        console.warn('CARRIER_COLLISION_DETECTED', { adapter: 'advantage', carrierId, distinctRawNames: Array.from(set.values()) })
      }})
    }
    return summaries
  }
}

export default advantagePlanAdapter
