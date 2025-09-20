/**
 * Simplified Carrier System
 * 
 * This module provides carrier data with preferred carriers configuration
 * in a clean, extensible way that's ready for future product categories.
 */

// ===== TYPES =====

export type ProductCategory = 
  | 'medicare-supplement' 
  | 'medicare-advantage' 
  | 'dental' 
  | 'final-expense' 
  | 'hospital-indemnity'
  | 'cancer'
  | 'drug-plan';

export interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;
  displayName: string;
  namePatterns: string[];
  phone?: string;
  website?: string;
  logoUrl?: string;
  /** Inline preferred configuration: category -> { priority, active } */
  preferred?: Partial<Record<ProductCategory, { priority: number; active?: boolean }>>;
}

export interface PreferredCarrier {
  carrierId: string;  // References CarrierInfo.id
  category: ProductCategory;
  priority: number;
  isActive: boolean;
}

// ===== CORE CARRIER DATA =====

// Featured carriers for homepage display - using local logos
export const featuredCarriers = [
  { "id": "unitedhealth", "name": "UnitedHealth Group", "logoUrl": "/carrier-logos/1.png", "website": "https://uhc.com" },
  { "id": "elevance", "name": "Elevance Health (Anthem)", "logoUrl": "/carrier-logos/2.png", "website": "https://anthem.com" },
  { "id": "humana", "name": "Humana", "logoUrl": "/carrier-logos/3.png", "website": "https://humana.com" },
  { "id": "cvs_aetna", "name": "CVS Health (Aetna)", "logoUrl": "/carrier-logos/4.png", "website": "https://aetna.com" },
  { "id": "kaiser", "name": "Kaiser Permanente", "logoUrl": "/carrier-logos/5.png", "website": "https://kaiserpermanente.org" },
  { "id": "cigna", "name": "Cigna", "logoUrl": "/carrier-logos/6.png", "website": "https://cigna.com" },
  { "id": "molina", "name": "Molina Healthcare", "logoUrl": "/carrier-logos/7.png", "website": "https://molinahealthcare.com" },
  { "id": "bcbsm", "name": "Blue Cross Blue Shield", "logoUrl": "/carrier-logos/8.png", "website": "https://bcbsm.com" },
  { "id": "oscar", "name": "Oscar Health", "logoUrl": "/carrier-logos/9.png", "website": "https://oscar.com" },
  { "id": "aflac", "name": "Aflac", "logoUrl": "/carrier-logos/10.png", "website": "https://aflac.com" }
];

/**
 * Essential carrier information
 * This is the single source of truth for carrier data
 * Only includes carriers we actually support/prefer
 */
export const CARRIERS: CarrierInfo[] = [

  {
    id: 'bankers-fidelity',
    name: 'Bankers Fidelity Life Insurance Company',
    shortName: 'Bankers Fidelity',
    displayName: 'Bankers Fidelity',
    namePatterns: [
      'Bankers Fidelity', 
      'Atlantic Capital Life Assur Co', 
      'Atlantic Capital Life Assurance Company',
      'Bankers Fidelity Life Ins Co'
    ],
    phone: '800-241-1439',
    website: 'https://www.bankersfidelitylife.com',
    logoUrl: 'https://logo.clearbit.com/bankersfidelity.com',
    preferred: {
      'medicare-supplement': { priority: 1 },
      'final-expense': { priority: 1 },
      'hospital-indemnity': { priority: 1 },
      'cancer': { priority: 1 }
    }
  },
  {
    id: 'insurance-co-n-america',
    name: 'Insurance Company of North America',
    shortName: 'Chubb',
    displayName: 'Insurance Co. of North America',
    namePatterns: ['Insurance Co of N Amer', 'Insurance Co. of N. America', 'Insurance Co. of North America', 'Chubb'],
    phone: '215-640-1000',
    website: 'https://www.chubb.com',
    logoUrl: 'https://logo.clearbit.com/chubb.com',
    preferred: {
      'medicare-supplement': { priority: 2 }
    }
  },
  {
    id: 'cigna',
    name: 'Cigna Health and Life Insurance Company',
    shortName: 'Cigna',
    displayName: 'Cigna',
    namePatterns: [
      'Cigna', 
      'Cigna Ins Co', 
      'Healthspring Insurance Company', 
      'CIGNA', 
      '(CIGNA)', 
      'Loyal Amer Life Ins Co (CIGNA)', 
      'Loyal American Life Insurance Company (CIGNA)',
      'American Retirement Life Ins Co (CIGNA)',
      'American Retirement Life',
      'Loyal Amer Life'
    ],
    phone: '512-451-2224',
    website: 'https://www.cigna.com',
    logoUrl: 'https://logo.clearbit.com/cigna.com',
    preferred: {
      'medicare-supplement': { priority: 3 },
      'medicare-advantage': { priority: 2 },
      'dental': { priority: 2 },
      'final-expense': { priority: 2 }
    }
  },
  {
    id: 'aflac',
    name: 'American Family Life Assurance Company of Columbus (AFLAC)',
    shortName: 'Aflac',
    displayName: 'Aflac',
    namePatterns: ['Aflac', 'American Family Life', 'American Family Life Assur Co of Col'],
    phone: '800-992-3522',
    website: 'https://www.aflac.com',
    logoUrl: 'https://logo.clearbit.com/aflac.com',
    preferred: {
      'medicare-supplement': { priority: 4 }
    }
  },
  {
    id: 'bcbs',
    name: 'Blue Cross Blue Shield',
    shortName: 'Blue Cross Blue Shield',
    displayName: 'BCBS',
    namePatterns: ['Blue Cross', 'BCBS', 'HCSC', 'BCBS IL/TX/NM/OK'],
    phone: '877-774-2267',
    website: 'https://www.bcbs.com',
    logoUrl: 'https://logo.clearbit.com/bcbs.com',
    preferred: {
      'medicare-supplement': { priority: 5 }
    }
  },
  {
    id: 'mutual-of-omaha',
    name: 'Mutual of Omaha Insurance Company',
    shortName: 'Mutual of Omaha',
    displayName: 'Mutual of Omaha',
    namePatterns: [
      'Mutual of Omaha', 
      'United of Omaha',
      'United Of Omaha Life Ins Co',
      'Mutual Of Omaha Ins Co',
      'United Of Omaha',
      'Mutual Of Omaha'
    ],
    phone: '402-342-7600',
    website: 'https://www.mutualofomaha.com',
    logoUrl: 'https://logo.clearbit.com/mutualofomaha.com',
    preferred: {
      'medicare-supplement': { priority: 6 },
      'dental': { priority: 3 },
      'final-expense': { priority: 3 }
    }
  },
  {
    id: 'aetna',
    name: 'Aetna Health Insurance Company',
    shortName: 'Aetna',
    displayName: 'Aetna',
    namePatterns: [
      'Aetna', 
      'Continental Life Insurance Company', 
      'Continental Life Ins Co',
      'Continental Life Ins Co Brentwood',
      'Accendo Ins Co'
    ],
    phone: '800-872-3862',
    website: 'https://www.aetna.com',
    logoUrl: 'https://logo.clearbit.com/aetna.com',
    preferred: {
      'medicare-supplement': { priority: 7 },
      'medicare-advantage': { priority: 4 },
      'dental': { priority: 4 },
      'final-expense': { priority: 4 },
      'hospital-indemnity': { priority: 4 }
    }
  },
  {
    id: 'nassau',
    name: 'Nassau Life Insurance Company',
    shortName: 'Nassau Life',
    displayName: 'Nassau',
    namePatterns: ['Nassau', 'Nassau Life Insurance Company'],
    phone: '516-394-2000',
    website: 'https://www.nassaulife.com',
    logoUrl: 'https://logo.clearbit.com/nfg.com',
    preferred: {
      'medicare-supplement': { priority: 8 }
    }
  },
  {
    id: 'humana',
    name: 'Humana Insurance Company',
    shortName: 'Humana',
    displayName: 'Humana',
    namePatterns: ['Humana', 'Humana Insurance'],
    phone: '502-580-1000',
    website: 'https://www.humana.com',
    logoUrl: 'https://logo.clearbit.com/humana.com',
    preferred: {
      'medicare-supplement': { priority: 9 },
      'medicare-advantage': { priority: 1 }
    }
  },
  {
    id: 'united-healthcare',
    name: 'UnitedHealthcare Insurance Company',
    shortName: 'UnitedHealthcare',
    displayName: 'UnitedHealthcare',
    namePatterns: ['UnitedHealthcare', 'United Healthcare', 'UnitedHealth', 'AARP Medicare Supplement', 'Golden Rule Ins Co', 'UnitedHealthcare Ins Co', 'AARP Medicare Supplement Insurance Plans, insured by United Healthcare Insurance Company of America'],
    phone: '877-832-7734',
    website: 'https://www.uhc.com',
    logoUrl: 'https://logo.clearbit.com/unitedhealthcare.com',
    preferred: {
      'medicare-advantage': { priority: 3 }
    }
  },
  {
    id: 'united-american',
    name: 'United American Insurance Company',
    shortName: 'United American',
    displayName: 'United American',
    namePatterns: ['United Amer Ins Co', 'United American Insurance', 'United American'],
    phone: '800-925-7355',
    website: 'https://www.unitedamerican.com',
    logoUrl: 'https://logo.clearbit.com/unitedamerican.com'
  },
  {
    id: 'manhattan-life',
    name: 'Manhattan Life Insurance Company',
    shortName: 'Manhattan Life',
    displayName: 'Manhattan Life',
    namePatterns: ['Manhattan Life', 'Manhattan Life Insurance', 'ManhattanLife Insurance and Annuity Company'],
    phone: '800-622-9525',
    website: 'https://www.manhattanlife.com',
    logoUrl: 'https://logo.clearbit.com/manhattanlife.com',
    preferred: {
      'dental': { priority: 5 },
      'hospital-indemnity': { priority: 3 }
    }
  },
  {
    id: 'guarantee-trust-life',
    name: 'Guarantee Trust Life Insurance Company',
    shortName: 'Guarantee Trust Life',
    displayName: 'Guarantee Trust Life',
    namePatterns: ['Guarantee Trust Life', 'Guarantee Trust', 'Guarantee Trust Life Ins Co'],
    phone: '800-338-7452',
    website: 'https://www.gtlic.com',
    logoUrl: 'https://logo.clearbit.com/gtlic.com'
  },
  {
    id: 'liberty-bankers',
    name: 'Liberty Bankers Life Insurance Company',
    shortName: 'Liberty Bankers',
    displayName: 'Liberty Bankers Life',
    namePatterns: ['Liberty Bankers Life', 'Liberty Bankers', 'Liberty Bankers Life Ins Co', 'American Benefit Life Ins Co'],
    phone: '800-731-4300',
    website: 'https://www.lbig.com/',
    logoUrl: 'https://logo.clearbit.com/lbig.com'
  },
  {
    id: 'all-state-health',
    name: 'Allstate Health Insurance Company',
    shortName: 'Allstate',
    displayName: 'Allstate Health',
    namePatterns: ['Allstate Health', 'Allstate'],
    phone: '800-781-0585',
    website: 'https://allstatehealth.com/',
    logoUrl: 'https://logo.clearbit.com/allstate.com'
  },
  {
    id: 'heartland',
    name: 'Heartland National Life Insurance Company',
    shortName: 'Heartland',
    displayName: 'Heartland National Life',
    namePatterns: ['Heartland National Life', 'Heartland', 'Heartland Nat Life Ins Co'],
    phone: '800-616-0015',
    website: 'https://www.heartlandnationallife.com',
    logoUrl: 'https://logo.clearbit.com/heartlandnationallife.com'
  },
  {
    id: 'manhattan-life',
    name: 'Manhattan Life Insurance Company',
    shortName: 'Manhattan Life',
    displayName: 'Manhattan Life',
    namePatterns: ['Manhattan Life', 'Manhattan Life Insurance', 'ManhattanLife Insurance and Annuity Company'],
    phone: '800-622-9525',
    website: 'https://www.manhattanlife.com',
    logoUrl: 'https://logo.clearbit.com/manhattanlife.com'
  },
  {
    id: 'medico',
    name: 'Medico Insurance Company',
    shortName: 'Medico',
    displayName: 'Medico',
    namePatterns: ['Medico', 'Medico Insurance', 'Medico Life and Health Ins Co'],
    phone: '800-228-6080',
    website: 'https://www.wellabe.com/',
    logoUrl: 'https://logo.clearbit.com/wellabe.com'
  },
  {
    id: 'unl',
    name: 'United National Life Insurance Company of America',
    shortName: 'UNL',
    displayName: 'United National Life',
    namePatterns: ['United National Life', 'UNL', 'United Natl Life Ins Co'],
    phone: '800-207-8050',
    website: 'https://unlinsurance.com/',
    logoUrl: 'https://logo.clearbit.com/unlinsurance.com',
    preferred: {
      'dental': { priority: 1 },
      'hospital-indemnity': { priority: 2 }
    }
  }
];

// ===== LOOKUP FUNCTIONS =====

/**
 * Create lookup maps for efficient searches
 */
const carriersById = new Map(CARRIERS.map(c => [c.id, c]));

// ===== NORMALIZATION HELPERS =====

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\((.*?)\)/g,'') // drop parenthetical suffixes like (CIGNA)
    .replace(/&/g,'and')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .trim();
}

// Lazy-built lookup cache (rebuilt from inline preferred data)
const PREFERRED_LOOKUPS: Partial<Record<ProductCategory, Map<string,string>>> = {};
function getPreferredLookup(category: ProductCategory): Map<string,string> | undefined {
  if (PREFERRED_LOOKUPS[category]) return PREFERRED_LOOKUPS[category];
  const preferred = getPreferredCarriers(category);
  if (!preferred.length) return undefined;
  const map = new Map<string,string>();
  for (const pc of preferred) {
    const info = carriersById.get(pc.carrierId);
    if (!info) continue;
    const variants = new Set<string>();
    variants.add(pc.carrierId);
    [info.displayName, info.shortName, info.name].forEach(v => v && variants.add(v));
    info.namePatterns.forEach(p => variants.add(p));
    // Synthetic alias expansion: compressed, initials, no-vowel simplification
    const synthetic = new Set<string>();
    variants.forEach(v => {
      const base = v.trim();
      if (!base) return;
      const compressed = base.toLowerCase().replace(/[^a-z0-9]/g,'');
      if (compressed.length > 4) synthetic.add(compressed);
      const initials = base.split(/[^A-Za-z0-9]+/).filter(Boolean).map(w => w[0]).join('').toLowerCase();
      if (initials.length >= 2) synthetic.add(initials);
      const novowel = compressed.replace(/[aeiou]/g,'');
      if (novowel.length >= 4) synthetic.add(novowel);
    });
    synthetic.forEach(syn => variants.add(syn));
    for (const v of variants) {
      const s = slugify(v);
      if (s) map.set(s, pc.carrierId);
    }
  }
  PREFERRED_LOOKUPS[category] = map;
  return map;
}

/**
 * Get carrier information by ID
 */
export function getCarrierById(id: string): CarrierInfo | undefined {
  return carriersById.get(id);
}

/**
 * Find carrier by name patterns
 */
export function findCarrierByName(carrierName: string): CarrierInfo | undefined {
  // Normalize defensively; if not a string or empty after trim, bail early.
  if (typeof carrierName !== 'string') return undefined;
  const raw = carrierName;
  const safeName = raw.trim();
  if (!safeName) return undefined;
  // Produce a relaxed token signature: lowercase, remove punctuation & spaces
  const signature = safeName.toLowerCase().replace(/[^a-z0-9]+/g,'');
  const words = Array.from(new Set(safeName.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean)));
  // Attempt direct pattern inclusion match first (legacy behavior)
  let result = CARRIERS.find(carrier =>
    carrier.namePatterns.some(pattern => {
      const pl = pattern.toLowerCase();
      return safeName.toLowerCase().includes(pl) || pl.includes(safeName.toLowerCase());
    })
  );
  if (result) return result;
  // Fallback (revised): previous implementation accepted any carrier with >=2 overlapping tokens
  // which caused false positives for generic tokens like "fidelity" + "life" mapping unrelated companies.
  // We now:
  //  1. Ignore generic tokens (life, insurance, company, inc, co, group, holdings, health, mutual, national, american, universal)
  //  2. Collect candidates that have either:
  //       - >=2 meaningful (non-generic) overlapping tokens, OR
  //       - 1 meaningful overlapping token of length >= 6 AND exact signature match on remaining tokens
  //  3. If exactly one candidate remains, return it.
  //  4. If multiple, prefer an exact compressed signature match; otherwise, treat as ambiguous (no match) to avoid mislabeling.
  const GENERIC_TOKENS = new Set([
    'life','insurance','ins','company','co','inc','corp','group','grp','holdings','health','assurance','mutual','national','american','united','universal','the'
  ]);
  interface Candidate { carrier: CarrierInfo; meaningfulOverlap: string[]; signatureMatch: boolean }
  const candidates: Candidate[] = [];
  for (const carrier of CARRIERS) {
    const patternTokens = new Set(
      carrier.namePatterns
        .flatMap(p => p.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean))
    );
    const meaningfulOverlap = words.filter(w => patternTokens.has(w) && !GENERIC_TOKENS.has(w));
    // Require at least one meaningful token that appears EXACTLY in a namePattern (not generated by generic shortening)
    const hasExactMeaningfulPattern = carrier.namePatterns.some(p => {
      const ptoks = p.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
      return ptoks.some(t => meaningfulOverlap.includes(t) && !GENERIC_TOKENS.has(t));
    });
    if (!hasExactMeaningfulPattern) continue;
    if (!meaningfulOverlap.length) continue;
    // Require >=2 meaningful overlaps OR a single substantial (len>=6) token
    // Special guard: avoid mapping unrelated "Universal Fidelity" to Bankers Fidelity (only shared token is 'fidelity').
    if (meaningfulOverlap.length === 1 && meaningfulOverlap[0] === 'fidelity' && /universal/i.test(safeName) && /bankers fidelity/i.test(carrier.displayName)) {
      continue;
    }
    if (meaningfulOverlap.length >= 2 || meaningfulOverlap.some(t => t.length >= 6)) {
      const carrierSignature = carrier.displayName.toLowerCase().replace(/[^a-z0-9]+/g,'');
      candidates.push({ carrier, meaningfulOverlap, signatureMatch: carrierSignature === signature });
    }
  }
  if (candidates.length === 1) return candidates[0].carrier;
  if (candidates.length > 1) {
    const sigMatches = candidates.filter(c => c.signatureMatch);
    if (sigMatches.length === 1) return sigMatches[0].carrier;
    // Ambiguous: do not guess.
    return undefined;
  }
  return undefined;
}

// STRICT EXACT-PATTERN MATCHING
// Only returns a carrier if one of the raw fields matches (case-insensitive) a carrier's namePatterns OR
// its canonical name/shortName/displayName exactly. No partials, no token overlap.
export function strictlyMatchCarrier(rawFields: Array<string | undefined | null>): CarrierInfo | undefined {
  const normalized = rawFields
    .filter(v => typeof v === 'string')
    .map(v => (v as string).trim().toLowerCase())
    .filter(Boolean);
  if (!normalized.length) return undefined;
  for (const carrier of CARRIERS) {
    const patterns = new Set<string>([
      carrier.name.toLowerCase(),
      carrier.shortName.toLowerCase(),
      carrier.displayName.toLowerCase(),
      ...carrier.namePatterns.map(p => p.toLowerCase())
    ]);
    if (normalized.some(f => patterns.has(f))) {
      return carrier;
    }
  }
  return undefined;
}

// ===== STRICT PREFERRED MATCHING =====
// Build a PreferredCarrier object ONLY when a strict carrier identity exists AND that carrier declares preferred config for the category.
// This avoids fuzzy cross-brand leakage (e.g. LifeShield mapping to Cigna) when user toggles preferred-only filtering.
export function strictPreferredCarrierMatch(quote: any, category: ProductCategory): PreferredCarrier | null {
  const rawFields = [
    typeof quote?.carrier === 'string' ? quote.carrier : quote?.carrier?.name,
    typeof quote?.carrier === 'object' ? quote?.carrier?.full_name : undefined,
    quote?.company_base?.name,
    quote?.company_base?.name_full,
    quote?.company?.name,
    quote?.carrier_name,
    quote?.companyName,
    quote?.company,
  ];
  const strict = strictlyMatchCarrier(rawFields);
  if (!strict) return null;
  const prefMeta = strict.preferred?.[category];
  if (!prefMeta || prefMeta.active === false) return null;
  return {
    carrierId: strict.id,
    category,
    priority: prefMeta.priority,
    isActive: true,
  };
}

/**
 * Get proper logo URL for a carrier
 */
export function getCarrierLogoUrl(carrierName: string): string {
  const carrier = findCarrierByName(carrierName);
  if (carrier?.logoUrl) {
    return carrier.logoUrl;
  }
  
  // Fallback to placeholder
  return '/images/carrier-placeholder.svg';
}

/**
 * Get display name for a carrier (prefer preferred carrier display name, then short name from carrier data)
 */
/**
 * Strict, deterministic carrier display resolution.
 * 1. Exact strict identity (strictlyMatchCarrier) -> displayName/shortName/name
 * 2. Light pattern inclusion (findCarrierByName) WITHOUT preferred fuzzy heuristics
 * 3. Return original string if no match
 * 4. Append (AARP) when raw contains AARP and strict match is UnitedHealthcare
 */
export function getCarrierDisplayNameStrict(carrierName: string): string {
  if (typeof carrierName !== 'string' || !carrierName.trim()) return carrierName;
  const raw = carrierName.trim();
  const strict = strictlyMatchCarrier([raw]);
  let display = strict ? (strict.displayName || strict.shortName || strict.name) : undefined;
  if (!display) {
    const pattern = findCarrierByName(raw);
    display = pattern ? (pattern.displayName || pattern.shortName || pattern.name) : raw;
  }
  if (display === 'UnitedHealthcare' && /aarp/i.test(raw)) {
    display = 'UnitedHealthcare (AARP)';
  }
  return display;
}

/**
 * @deprecated Use getCarrierDisplayNameStrict. This legacy function previously invoked fuzzy preferred matching
 * which could cause cross-carrier branding contamination. Now it delegates to the strict helper.
 */
export function getCarrierDisplayName(carrierName: string, _category: ProductCategory = 'medicare-supplement'): string {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('DEPRECATED_getCarrierDisplayName: use getCarrierDisplayNameStrict instead');
  }
  return getCarrierDisplayNameStrict(carrierName);
}

/**
 * Get subsidiary company name for display beneath parent company
 */
export function getSubsidiaryName(carrierName: string, category: ProductCategory = 'medicare-supplement'): string | null {
  // Check if this is a subsidiary relationship
  const carrier = findCarrierByName(carrierName);
  
  // If we found a parent carrier match, but the actual carrier name is different, 
  // return the original name as the subsidiary
  if (carrier && !carrier.namePatterns.some(pattern => 
    pattern.toLowerCase() === carrierName.toLowerCase()
  )) {
    // This means we matched on a subsidiary pattern
    return carrierName;
  }
  
  return null;
}

// ===== PREFERRED CARRIERS FUNCTIONS =====

/**
 * Find preferred carrier match for a quote
 */
/**
 * Find preferred carrier by name (simplified without NAIC)
 */
export function findPreferredCarrierByParams(
  carrierName: string,
  category: ProductCategory = 'medicare-supplement'
): PreferredCarrier | null {
  if (typeof carrierName !== 'string' || !carrierName.trim()) return null;
  const lower = carrierName.toLowerCase();
  const preferredCarriers = getPreferredCarriers(category);
  
  for (const preferredCarrier of preferredCarriers) {
    // Get the actual carrier info
    const carrierInfo = getCarrierById(preferredCarrier.carrierId);
    if (carrierInfo) {
      // Check name patterns from carrier info
      for (const pattern of carrierInfo.namePatterns) {
        const pl = pattern.toLowerCase();
        if (lower.includes(pl)) {
          return preferredCarrier;
        }
      }
    }
  }
  
  return null;
}

export function findPreferredCarrier(quote: any, category: ProductCategory): PreferredCarrier | null {
  // First attempt strict deterministic preferred match; if found, skip all fuzzy paths.
  const strictPref = strictPreferredCarrierMatch(quote, category);
  if (strictPref) return strictPref;

  // Allow disabling fuzzy preferred resolution entirely (recommended) via env flag.
  if (process.env.NEXT_PUBLIC_DISABLE_FUZZY_PREFERRED === '1') {
    return null;
  }

  const carrierNameRaw = (typeof quote.carrier === 'string' ? quote.carrier : quote.carrier?.name)
    || quote.company_base?.name
    || quote.company?.name
    || quote.carrier_name
    || quote.companyName
    || quote.company
    || '';
  if (!carrierNameRaw) return null;
  const s = slugify(carrierNameRaw);
  const lookup = getPreferredLookup(category);
  if (!lookup || !lookup.size) return null;
  // Direct slug match
  const directId = lookup.get(s);
  if (directId) return { carrierId: directId, category, isActive: true, priority: (getPreferredCarriers(category).find(p=>p.carrierId===directId)?.priority) || 999 };
  // Progressive suffix trimming (drop common insurance terms) then retry
  const trimmed = s
    .replace(/-(life|insurance|ins|company|co|inc|grp|group)$/,'')
    .replace(/-(life|insurance|ins|company|co|inc|grp|group)$/,''); // second pass
  if (trimmed !== s) {
    const tId = lookup.get(trimmed);
    if (tId) return { carrierId: tId, category, isActive: true, priority: (getPreferredCarriers(category).find(p=>p.carrierId===tId)?.priority) || 999 };
  }
  // Token overlap fallback: count matches; choose highest overlap above threshold
  const tokens = s.split('-').filter(Boolean);
  const scoreMap: Record<string, number> = {};
  for (const [slugVariant, carrierId] of lookup.entries()) {
    const variantTokens = slugVariant.split('-').filter(Boolean);
    const overlap = tokens.filter(t => variantTokens.includes(t));
    if (overlap.length) {
      scoreMap[carrierId] = Math.max(scoreMap[carrierId] || 0, overlap.length / variantTokens.length);
    }
  }
  const best = Object.entries(scoreMap).sort((a,b)=> b[1]-a[1])[0];
  if (best && best[1] >= 0.6) { // 60% pattern token overlap heuristic
    const carrierId = best[0];
    return { carrierId, category, isActive: true, priority: (getPreferredCarriers(category).find(p=>p.carrierId===carrierId)?.priority) || 999 };
  }
  // RELAXED FALLBACK: broader token match ignoring generic stop words & allowing partial pattern match.
  // NOTE: This fallback is a major source of false positives; keep behind explicit fuzzy allowance
  if (process.env.NEXT_PUBLIC_DISABLE_FUZZY_PREFERRED === '1') {
    return null;
  }
  try {
    const STOP = new Set(['life','insurance','ins','company','co','inc','grp','group','health','assurance','national','america','american']);
    const rawTokens = carrierNameRaw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g,' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter((t: string) => !STOP.has(t));
    if (rawTokens.length) {
      let looseBest: { carrierId:string; score:number } | null = null;
      const preferredList = getPreferredCarriers(category);
      for (const pref of preferredList) {
        const info = getCarrierById(pref.carrierId);
        if (!info) continue;
        const variants = new Set<string>([info.displayName, info.shortName, info.name, ...info.namePatterns]);
        let bestVariantScore = 0;
        for (const v of variants) {
          if (!v) continue;
            const vtoks = v
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g,' ')
              .split(/\s+/)
              .filter(Boolean)
              .filter((t: string) => !STOP.has(t));
            if (!vtoks.length) continue;
            const inter = vtoks.filter(t => rawTokens.includes(t));
            if (inter.length) {
              const score = inter.length / Math.min(vtoks.length, rawTokens.length);
              bestVariantScore = Math.max(bestVariantScore, score);
            }
        }
        if (bestVariantScore >= 0.5) { // at least half overlap of the smaller token list
          if (!looseBest || bestVariantScore > looseBest.score || (bestVariantScore === looseBest.score && pref.priority < (getPreferredCarriers(category).find(p=>p.carrierId===looseBest!.carrierId)?.priority || 999))) {
            looseBest = { carrierId: pref.carrierId, score: bestVariantScore };
          }
        }
      }
      if (looseBest) {
        return { carrierId: looseBest.carrierId, category, isActive: true, priority: (getPreferredCarriers(category).find(p=>p.carrierId===looseBest.carrierId)?.priority) || 999 };
      }
    }
  } catch { /* ignore relaxed fallback errors */ }
  return null;
}

/**
 * Check if a quote is from a preferred carrier
 */
export function isPreferredCarrier(quote: any, category: ProductCategory): boolean {
  return !!strictPreferredCarrierMatch(quote, category);
}

/**
 * Filter quotes to only include preferred carriers
 */
export function filterPreferredCarriers(quotes: any[], category: ProductCategory): any[] {
  const filteredQuotes = quotes.filter(q => isPreferredCarrier(q, category));
  if (process.env.NODE_ENV !== 'production') {
    const unmatchedExample = quotes.find(q => !filteredQuotes.includes(q));
    // eslint-disable-next-line no-console
    console.debug('PREFERRED_FILTER_APPLIED', {
      category,
      total: quotes.length,
      preferredCount: filteredQuotes.length,
      sampleNonPreferred: unmatchedExample ? (typeof unmatchedExample.carrier === 'string' ? unmatchedExample.carrier : unmatchedExample.carrier?.name) : undefined,
    });
  }
  return filteredQuotes;
}

/**
 * Sort quotes by preferred carrier priority
 */
export function sortByPreferredCarrierPriority(quotes: any[], category: ProductCategory): any[] {
  return quotes.sort((a, b) => {
    const carrierA = strictPreferredCarrierMatch(a, category);
    const carrierB = strictPreferredCarrierMatch(b, category);
    
    // Preferred carriers first
    if (carrierA && !carrierB) return -1;
    if (!carrierA && carrierB) return 1;
    
    // Both preferred - sort by priority
    if (carrierA && carrierB) {
      if (carrierA.priority !== carrierB.priority) {
        return carrierA.priority - carrierB.priority;
      }
    }
    
    // Same priority or both non-preferred - sort by premium
    const premiumA = a.monthly_premium || (a.rate?.month ? a.rate.month / 100 : 0);
    const premiumB = b.monthly_premium || (b.rate?.month ? b.rate.month / 100 : 0);
    return premiumA - premiumB;
  });
}

/**
 * Get enhanced carrier display information for a quote
 */
export function getEnhancedCarrierInfo(quote: any, category: ProductCategory) {
  const rawFields = [
    typeof quote.carrier === 'string' ? quote.carrier : quote.carrier?.name,
    typeof quote.carrier === 'object' ? quote.carrier?.full_name : undefined,
    quote.companyName,
    quote.company,
    quote.company_base?.name,
    quote.company_base?.name_full,
    quote.parent_company_base?.name,
    quote.parent_company_base?.name_full
  ];
  const strict = strictlyMatchCarrier(rawFields);
  if (!strict) {
    // No strict match: treat carrier as unknown, don't assign another brand
    const fallback = rawFields.find(Boolean) || '';
    return {
      displayName: fallback,
      logoUrl: '/images/carrier-placeholder.svg',
      website: undefined,
      phone: undefined,
      isPreferred: false,
      priority: undefined,
      strictMatch: false
    };
  }
  // If strict match, optionally overlay preferred info only if same carrier id.
  const preferred = findPreferredCarrier(quote, category);
  const preferredInfo = preferred && preferred.carrierId === strict.id ? getCarrierById(preferred.carrierId) : undefined;
  const info = preferredInfo || strict;
  return {
    displayName: info.displayName || info.shortName || info.name,
    logoUrl: info.logoUrl || '/images/carrier-placeholder.svg',
    website: info.website,
    phone: info.phone,
    isPreferred: !!preferredInfo,
    priority: preferredInfo ? preferred?.priority : undefined,
    strictMatch: true
  };
}

// ===== BACKWARD COMPATIBILITY =====

/**
 * Legacy compatibility - getProperLogoUrl alias
 */
export { getCarrierLogoUrl as getProperLogoUrl };

// ===== PREFERRED CARRIERS =====

/**
 * Curated list of preferred carriers by product category
 * Based on agent requirements and product category specifications
 * References carrier IDs from the CARRIERS array
 */
// ===== INLINE PREFERRED INDEX BUILD =====
let PREFERRED_CARRIERS_CACHE: Record<ProductCategory, PreferredCarrier[]> | null = null;
function buildPreferredIndex(): Record<ProductCategory, PreferredCarrier[]> {
  const blank: Record<ProductCategory, PreferredCarrier[]> = {
    'medicare-supplement': [],
    'medicare-advantage': [],
    'dental': [],
    'final-expense': [],
    'hospital-indemnity': [],
    'cancer': [],
    'drug-plan': []
  };
  for (const carrier of CARRIERS) {
    if (!carrier.preferred) continue;
    for (const [cat, meta] of Object.entries(carrier.preferred) as Array<[ProductCategory, { priority: number; active?: boolean }]>) {
      if (!meta || meta.active === false) continue;
      blank[cat].push({ carrierId: carrier.id, category: cat, priority: meta.priority, isActive: true });
    }
  }
  // Sort by priority asc for deterministic order
  (Object.keys(blank) as ProductCategory[]).forEach(cat => {
    blank[cat].sort((a,b) => a.priority - b.priority);
  });
  return blank;
}

/**
 * Get preferred carriers for a specific product category
 */
export function getPreferredCarriers(category: ProductCategory): PreferredCarrier[] {
  if (!PREFERRED_CARRIERS_CACHE) {
    PREFERRED_CARRIERS_CACHE = buildPreferredIndex();
  }
  return PREFERRED_CARRIERS_CACHE[category] || [];
}

/**
 * Map UI category names to ProductCategory types for carrier system
 */
export function mapUICategoryToProductCategory(uiCategory: string): ProductCategory | null {
  const categoryMap: Record<string, ProductCategory> = {
    'medigap': 'medicare-supplement',
    'advantage': 'medicare-advantage', 
    'dental': 'dental',
    'final-expense': 'final-expense',
    'hospital-indemnity': 'hospital-indemnity',
    // Alias: UI sometimes uses short 'hospital'; normalize it.
    'hospital': 'hospital-indemnity',
    'cancer': 'cancer',
    'drug-plan': 'drug-plan'
  };
  
  return categoryMap[uiCategory] || null;
}

/**
 * Check if a UI category supports preferred carriers filtering
 */
export function categorySupportsPreferredCarriers(uiCategory: string): boolean {
  const productCategory = mapUICategoryToProductCategory(uiCategory);
  return productCategory ? getPreferredCarriers(productCategory).length > 0 : false;
}
