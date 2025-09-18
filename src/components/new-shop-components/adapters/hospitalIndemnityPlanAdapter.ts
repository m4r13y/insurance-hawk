// Hospital Indemnity Plan Adapter (foundation)
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawHospitalIndemnityQuote {
  id: string;
  carrier_name: string;
  plan_name: string;
  monthly_premium: number;
  daily_hospital_benefit?: number; // per day amount
  days_covered?: number; // number of days
  observation_benefit?: number;
  ambulance_benefit?: number;
  icu_upgrade?: boolean;
}

function toMoney(v:any){ if(typeof v!=='number'||v<0||isNaN(v)) return undefined; return v>=1000? v/100 : v; }

export const hospitalIndemnityPlanAdapter: CategoryAdapter<RawHospitalIndemnityQuote, NormalizedQuoteBase> = {
  category: 'hospital',
  version: 1,
  normalize(raw: RawHospitalIndemnityQuote, _ctx: NormalizeContext){
    const monthly = toMoney(raw.monthly_premium); if(monthly==null) return null;
    const carrier = raw.carrier_name || 'Unknown';
    return {
      id: `hospital:${raw.id}`,
      category: 'hospital',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: raw.id, display: raw.plan_name },
      adapter: { category: 'hospital', version: 1 },
      metadata: {
        dailyBenefit: raw.daily_hospital_benefit,
        daysCovered: raw.days_covered,
        observation: raw.observation_benefit,
        ambulance: raw.ambulance_benefit,
        icuUpgrade: raw.icu_upgrade,
      }
    };
  },
  derivePricingSummary(quotes){
    if(!quotes.length) return [];
    const map = new Map<string,{carrierName:string; prices:number[]}>();
    quotes.forEach(q=>{ let b=map.get(q.carrier.id); if(!b){b={carrierName:q.carrier.name, prices:[]}; map.set(q.carrier.id,b);} b.prices.push(q.pricing.monthly); });
    return Array.from(map.entries()).map(([carrierId,agg])=>{const min=Math.min(...agg.prices); const max=Math.max(...agg.prices); return { carrierId, carrierName: agg.carrierName, plans:{ HOSP: min }, planRanges:{ HOSP:{ min,max,count:agg.prices.length } } } as PricingSummary;}).sort((a,b)=> (a.plans.HOSP??Infinity)-(b.plans.HOSP??Infinity));
  }
};

export default hospitalIndemnityPlanAdapter;
