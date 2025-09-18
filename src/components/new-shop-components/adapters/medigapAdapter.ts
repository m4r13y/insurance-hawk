// Medigap Adapter (Draft v1)
// ---------------------------
// Normalizes raw Medigap quote objects into the shared NormalizedQuote shape.

import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase } from './types';

// Lightweight type for the subset of fields we actually touch (keeps adapter resilient
// to raw API shape fluctuations). Extend as needed.
export interface RawMedigapQuote {
  plan?: string;             // e.g. 'Plan G'
  plan_name?: string;        // alternate field
  carrier?: { name?: string; logo_url?: string; ambest_rating?: string };
  company?: string;          // fallback name
  company_base?: { ambest_rating?: string };
  view_type?: string[] | string; // may contain with_hhd / sans_hhd tokens
  rate?: number;             // sometimes cents (>=1000)
  monthly_rate?: number;     // alternate naming
  base_rate?: number;        // fallback
  state?: string;
  effective_date?: string;
  rating?: string;           // generic rating fallback
  ambest_rating?: string;    // alternate rating field
}

function coerceViewType(v: RawMedigapQuote['view_type']): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [String(v)].filter(Boolean);
}

function derivePlanLetter(raw: RawMedigapQuote): string {
  const src = raw.plan || raw.plan_name || '';
  const match = src.match(/Plan\s+([A-Z])/i);
  return match ? match[1].toUpperCase() : (src.slice(-1).toUpperCase() || 'G');
}

function normalizeRate(raw: RawMedigapQuote): { monthly: number; rawBase?: number; rateSource: string } | null {
  const candidates: { val?: number; source: string }[] = [
    { val: raw.rate, source: 'rate' },
    { val: raw.monthly_rate, source: 'monthly_rate' },
    { val: raw.base_rate, source: 'base_rate' },
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

export const medigapAdapter: CategoryAdapter<RawMedigapQuote, NormalizedQuoteBase> = {
  category: 'medigap',
  version: 1,
  normalize(raw: RawMedigapQuote, ctx: NormalizeContext) {
    const planLetter = derivePlanLetter(raw);
    const viewTypes = coerceViewType(raw.view_type);
    const rateInfo = normalizeRate(raw);
    if (!rateInfo) return null; // drop un-priced quotes
    const carrierName = raw.carrier?.name || raw.company || 'Unknown Carrier';
    const carrierId = carrierName; // keep 1:1 for now (slug later if needed)
    const discountActive = !!ctx.applyDiscounts;

    // Determine discount facet selection: prefer matching token, else fall back to available
    let rateSourceTag: string | undefined;
    if (discountActive && viewTypes.some(v => v.includes('with'))) {
      rateSourceTag = 'with_hhd';
    } else if (!discountActive && viewTypes.some(v => v.includes('sans'))) {
      rateSourceTag = 'sans_hhd';
    }

    return {
      id: `medigap:${carrierId}:${planLetter}`,
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
        rateSource: rateSourceTag || rateInfo.rateSource,
      },
      plan: {
        key: planLetter,
        display: `Plan ${planLetter}`,
        discountApplied: discountActive && !!rateSourceTag,
      },
      adapter: { category: 'medigap', version: 1 },
      metadata: {
        state: raw.state,
        effectiveDate: raw.effective_date,
        viewTypeTags: viewTypes,
      },
      __raw: undefined, // omit by default (can toggle for debugging)
    };
  },
  /**
   * Collapse an array of normalized Medigap quotes down to one PricingSummary per carrier.
   * We surface the lowest monthly price per (F|G|N) plan and also build a min/max/count range.
   * Additional plan letters are ignored for now to keep UI stable; easy to extend later.
   */
  derivePricingSummary(quotes) {
    if (!Array.isArray(quotes) || !quotes.length) return [];
    const planKeys = ['F','G','N'];
    interface Agg { prices: Record<string, number | undefined>; ranges: Record<string, { min:number; max:number; count:number } | undefined>; carrierName: string; logo?: string; rating?: string; }
    const map = new Map<string, Agg>();
    for (const q of quotes) {
      // Defensive: skip if pricing missing
      if (!q?.carrier?.id || typeof q.pricing?.monthly !== 'number') continue;
      const carrierId = q.carrier.id;
      let agg = map.get(carrierId);
      if (!agg) {
        agg = { carrierName: q.carrier.name, logo: q.carrier.logoUrl, rating: q.carrier.amBestRating, prices: {}, ranges: {} };
        map.set(carrierId, agg);
      }
      const planKey = q.plan?.key?.toUpperCase();
      if (!planKeys.includes(planKey)) continue; // ignore other letters for initial surface
      const price = q.pricing.monthly;
      // Lowest price per plan
      const current = agg.prices[planKey];
      if (current == null || price < current) agg.prices[planKey] = price;
      // Range accumulation
      const r = agg.ranges[planKey];
      if (!r) {
        agg.ranges[planKey] = { min: price, max: price, count: 1 };
      } else {
        if (price < r.min) r.min = price;
        if (price > r.max) r.max = price;
        r.count += 1;
      }
    }
    // Build summaries list
    const summaries = Array.from(map.entries()).map(([carrierId, agg]) => {
      return {
        carrierId,
        carrierName: agg.carrierName,
        logoUrl: agg.logo,
        rating: agg.rating,
        plans: agg.prices,
        planRanges: agg.ranges,
      };
    });
    // Sort by lowest available plan price across tracked plan keys
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
