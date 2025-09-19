// Medigap Adapter (Draft v1)
// ---------------------------
// Normalizes raw Medigap quote objects into the shared NormalizedQuote shape.

import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase } from './types';

// Lightweight type for the subset of fields we actually touch (keeps adapter resilient
// to raw API shape fluctuations). Extend as needed.
export interface RawMedigapQuote {
  plan?: string;             // e.g. 'Plan G'
  plan_name?: string;        // alternate field
  planLetter?: string;       // sometimes already isolated ('G')
  carrier?: { name?: string; logo_url?: string; ambest_rating?: string };
  company?: string;          // fallback name
  company_base?: { ambest_rating?: string };
  view_type?: string[] | string; // may contain with_hhd / sans_hhd tokens
  rate?: number;             // sometimes cents (>=1000)
  monthly_rate?: number;     // alternate naming
  base_rate?: number;        // fallback
  premium?: number;          // alternate naming seen in some datasets
  monthly_premium?: number;  // alternate naming
  total_premium?: number;    // alternate naming (pre-discount)
  state?: string;
  effective_date?: string;
  rating?: string;           // generic rating fallback
  ambest_rating?: string;    // alternate rating field
  carrier_id?: string;       // sometimes separate id
}

function coerceViewType(v: RawMedigapQuote['view_type']): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [String(v)].filter(Boolean);
}

function derivePlanLetter(raw: RawMedigapQuote): string {
  if (raw.planLetter && /^[A-Z]$/i.test(raw.planLetter)) return raw.planLetter.toUpperCase();
  const src = raw.plan || raw.plan_name || '';
  const match = src.match(/Plan\s+([A-Z])/i);
  if (match) return match[1].toUpperCase();
  // Fallback: last alpha char
  const alpha = src.replace(/[^A-Za-z]/g,'');
  if (alpha) return alpha.slice(-1).toUpperCase();
  return 'G';
}

function normalizeRate(raw: RawMedigapQuote): { monthly: number; rawBase?: number; rateSource: string } | null {
  const candidates: { val?: number; source: string }[] = [
    { val: raw.rate, source: 'rate' },
    { val: raw.monthly_rate, source: 'monthly_rate' },
    { val: raw.base_rate, source: 'base_rate' },
    { val: raw.premium, source: 'premium' },
    { val: raw.monthly_premium, source: 'monthly_premium' },
    { val: raw.total_premium, source: 'total_premium' },
  ];
  for (const c of candidates) {
    if (typeof c.val === 'number' && !isNaN(c.val) && c.val > 0) {
      const rawBase = c.val;
      const monthly = rawBase >= 1000 ? rawBase / 100 : rawBase; // heuristic cents normalization
      return { monthly, rawBase, rateSource: c.source as string };
    }
  }
  return null;
}

function deriveRating(raw: RawMedigapQuote): string | undefined {
  const candidates = [
    raw.carrier?.ambest_rating,
    raw.company_base?.ambest_rating,
    raw.ambest_rating,
    raw.rating,
  ].filter((r): r is string => typeof r === 'string' && !!r.trim());
  if (!candidates.length) return undefined;
  // Mode by frequency
  const freq = candidates.reduce<Record<string, number>>((acc, r) => { const k = r.trim().toUpperCase(); acc[k] = (acc[k]||0)+1; return acc; }, {});
  return Object.entries(freq).sort((a,b)=> b[1]-a[1] || a[0].localeCompare(b[0]))[0][0];
}

// Extended Normalized shape (still assignable to NormalizedQuoteBase) for internal helper use.
interface MedigapNormalizedQuote extends NormalizedQuoteBase {
  metadata?: NormalizedQuoteBase['metadata'] & {
    viewTypeTags?: string[];
    discountFacet?: 'with_hhd' | 'sans_hhd' | 'unknown';
  };
}

export const medigapAdapter: CategoryAdapter<RawMedigapQuote, NormalizedQuoteBase> = {
  category: 'medigap',
  version: 1,
  normalize(raw: RawMedigapQuote, ctx: NormalizeContext) {
    const planLetter = derivePlanLetter(raw);
    const viewTypes = coerceViewType(raw.view_type);
    const rateInfo = normalizeRate(raw);
    if (!rateInfo) return null; // drop un-priced quotes
    const carrierName = raw.carrier?.name || raw.company || 'Unknown Carrier';
    const carrierId = raw.carrier_id || carrierName; // prefer explicit id if present

    // Classify discount facet (independent of current toggle)
    let discountFacet: 'with_hhd' | 'sans_hhd' | 'unknown' = 'unknown';
    if (viewTypes.some(v => /with/i.test(v))) discountFacet = 'with_hhd';
    else if (viewTypes.some(v => /sans/i.test(v))) discountFacet = 'sans_hhd';

    // We always store the raw rate in monthly; UI can choose discounted vs non later using summaries.
    const q: MedigapNormalizedQuote = {
      id: `medigap:${carrierId}:${planLetter}:${discountFacet}`,
      category: 'medigap',
      carrier: {
        id: carrierId,
        name: carrierName,
        logoUrl: raw.carrier?.logo_url,
        amBestRating: deriveRating(raw),
      },
      pricing: {
        monthly: rateInfo.monthly,
        rawBase: rateInfo.rawBase,
        rateSource: discountFacet,
      },
      plan: {
        key: planLetter,
        display: `Plan ${planLetter}`,
        discountApplied: discountFacet === 'with_hhd',
        discountType: discountFacet === 'with_hhd' ? 'household' : undefined,
      },
      adapter: { category: 'medigap', version: 1 },
      metadata: {
        state: raw.state,
        effectiveDate: raw.effective_date,
        viewTypeTags: viewTypes,
        discountFacet,
      },
      __raw: raw, // retain minimally so downstream consumers (details) can recalc if needed
    };
    return q;
  },
  /**
   * Collapse an array of normalized Medigap quotes down to one PricingSummary per carrier.
   * We surface the lowest monthly price per (F|G|N) plan and also build a min/max/count range.
   * Additional plan letters are ignored for now to keep UI stable; easy to extend later.
   */
  derivePricingSummary(quotes) {
    if (!Array.isArray(quotes) || !quotes.length) return [];
    const planKeys = ['F','G','N'];
    type Facet = 'with_hhd' | 'sans_hhd' | 'unknown';
  interface FacetAgg { with_hhd?: number; sans_hhd?: number; unknown?: number; allPrices: number[]; rawQuotes: MedigapNormalizedQuote[]; }
    interface Agg {
      carrierName: string; logo?: string; rating?: string;
      // active (baseline) prices default to sans_hhd if present else with_hhd else unknown
      prices: Record<string, number | undefined>;
      discounted: Record<string, number | undefined>; // explicit discounted (with_hhd) minima
      ranges: Record<string, { min:number; max:number; count:number } | undefined>;
      facetPrices: Record<string, FacetAgg>; // planKey -> facet aggregation
    }
    const map = new Map<string, Agg>();
    for (const q of quotes as MedigapNormalizedQuote[]) {
      if (!q?.carrier?.id || typeof q.pricing?.monthly !== 'number') continue;
      const planKey = q.plan?.key?.toUpperCase();
      if (!planKeys.includes(planKey)) continue;
      const carrierId = q.carrier.id;
      let agg = map.get(carrierId);
      if (!agg) {
        agg = { carrierName: q.carrier.name, logo: q.carrier.logoUrl, rating: q.carrier.amBestRating, prices: {}, discounted: {}, ranges: {}, facetPrices: {} };
        map.set(carrierId, agg);
      }
      const facet: Facet = (q.metadata?.discountFacet as Facet) || 'unknown';
      const price = q.pricing.monthly;
      let fp = agg.facetPrices[planKey];
      if (!fp) { fp = { allPrices: [], rawQuotes: [] }; agg.facetPrices[planKey] = fp; }
      fp.allPrices.push(price);
      fp.rawQuotes.push(q);
      if (fp[facet] == null || price < (fp[facet] as number)) fp[facet] = price;
    }

    // Build consolidated prices and ranges
    for (const agg of map.values()) {
      for (const planKey of Object.keys(agg.facetPrices)) {
        const fp = agg.facetPrices[planKey];
        const base = fp.sans_hhd ?? fp.with_hhd ?? fp.unknown; // baseline non-discount preference
        const discounted = fp.with_hhd; // explicit discounted variant
        if (base != null) agg.prices[planKey] = base;
        if (discounted != null) agg.discounted[planKey] = discounted;
        if (fp.allPrices.length) {
          const min = Math.min(...fp.allPrices);
            const max = Math.max(...fp.allPrices);
            agg.ranges[planKey] = { min, max, count: fp.allPrices.length };
        }
      }
    }

    const summaries = Array.from(map.entries()).map(([carrierId, agg]) => {
      // Build per-plan discount meta
      const perPlan: Record<string, any> = {};
      for (const pk of Object.keys(agg.facetPrices)) {
        const fp = agg.facetPrices[pk];
        const rawQuotes = fp.rawQuotes;
        // Identify pattern
        const hasWith = fp.with_hhd != null;
        const hasSans = fp.sans_hhd != null;
        let pattern: 'precalculated' | 'calculated' | 'none' = 'none';
        if (hasWith && hasSans) pattern = 'precalculated';
        else if (!hasWith && !hasSans) {
          // Look for discounts arrays on raw
          if (rawQuotes.some(r => (r.__raw?.discounts?.length))) pattern = 'calculated';
        }
        // Build option variants
        const options: any[] = [];
        // Pre-calculated options: split facets
  if (pattern === 'precalculated') {
          const withQuotes = rawQuotes.filter(r => r.metadata?.discountFacet === 'with_hhd');
          const sansQuotes = rawQuotes.filter(r => r.metadata?.discountFacet === 'sans_hhd');
          if (sansQuotes.length) {
            const bestSans = sansQuotes.reduce((m, q) => q.pricing.monthly < m.pricing.monthly ? q : m, sansQuotes[0]);
            options.push({
              facet: 'sans_hhd',
              rate: bestSans.pricing.monthly,
              ratingClass: bestSans.__raw?.rating_class || bestSans.__raw?.rating_class,
              viewType: bestSans.metadata?.viewTypeTags,
              discounts: bestSans.__raw?.discounts || [],
            });
          }
            if (withQuotes.length) {
            const bestWith = withQuotes.reduce((m, q) => q.pricing.monthly < m.pricing.monthly ? q : m, withQuotes[0]);
            options.push({
              facet: 'with_hhd',
              rate: bestWith.pricing.monthly,
              ratingClass: bestWith.__raw?.rating_class || bestWith.__raw?.rating_class,
              viewType: bestWith.metadata?.viewTypeTags,
              discounts: bestWith.__raw?.discounts || [],
            });
          }
        } else if (pattern === 'calculated') {
          // Baseline quotes (unknown facet) that have discount arrays
          rawQuotes.forEach(r => {
            const baseRate = r.pricing.monthly;
            let discountedRate = baseRate;
            const discounts = (r.__raw?.discounts || []).slice();
            discounts.forEach((d: any) => {
              if (d.type === 'percent') {
                const val = d.value > 1 ? d.value / 100 : d.value; discountedRate = discountedRate * (1 - val);
              } else if (typeof d.value === 'number') {
                discountedRate = Math.max(0, discountedRate - d.value);
              }
            });
            options.push({
              facet: 'baseline',
              rate: baseRate,
              ratingClass: r.__raw?.rating_class,
              discounts,
            });
            if (discountedRate !== baseRate) {
              options.push({
                facet: 'computed',
                rate: discountedRate,
                originalRate: baseRate,
                ratingClass: r.__raw?.rating_class,
                discounts,
                isCalculatedDiscount: true,
              });
            }
          });
        } else {
          // None pattern: just keep the cheapest baseline as one option
          const cheapest = rawQuotes.reduce((m, q) => q.pricing.monthly < m.pricing.monthly ? q : m, rawQuotes[0]);
          options.push({ facet: 'baseline', rate: cheapest.pricing.monthly, ratingClass: cheapest.__raw?.rating_class, discounts: cheapest.__raw?.discounts || [] });
        }
        // Compute savings if both baseline + discounted present
        let baselineVal: number | undefined;
        let discountedVal: number | undefined;
        if (pattern === 'precalculated') {
          baselineVal = fp.sans_hhd ?? fp.unknown;
          discountedVal = fp.with_hhd;
        } else if (pattern === 'calculated') {
          const baseOpt = options.find(o => o.facet === 'baseline');
          const discOpt = options.find(o => o.facet === 'computed');
          baselineVal = baseOpt?.rate;
          discountedVal = discOpt?.rate;
        }
        const savings = (baselineVal != null && discountedVal != null && discountedVal < baselineVal) ? (baselineVal - discountedVal) : undefined;
        // If pattern is calculated and we derived a discountedVal, also surface it inside top-level discounted map
        if (pattern === 'calculated' && discountedVal != null && (agg as any).discounted) {
          (agg as any).discounted[pk] = discountedVal;
        }
        perPlan[pk] = {
          pattern,
          baseline: baselineVal,
          discounted: discountedVal,
          savings,
          source: pattern === 'precalculated' ? 'with_hhd' : (pattern === 'calculated' ? 'computed' : 'none'),
          options,
        };
      }

      return {
        carrierId,
        carrierName: agg.carrierName,
        logoUrl: agg.logo,
        rating: agg.rating,
        plans: agg.prices,
        planRanges: agg.ranges,
        discountedPlans: agg.discounted,
        __discountMeta: { perPlan },
      };
    }) as any[]; // widen for extended fields

    summaries.sort((a,b) => {
      const aMin = Math.min(...planKeys.map(pk => a.plans[pk] == null ? Number.POSITIVE_INFINITY : (a.plans[pk] as number)));
      const bMin = Math.min(...planKeys.map(pk => b.plans[pk] == null ? Number.POSITIVE_INFINITY : (b.plans[pk] as number)));
      if (aMin === bMin) return a.carrierName.localeCompare(b.carrierName);
      return aMin - bMin;
    });
    return summaries;
  }
};

export default medigapAdapter;
