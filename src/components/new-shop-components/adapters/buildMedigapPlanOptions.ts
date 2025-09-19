// Utility: buildMedigapPlanOptions
// ---------------------------------
// Reconstructs plan option variants (baseline vs discounted) for a given plan key
// from normalized adapter quotes + summary __discountMeta, mirroring logic found in
// processOptionsForDisplay but operating purely on normalized adapter layer.

export interface PlanOptionVariant {
  facet: 'with_hhd' | 'sans_hhd' | 'baseline' | 'computed' | 'unknown';
  rate: number;             // monthly rate in dollars (normalized monthly)
  originalRate?: number;    // baseline before discount (for computed variants)
  ratingClass?: string;
  viewType?: string[];
  discounts?: any[];
  isCalculatedDiscount?: boolean;
  savings?: number;         // baseline - discounted (positive)
}

interface BuildOptionsArgs {
  planKey: string; // e.g. 'G'
  normalizedQuotes: any[]; // Medigap normalized quotes for the carrier
  summary: any; // pricing summary row containing __discountMeta
  applyDiscounts: boolean;
}

// Decide which subset of variants to expose based on toggle & pattern
export function buildMedigapPlanOptions({ planKey, normalizedQuotes, summary, applyDiscounts }: BuildOptionsArgs): PlanOptionVariant[] {
  const key = planKey.toUpperCase();
  const meta = summary?.__discountMeta?.perPlan?.[key];
  if (!meta) return [];
  const pattern: 'precalculated' | 'calculated' | 'none' = meta.pattern || 'none';

  // Precalculated: show with_hhd or sans_hhd depending on toggle
  if (pattern === 'precalculated') {
    const opts = meta.options as PlanOptionVariant[];
    if (!Array.isArray(opts)) return [];
    if (applyDiscounts) {
      return opts.filter(o => o.facet === 'with_hhd').map(o => attachSavings(o, meta));
    } else {
      return opts.filter(o => o.facet === 'sans_hhd').map(o => attachSavings(o, meta));
    }
  }

  // Calculated pattern: we generated baseline + computed variants
  if (pattern === 'calculated') {
    const opts = meta.options as PlanOptionVariant[];
    if (!Array.isArray(opts)) return [];
    if (applyDiscounts) {
      return opts.filter(o => o.facet === 'computed').map(o => attachSavings(o, meta));
    }
    return opts.filter(o => o.facet === 'baseline');
  }

  // None pattern: just baseline single option
  return (meta.options as PlanOptionVariant[] || []).filter(o => o.facet === 'baseline');
}

function attachSavings(option: PlanOptionVariant, meta: any): PlanOptionVariant {
  if (meta?.savings && option.facet !== 'baseline') {
    return { ...option, savings: meta.savings };
  }
  return option;
}

export default buildMedigapPlanOptions;
