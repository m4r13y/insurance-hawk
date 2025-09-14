/**
 * Simplified Hospital Indemnity Benefits Handler
 * Treats base plans and riders uniformly as "benefits"
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

export interface UnifiedBenefit {
  name: string;
  included: boolean;
  isMainBenefit: boolean; // true for base plan, false for riders
  benefitOptions: Array<{
    amount: string;
    rate: number;
    quantifier?: string;
  }>;
  notes: string | null;
  originalIndex: number; // for tracking
  type: 'main' | 'rider'; // for easier identification
}

/**
 * Get all benefits (base plans + riders) as a unified list
 */
export const getAllBenefits = (quote: OptimizedHospitalIndemnityQuote): UnifiedBenefit[] => {
  const benefits: UnifiedBenefit[] = [];

  // Add base plans as main benefits
  if (quote.basePlans) {
    quote.basePlans.forEach((basePlan, index) => {
      benefits.push({
        name: basePlan.name,
        included: basePlan.included,
        isMainBenefit: true,
        benefitOptions: basePlan.benefitOptions || [],
        notes: basePlan.notes,
        originalIndex: index,
        type: 'main'
      });
    });
  }

  // Add riders as additional benefits
  if (quote.riders) {
    quote.riders.forEach((rider, index) => {
      benefits.push({
        name: rider.name,
        included: rider.included,
        isMainBenefit: false,
        benefitOptions: rider.benefitOptions || [],
        notes: rider.notes,
        originalIndex: index,
        type: 'rider'
      });
    });
  }

  return benefits;
};

/**
 * Get the main benefit (base plan)
 */
export const getMainBenefit = (quote: OptimizedHospitalIndemnityQuote): UnifiedBenefit | null => {
  const allBenefits = getAllBenefits(quote);
  return allBenefits.find(b => b.isMainBenefit) || null;
};

/**
 * Get additional riders (non-main benefits)
 */
export const getAdditionalRiders = (quote: OptimizedHospitalIndemnityQuote): UnifiedBenefit[] => {
  const allBenefits = getAllBenefits(quote);
  return allBenefits.filter(b => !b.isMainBenefit);
};

/**
 * Get available benefit amounts from main benefit (handles both daily and admission benefits)
 */
export const getAvailableDailyBenefits = (quote: OptimizedHospitalIndemnityQuote): number[] => {
  const mainBenefit = getMainBenefit(quote);
  if (!mainBenefit) return [];

  const amounts = new Set<number>();
  mainBenefit.benefitOptions.forEach(option => {
    const amount = parseInt(option.amount);
    if (!isNaN(amount) && amount > 0) {
      amounts.add(amount);
    }
  });

  return Array.from(amounts).sort((a, b) => a - b);
};

/**
 * Get the benefit type (daily or admission) from main benefit
 */
export const getMainBenefitType = (quote: OptimizedHospitalIndemnityQuote): 'daily' | 'admission' | 'unknown' => {
  const mainBenefit = getMainBenefit(quote);
  if (!mainBenefit) return 'unknown';

  // Check if benefit name contains "admission"
  if (mainBenefit.name.toLowerCase().includes('admission')) {
    return 'admission';
  }

  // Check quantifiers in benefit options
  const hasAdmissionQuantifier = mainBenefit.benefitOptions.some(option => 
    option.quantifier?.toLowerCase().includes('admission')
  );
  
  if (hasAdmissionQuantifier) {
    return 'admission';
  }

  // Default to daily
  return 'daily';
};

/**
 * Determine if main benefit needs a selection dropdown or is auto-included
 */
export const shouldShowMainBenefitSelection = (quote: OptimizedHospitalIndemnityQuote): boolean => {
  const mainBenefit = getMainBenefit(quote);
  if (!mainBenefit) return false;

  const availableOptions = getAvailableDailyBenefits(quote);
  
  // If there are multiple options, always show dropdown for selection
  if (availableOptions.length > 1) {
    return true;
  }

  // If there's only one option, check if it's duplicated in included benefits
  if (availableOptions.length === 1) {
    const benefitType = getMainBenefitType(quote);
    
    // For admission type benefits, check for matching included benefits
    if (benefitType === 'admission') {
      const includedBenefits = getIncludedBenefits(quote);
      const mainBenefitAmount = availableOptions[0];
      
      // Check if there's an included benefit that matches the main benefit
      const hasMatchingIncludedBenefit = includedBenefits.some(benefit => {
        const benefitNameMatches = (
          benefit.name.toLowerCase().includes('admission') ||
          benefit.name.toLowerCase().includes(mainBenefit.name.toLowerCase().replace('benefit', '').trim())
        );
        
        const benefitAmountMatches = benefit.benefitOptions.some(option => 
          parseInt(option.amount.trim()) === mainBenefitAmount
        );
        
        return benefitNameMatches && benefitAmountMatches;
      });
      
      if (hasMatchingIncludedBenefit) {
        return false; // Don't show dropdown, it's redundant with included benefits
      }
    }
    
    // For daily benefits or any single-option benefit that's "Required", hide the dropdown
    if (mainBenefit.notes && mainBenefit.notes.toLowerCase().includes('required')) {
      return false; // Don't show dropdown for required single-option benefits
    }
  }

  // Default: show selection for other cases
  return true;
};

/**
 * Get the premium rate for a specific daily benefit amount from main benefit
 */
export const getPremiumForDailyBenefit = (
  quote: OptimizedHospitalIndemnityQuote, 
  dailyBenefit: number
): number => {
  const mainBenefit = getMainBenefit(quote);
  if (!mainBenefit) return 0;

  const matchingOption = mainBenefit.benefitOptions.find(option => {
    const amount = parseInt(option.amount);
    return amount === dailyBenefit;
  });

  return matchingOption?.rate || 0;
};

/**
 * Get available rider options for selection (optional riders with cost)
 */
export const getAvailableRiderOptions = (quote: OptimizedHospitalIndemnityQuote): UnifiedBenefit[] => {
  const additionalRiders = getAdditionalRiders(quote);
  
  // Only show riders that have additional cost (rate > 0) and are not included
  return additionalRiders.filter(rider => 
    !rider.included && rider.benefitOptions.some(option => option.rate > 0)
  );
};

/**
 * Get included benefits for informational display
 */
export const getIncludedBenefits = (quote: OptimizedHospitalIndemnityQuote): UnifiedBenefit[] => {
  const includedBenefits: UnifiedBenefit[] = [];
  
  // Check if main benefit is required and should be shown as included
  const mainBenefit = getMainBenefit(quote);
  if (mainBenefit) {
    const availableOptions = getAvailableDailyBenefits(quote);
    const isRequiredSingleOption = availableOptions.length === 1 && 
                                   mainBenefit.notes && 
                                   mainBenefit.notes.toLowerCase().includes('required');
    
    if (isRequiredSingleOption) {
      includedBenefits.push(mainBenefit);
    }
  }
  
  // Add riders that are included (typically rate = 0)
  const additionalRiders = getAdditionalRiders(quote);
  const includedRiders = additionalRiders.filter(rider => rider.included);
  includedBenefits.push(...includedRiders);
  
  return includedBenefits;
};

/**
 * Check if quote has valid benefit structure
 */
export const hasValidBenefitStructure = (quote: OptimizedHospitalIndemnityQuote): boolean => {
  const mainBenefit = getMainBenefit(quote);
  return mainBenefit !== null && mainBenefit.benefitOptions.length > 0;
};

/**
 * Get total premium including selected riders
 */
export const calculateTotalPremium = (
  quote: OptimizedHospitalIndemnityQuote,
  selectedDailyBenefit: number,
  selectedRiderOptions: { riderIndex: number; optionIndex: number }[] = []
): number => {
  let total = getPremiumForDailyBenefit(quote, selectedDailyBenefit);

  const additionalRiders = getAdditionalRiders(quote);
  selectedRiderOptions.forEach(({ riderIndex, optionIndex }) => {
    const rider = additionalRiders[riderIndex];
    if (rider && rider.benefitOptions[optionIndex]) {
      total += rider.benefitOptions[optionIndex].rate;
    }
  });

  return total;
};