// Hospital Indemnity Plan Adapter (foundation)
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawHospitalIndemnityQuote {
  id: string;
  carrier_name?: string;
  company?: string; // action uses 'company'
  plan_name?: string;
  planName?: string; // docs sample
  monthly_premium?: number; // may not exist
  policy_fee?: number;
  base_plans?: any[]; // use to derive cost
  riders?: any[];
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
    let monthly = toMoney(raw.monthly_premium);
    if(monthly==null){
      // Derive approximate monthly by summing policy_fee + first rate of each included base plan + included riders
      let total = 0;
      if(typeof raw.policy_fee==='number') total += toMoney(raw.policy_fee) || 0;
      const pickRate = (benef:any)=> typeof benef?.rate==='number'? benef.rate : 0;
      if(Array.isArray(raw.base_plans)){
        raw.base_plans.forEach((bp:any)=>{
          if(bp?.included && Array.isArray(bp.benefits)) total += bp.benefits.reduce((s:number,b:any)=> s + pickRate(b),0);
        });
      }
      if(Array.isArray(raw.riders)){
        raw.riders.forEach((r:any)=>{
          if(r?.included && Array.isArray(r.benefitOptions)){
            // choose minimal rate option to approximate base added cost
            const min = r.benefitOptions
              .map((o:any)=> pickRate(o))
              .filter((n:number)=> n>0)
              .sort((a:number,b:number)=> a-b)[0];
            if(min) total += min;
          }
        });
      }
      monthly = toMoney(total);
    }
    if(monthly==null) return null; // still invalid
    const carrier = raw.carrier_name || raw.company || 'Unknown';
    return {
      id: `hospital:${raw.id}`,
      category: 'hospital',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly },
      plan: { key: raw.id, display: raw.plan_name || raw.planName || 'Hospital Indemnity Plan' },
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
