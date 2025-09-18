// Final Expense Plan Adapter (foundation)
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawFinalExpenseQuote {
  id: string;
  carrier_name: string;
  plan_name: string;
  monthly_premium: number;
  face_amount?: number; // death benefit
  graded?: boolean;
  immediate?: boolean;
  accidental_rider?: boolean;
}

function normalizeMoney(v:any){ if(typeof v!=='number'||v<0||isNaN(v)) return undefined; return v>=1000? v/100 : v; }

export const finalExpensePlanAdapter: CategoryAdapter<RawFinalExpenseQuote, NormalizedQuoteBase> = {
  category: 'final-expense',
  version: 1,
  normalize(raw: RawFinalExpenseQuote, _ctx: NormalizeContext){
    const monthly = normalizeMoney(raw.monthly_premium); if(monthly==null) return null;
    const carrier = raw.carrier_name || 'Unknown';
    return {
      id: `final-expense:${raw.id}`,
      category: 'final-expense',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: raw.id, display: raw.plan_name },
      adapter: { category: 'final-expense', version: 1 },
      metadata: {
        faceAmount: raw.face_amount,
        graded: raw.graded,
        immediate: raw.immediate,
        accidental: raw.accidental_rider,
      }
    };
  },
  derivePricingSummary(quotes){
    if(!quotes.length) return [];
    const map = new Map<string,{carrierName:string; prices:number[]}>();
    quotes.forEach(q=>{ let b=map.get(q.carrier.id); if(!b){b={carrierName:q.carrier.name, prices:[]}; map.set(q.carrier.id,b);} b.prices.push(q.pricing.monthly); });
    return Array.from(map.entries()).map(([carrierId,agg])=>{const min=Math.min(...agg.prices); const max=Math.max(...agg.prices); return { carrierId, carrierName: agg.carrierName, plans:{ FE: min }, planRanges:{ FE:{ min,max,count:agg.prices.length } } } as PricingSummary;}).sort((a,b)=> (a.plans.FE??Infinity)-(b.plans.FE??Infinity));
  }
};

export default finalExpensePlanAdapter;
