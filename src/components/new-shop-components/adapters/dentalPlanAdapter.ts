// Dental Plan Adapter (foundation)
// Normalizes raw dental quotes to shared NormalizedQuoteBase shape.
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawDentalQuote {
  id: string;
  carrier_name: string;
  plan_name: string;
  monthly_premium: number;
  annual_maximum?: number;
  deductible_individual?: number;
  waiting_period_major?: string;
  includes_vision?: boolean;
  includes_hearing?: boolean;
}

function safeCurrency(v: any): number | undefined { if (typeof v !== 'number' || v < 0 || isNaN(v)) return undefined; return v >= 1000 ? v / 100 : v; }

export const dentalPlanAdapter: CategoryAdapter<RawDentalQuote, NormalizedQuoteBase> = {
  category: 'dental',
  version: 1,
  normalize(raw: RawDentalQuote, _ctx: NormalizeContext) {
    const monthly = safeCurrency(raw.monthly_premium);
    if (monthly == null) return null;
    const carrier = raw.carrier_name || 'Unknown';
    return {
      id: `dental:${raw.id}`,
      category: 'dental',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: raw.id, display: raw.plan_name },
      adapter: { category: 'dental', version: 1 },
      metadata: {
        annualMax: raw.annual_maximum,
        deductibleIndividual: raw.deductible_individual,
        waitingMajor: raw.waiting_period_major,
        visionIncluded: raw.includes_vision,
        hearingIncluded: raw.includes_hearing,
      }
    };
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
