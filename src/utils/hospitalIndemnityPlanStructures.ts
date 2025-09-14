/**
 * Generalized Hospital Indemnity Plan Structure Detection
 * 
 * This system handles different company plan structures:
 * 1. Standard configurable plans (Liberty Bankers, etc.)
 * 2. Pre-configured plan packages (Allstate, etc.)
 * 3. Multiple plan series within a company (CIGNA Choice, Guarantee Trust series)
 * 
 * Key features:
 * - Detect plan groupings within companies
 * - Handle included riders that should be displayed but not configurable
 * - Support different base plan option structures
 * - Maintain current UI style for standard plans while enhancing for special cases
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

export interface PlanGroup {
  groupName: string;
  baseName: string; // e.g., "Senior Indemnity Plan", "Choice Hospital Indemnity"
  variants: PlanVariant[];
  isPreConfigured: boolean;
  hasMultipleSeries: boolean;
}

export interface PlanVariant {
  quote: OptimizedHospitalIndemnityQuote;
  variantName: string; // e.g., "Plan 1", "Core Option 2 - 7 Day"
  variantNumber?: number;
  benefitDays?: number;
  isPreConfigured: boolean;
  includedBenefits: IncludedBenefit[];
  configurableOptions: ConfigurableOption[];
}

export interface IncludedBenefit {
  name: string;
  amount: string;
  quantifier: string;
  description: string;
  type: 'admission' | 'daily' | 'outpatient' | 'ambulance' | 'surgery' | 'other';
}

export interface ConfigurableOption {
  type: 'base-plan' | 'rider';
  name: string;
  options: Array<{
    amount: string;
    rate: number;
    quantifier: string;
  }>;
  isRequired: boolean;
}

export interface CompanyPlanStructure {
  companyName: string;
  planGroups: PlanGroup[];
  structureType: 'standard' | 'pre-configured' | 'multiple-series' | 'hybrid';
  displayStyle: 'standard' | 'package-selection' | 'series-comparison';
}

/**
 * Detect plan structure patterns
 */
export const detectPlanStructure = (quotes: OptimizedHospitalIndemnityQuote[]): CompanyPlanStructure => {
  if (quotes.length === 0) {
    throw new Error('No quotes provided');
  }

  const companyName = quotes[0].companyName;
  const planGroups = groupQuotesByPlanSeries(quotes);
  
  // Determine structure type
  let structureType: CompanyPlanStructure['structureType'] = 'standard';
  let displayStyle: CompanyPlanStructure['displayStyle'] = 'standard';

  // Check if any plans are pre-configured (multiple included riders with rate 0)
  const hasPreConfiguredPlans = quotes.some(quote => {
    const includedRiders = quote.riders?.filter(r => r.included === true && r.benefitOptions?.[0]?.rate === 0) || [];
    return includedRiders.length >= 3; // 3+ included riders suggests pre-configured
  });

  // Check if multiple plan series exist
  const hasMultipleSeries = planGroups.length > 1;

  if (hasPreConfiguredPlans && hasMultipleSeries) {
    structureType = 'hybrid';
    displayStyle = 'series-comparison';
  } else if (hasPreConfiguredPlans) {
    structureType = 'pre-configured';
    displayStyle = 'package-selection';
  } else if (hasMultipleSeries) {
    structureType = 'multiple-series';
    displayStyle = 'series-comparison';
  }

  return {
    companyName,
    planGroups,
    structureType,
    displayStyle
  };
};

/**
 * Group quotes by plan series (e.g., "Senior Indemnity Plan 1, 2, 3...")
 */
const groupQuotesByPlanSeries = (quotes: OptimizedHospitalIndemnityQuote[]): PlanGroup[] => {
  const groups = new Map<string, OptimizedHospitalIndemnityQuote[]>();

  quotes.forEach(quote => {
    const baseName = extractBasePlanName(quote.planName);
    if (!groups.has(baseName)) {
      groups.set(baseName, []);
    }
    groups.get(baseName)!.push(quote);
  });

  return Array.from(groups.entries()).map(([baseName, groupQuotes]) => {
    const variants = groupQuotes.map(quote => analyzeQuoteVariant(quote, baseName));
    const isPreConfigured = variants.some(v => v.isPreConfigured);
    const hasMultipleSeries = variants.length > 1;

    return {
      groupName: baseName,
      baseName,
      variants,
      isPreConfigured,
      hasMultipleSeries
    };
  });
};

/**
 * Extract base plan name from full plan name
 */
const extractBasePlanName = (planName: string): string => {
  // Handle Allstate patterns: "Senior Indemnity Plan 1" -> "Senior Indemnity Plan"
  if (planName.match(/Senior Indemnity Plan \d+/)) {
    return 'Senior Indemnity Plan';
  }

  // Handle CIGNA patterns: "Choice Hospital Indemnity - Preferred Option 2 - 7 Day" -> "Choice Hospital Indemnity"
  if (planName.includes('Choice Hospital Indemnity')) {
    return 'Choice Hospital Indemnity';
  }

  // Handle Guarantee Trust patterns
  if (planName.includes('AdvantageGuard')) {
    return 'AdvantageGuard';
  }
  if (planName.includes('Shield')) {
    return 'Shield';
  }
  if (planName.includes('Protection Series')) {
    return 'Protection Series';
  }

  // Handle benefit days patterns: "07 Benefit Days" -> "Benefit Days"
  const benefitDaysMatch = planName.match(/\d+ (Day )?Benefits?/);
  if (benefitDaysMatch) {
    return 'Benefit Days Plans';
  }

  // Default: use the full plan name
  return planName;
};

/**
 * Analyze individual quote variant
 */
const analyzeQuoteVariant = (quote: OptimizedHospitalIndemnityQuote, baseName: string): PlanVariant => {
  const variantName = extractVariantName(quote.planName, baseName);
  const variantNumber = extractVariantNumber(quote.planName);
  const benefitDays = extractBenefitDaysFromName(quote.planName);
  
  // Check if this variant is pre-configured
  const includedRiders = quote.riders?.filter(r => r.included === true && r.benefitOptions?.[0]?.rate === 0) || [];
  const isPreConfigured = includedRiders.length >= 3;

  // Extract included benefits
  const includedBenefits = extractIncludedBenefits(quote);

  // Extract configurable options
  const configurableOptions = extractConfigurableOptions(quote);

  return {
    quote,
    variantName,
    variantNumber,
    benefitDays,
    isPreConfigured,
    includedBenefits,
    configurableOptions
  };
};

/**
 * Extract variant name from full plan name
 */
const extractVariantName = (planName: string, baseName: string): string => {
  if (baseName === 'Senior Indemnity Plan') {
    const match = planName.match(/Senior Indemnity Plan (\d+)/);
    return match ? `Plan ${match[1]}` : planName;
  }

  if (baseName === 'Choice Hospital Indemnity') {
    const parts = planName.replace('Choice Hospital Indemnity - ', '');
    return parts;
  }

  if (baseName === 'Benefit Days Plans') {
    const match = planName.match(/(\d+) (Day )?Benefits?/);
    return match ? `${match[1]} Days` : planName;
  }

  return planName.replace(baseName, '').trim();
};

/**
 * Extract variant number if available
 */
const extractVariantNumber = (planName: string): number | undefined => {
  const match = planName.match(/(?:Plan|Option) (\d+)/);
  return match ? parseInt(match[1]) : undefined;
};

/**
 * Extract benefit days from plan name
 */
const extractBenefitDaysFromName = (planName: string): number | undefined => {
  const match = planName.match(/(\d+) Day/);
  return match ? parseInt(match[1]) : undefined;
};

/**
 * Extract included benefits that should be displayed but not configurable
 */
const extractIncludedBenefits = (quote: OptimizedHospitalIndemnityQuote): IncludedBenefit[] => {
  const includedRiders = quote.riders?.filter(r => r.included === true && r.benefitOptions?.[0]?.rate === 0) || [];
  
  return includedRiders.map(rider => {
    const benefit = rider.benefitOptions?.[0];
    if (!benefit) return null;

    let type: IncludedBenefit['type'] = 'other';
    const name = rider.name.toLowerCase();
    
    if (name.includes('admission')) type = 'admission';
    else if (name.includes('daily') || name.includes('confinement')) type = 'daily';
    else if (name.includes('outpatient') || name.includes('office') || name.includes('urgent')) type = 'outpatient';
    else if (name.includes('ambulance')) type = 'ambulance';
    else if (name.includes('surgery')) type = 'surgery';

    return {
      name: rider.name,
      amount: benefit.amount.trim(),
      quantifier: benefit.quantifier || '',
      description: `$${benefit.amount.trim()} ${benefit.quantifier || ''}`,
      type
    };
  }).filter(Boolean) as IncludedBenefit[];
};

/**
 * Extract configurable options (base plans and optional riders)
 */
const extractConfigurableOptions = (quote: OptimizedHospitalIndemnityQuote): ConfigurableOption[] => {
  const options: ConfigurableOption[] = [];

  // Base plan options
  if (quote.basePlans?.length) {
    quote.basePlans.forEach(basePlan => {
      if (basePlan.benefitOptions?.length) {
        options.push({
          type: 'base-plan',
          name: basePlan.name,
          options: basePlan.benefitOptions.map(opt => ({
            amount: opt.amount,
            rate: opt.rate,
            quantifier: opt.quantifier || ''
          })),
          isRequired: true
        });
      }
    });
  }

  // Optional rider options
  const optionalRiders = quote.riders?.filter(r => r.included !== true && r.benefitOptions?.length) || [];
  optionalRiders.forEach(rider => {
    options.push({
      type: 'rider',
      name: rider.name,
      options: rider.benefitOptions!.map(opt => ({
        amount: opt.amount,
        rate: opt.rate,
        quantifier: opt.quantifier || ''
      })),
      isRequired: false
    });
  });

  return options;
};

/**
 * Get display configuration for a company's plan structure
 */
export const getDisplayConfiguration = (structure: CompanyPlanStructure) => {
  return {
    showPlanGrouping: structure.planGroups.length > 1,
    showIncludedBenefits: structure.planGroups.some(g => g.variants.some(v => v.includedBenefits.length > 0)),
    usePackageSelection: structure.displayStyle === 'package-selection',
    useSeriesComparison: structure.displayStyle === 'series-comparison',
    maintainStandardFlow: structure.displayStyle === 'standard'
  };
};

/**
 * Check if a company has special plan structures
 */
export const hasSpecialPlanStructure = (quotes: OptimizedHospitalIndemnityQuote[]): boolean => {
  if (quotes.length === 0) return false;
  
  const structure = detectPlanStructure(quotes);
  return structure.structureType !== 'standard';
};

/**
 * Get plan grouping summary for company card display
 */
export const getPlanGroupingSummary = (quotes: OptimizedHospitalIndemnityQuote[]): {
  hasMultiplePlanSeries: boolean;
  planSeriesNames: string[];
  hasPreConfiguredPlans: boolean;
  totalVariants: number;
} => {
  if (quotes.length === 0) {
    return {
      hasMultiplePlanSeries: false,
      planSeriesNames: [],
      hasPreConfiguredPlans: false,
      totalVariants: 0
    };
  }

  const structure = detectPlanStructure(quotes);
  
  return {
    hasMultiplePlanSeries: structure.planGroups.length > 1,
    planSeriesNames: structure.planGroups.map(g => g.baseName),
    hasPreConfiguredPlans: structure.structureType === 'pre-configured' || structure.structureType === 'hybrid',
    totalVariants: structure.planGroups.reduce((sum, g) => sum + g.variants.length, 0)
  };
};