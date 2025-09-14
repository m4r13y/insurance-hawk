/**
 * Hospital Indemnity Base Plan Detection and Management Utilities
 * 
 * Based on analysis of hospital-indemnity-raw-api-response.md:
 * - 3 base plan types identified across 109 quotes
 * - Some benefits appear as both riders and base plans depending on carrier
 * - Need to handle multiple base plan structures for accurate plan building
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

export type BasePlanType = 
  | 'hospital-confinement'      // "Hospital Confinement Benefit" - 27 occurrences
  | 'inpatient-confinement'     // "Inpatient Hospital Confinement Benefits" - 7 occurrences
  | 'hospital-admission'        // "Hospital Admission Benefit" - 5 occurrences
  | 'hybrid-rider-base'         // Cases where primary benefit is in riders
  | 'unknown';

export interface BasePlanInfo {
  type: BasePlanType;
  name: string;
  benefitOptions: Array<{
    amount: string;
    rate: number;
    quantifier?: string;
  }>;
  isIncluded: boolean;
  notes?: string;
  // For hybrid cases where primary benefit is in riders
  alternativeRiderBenefit?: {
    riderName: string;
    riderIndex: number;
  };
}

export interface PrimaryBenefitSource {
  source: 'base-plan' | 'rider';
  planInfo?: BasePlanInfo;
  riderInfo?: {
    name: string;
    index: number;
    benefitOptions: Array<{
      amount: string;
      rate: number;
      quantifier?: string;
    }>;
  };
}

/**
 * Detect the type of base plan structure for a quote
 */
export const detectBasePlanType = (quote: OptimizedHospitalIndemnityQuote): BasePlanType => {
  // Check if quote has basePlans
  if (!quote.basePlans || quote.basePlans.length === 0) {
    return 'hybrid-rider-base';
  }

  const basePlan = quote.basePlans[0];
  const planName = basePlan.name?.toLowerCase().trim();

  if (!planName) {
    return 'unknown';
  }

  // Hospital Confinement Benefit (most common - 27 occurrences)
  if (planName.includes('hospital confinement benefit') && 
      !planName.includes('inpatient')) {
    return 'hospital-confinement';
  }

  // Inpatient Hospital Confinement Benefits (7 occurrences)
  if (planName.includes('inpatient hospital confinement')) {
    return 'inpatient-confinement';
  }

  // Hospital Admission Benefit (5 occurrences)
  if (planName.includes('hospital admission benefit')) {
    return 'hospital-admission';
  }

  // Check for other variations
  if (planName.includes('hospital confinement') || planName.includes('confinement benefit')) {
    return 'hospital-confinement';
  }

  if (planName.includes('hospital admission')) {
    return 'hospital-admission';
  }

  return 'unknown';
};

/**
 * Get the primary benefit source for a quote (base plan or rider)
 */
export const getPrimaryBenefitSource = (quote: OptimizedHospitalIndemnityQuote): PrimaryBenefitSource => {
  const basePlanType = detectBasePlanType(quote);
  
  // If we have a recognized base plan, use it
  if (basePlanType !== 'hybrid-rider-base' && basePlanType !== 'unknown' && quote.basePlans?.[0]) {
    const basePlan = quote.basePlans[0];
    return {
      source: 'base-plan',
      planInfo: {
        type: basePlanType,
        name: basePlan.name,
        benefitOptions: basePlan.benefitOptions || [],
        isIncluded: basePlan.included || false,
        notes: basePlan.notes || undefined
      }
    };
  }

  // Look for primary benefit in riders
  const primaryRider = findPrimaryBenefitRider(quote);
  if (primaryRider) {
    return {
      source: 'rider',
      riderInfo: primaryRider
    };
  }

  // Fallback to first base plan if exists
  if (quote.basePlans?.[0]) {
    const basePlan = quote.basePlans[0];
    return {
      source: 'base-plan',
      planInfo: {
        type: 'unknown',
        name: basePlan.name,
        benefitOptions: basePlan.benefitOptions || [],
        isIncluded: basePlan.included || false,
        notes: basePlan.notes || undefined
      }
    };
  }

  // No primary benefit found
  return {
    source: 'base-plan',
    planInfo: {
      type: 'unknown',
      name: 'Unknown',
      benefitOptions: [],
      isIncluded: false
    }
  };
};

/**
 * Find the primary benefit rider when base plan is not the main benefit
 */
const findPrimaryBenefitRider = (quote: OptimizedHospitalIndemnityQuote) => {
  if (!quote.riders) return null;

  // Priority order for primary benefit riders based on analysis
  const primaryBenefitNames = [
    'hospital confinement benefits',
    'hospital confinement',
    'hospital admission',
    'lump sum hospital benefit',
    'lump sum hospital confinement',
    'daily confinement',
    'inpatient hospital confinement'
  ];

  for (const targetName of primaryBenefitNames) {
    const riderIndex = quote.riders.findIndex(rider => 
      rider.name?.toLowerCase().includes(targetName)
    );
    
    if (riderIndex !== -1) {
      const rider = quote.riders[riderIndex];
      return {
        name: rider.name,
        index: riderIndex,
        benefitOptions: rider.benefitOptions || []
      };
    }
  }

  return null;
};

/**
 * Get all available daily benefit amounts for a quote
 */
export const getAvailableDailyBenefits = (quote: OptimizedHospitalIndemnityQuote): number[] => {
  const primarySource = getPrimaryBenefitSource(quote);
  let benefitOptions: Array<{ amount: string; rate: number; quantifier?: string }> = [];

  if (primarySource.source === 'base-plan' && primarySource.planInfo) {
    benefitOptions = primarySource.planInfo.benefitOptions;
  } else if (primarySource.source === 'rider' && primarySource.riderInfo) {
    benefitOptions = primarySource.riderInfo.benefitOptions;
  }

  const amounts = new Set<number>();
  benefitOptions.forEach(option => {
    const amount = parseInt(option.amount);
    if (!isNaN(amount) && amount > 0) {
      amounts.add(amount);
    }
  });

  return Array.from(amounts).sort((a, b) => a - b);
};

/**
 * Get the premium rate for a specific daily benefit amount
 */
export const getPremiumForDailyBenefit = (
  quote: OptimizedHospitalIndemnityQuote, 
  dailyBenefit: number
): number => {
  const primarySource = getPrimaryBenefitSource(quote);
  let benefitOptions: Array<{ amount: string; rate: number; quantifier?: string }> = [];

  if (primarySource.source === 'base-plan' && primarySource.planInfo) {
    benefitOptions = primarySource.planInfo.benefitOptions;
  } else if (primarySource.source === 'rider' && primarySource.riderInfo) {
    benefitOptions = primarySource.riderInfo.benefitOptions;
  }

  const matchingOption = benefitOptions.find(option => 
    parseInt(option.amount) === dailyBenefit
  );

  return matchingOption?.rate || 0;
};

/**
 * Check if a quote has a specific base plan type
 */
export const hasBasePlanType = (quote: OptimizedHospitalIndemnityQuote, type: BasePlanType): boolean => {
  return detectBasePlanType(quote) === type;
};

/**
 * Get a user-friendly description of the base plan type
 */
export const getBasePlanTypeDescription = (type: BasePlanType): string => {
  switch (type) {
    case 'hospital-confinement':
      return 'Hospital Confinement Benefit';
    case 'inpatient-confinement':
      return 'Inpatient Hospital Confinement Benefits';
    case 'hospital-admission':
      return 'Hospital Admission Benefit';
    case 'hybrid-rider-base':
      return 'Primary Benefit in Riders';
    case 'unknown':
      return 'Unknown Benefit Structure';
    default:
      return 'Unknown';
  }
};

/**
 * Validate that a quote has usable benefit options
 */
export const hasValidBenefitOptions = (quote: OptimizedHospitalIndemnityQuote): boolean => {
  const availableBenefits = getAvailableDailyBenefits(quote);
  return availableBenefits.length > 0;
};

/**
 * Get comprehensive base plan analysis for debugging
 */
export const analyzeQuoteStructure = (quote: OptimizedHospitalIndemnityQuote) => {
  const basePlanType = detectBasePlanType(quote);
  const primarySource = getPrimaryBenefitSource(quote);
  const availableBenefits = getAvailableDailyBenefits(quote);
  
  return {
    planName: quote.planName,
    companyName: quote.companyName,
    basePlanType,
    basePlanTypeDescription: getBasePlanTypeDescription(basePlanType),
    primarySource,
    availableBenefits,
    hasValidBenefits: hasValidBenefitOptions(quote),
    basePlansCount: quote.basePlans?.length || 0,
    ridersCount: quote.riders?.length || 0,
    basePlanNames: quote.basePlans?.map(bp => bp.name) || [],
    riderNames: quote.riders?.map(r => r.name) || []
  };
};