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
  // Medicare Supplement preferred carriers
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
    logoUrl: 'https://logo.clearbit.com/bankersfidelity.com'
  },
  {
    id: 'insurance-co-n-america',
    name: 'Insurance Company of North America',
    shortName: 'Chubb',
    displayName: 'Insurance Co. of North America',
    namePatterns: ['Insurance Co of N Amer', 'Insurance Co. of N. America', 'Insurance Co. of North America', 'Chubb'],
    phone: '215-640-1000',
    website: 'https://www.chubb.com',
    logoUrl: 'https://logo.clearbit.com/chubb.com'
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
    logoUrl: 'https://logo.clearbit.com/cigna.com'
  },
  {
    id: 'aflac',
    name: 'American Family Life Assurance Company of Columbus (AFLAC)',
    shortName: 'Aflac',
    displayName: 'Aflac',
    namePatterns: ['Aflac', 'American Family Life'],
    phone: '800-992-3522',
    website: 'https://www.aflac.com',
    logoUrl: 'https://logo.clearbit.com/aflac.com'
  },
  {
    id: 'bcbs',
    name: 'Blue Cross Blue Shield',
    shortName: 'Blue Cross Blue Shield',
    displayName: 'BCBS',
    namePatterns: ['Blue Cross', 'BCBS', 'HCSC'],
    phone: '877-774-2267',
    website: 'https://www.bcbs.com',
    logoUrl: 'https://logo.clearbit.com/bcbs.com'
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
    logoUrl: 'https://logo.clearbit.com/mutualofomaha.com'
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
      'Continental Life Ins Co Brentwood'
    ],
    phone: '800-872-3862',
    website: 'https://www.aetna.com',
    logoUrl: 'https://logo.clearbit.com/aetna.com'
  },
  {
    id: 'nassau',
    name: 'Nassau Life Insurance Company',
    shortName: 'Nassau Life',
    displayName: 'Nassau',
    namePatterns: ['Nassau', 'Nassau Life Insurance Company'],
    phone: '516-394-2000',
    website: 'https://www.nassaulife.com',
    logoUrl: 'https://logo.clearbit.com/nfg.com'
  },
  {
    id: 'humana',
    name: 'Humana Insurance Company',
    shortName: 'Humana',
    displayName: 'Humana',
    namePatterns: ['Humana', 'Humana Insurance'],
    phone: '502-580-1000',
    website: 'https://www.humana.com',
    logoUrl: 'https://logo.clearbit.com/humana.com'
  },
  {
    id: 'united-healthcare',
    name: 'UnitedHealthcare Insurance Company',
    shortName: 'UnitedHealthcare',
    displayName: 'UnitedHealthcare',
    namePatterns: ['UnitedHealthcare', 'United Healthcare', 'UnitedHealth', 'AARP Medicare Supplement', 'Golden Rule Ins Co'],
    phone: '877-832-7734',
    website: 'https://www.uhc.com',
    logoUrl: 'https://logo.clearbit.com/unitedhealthcare.com'
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
    id: 'united-national-life',
    name: 'United National Life Insurance Company of America',
    shortName: 'United National Life',
    displayName: 'United National Life',
    namePatterns: ['United National Life', 'UNL'],
    phone: '800-207-8050',
    website: 'https://www.unlinsurance.com',
    logoUrl: 'https://logo.clearbit.com/unl.com'
  },
  {
    id: 'manhattan-life',
    name: 'Manhattan Life Insurance Company',
    shortName: 'Manhattan Life',
    displayName: 'Manhattan Life',
    namePatterns: ['Manhattan Life', 'Manhattan Life Insurance'],
    phone: '800-622-9525',
    website: 'https://www.manhattanlife.com',
    logoUrl: 'https://logo.clearbit.com/manhattanlife.com'
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
    namePatterns: ['Liberty Bankers Life', 'Liberty Bankers', 'Liberty Bankers Life Ins Co'],
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
    phone: '800-879-6542',
    website: 'https://www.manhattanlife.com',
    logoUrl: 'https://logo.clearbit.com/manhattanlife.com'
  },
  {
    id: 'medico',
    name: 'Medico Insurance Company',
    shortName: 'Medico',
    displayName: 'Medico',
    namePatterns: ['Medico', 'Medico Insurance'],
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
    logoUrl: 'https://logo.clearbit.com/unlinsurance.com'
  }
];

// ===== LOOKUP FUNCTIONS =====

/**
 * Create lookup maps for efficient searches
 */
const carriersById = new Map(CARRIERS.map(c => [c.id, c]));

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
  // console.log(`🔍 findCarrierByName called with: "${carrierName}"`);
  
  const result = CARRIERS.find(carrier => 
    carrier.namePatterns.some(pattern => {
      const matches = carrierName.toLowerCase().includes(pattern.toLowerCase()) ||
                     pattern.toLowerCase().includes(carrierName.toLowerCase());
      // if (matches) {
      //   console.log(`✅ Matched pattern "${pattern}" for carrier "${carrier.displayName}"`);
      // }
      return matches;
    })
  );
  
  // console.log(`🎯 findCarrierByName result for "${carrierName}":`, result ? `${result.displayName} (${result.id})` : 'NOT FOUND');
  return result;
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
export function getCarrierDisplayName(carrierName: string, category: ProductCategory = 'medicare-supplement'): string {
  // First check if this is a preferred carrier
  const mockQuote = { carrier: { name: carrierName } };
  const preferredCarrier = findPreferredCarrier(mockQuote, category);
  
  let displayName = carrierName;
  
  if (preferredCarrier) {
    // Get the carrier info using the carrierId
    const carrierInfo = getCarrierById(preferredCarrier.carrierId);
    if (carrierInfo?.displayName) {
      displayName = carrierInfo.displayName;
    }
  } else {
    // Fall back to carrier short name
    const carrier = findCarrierByName(carrierName);
    displayName = carrier?.displayName || carrier?.shortName || carrierName;
  }
  
  // For UnitedHealthcare plans that are AARP branded, add (AARP) suffix
  if (displayName === 'UnitedHealthcare' && carrierName.includes('AARP')) {
    displayName = 'UnitedHealthcare (AARP)';
  }
  
  return displayName;
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
  const preferredCarriers = getPreferredCarriers(category);
  
  for (const preferredCarrier of preferredCarriers) {
    // Get the actual carrier info
    const carrierInfo = getCarrierById(preferredCarrier.carrierId);
    if (carrierInfo) {
      // Check name patterns from carrier info
      for (const pattern of carrierInfo.namePatterns) {
        if (carrierName.toLowerCase().includes(pattern.toLowerCase())) {
          return preferredCarrier;
        }
      }
    }
  }
  
  return null;
}

export function findPreferredCarrier(quote: any, category: ProductCategory): PreferredCarrier | null {
  // Enhanced carrier name extraction - check multiple possible fields
  // Handle both object format (quote.carrier.name) and string format (quote.carrier)
  const carrierName = (typeof quote.carrier === 'string' ? quote.carrier : quote.carrier?.name) ||
                     quote.company_base?.name || 
                     quote.company?.name ||
                     quote.carrier_name ||
                     quote.companyName ||
                     quote.company ||
                     '';
  
  // Debug logging for non-medigap categories
  if (category !== 'medicare-supplement') {
    console.log(`🔍 [${category}] findPreferredCarrier called:`, {
      category,
      carrierName,
      quoteStructure: {
        hasCarrier: !!quote.carrier,
        carrierType: typeof quote.carrier,
        hasCompanyBase: !!quote.company_base,
        hasCompany: !!quote.company,
        carrierValue: quote.carrier, // Show full carrier value (string or object)
        carrierNameValue: typeof quote.carrier === 'object' ? quote.carrier?.name : null,
        companyBaseNameValue: quote.company_base?.name,
        companyNameValue: quote.company?.name,
        carrierNameField: quote.carrier_name,
        companyNameField: quote.companyName,
        companyField: quote.company,
        allQuoteKeys: Object.keys(quote)
      }
    });
  }
  
  const preferredCarriers = getPreferredCarriers(category);
  
  if (category !== 'medicare-supplement') {
    console.log(`📋 [${category}] Preferred carriers for category:`, preferredCarriers.map(pc => pc.carrierId));
  }
  
  for (const preferredCarrier of preferredCarriers) {
    // Get the actual carrier info
    const carrierInfo = getCarrierById(preferredCarrier.carrierId);
    if (carrierInfo) {
      if (category !== 'medicare-supplement') {
        console.log(`🎯 [${category}] Testing carrier ${preferredCarrier.carrierId}:`, {
          patterns: carrierInfo.namePatterns,
          carrierName
        });
      }
      
      // Check name patterns from carrier info
      for (const pattern of carrierInfo.namePatterns) {
        const match = carrierName.toLowerCase().includes(pattern.toLowerCase());
        if (category !== 'medicare-supplement') {
          console.log(`   Pattern "${pattern}" vs "${carrierName}": ${match ? '✅ MATCH' : '❌ no match'}`);
        }
        if (match) {
          if (category !== 'medicare-supplement') {
            console.log(`🎉 [${category}] FOUND MATCH! Returning preferred carrier:`, preferredCarrier);
          }
          return preferredCarrier;
        }
      }
    } else {
      if (category !== 'medicare-supplement') {
        console.log(`❌ [${category}] No carrier info found for carrierId: ${preferredCarrier.carrierId}`);
      }
    }
  }
  
  if (category !== 'medicare-supplement') {
    console.log(`🚫 [${category}] No preferred carrier match found for "${carrierName}"`);
  }
  
  return null;
}

/**
 * Check if a quote is from a preferred carrier
 */
export function isPreferredCarrier(quote: any, category: ProductCategory): boolean {
  const preferredCarrier = findPreferredCarrier(quote, category);
  return preferredCarrier !== null;
}

/**
 * Filter quotes to only include preferred carriers
 */
export function filterPreferredCarriers(quotes: any[], category: ProductCategory): any[] {
  // Debug logging for non-medigap categories
  if (category !== 'medicare-supplement') {
    const sampleQuote = quotes[0];
    const sampleCarrierName = sampleQuote ? (
      (typeof sampleQuote.carrier === 'string' ? sampleQuote.carrier : sampleQuote.carrier?.name) ||
      sampleQuote.company_base?.name || 
      sampleQuote.company?.name ||
      sampleQuote.carrier_name ||
      sampleQuote.companyName ||
      sampleQuote.company ||
      'No name found'
    ) : 'No quotes';
    
    console.log(`🔄 [${category}] filterPreferredCarriers called:`, {
      category,
      totalQuotes: quotes.length,
      sampleQuote: sampleQuote ? {
        hasCarrier: !!sampleQuote.carrier,
        carrierType: typeof sampleQuote.carrier,
        hasCompanyBase: !!sampleQuote.company_base,
        hasCompany: !!sampleQuote.company,
        sampleCarrierName,
        allQuoteKeys: Object.keys(sampleQuote)
      } : 'No quotes'
    });
  }
  
  const filteredQuotes = quotes.filter(quote => isPreferredCarrier(quote, category));
  
  if (category !== 'medicare-supplement') {
    console.log(`✅ [${category}] filterPreferredCarriers result:`, {
      originalCount: quotes.length,
      filteredCount: filteredQuotes.length,
      matchedCarriers: filteredQuotes.map(q => 
        (typeof q.carrier === 'string' ? q.carrier : q.carrier?.name) ||
        q.company_base?.name || 
        q.company?.name ||
        q.carrier_name ||
        q.companyName ||
        q.company ||
        'Unknown'
      )
    });
  }
  
  return filteredQuotes;
}

/**
 * Sort quotes by preferred carrier priority
 */
export function sortByPreferredCarrierPriority(quotes: any[], category: ProductCategory): any[] {
  return quotes.sort((a, b) => {
    const carrierA = findPreferredCarrier(a, category);
    const carrierB = findPreferredCarrier(b, category);
    
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
  // Handle both object format (quote.carrier.name) and string format (quote.carrier)
  const carrierName = (typeof quote.carrier === 'string' ? quote.carrier : quote.carrier?.name) || 
                     quote.company_base?.name || '';
  // console.log(`🔍 getEnhancedCarrierInfo called with carrierName: "${carrierName}", category: "${category}"`);
  
  // Get basic carrier info by name pattern matching
  const carrierInfo = findCarrierByName(carrierName);
  // console.log(`📋 Basic carrier info:`, carrierInfo ? `${carrierInfo.displayName} (logoUrl: ${carrierInfo.logoUrl})` : 'NOT FOUND');
  
  // Get preferred carrier info
  const preferredCarrier = findPreferredCarrier(quote, category);
  // console.log(`⭐ Preferred carrier:`, preferredCarrier ? `${preferredCarrier.carrierId} (priority: ${preferredCarrier.priority})` : 'NOT PREFERRED');
  
  if (preferredCarrier) {
    // Get the full carrier info for the preferred carrier
    const preferredCarrierInfo = getCarrierById(preferredCarrier.carrierId);
    if (preferredCarrierInfo) {
      // console.log(`✅ Using preferred carrier info for "${carrierName}": ${preferredCarrierInfo.displayName} (logoUrl: ${preferredCarrierInfo.logoUrl})`);
      return {
        displayName: preferredCarrierInfo.displayName,
        logoUrl: preferredCarrierInfo.logoUrl || '/images/carrier-placeholder.svg',
        website: preferredCarrierInfo.website,
        phone: preferredCarrierInfo.phone,
        isPreferred: true,
        priority: preferredCarrier.priority
      };
    }
  }
  
  // Fallback to basic carrier info
  // console.log(`⬇️ Using fallback carrier info for "${carrierName}": ${carrierInfo?.displayName || 'Unknown'} (logoUrl: ${carrierInfo?.logoUrl || '/images/carrier-placeholder.svg'})`);
  return {
    displayName: carrierInfo?.displayName || carrierInfo?.shortName || carrierName,
    logoUrl: carrierInfo?.logoUrl || '/images/carrier-placeholder.svg',
    website: carrierInfo?.website,
    phone: carrierInfo?.phone,
    isPreferred: false,
    priority: undefined
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
export const PREFERRED_CARRIERS: Record<ProductCategory, PreferredCarrier[]> = {
  'medicare-supplement': [
    { carrierId: 'bankers-fidelity', category: 'medicare-supplement', priority: 1, isActive: true },
    { carrierId: 'insurance-co-n-america', category: 'medicare-supplement', priority: 2, isActive: true },
    { carrierId: 'cigna', category: 'medicare-supplement', priority: 3, isActive: true },
    { carrierId: 'aflac', category: 'medicare-supplement', priority: 4, isActive: true },
    { carrierId: 'bcbs', category: 'medicare-supplement', priority: 5, isActive: true },
    { carrierId: 'mutual-of-omaha', category: 'medicare-supplement', priority: 6, isActive: true },
    { carrierId: 'aetna', category: 'medicare-supplement', priority: 7, isActive: true },
    { carrierId: 'nassau', category: 'medicare-supplement', priority: 8, isActive: true },
    { carrierId: 'humana', category: 'medicare-supplement', priority: 9, isActive: true }
  ],
  'medicare-advantage': [
    { carrierId: 'humana', category: 'medicare-advantage', priority: 1, isActive: true },
    { carrierId: 'cigna', category: 'medicare-advantage', priority: 2, isActive: true },
    { carrierId: 'united-healthcare', category: 'medicare-advantage', priority: 3, isActive: true },
    { carrierId: 'aetna', category: 'medicare-advantage', priority: 4, isActive: true }
  ],
  'dental': [
    { carrierId: 'unl', category: 'dental', priority: 1, isActive: true },
    { carrierId: 'cigna', category: 'dental', priority: 2, isActive: true },
    { carrierId: 'mutual-of-omaha', category: 'dental', priority: 3, isActive: true },
    { carrierId: 'aetna', category: 'dental', priority: 4, isActive: true },
    { carrierId: 'manhattan-life', category: 'dental', priority: 5, isActive: true }
  ],
  'final-expense': [
    { carrierId: 'bankers-fidelity', category: 'final-expense', priority: 1, isActive: true },
    { carrierId: 'cigna', category: 'final-expense', priority: 2, isActive: true },
    { carrierId: 'mutual-of-omaha', category: 'final-expense', priority: 3, isActive: true },
    { carrierId: 'aetna', category: 'final-expense', priority: 4, isActive: true }
  ],
  'hospital-indemnity': [
    { carrierId: 'bankers-fidelity', category: 'hospital-indemnity', priority: 1, isActive: true },
    { carrierId: 'unl', category: 'hospital-indemnity', priority: 2, isActive: true },
    { carrierId: 'manhattan-life', category: 'hospital-indemnity', priority: 3, isActive: true },
    { carrierId: 'aetna', category: 'hospital-indemnity', priority: 4, isActive: true }
  ],
  'cancer': [
    { carrierId: 'bankers-fidelity', category: 'cancer', priority: 1, isActive: true },
  ],
  'drug-plan': []
};

/**
 * Get preferred carriers for a specific product category
 */
export function getPreferredCarriers(category: ProductCategory): PreferredCarrier[] {
  return PREFERRED_CARRIERS[category] || [];
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
