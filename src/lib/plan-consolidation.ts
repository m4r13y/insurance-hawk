/**
 * Plan Consolidation Utilities
 * 
 * This module provides functions to consolidate multiple quote variations 
 * (different rating classes, discounts, view types) into a single plan
 * with multiple options/factors.
 */

import { getCarrierDisplayName, getCarrierLogoUrl } from './carrier-system';

export interface PlanOption {
  id: string;
  name: string;
  type: 'rating_class' | 'discount' | 'household_discount' | 'standard';
  description: string;
  rate: {
    annual: number;
    month: number;
    quarter: number;
    semi_annual: number;
  };
  discounts: any[];
  rating_class: string;
  view_type: string[];
  savings?: number; // compared to base rate
  savingsPercent?: number;
  isRecommended?: boolean;
  originalQuote: any; // reference to original quote data
}

export interface RatingOption {
  id: string;
  name: string;
  ratingClass: string;
  description: string;
  rate: {
    annual: number;
    month: number;
    quarter: number;
    semi_annual: number;
  };
  isRecommended?: boolean;
  originalQuote: any;
}

export interface DiscountOption {
  id: string;
  name: string;
  type: 'household_discount' | 'multi_policy' | 'other';
  description: string;
  discountPercent: number;
  applicableToRating?: string; // which rating class this applies to
  savings: number;
  savingsPercent: number;
  originalQuote: any;
}

export interface ConsolidatedPlan {
  id: string;
  plan: string; // Plan letter (G, N, F, etc.)
  carrier: {
    name: string;
    displayName: string;
    logoUrl: string;
    originalName: string;
  };
  baseRate: {
    annual: number;
    month: number;
    quarter: number;
    semi_annual: number;
  };
  options: PlanOption[];
  ratingOptions: RatingOption[];
  discountOptions: DiscountOption[];
  recommendedRatingId?: string;
  recommendedDiscountId?: string;
  recommendedOptionId: string;
  company_base: any;
  effective_date: string;
  expires_date: string;
  rate_type: string;
  gender: string;
  age: number;
  tobacco: boolean;
  location_base: any;
}

/**
 * Determine the base plan identifier (carrier + plan letter)
 */
function getBasePlanId(quote: any): string {
  const carrierName = quote.carrier?.name || quote.company_base?.name || 'Unknown';
  const plan = quote.plan || 'Unknown';
  
  // For UnitedHealthcare, create separate plans based on rating class and underwriting type
  if (carrierName.includes('UnitedHealthcare') || carrierName.includes('AARP')) {
    const ratingClass = quote.rating_class || 'Standard';
    const selectUnderwriting = quote.select ? 'Select' : 'Standard';
    
    // Extract base rating class (remove /Household suffix for grouping)
    const baseRatingClass = ratingClass.replace('/Household', '').replace('/Multi-Insured', '').replace('/Multi-Person', '');
    
    return `${carrierName}-${plan}-${baseRatingClass}-${selectUnderwriting}`;
  }
  
  return `${carrierName}-${plan}`;
}

/**
 * Determine if a quote is a standard/base version (no special discounts or rating classes)
 */
function isStandardQuote(quote: any): boolean {
  const hasNoDiscounts = !quote.discounts || quote.discounts.length === 0;
  const hasNoViewType = !quote.view_type || quote.view_type.length === 0 || 
                        (quote.view_type.length === 1 && quote.view_type[0] === '');
  const ratingClass = quote.rating_class || '';
  const hasStandardRatingClass = !ratingClass || 
                                 ratingClass === '' || 
                                 ratingClass.toLowerCase() === 'standard' ||
                                 ratingClass.toLowerCase() === 'standard i' ||
                                 ratingClass.toLowerCase() === 'standard ii';
  
  return hasNoDiscounts && hasNoViewType && hasStandardRatingClass;
}

/**
 * Extract the monthly rate from a quote
 */
function getRateFromQuote(quote: any): number {
  if (quote.rate?.month) return quote.rate.month;
  if (quote.rate?.semi_annual) return quote.rate.semi_annual / 6;
  return quote.monthly_premium || quote.premium || 0;
}

/**
 * Get option name based on quote characteristics
 */
function getOptionName(quote: any): string {
  // Return just the rating class - badges will show discount info
  return quote.rating_class || 'Standard';
}

/**
 * Get option type based on quote characteristics
 */
function getOptionType(quote: any): PlanOption['type'] {
  const hasHouseholdDiscount = quote.view_type && quote.view_type.includes('with_hhd');
  const hasDiscounts = quote.discounts && quote.discounts.length > 0;
  
  if (hasHouseholdDiscount) return 'household_discount';
  if (hasDiscounts) return 'discount';
  return 'rating_class';
}

/**
 * Get option description based on quote characteristics
 */
function getOptionDescription(quote: any): string {
  const hasHouseholdDiscount = quote.view_type && quote.view_type.includes('with_hhd');
  const hasDiscounts = quote.discounts && quote.discounts.length > 0;
  const ratingClass = quote.rating_class || 'Standard';
  
  if (hasHouseholdDiscount) {
    return `${ratingClass} rating class with household discount applied`;
  }
  
  if (hasDiscounts) {
    return `${ratingClass} rating class with discounts applied`;
  }
  
  return `${ratingClass} rating class`;
}

/**
 * Create rating options from quotes
 */
function createRatingOptions(planQuotes: any[]): RatingOption[] {
  const ratingClassMap = new Map<string, any>();
  
  // Group quotes by rating class, keeping only the best (lowest) rate for each rating class
  planQuotes.forEach(quote => {
    const ratingClass = quote.rating_class || 'Standard';
    const rate = getRateFromQuote(quote);
    
    if (!ratingClassMap.has(ratingClass) || rate < getRateFromQuote(ratingClassMap.get(ratingClass))) {
      ratingClassMap.set(ratingClass, quote);
    }
  });
  
  return Array.from(ratingClassMap.values()).map(quote => {
    const ratingClass = quote.rating_class || 'Standard';
    const rate = getRateFromQuote(quote);
    
    return {
      id: `rating-${ratingClass}`,
      name: ratingClass,
      ratingClass,
      description: getRatingClassDescription(ratingClass),
      rate: {
        annual: rate * 12,
        month: rate,
        quarter: rate * 3,
        semi_annual: rate * 6
      },
      originalQuote: quote
    };
  });
}

/**
 * Create discount options from quotes
 */
function createDiscountOptions(planQuotes: any[]): DiscountOption[] {
  const discountOptions: DiscountOption[] = [];
  
  planQuotes.forEach(quote => {
    const hasHouseholdDiscount = quote.view_type && quote.view_type.includes('with_hhd');
    const hasDiscounts = quote.discounts && quote.discounts.length > 0;
    
    if (hasHouseholdDiscount) {
      const rate = getRateFromQuote(quote);
      const convertedRate = rate >= 100 ? rate / 100 : rate;
      
      discountOptions.push({
        id: `hhd-${quote.rating_class || 'standard'}`,
        name: 'Household Discount',
        type: 'household_discount',
        description: 'Discount for multiple policies in the same household',
        discountPercent: 0, // Will be calculated based on comparison
        savings: 0, // Will be calculated
        savingsPercent: 0, // Will be calculated
        originalQuote: quote
      });
    }
    
    if (hasDiscounts) {
      quote.discounts.forEach((discount: any) => {
        // Convert discount value to percentage (0.07 → 7)
        const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
        
        discountOptions.push({
          id: `discount-${discount.name || discount.type}`,
          name: discount.name || discount.type || 'Discount',
          type: 'other',
          description: discount.description || 'Policy discount',
          discountPercent: discountPercent,
          savings: 0, // Will be calculated
          savingsPercent: 0, // Will be calculated
          originalQuote: quote
        });
      });
    }
  });
  
  return discountOptions;
}

/**
 * Find the highest rate (usually the standard/base rate without discounts)
 */
function findBaseRate(planQuotes: any[]): number {
  // Find the highest rate among the quotes (this should be the base rate without discounts)
  let maxRate = 0;
  for (const quote of planQuotes) {
    const rate = quote.rate?.month || quote.monthly_premium || 0;
    if (rate > maxRate) {
      maxRate = rate;
    }
  }
  return maxRate;
}

/**
 * Create a plan option from a quote
 */
function createPlanOption(quote: any, allQuotes: any[]): PlanOption {
  // Convert from cents to dollars
  const currentRate = (quote.rate?.month || quote.monthly_premium || 0) / 100;
  
  // Find the highest rate among all quotes for this plan (this would be the "standard" or least discounted rate)
  const highestRate = Math.max(...allQuotes.map(q => (q.rate?.month || q.monthly_premium || 0) / 100));
  
  // Calculate savings compared to the highest rate option (only show savings if this rate is lower)
  const savings = currentRate < highestRate ? highestRate - currentRate : 0;
  const savingsPercent = highestRate > 0 ? (savings / highestRate) * 100 : 0;
  
  // Determine option type and name based on the actual quote data
  let optionType: PlanOption['type'] = 'standard';
  let optionName = 'Standard';
  let description = 'Standard plan option';
  
  // Check for household discount (view_type contains "with_hhd")
  const hasHouseholdDiscount = quote.view_type && quote.view_type.includes('with_hhd');
  
  // Parse rating class for discount information
  const ratingClass = quote.rating_class || '';
  
  if (hasHouseholdDiscount || ratingClass.toLowerCase().includes('hhd')) {
    optionType = 'household_discount';
    
    // Extract discount percentage from rating class
    let discountPercent = '';
    if (ratingClass.includes('6%')) {
      discountPercent = '6%';
    } else if (ratingClass.includes('20%')) {
      discountPercent = '20%';
    } else if (savings > 0) {
      discountPercent = `${Math.round(savingsPercent)}%`;
    } else {
      discountPercent = 'Household';
    }
    
    optionName = `Household Discount (${discountPercent})`;
    description = `Household discount - save when multiple family members enroll. ${ratingClass ? `Rating: ${ratingClass}` : ''}`.trim();
    
  } else if (ratingClass && ratingClass !== '' && !ratingClass.toLowerCase().includes('standard')) {
    optionType = 'rating_class';
    optionName = ratingClass;
    description = `Special underwriting class: ${ratingClass}`;
    
  } else if (quote.discounts && quote.discounts.length > 0) {
    optionType = 'discount';
    const discountNames = quote.discounts.map((d: any) => {
      const name = d.name || 'Discount';
      const value = d.type === 'percent' ? `${Math.round(d.value * 100)}%` : `$${d.value}`;
      return `${name} (${value})`;
    }).join(', ');
    optionName = `With Discounts`;
    description = `Available discounts: ${discountNames}`;
    
  } else {
    // This is a standard option
    optionType = 'standard';
    optionName = ratingClass || 'Standard';
    description = ratingClass ? `Standard plan with ${ratingClass} rating` : 'Standard plan option';
  }
  
  return {
    id: quote.key || `${quote.plan}-${Date.now()}-${Math.random()}`,
    name: optionName,
    type: optionType,
    description,
    rate: {
      annual: (quote.rate?.annual || currentRate * 100 * 12) / 100,
      month: currentRate,
      quarter: (quote.rate?.quarter || currentRate * 100 * 3) / 100,
      semi_annual: (quote.rate?.semi_annual || currentRate * 100 * 6) / 100
    },
    discounts: quote.discounts || [],
    rating_class: ratingClass,
    view_type: quote.view_type || [],
    savings: savings > 0 ? savings : undefined,
    savingsPercent: savingsPercent > 0 ? savingsPercent : undefined,
    isRecommended: false, // Will be set later
    originalQuote: quote
  };
}

/**
 * Consolidate quotes by carrier and plan type - for multi-plan scenarios
 */
export function consolidateQuotesByCarrierAndPlan(quotes: any[]): Record<string, ConsolidatedPlan[]> {
  // First group by carrier
  const carrierGroups = quotes.reduce((groups: Record<string, any[]>, quote: any) => {
    const carrierName = quote.carrier?.name || quote.company_base?.name || 'Unknown';
    
    if (!groups[carrierName]) {
      groups[carrierName] = [];
    }
    groups[carrierName].push(quote);
    return groups;
  }, {});
  
  // Then consolidate each carrier's quotes by plan type
  const result: Record<string, ConsolidatedPlan[]> = {};
  
  Object.entries(carrierGroups).forEach(([carrierName, carrierQuotes]) => {
    result[carrierName] = consolidateQuoteVariations(carrierQuotes);
  });
  
  return result;
}

/**
 * Consolidate multiple quote variations into a single plan with options
 */
export function consolidateQuoteVariations(quotes: any[]): ConsolidatedPlan[] {
  if (!quotes || quotes.length === 0) return [];
  
  // Group quotes by base plan (carrier + plan letter)
  const basePlans = new Map<string, any[]>();
  
  quotes.forEach(quote => {
    const basePlanId = getBasePlanId(quote);
    if (!basePlans.has(basePlanId)) {
      basePlans.set(basePlanId, []);
    }
    basePlans.get(basePlanId)!.push(quote);
  });
  
  // Convert each group into a consolidated plan
  const consolidatedPlans: ConsolidatedPlan[] = [];
  
  for (const [basePlanId, planQuotes] of basePlans) {
    if (planQuotes.length === 0) continue;
    
    // Use the first quote as the base for plan metadata
    const baseQuote = planQuotes[0];
    
    // Convert each quote into a plan option - no calculation needed, just use the quote's rate
    const options: PlanOption[] = planQuotes.map(quote => {
      const monthlyRate = getRateFromQuote(quote);
      // Keep rates in cents format for consistency with display functions
      
      return {
        id: quote.key || `${quote.plan}-${quote.rating_class || 'standard'}-${quote.discounts?.length || 0}`,
        name: getOptionName(quote),
        type: getOptionType(quote),
        description: getOptionDescription(quote),
        rate: {
          annual: monthlyRate * 12,
          month: monthlyRate,
          quarter: monthlyRate * 3,
          semi_annual: monthlyRate * 6
        },
        discounts: quote.discounts || [],
        rating_class: quote.rating_class || 'Standard',
        view_type: quote.view_type || [],
        originalQuote: quote
      };
    });
    
    // Sort options by rate (lowest first)
    options.sort((a, b) => a.rate.month - b.rate.month);
    
    // Mark the lowest rate option as recommended
    if (options.length > 0) {
      options[0].isRecommended = true;
    }

    // Create separate rating and discount options for easier filtering
    const ratingOptions = createRatingOptions(planQuotes);
    const discountOptions = createDiscountOptions(planQuotes);
    
    const carrierName = baseQuote.carrier?.name || baseQuote.company_base?.name || 'Unknown';
    
    // Use the lowest rate option as the base display rate
    const baseDisplayRate = options[0]?.rate.month || 0;
    
    const consolidatedPlan: ConsolidatedPlan = {
      id: basePlanId,
      plan: baseQuote.plan || 'Unknown',
      carrier: {
        name: carrierName,
        originalName: carrierName, // Keep original name for carrier system lookup
        displayName: getCarrierDisplayName(carrierName, 'medicare-supplement'),
        logoUrl: getCarrierLogoUrl(carrierName)
      },
      baseRate: {
        annual: baseDisplayRate * 12,
        month: baseDisplayRate,
        quarter: baseDisplayRate * 3,
        semi_annual: baseDisplayRate * 6
      },
      options,
      ratingOptions,
      discountOptions,
      recommendedRatingId: ratingOptions.find((opt: any) => opt.isRecommended)?.id || ratingOptions[0]?.id,
      recommendedDiscountId: discountOptions.length > 0 ? discountOptions[0].id : undefined,
      recommendedOptionId: options.find(opt => opt.isRecommended)?.id || options[0]?.id || '',
      company_base: baseQuote.company_base,
      effective_date: baseQuote.effective_date || new Date().toISOString(),
      expires_date: baseQuote.expires_date || '2099-12-31T00:00:00',
      rate_type: baseQuote.rate_type || 'attained age',
      gender: baseQuote.gender || 'M',
      age: baseQuote.age || 65,
      tobacco: baseQuote.tobacco || false,
      location_base: baseQuote.location_base
    };
    
    consolidatedPlans.push(consolidatedPlan);
  }
  
  // Sort consolidated plans by lowest rate
  consolidatedPlans.sort((a, b) => {
    const aLowestRate = Math.min(...a.options.map(opt => opt.rate.month));
    const bLowestRate = Math.min(...b.options.map(opt => opt.rate.month));
    return aLowestRate - bLowestRate;
  });
  
  return consolidatedPlans;
}

/**
 * Creates separate rating and discount options from plan options
 */
function createRatingAndDiscountOptions(options: PlanOption[]): {
  ratingOptions: RatingOption[];
  discountOptions: DiscountOption[];
} {
  const ratingOptions: RatingOption[] = [];
  const discountOptions: DiscountOption[] = [];
  const processedRatings = new Set<string>();
  const processedDiscounts = new Set<string>();

  // First pass: collect all unique rating classes
  for (const option of options) {
    if (option.rating_class && !processedRatings.has(option.rating_class)) {
      processedRatings.add(option.rating_class);
      
      // Find the option with this rating class and no discounts (if available)
      const baseRatingOption = options.find(opt => 
        opt.rating_class === option.rating_class && 
        (!opt.discounts || opt.discounts.length === 0)
      ) || option;
      
      ratingOptions.push({
        id: `rating-${option.rating_class.toLowerCase().replace(/\s+/g, '-')}`,
        name: option.rating_class,
        ratingClass: option.rating_class,
        description: getRatingClassDescription(option.rating_class),
        rate: baseRatingOption.rate,
        isRecommended: baseRatingOption.isRecommended,
        originalQuote: baseRatingOption.originalQuote
      });
    }
  }

  // Second pass: collect all unique discount types
  for (const option of options) {
    if (option.discounts && option.discounts.length > 0) {
      for (const discount of option.discounts) {
        const discountKey = `${discount.type || 'discount'}-${discount.name || 'unnamed'}`;
        
        if (!processedDiscounts.has(discountKey)) {
          processedDiscounts.add(discountKey);
          
          // Calculate discount savings by comparing with base rate
          const baseOption = options.find(opt => 
            opt.rating_class === option.rating_class && 
            (!opt.discounts || opt.discounts.length === 0)
          );
          
          const savings = baseOption ? baseOption.rate.month - option.rate.month : 0;
          const savingsPercent = baseOption && baseOption.rate.month > 0 
            ? (savings / baseOption.rate.month) * 100 
            : 0;
          
          const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
          
          discountOptions.push({
            id: `discount-${discountKey.toLowerCase().replace(/\s+/g, '-')}`,
            name: discount.name || 'Household Discount',
            type: discount.type === 'household' ? 'household_discount' : 'other',
            description: getDiscountDescription(discount),
            discountPercent: discountPercent,
            applicableToRating: option.rating_class,
            savings: Math.max(0, savings),
            savingsPercent: Math.max(0, savingsPercent),
            originalQuote: option.originalQuote
          });
        }
      }
    }
  }

  return { ratingOptions, discountOptions };
}

/**
 * Gets a user-friendly description for rating classes
 */
function getRatingClassDescription(ratingClass: string): string {
  const descriptions: Record<string, string> = {
    'Standard': 'Standard plan option',
    'Standard I': 'Standard plan option with basic coverage',
    'Standard II': 'Enhanced standard plan option',
    'Standard II w/ 20% HHD': 'Enhanced standard plan with household discount',
    'Preferred': 'Preferred rates for qualified applicants',
    'Select': 'Select rates for qualified applicants',
    'Super Preferred': 'Best rates for highly qualified applicants'
  };
  
  return descriptions[ratingClass] || `${ratingClass} plan option`;
}

/**
 * Gets a user-friendly description for discounts
 */
function getDiscountDescription(discount: any): string {
  const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
  
  if (discount.type === 'household' || discount.name?.includes('Household')) {
    return `${discountPercent}% discount for household members`;
  }
  
  if (discount.name?.includes('Multi')) {
    return `${discountPercent}% discount for multiple policies`;
  }
  
  return discount.name || `${discountPercent}% discount available`;
}

/**
 * Get the recommended option for a consolidated plan
 */
export function getRecommendedOption(plan: ConsolidatedPlan): PlanOption | null {
  return plan.options.find(opt => opt.id === plan.recommendedOptionId) || plan.options[0] || null;
}

/**
 * Calculate the potential savings across all options for a plan
 */
export function calculateMaxSavings(plan: ConsolidatedPlan): { amount: number; percent: number } {
  const baseRate = plan.baseRate.month;
  const lowestRate = Math.min(...plan.options.map(opt => opt.rate.month));
  const savings = baseRate - lowestRate;
  const percent = baseRate > 0 ? (savings / baseRate) * 100 : 0;
  
  return {
    amount: savings > 0 ? savings : 0,
    percent: percent > 0 ? percent : 0
  };
}
