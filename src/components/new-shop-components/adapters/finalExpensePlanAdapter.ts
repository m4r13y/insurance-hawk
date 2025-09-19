// Final Expense Plan Adapter (foundation)
import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

export interface RawFinalExpenseQuote {
  id: string;
  carrier_name?: string;
  carrier?: string;
  company_name?: string;
  plan_name?: string;
  planName?: string;
  monthly_premium?: number; // may be absent in raw
  monthly_rate?: number; // alternate field name from action
  monthly_fee?: number;
  face_amount?: number; // death benefit
  face_amount_min?: number;
  face_amount_max?: number;
  face_value?: number; // actual requested face value (action response)
  graded?: boolean;
  immediate?: boolean;
  accidental_rider?: boolean;
  am_best_rating?: string;
  state?: string;
}

function normalizeMoney(v:any){ if(typeof v!=='number'||v<0||isNaN(v)) return undefined; return v>=1000? v/100 : v; }

// Feature flag: allow disabling monetary normalization (use raw cents) for audit accuracy.
// Set NEXT_PUBLIC_FE_RAW_PRICING=1 to expose exact upstream values (still computing totalMonthly if possible).
const RAW_MODE = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FE_RAW_PRICING === '1';

function detectPaymentMode(planName?: string, benefitName?: string){
  const source = (planName || benefitName || '').toLowerCase();
  if(/single\s*pay/.test(source)) return { paymentMode: 'single' as const };
  const m = source.match(/(\d+)\s*pay/);
  if(m){
    const years = parseInt(m[1],10);
    if(!isNaN(years)) return { paymentMode: 'limited' as const, payYears: years };
  }
  return { paymentMode: 'lifetime' as const };
}

export const finalExpensePlanAdapter: CategoryAdapter<RawFinalExpenseQuote, NormalizedQuoteBase> = {
  category: 'final-expense',
  version: 1,
  normalize(raw: RawFinalExpenseQuote, _ctx: NormalizeContext){
  const rawValue = raw.monthly_premium ?? raw.monthly_rate;
  // Detect payment structure BEFORE normalization so we can avoid incorrect scaling on single-pay large totals
  const modeInfo = detectPaymentMode(raw.plan_name || raw.planName, (raw as any).benefit_name);
  let baseNormalized = normalizeMoney(rawValue);
  if(modeInfo.paymentMode==='single' && typeof rawValue==='number'){
    // Treat rawValue as already in real dollars (do NOT scale / divide). If normalizeMoney scaled it, override.
    baseNormalized = rawValue; 
  }
  if(baseNormalized==null) return null;
  const feeNormalized = normalizeMoney(raw.monthly_fee);
  const monthly = RAW_MODE ? (typeof rawValue==='number'? rawValue: baseNormalized) : baseNormalized;
  const fee = RAW_MODE ? (typeof raw.monthly_fee==='number'? raw.monthly_fee: feeNormalized) : feeNormalized;
  const monthlyTotal = (monthly ?? 0) + (fee ?? 0);
    if (process.env.NODE_ENV !== 'production' && typeof rawValue === 'number' && monthly < 30) {
      // eslint-disable-next-line no-console
      console.debug('[FE Adapter] Low monthly detected', { id: raw.id, rawValue, normalized: monthly });
    }
    // Sanitize carrier name: sometimes upstream provides objects; coerce to string early.
    let rawCarrier: any = raw.carrier_name || raw.carrier || raw.company_name || (raw as any)?.carrier_obj || 'Unknown';
    if (typeof rawCarrier !== 'string') {
      const tryName = rawCarrier?.name || rawCarrier?.full_name || rawCarrier?.displayName;
      rawCarrier = typeof tryName === 'string' ? tryName : JSON.stringify(rawCarrier);
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[final-expense adapter] Non-string carrier coerced', rawCarrier);
      }
    }
    // Canonicalize: collapse whitespace, remove corporate suffix clutter for better preferred matching later
    const carrier = (rawCarrier || 'Unknown')
      .replace(/\b(insurance|ins|company|co\.?|corp\.?|corporation|life|inc\.?|national|natl)\b/gi,'')
      .replace(/\s{2,}/g,' ')
      .trim() || 'Unknown';
    return {
      id: `final-expense:${raw.id}`,
      category: 'final-expense',
      carrier: { id: carrier, name: carrier },
      pricing: { monthly, fee, totalMonthly: monthlyTotal, __raw: { monthly_premium: raw.monthly_premium, monthly_rate: raw.monthly_rate, monthly_fee: raw.monthly_fee } },
      plan: { key: raw.id, display: raw.plan_name || raw.planName || 'Final Expense Plan' },
      adapter: { category: 'final-expense', version: 1 },
      metadata: {
        faceAmount: raw.face_amount,
        faceAmountMin: raw.face_amount_min,
        faceAmountMax: raw.face_amount_max,
        faceValue: raw.face_value,
        benefitName: (raw as any).benefit_name,
        rating: raw.am_best_rating,
        graded: raw.graded,
        immediate: raw.immediate,
        accidental: raw.accidental_rider,
        paymentMode: modeInfo.paymentMode,
        payYears: (modeInfo as any).payYears,
        singlePayTotal: modeInfo.paymentMode==='single'? baseNormalized: undefined,
        __raw: raw,
        normalizationMode: RAW_MODE ? 'raw' : 'normalized'
      }
    };
  },
  derivePricingSummary(quotes){
    if(!quotes.length) return [];
    const map = new Map<string,{carrierName:string; prices:number[]}>();
    quotes.forEach(q=>{ 
      // Exclude single-pay and limited-pay from monthly carrier summary comparisons
      const mode = (q.metadata as any)?.paymentMode;
      if(mode && mode !== 'lifetime') return;
      const price = (q.pricing as any).totalMonthly ?? q.pricing.monthly; 
      let b=map.get(q.carrier.id); 
      if(!b){b={carrierName:q.carrier.name, prices:[]}; map.set(q.carrier.id,b);} 
      if(typeof price==='number') b.prices.push(price); 
    });
    return Array.from(map.entries()).map(([carrierId,agg])=>{const min=Math.min(...agg.prices); const max=Math.max(...agg.prices); return { carrierId, carrierName: agg.carrierName, plans:{ FE: min }, planRanges:{ FE:{ min,max,count:agg.prices.length } } } as PricingSummary;}).sort((a,b)=> (a.plans.FE??Infinity)-(b.plans.FE??Infinity));
  }
};

export default finalExpensePlanAdapter;
