// Shared quote parameter builders and required-field logic
// Normalizes divergence between sidebar sandbox (page.tsx) and MedicareShopContent / MedicareQuoteFlow.

export type GenderMF = 'M' | 'F';

function normalizeAge(raw: any): number {
  const n = parseInt(String(raw ?? ''), 10);
  if (isNaN(n)) return 65;
  return Math.min(99, Math.max(18, n));
}

function normalizeGender(raw: any): GenderMF {
  if (!raw) return 'M';
  const s = String(raw).toLowerCase();
  if (s === 'male' || s.startsWith('m')) return 'M';
  return 'F';
}

function parseIntOr(raw: any, fallback: number): number { const n = parseInt(String(raw ?? ''), 10); return isNaN(n) ? fallback : n; }
function parseFloatOr(raw: any, fallback: number|undefined): number|undefined { if(raw==null||raw==='') return fallback; const n = parseFloat(String(raw)); return isNaN(n)? fallback : n; }

// Category specific builders -------------------------------------------------
export interface FinalExpenseParams {
  zipCode: string; age: number; gender: GenderMF; tobaccoUse: boolean;
  quoteMode: 'face' | 'rate';
  desiredFaceValue?: number; // present when quoteMode === 'face'
  desiredRate?: number;      // present when quoteMode === 'rate'
  underwritingType?: 'Full'|'Simplified'|'Guaranteed';
}
export function buildFinalExpenseParams(form: any): FinalExpenseParams {
  const underwritingType = form.underwritingType && form.underwritingType !== 'No Preference' ? form.underwritingType : undefined;
  const quoteMode: 'face' | 'rate' = form.finalExpenseQuoteMode === 'rate' ? 'rate' : 'face';
  const base = {
    zipCode: String(form.zipCode || ''),
    age: normalizeAge(form.age),
    gender: normalizeGender(form.gender),
    tobaccoUse: !!form.tobaccoUse,
    quoteMode,
    underwritingType
  } as FinalExpenseParams;
  if (quoteMode === 'rate') {
    const rate = parseFloatOr(form.desiredRate, undefined);
    if (rate != null) base.desiredRate = rate;
  } else {
    base.desiredFaceValue = parseIntOr(form.desiredFaceValue, 10000);
    const alt = parseFloatOr(form.desiredRate, undefined);
    if (alt && !base.desiredFaceValue) base.desiredFaceValue = Math.round((alt as number) * 1000); // fallback heuristic (unlikely path)
  }
  return base;
}

export interface HospitalParams { zipCode: string; age: number; gender: GenderMF; tobaccoUse: boolean; }
export function buildHospitalParams(form:any): HospitalParams {
  return { zipCode: String(form.zipCode||''), age: normalizeAge(form.age), gender: normalizeGender(form.gender), tobaccoUse: !!form.tobaccoUse };
}

export interface CancerParams { state: 'TX'|'GA'; age: number; familyType: 'Applicant Only'|'Applicant and Spouse'; tobaccoStatus: 'Tobacco'|'Non-Tobacco'; premiumMode: 'Annual'|'Monthly Bank Draft'; carcinomaInSitu: '100%'|'25%'; benefitAmount: number; }
export function buildCancerParams(form:any, opts?: { benefitStrategy?: 'fixed'|'form' }): CancerParams {
  const validStates = ['TX','GA'] as const; const rawState = String(form.state||'TX').toUpperCase();
  const state = (validStates as readonly string[]).includes(rawState) ? rawState as 'TX'|'GA' : 'TX';
  const benefitAmount = opts?.benefitStrategy==='form' ? parseIntOr(form.benefitAmount, 25000) : 25000; // default fixed benchmark
  return {
    state,
    age: normalizeAge(form.age),
    familyType: form.familyType === 'family' ? 'Applicant and Spouse' : 'Applicant Only',
    tobaccoStatus: form.tobaccoUse ? 'Tobacco' : 'Non-Tobacco',
    premiumMode: form.premiumMode === 'annual' ? 'Annual' : 'Monthly Bank Draft',
    carcinomaInSitu: form.carcinomaInSitu ? '100%' : '25%',
    benefitAmount
  };
}

export interface DentalParams { age: number; zipCode: string; gender: any; tobaccoUse: boolean; coveredMembers: number; }
export function buildDentalParams(form:any): DentalParams {
  return { age: normalizeAge(form.age), zipCode: String(form.zipCode||''), gender: form.gender, tobaccoUse: !!form.tobaccoUse, coveredMembers: parseIntOr(form.coveredMembers, 1) };
}

export interface DrugPlanParams { zipCode: string; }
export function buildDrugPlanParams(form:any): DrugPlanParams { return { zipCode: String(form.zipCode||'') }; }

export interface MedigapParams { zipCode: string; age: string; gender: GenderMF; tobacco: '1'|'0'; plans: string[]; }
export function buildMedigapParams(form:any, plans: string[]): MedigapParams {
  return { zipCode: String(form.zipCode||''), age: String(normalizeAge(form.age)), gender: normalizeGender(form.gender), tobacco: form.tobaccoUse ? '1':'0', plans: plans.slice() };
}

// Required field computation (single source of truth) ------------------------
export interface RequiredFieldsMap { zipCode:boolean; state:boolean; gender:boolean; age:boolean; tobaccoUse:boolean; benefitAmount:boolean; familyType:boolean; carcinomaInSitu:boolean; premiumMode:boolean; coveredMembers:boolean; desiredFaceValue:boolean; desiredRate:boolean; underwritingType:boolean; }

export function computeRequiredFields(form:any): RequiredFieldsMap {
  const selectedCats = new Set([...(form.planCategories||[]), ...(form.selectedAdditionalOptions||[])]);
  const has = (id:string)=> selectedCats.has(id);
  const req: RequiredFieldsMap = { zipCode:false,state:false,gender:false,age:false,tobaccoUse:false,benefitAmount:false,familyType:false,carcinomaInSitu:false,premiumMode:false,coveredMembers:false,desiredFaceValue:false,desiredRate:false,underwritingType:false };
  // Zip: all except (original note said cancer only? design now: if any selection needs it) -> replicate prior logic: all except when only cancer? we keep unified: any selected category triggers
  if ([...selectedCats].length) req.zipCode = true;
  if (has('cancer')) { req.state=true; req.familyType=true; req.carcinomaInSitu=true; req.premiumMode=true; req.benefitAmount=true; }
  if (has('medigap')||has('dental')||has('cancer')||has('final-expense')||has('hospital')) { req.gender=true; req.age=true; req.tobaccoUse=true; }
  if (has('dental')) req.coveredMembers=true;
  if (has('final-expense')) {
    req.underwritingType = true;
    // Determine mode from form (default face)
    const mode = form.finalExpenseQuoteMode === 'rate' ? 'rate' : 'face';
    if (mode === 'rate') {
      req.desiredRate = true;
    } else {
      req.desiredFaceValue = true;
    }
  }
  return req;
}

// Export normalization helpers if needed elsewhere
export const quoteParamHelpers = { normalizeAge, normalizeGender };
