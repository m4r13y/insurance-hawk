// Dental Plan Adapter (foundation)
// Normalizes raw dental quotes to shared NormalizedQuoteBase shape.
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

// NOTE: The dental API currently has at least two observed shapes:
// 1. Optimized/flattened quotes returned by firebase callable (fields: id, carrierName, planName, monthlyPremium, annualMaximum, deductible, ...)
// 2. Raw admin repository export style with: key, plan_name, company_base{name,name_full}, base_plans[ { included, benefits[ { rate, amount } ], name } ]
// This adapter now tolerates both shapes. If neither premium path yields a usable number the quote is skipped.
export interface RawDentalQuote {
  // Flattened / optimized
  id?: string;
  carrierName?: string; planName?: string; monthlyPremium?: number; annualMaximum?: number; deductible?: number;
  // Alt snake_case (legacy optimized)
  carrier_name?: string; plan_name?: string; monthly_premium?: number; annual_maximum?: number; deductible_individual?: number;
  waiting_period_major?: string; includes_vision?: boolean; includes_hearing?: boolean;
  // Raw complex shape
  key?: string; company_base?: { name?: string; name_full?: string };
  base_plans?: Array<{ included?: boolean; name?: string; benefits?: Array<{ rate?: number; amount?: string | number }>; benefit_notes?: string; limitation_notes?: string }>;
}

function safeCurrency(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') {
    const num = parseFloat(v.replace(/[^0-9.]/g,''));
    if (!isFinite(num)) return undefined;
    v = num;
  }
  if (typeof v !== 'number' || v < 0 || isNaN(v)) return undefined;
  // Some feeds provide cents when value >= 1000 (e.g. 3759 => 37.59)
  return v >= 1000 ? v / 100 : v;
}

function parseAnnualMaximum(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[^0-9]/g,''),10);
    if (isNaN(n)) return undefined; return n;
  }
  if (typeof v === 'number') return v;
  return undefined;
}

function extractFromRawShape(raw: RawDentalQuote) {
  if (!raw.base_plans || !Array.isArray(raw.base_plans) || !raw.base_plans.length) return null;
  const base = raw.base_plans.find(p => p.included) || raw.base_plans[0];
  if (!base) return null;
  const benefit = base.benefits?.[0];
  if (!benefit) return null;
  const monthly = safeCurrency(benefit.rate);
  const annualMax = parseAnnualMaximum(benefit.amount);
  const carrier = raw.company_base?.name_full || raw.company_base?.name || 'Unknown';
  const planDisplay = base.name || raw.plan_name || raw.planName || 'Dental Plan';
  const id = raw.key || raw.id || raw.plan_name || planDisplay;
  return {
    id, carrier, monthly, annualMax, planDisplay,
    benefitNotes: base.benefit_notes || (base as any).benefitNotes,
    limitationNotes: base.limitation_notes || (base as any).limitationNotes,
    basePlanName: base.name,
    rawBenefitAmount: benefit.amount
  };
}

export const dentalPlanAdapter: CategoryAdapter<RawDentalQuote, NormalizedQuoteBase> = {
  category: 'dental',
  version: 2, // bump after adding raw shape support
  normalize(raw: RawDentalQuote, _ctx: NormalizeContext) {
    // Instrumentation counters (module-level singleton via closure static)
    // Only active in development to avoid noise.
    const dbg = (process.env.NEXT_PUBLIC_DENTAL_ADAPTER_DEBUG || process.env.NODE_ENV !== 'production');
    // Lazy init global counter object on window (browser) or globalThis (SSR) for aggregated reporting.
    let counterStore: any;
    try {
      const root: any = (typeof window !== 'undefined') ? window : globalThis;
      root.__dentalAdapterStats = root.__dentalAdapterStats || { total: 0, normalized: 0, skipped: 0, reasons: {}, firstTs: Date.now(), lastTs: 0 };
      counterStore = root.__dentalAdapterStats;
    } catch { /* noop */ }
    function incReason(reason: string, meta?: any) {
      if (!counterStore) return;
      counterStore.skipped++; counterStore.reasons[reason] = (counterStore.reasons[reason] || 0) + 1; counterStore.lastTs = Date.now();
      if (dbg && (counterStore.reasons[reason] <= 5)) {
        console.debug(`[dentalPlanAdapter] skip:${reason}`, meta ? { meta } : undefined);
      }
    }
    if (counterStore) { counterStore.total++; }
    // Fast path for optimized / flattened shapes
  let monthly = safeCurrency(raw.monthly_premium ?? raw.monthlyPremium);
  let annualMax = parseAnnualMaximum(raw.annual_maximum ?? raw.annualMaximum);
  // Support optimized quote shape which may use companyName instead of carrierName
  let carrier = raw.carrier_name || raw.carrierName || (raw as any).companyName;
  let planDisplay = raw.plan_name || raw.planName;
  let id = raw.id;
  let benefitNotes: string | undefined = (raw as any).benefit_notes || (raw as any).benefitNotes;
  let limitationNotes: string | undefined = (raw as any).limitation_notes || (raw as any).limitationNotes;

    if (monthly == null) {
      // Attempt extraction from raw admin style payload
      const ext = extractFromRawShape(raw);
      if (ext) {
        monthly = ext.monthly;
        annualMax = annualMax ?? ext.annualMax;
        carrier = carrier || ext.carrier;
        planDisplay = planDisplay || ext.planDisplay;
        id = id || ext.id;
        benefitNotes = benefitNotes || ext.benefitNotes;
        limitationNotes = limitationNotes || ext.limitationNotes;
      }
    }

    if (monthly == null) {
      const hint = (raw.id || raw.key || raw.plan_name || '').toString().slice(0,12);
      incReason('missing_monthly_premium', { hint, hasBasePlans: Array.isArray(raw.base_plans), rateProbe: raw.base_plans?.[0]?.benefits?.[0]?.rate });
      return null;
    }

    if (carrier == null || carrier === '') {
      incReason('missing_carrier_name', { id: raw.id, key: (raw as any).key });
      carrier = 'Unknown';
    }

    if (!planDisplay) {
      incReason('missing_plan_display', { carrier, rawPlan: raw.plan_name });
      planDisplay = 'Dental Plan';
    }

    carrier = carrier || 'Unknown';
    planDisplay = planDisplay || 'Dental Plan';
    id = id || `${carrier}:${planDisplay}`;

    // Attempt deductible extraction from planDisplay if not explicitly present (e.g. "$100 Deductible")
    const dedExplicit = raw.deductible_individual ?? raw.deductible;
    let deductible = typeof dedExplicit === 'number' ? dedExplicit : undefined;
    if (deductible == null && planDisplay) {
      const m = planDisplay.match(/\$(\d{2,4})\s*Deductible/i);
      if (m) deductible = parseInt(m[1],10);
    }

    const normalized: any = {
      id: `dental:${id}`,
      category: 'dental',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: id, display: planDisplay },
      adapter: { category: 'dental', version: 2 },
      metadata: {
        annualMax,
        deductibleIndividual: deductible,
        waitingMajor: raw.waiting_period_major,
        visionIncluded: raw.includes_vision,
        hearingIncluded: raw.includes_hearing,
        benefitNotes,
        limitationNotes,
        basePlanName: (raw as any).basePlanName,
        source: raw.key ? 'raw-admin' : 'optimized'
      }
    };
    // Attach original raw for downstream enrichment (non-enumerable to avoid accidental serialization bloat)
    try { Object.defineProperty(normalized, '__raw', { value: raw, enumerable: false }); } catch {}
    if (counterStore) { counterStore.normalized++; }
    // Periodic aggregate log (every 50 processed or every 5 seconds since last log)
    if (dbg && counterStore && counterStore.total > 0) {
      const sinceLast = Date.now() - (counterStore._lastAggregateTs || 0);
      if ((counterStore.total % 50 === 0) || sinceLast > 5000) {
        counterStore._lastAggregateTs = Date.now();
        console.info('[dentalPlanAdapter] aggregate', {
          total: counterStore.total,
            normalized: counterStore.normalized,
            skipped: counterStore.skipped,
            reasons: counterStore.reasons
        });
      }
    }
    return normalized;
  },
  derivePricingSummary(quotes) {
    if (!quotes.length) return [];
    const map = new Map<string, { carrierName: string; prices: number[] }>();
    quotes.forEach(q => {
      const id = q.carrier.id;
      let bucket = map.get(id); if (!bucket) { bucket = { carrierName: q.carrier.name, prices: [] }; map.set(id, bucket); }
      bucket.prices.push(q.pricing.monthly);
    });
    return Array.from(map.entries()).map(([carrierId, agg]) => {
      const min = Math.min(...agg.prices); const max = Math.max(...agg.prices);
      return { carrierId, carrierName: agg.carrierName, plans: { DENTAL: min }, planRanges: { DENTAL: { min, max, count: agg.prices.length } } } as PricingSummary;
    }).sort((a,b)=> (a.plans.DENTAL ?? Infinity) - (b.plans.DENTAL ?? Infinity));
  }
};

export default dentalPlanAdapter;
