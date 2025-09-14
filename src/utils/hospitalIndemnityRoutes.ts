/**
 * Hospital Indemnity Plan Routing Utilities
 * Based on all-name-fields-reference.md analysis
 * Handles routing and configuration for different plan structures
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

// Plan structure types based on analysis
export type PlanStructureType = 
  | 'standard'           // Plan name contains benefit days (e.g., "5 Day Benefits")
  | 'series-based'       // Multiple series with different types (e.g., "Protection Series - Flex Daily")
  | 'quantifier-based'   // Benefits defined by rider quantifiers (e.g., "3 Day", "Occurrence")
  | 'hybrid'             // Mix of base plans and riders
  | 'admission-based';   // Hospital admission benefits

// Benefit structure types
export type BenefitStructureType =
  | 'daily'              // Daily benefits after waiting period
  | 'lump-sum'           // One-time payment per occurrence
  | 'admission'          // Per admission benefits
  | 'hybrid';            // Multiple benefit types

// Company-specific routing configuration
export interface CompanyRouteConfig {
  companyName: string;
  planStructureType: PlanStructureType;
  benefitStructureType: BenefitStructureType;
  requiresPlanOption: boolean;
  availablePlanOptions?: string[];
  primaryBenefitSources: string[];
  quantifierPatterns: string[];
  dayExtractionMethod: 'plan-name' | 'quantifier' | 'base-plan';
}

/**
 * Base plan name patterns from the reference
 */
export const BASE_PLAN_PATTERNS = [
  'Hospital Confinement Benefit',
  'Inpatient Hospital Confinement Benefits', 
  'Hospital Admission Benefit'
] as const;

/**
 * Primary benefit rider patterns (top frequency from reference)
 */
export const PRIMARY_BENEFIT_RIDERS = [
  'Hospital Confinement Benefits',
  'Hospital Confinement',
  'Lump Sum Hospital Confinement Benefits',
  'Daily Confinement Sickness',
  'Daily Confinement Injury',
  'Hospital Admission'
] as const;

/**
 * Lump sum benefit patterns
 */
export const LUMP_SUM_PATTERNS = [
  'Lump Sum Hospital Confinement',
  'Lump Sum Hospital Benefit',
  'Lump Sum Cancer',
  'Terminal Illness'
] as const;

/**
 * Continental Life specific configuration
 */
export const CONTINENTAL_LIFE_CONFIG: CompanyRouteConfig = {
  companyName: 'Continental Life Ins Co Brentwood',
  planStructureType: 'series-based',
  benefitStructureType: 'hybrid',
  requiresPlanOption: true,
  availablePlanOptions: [
    'Protection Series - Flex Daily',
    'Protection Series - Flex Lump Sum'
  ],
  primaryBenefitSources: [
    'Hospital Confinement Benefits',
    'Lump Sum Hospital Confinement Benefits'
  ],
  quantifierPatterns: ['Day', 'Occurrence'],
  dayExtractionMethod: 'quantifier'
};

/**
 * Detect company routing configuration
 */
export const detectCompanyRouteConfig = (companyName: string, quotes: OptimizedHospitalIndemnityQuote[]): CompanyRouteConfig => {
  // Continental Life specific handling
  if (companyName.includes('Continental Life')) {
    return CONTINENTAL_LIFE_CONFIG;
  }

  // Get sample quote for analysis
  const sampleQuote = quotes[0];
  if (!sampleQuote) {
    throw new Error('No quotes available for analysis');
  }

  // Detect if plan names contain day patterns
  const hasStandardDayPattern = quotes.some(q => 
    /\d+\s+(Day|Benefit)\s+(Days?|Benefits?)/.test(q.planName)
  );

  if (hasStandardDayPattern) {
    return {
      companyName,
      planStructureType: 'standard',
      benefitStructureType: 'daily',
      requiresPlanOption: false,
      primaryBenefitSources: ['Hospital Confinement Benefit'],
      quantifierPatterns: [],
      dayExtractionMethod: 'plan-name'
    };
  }

  // Detect admission-based plans
  const hasAdmissionPattern = quotes.some(q => 
    q.planName.toLowerCase().includes('admission') ||
    (q.basePlans && q.basePlans.some(bp => bp.name.includes('Admission')))
  );

  if (hasAdmissionPattern) {
    return {
      companyName,
      planStructureType: 'admission-based',
      benefitStructureType: 'admission',
      requiresPlanOption: false,
      primaryBenefitSources: ['Hospital Admission Benefit'],
      quantifierPatterns: [],
      dayExtractionMethod: 'base-plan'
    };
  }

  // Default to quantifier-based for companies with rider structures
  return {
    companyName,
    planStructureType: 'quantifier-based',
    benefitStructureType: 'daily',
    requiresPlanOption: false,
    primaryBenefitSources: [
      'Hospital Confinement Benefits',
      'Hospital Confinement'
    ],
    quantifierPatterns: ['Day'],
    dayExtractionMethod: 'quantifier'
  };
};

/**
 * Get available plan options for a company
 */
export const getAvailablePlanOptions = (companyName: string, quotes: OptimizedHospitalIndemnityQuote[]): string[] => {
  const config = detectCompanyRouteConfig(companyName, quotes);
  
  if (config.requiresPlanOption && config.availablePlanOptions) {
    // Return pre-configured options (e.g., Continental Life)
    return config.availablePlanOptions.filter(option => 
      quotes.some(q => q.planName === option)
    );
  }

  // For other companies, check if they have multiple distinct plan names
  const uniquePlanNames = [...new Set(quotes.map(q => q.planName))];
  
  // If there are multiple distinct plan names, require plan option selection
  if (uniquePlanNames.length > 1) {
    return uniquePlanNames.sort();
  }

  return [];
};

/**
 * Extract benefit days based on company configuration
 * Returns null for lump sum plans that don't have daily waiting periods
 */
export const extractBenefitDaysForCompany = (
  quote: OptimizedHospitalIndemnityQuote, 
  config: CompanyRouteConfig
): number | null => {
  // First check if this is a lump sum plan that shouldn't have benefit days
  if (quote.planName.toLowerCase().includes('lump sum')) {
    return null; // Lump sum plans don't have daily waiting periods
  }

  switch (config.dayExtractionMethod) {
    case 'plan-name':
      const dayMatch = quote.planName.match(/(\d+)\s+(Day|Benefit)/i);
      return dayMatch ? parseInt(dayMatch[1]) : null;

    case 'quantifier':
      // Look for quantifier patterns in primary benefit riders
      if (quote.riders) {
        for (const rider of quote.riders) {
          // Skip lump sum riders for day extraction
          if (rider.name?.toLowerCase().includes('lump sum')) {
            continue;
          }
          
          if (config.primaryBenefitSources.some(source => 
            rider.name?.toLowerCase().includes(source.toLowerCase())
          )) {
            for (const option of rider.benefitOptions || []) {
              if (option.quantifier) {
                // Only extract days from day-based quantifiers, not "Occurrence"
                const quantifierMatch = option.quantifier.match(/(\d+)\s*day/i);
                if (quantifierMatch) {
                  return parseInt(quantifierMatch[1]);
                }
              }
            }
          }
        }
      }
      return null;

    case 'base-plan':
      // Look in base plans for day information
      if (quote.basePlans) {
        for (const basePlan of quote.basePlans) {
          const dayMatch = basePlan.name.match(/(\d+)\s+(Day|Benefit)/i);
          if (dayMatch) {
            return parseInt(dayMatch[1]);
          }
        }
      }
      return null;

    default:
      return null;
  }
};

/**
 * Get primary benefit source based on company configuration
 */
export const getPrimaryBenefitSourceForCompany = (
  quote: OptimizedHospitalIndemnityQuote,
  config: CompanyRouteConfig
): { source: 'base-plan' | 'rider'; name: string; benefitOptions: any[] } | null => {
  
  // Check base plans first
  if (quote.basePlans) {
    for (const basePlan of quote.basePlans) {
      if (config.primaryBenefitSources.some(source => 
        basePlan.name.toLowerCase().includes(source.toLowerCase())
      )) {
        return {
          source: 'base-plan',
          name: basePlan.name,
          benefitOptions: basePlan.benefitOptions || []
        };
      }
    }
  }

  // Check riders
  if (quote.riders) {
    for (const rider of quote.riders) {
      if (config.primaryBenefitSources.some(source => 
        rider.name?.toLowerCase().includes(source.toLowerCase())
      )) {
        return {
          source: 'rider',
          name: rider.name,
          benefitOptions: rider.benefitOptions || []
        };
      }
    }
  }

  return null;
};

/**
 * Determine if a benefit is daily vs lump sum based on quantifier
 */
export const determineBenefitType = (quantifier?: string): 'daily' | 'lump-sum' | 'unknown' => {
  if (!quantifier) return 'unknown';
  
  const lowerQuantifier = quantifier.toLowerCase();
  
  if (lowerQuantifier.includes('day')) return 'daily';
  if (lowerQuantifier.includes('occurrence')) return 'lump-sum';
  if (lowerQuantifier.includes('visit')) return 'lump-sum';
  if (lowerQuantifier.includes('admission')) return 'lump-sum';
  
  return 'unknown';
};

/**
 * Filter quotes by benefit type (daily vs lump sum)
 */
export const filterQuotesByBenefitType = (
  quotes: OptimizedHospitalIndemnityQuote[],
  benefitType: 'daily' | 'lump-sum',
  config: CompanyRouteConfig
): OptimizedHospitalIndemnityQuote[] => {
  return quotes.filter(quote => {
    const primarySource = getPrimaryBenefitSourceForCompany(quote, config);
    if (!primarySource) return false;

    // Check if any benefit option matches the desired type
    return primarySource.benefitOptions.some(option => 
      determineBenefitType(option.quantifier) === benefitType
    );
  });
};

/**
 * Get routing summary for debugging
 */
export const getRoutingSummary = (companyName: string, quotes: OptimizedHospitalIndemnityQuote[]) => {
  const config = detectCompanyRouteConfig(companyName, quotes);
  const planOptions = getAvailablePlanOptions(companyName, quotes);
  
  return {
    companyName,
    config,
    planOptions,
    totalQuotes: quotes.length,
    sampleQuote: quotes[0]?.planName || 'No quotes available'
  };
};