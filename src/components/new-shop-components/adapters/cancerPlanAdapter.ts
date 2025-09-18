// Cancer Plan Adapter (foundation)
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawCancerQuote {
  id: string;
  carrier_name?: string;
  carrier?: string; // action returns 'carrier'
  plan_name?: string;
  planName?: string;
  monthly_premium?: number;
  monthlyPremium?: number;
  lump_sum_benefit?: number; // e.g. base payout
  wellness_benefit?: number;
  recurrence_benefit?: boolean;
  benefit_amount?: number; // action returns benefit_amount
}

function money(v:any){ if(typeof v!=='number'||v<0||isNaN(v)) return undefined; return v>=1000? v/100 : v; }

export const cancerPlanAdapter: CategoryAdapter<RawCancerQuote, NormalizedQuoteBase> = {
  category: 'cancer',
  version: 1,
  normalize(raw: RawCancerQuote, _ctx: NormalizeContext) {
    const monthly = money(raw.monthly_premium ?? raw.monthlyPremium); if(monthly==null) return null;
    const carrier = raw.carrier_name || raw.carrier || 'Unknown';
    return {
      id: `cancer:${raw.id}`,
      category: 'cancer',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: raw.id, display: raw.plan_name || raw.planName || 'Cancer Plan' },
      adapter: { category: 'cancer', version: 1 },
      metadata: {
        lumpSum: raw.lump_sum_benefit,
        wellness: raw.wellness_benefit,
        recurrence: raw.recurrence_benefit,
        benefitAmount: raw.benefit_amount,
      }
    };
  },
  derivePricingSummary(quotes){
    if(!quotes.length) return [];
    const map = new Map<string,{carrierName:string; prices:number[]}>();
    quotes.forEach(q=>{ let b=map.get(q.carrier.id); if(!b){b={carrierName:q.carrier.name, prices:[]}; map.set(q.carrier.id,b);} b.prices.push(q.pricing.monthly); });
    return Array.from(map.entries()).map(([carrierId,agg])=>{const min=Math.min(...agg.prices); const max=Math.max(...agg.prices); return { carrierId, carrierName: agg.carrierName, plans:{ CANCER: min }, planRanges:{ CANCER:{ min,max,count:agg.prices.length } } } as PricingSummary;}).sort((a,b)=> (a.plans.CANCER??Infinity)-(b.plans.CANCER??Infinity));
  }
};

export default cancerPlanAdapter;
