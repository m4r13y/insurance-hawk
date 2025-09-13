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
    namePatterns: ['Bankers Fidelity', 'Atlantic Capital Life Assur Co', 'Atlantic Capital Life Assurance Company'],
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
    namePatterns: ['Cigna', 'Cigna Ins Co', 'Healthspring Insurance Company'],
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
    namePatterns: ['Mutual of Omaha', 'United of Omaha'],
    phone: '402-342-7600',
    website: 'https://www.mutualofomaha.com',
    logoUrl: 'https://logo.clearbit.com/mutualofomaha.com'
  },
  {
    id: 'aetna',
    name: 'Aetna Health Insurance Company',
    shortName: 'Aetna',
    displayName: 'Aetna',
    namePatterns: ['Aetna', 'Continental Life Insurance Company', 'Continental Life Ins Co'],
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
    namePatterns: ['UnitedHealthcare', 'United Healthcare', 'UnitedHealth', 'AARP Medicare Supplement'],
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
  const carrierName = quote.carrier?.name || quote.company_base?.name || '';
  
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
  return quotes.filter(quote => isPreferredCarrier(quote, category));
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
  const carrierName = quote.carrier?.name || quote.company_base?.name || '';
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
    { carrierId: 'united-national-life', category: 'dental', priority: 1, isActive: true },
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
    { carrierId: 'united-national-life', category: 'hospital-indemnity', priority: 2, isActive: true },
    { carrierId: 'manhattan-life', category: 'hospital-indemnity', priority: 3, isActive: true },
    { carrierId: 'aetna', category: 'hospital-indemnity', priority: 4, isActive: true }
  ],
  'cancer': [],
  'drug-plan': []
};

/**
 * Get preferred carriers for a specific product category
 */
export function getPreferredCarriers(category: ProductCategory): PreferredCarrier[] {
  return PREFERRED_CARRIERS[category] || [];
}
