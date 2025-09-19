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

// Simple monotonic counter for fallback ids (scoped to module)
let _fallbackSeq = 0;
const CARRIER_ALIASES: Record<string,string> = {
  'american-general': 'AIG',
  'bankers-fidelity': 'Bankers Fidelity',
  'bankers': 'Bankers Fidelity',
  'united-national-life': 'United National Life',
  'unl': 'United National Life',
  'manhattan-life': 'Manhattan Life',
  'aetna': 'Aetna',
  'senior-indemnity': 'Aetna',
  'nassau': 'Nassau',
  'allstate': 'Allstate',
};
function slugifyCarrier(rawName: string){
  return rawName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
// Detect opaque / hashed looking ids (base58-like or long random strings) we don't want to show
function looksOpaque(str: string){
  if(!str) return false;
  const s = str.trim();
  // if contains both upper+lower or hyphens we probably already normalized (allow). Opaque keys here appear base64/base58-ish
  if(/^[a-zA-Z0-9+=/]{15,}$/.test(s) && !/[\s-]/.test(s)) return true; // long tokeny string
  if(/^[a-z0-9]{10,}$/.test(s) && !/[aeiou]{2}/.test(s) && !/[-_]/.test(s)) return true; // long consonant heavy
  return false;
}
function displayNameFor(rawName: string){
  const slug = slugifyCarrier(rawName);
  // Alias mapping first
  const alias = CARRIER_ALIASES[slug];
  if (alias) return alias;
  const trimmed = rawName.replace(/\s+/g,' ').trim();
  // If looks like a slug (contains hyphen and is lowercase) -> humanize
  if (/^[a-z0-9-]+$/.test(trimmed) && trimmed.includes('-')) {
    return trimmed.split('-').filter(Boolean).map(w=> w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  }
  // If ALL CAPS (with optional spaces) convert to title case for readability
  if (/^[A-Z0-9 &]+$/.test(trimmed) && /[A-Z]/.test(trimmed) && trimmed.length > 4) {
    return trimmed.toLowerCase().split(/\s+/).map(w=> w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  }
  return trimmed;
}

// Attempt to map well-known hospital indemnity plan family prefixes to a parent carrier
function brandFromPlan(plan?: string): string | undefined {
  if(!plan) return undefined;
  const p = plan.toLowerCase();
  if(/advantageguard|protection series|hospital indemnity select|shield -|choice hospital indemnity|senior indemnity/.test(p)) return 'Allstate';
  return undefined;
}
function makeId(raw: RawHospitalIndemnityQuote){
  const primary = raw.id && String(raw.id).trim();
  if(primary) return primary;
  const plan = (raw.plan_name || raw.planName || '').toString().trim();
  const carrier = (raw.carrier_name || raw.company || 'carrier').toString().trim();
  _fallbackSeq += 1;
  return `${carrier}:${plan || 'plan'}:${_fallbackSeq}`.replace(/\s+/g,'_');
}

export const hospitalIndemnityPlanAdapter: CategoryAdapter<RawHospitalIndemnityQuote, NormalizedQuoteBase> = {
  // Canonical category id aligned with storage key and legacy selection mapping
  category: 'hospital-indemnity',
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
    if(monthly==null){
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[hospital adapter] dropping quote: could not derive monthly', { id: raw.id, carrier: raw.carrier_name||raw.company, policy_fee: raw.policy_fee, base_plans: raw.base_plans?.length, riders: raw.riders?.length });
      }
      return null; // still invalid
    }
  let rawCarrier = raw.carrier_name
    || (raw as any)?.company
    || (raw as any)?.company_name
    || (raw as any)?.companyName
    || (raw as any)?.company_full_name
    || (raw as any)?.companyFullName
    || (raw as any)?.company_base?.name
    || '';
  // Heuristic: if rawCarrier looks opaque, attempt alternate sources
  if(!rawCarrier || looksOpaque(rawCarrier)){
    const companyBaseName = (raw as any)?.company_base?.name;
    if(companyBaseName && !looksOpaque(companyBaseName)) rawCarrier = companyBaseName;
    else {
      // Try deriving from plan_name prefix before first dash or ' - '
      const plan = raw.plan_name || raw.planName;
      if(typeof plan === 'string'){
        const prefix = plan.split(/\s+-\s+|\s+Plan|\s+\d| - /)[0];
        if(prefix && prefix.length >=3 && !looksOpaque(prefix)) {
          // If prefix maps to a known umbrella brand, use umbrella brand rather than raw prefix
          const mappedBrand = brandFromPlan(plan) || brandFromPlan(prefix);
            rawCarrier = mappedBrand || prefix;
        } else {
          const mappedBrand = brandFromPlan(plan);
          if(mappedBrand) rawCarrier = mappedBrand;
        }
      }
    }
  }
  if(!rawCarrier) rawCarrier = 'Unknown';
  const carrierSlug = slugifyCarrier(rawCarrier);
  const carrierDisplay = displayNameFor(rawCarrier);
    // Derive fallback benefit metadata if API omitted the newer flattened fields
    let dailyBenefit = raw.daily_hospital_benefit as any;
    let daysCovered = raw.days_covered as any;
    let ambulance = raw.ambulance_benefit as any;
    let icuUpgrade = raw.icu_upgrade as any;
    if(dailyBenefit == null || daysCovered == null){
      try {
        // Look for a base plan that appears to represent the core daily benefit. Common naming heuristics.
        const core = Array.isArray(raw.base_plans) ? raw.base_plans.find(p => /daily|hospital/i.test(p?.name||'')) || raw.base_plans[0] : undefined;
        if(core && Array.isArray(core.benefits) && core.benefits.length){
          const firstBenef = core.benefits[0];
          // amount may be a string like "$250" or "250" or "250 per day".
          const amtStr = (firstBenef.amount||'').toString();
          const match = amtStr.replace(/[,]/g,'').match(/(\d+(?:\.\d+)?)/);
          const num = match ? parseFloat(match[1]) : undefined;
            if(dailyBenefit == null && typeof num === 'number') dailyBenefit = num; 
            if(daysCovered == null){
              // Attempt to parse quantifier or notes for number of days (e.g., "x6" or "6 days")
              const q = (firstBenef.quantifier||'').toString();
              const qMatch = q.match(/(\d+)/);
              if(qMatch) daysCovered = parseInt(qMatch[1],10);
            }
        }
      } catch {/* silent heuristic failure */}
    }
    if(ambulance == null){
      try {
        const ambRider = Array.isArray(raw.riders)? raw.riders.find(r => /ambulance/i.test(r?.name||'')) : undefined;
        if(ambRider && Array.isArray(ambRider.benefits)){
          const rates = ambRider.benefits.map((b:any)=>{
            const amtStr = (b.amount||'').toString();
            const m = amtStr.replace(/[,]/g,'').match(/(\d+(?:\.\d+)?)/);
            return m? parseFloat(m[1]): undefined;
          }).filter((n:any)=> typeof n==='number') as number[];
          if(rates.length) ambulance = Math.max(...rates); // show higher benefit amount
        }
      } catch {}
    }
    if(icuUpgrade == null){
      try { icuUpgrade = Array.isArray(raw.riders) ? raw.riders.some(r => /ICU|Intensive/i.test(r?.name||'')) : false; } catch { /* noop */ }
    }
    const baseId = makeId(raw);
    return {
      id: `hospital:${baseId}`,
      category: 'hospital-indemnity',
  carrier: { id: carrierSlug || rawCarrier, name: carrierDisplay },
      pricing: { monthly },
      plan: { key: baseId, display: raw.plan_name || raw.planName || 'Hospital Indemnity Plan' },
      adapter: { category: 'hospital-indemnity', version: 1 },
      metadata: {
        dailyBenefit,
        daysCovered,
        observation: raw.observation_benefit,
        ambulance,
        icuUpgrade,
        rawCarrierName: rawCarrier,
        carrierDebug: { originalCarrier: raw.carrier_name||raw.company, derived: rawCarrier },
      }
    };
  },
  derivePricingSummary(quotes){
    if(!quotes.length) return [];
    const map = new Map<string,{carrierName:string; prices:number[]}>();
    quotes.forEach(q=>{ let b=map.get(q.carrier.id); if(!b){b={carrierName:q.carrier.name, prices:[]}; map.set(q.carrier.id,b);} if(typeof q.pricing?.monthly==='number') b.prices.push(q.pricing.monthly); });
    const summaries: PricingSummary[] = Array.from(map.entries()).map(([carrierId,agg])=>{
      if(!agg.prices.length) return null as any; 
      const min=Math.min(...agg.prices); 
      const max=Math.max(...agg.prices); 
      return { carrierId, carrierName: agg.carrierName, plans:{ HOSP: min }, planRanges:{ HOSP:{ min,max,count:agg.prices.length } } } as PricingSummary;
    }).filter((x): x is PricingSummary => !!x);
    return summaries.sort((a,b)=> (a.plans.HOSP??Infinity)-(b.plans.HOSP??Infinity));
  }
};

export default hospitalIndemnityPlanAdapter;
