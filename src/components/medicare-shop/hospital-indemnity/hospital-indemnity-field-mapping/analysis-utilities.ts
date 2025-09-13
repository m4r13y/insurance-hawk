/**
 * Hospital Indemnity Quote Analysis Utilities
 * Functions to parse and analyze complex nested benefit structures and rider configurations
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { RIDER_TYPES, QUANTIFIER_PATTERNS, RATE_ANALYSIS } from './field-analysis';

/**
 * Extracts benefit days configuration from plan name
 * Similar to how dental plans have variable annual maximums
 */
export function extractBenefitDays(planName: string): {
  days: number | null;
  planType: string;
  isVariable: boolean;
} {
  // Match patterns like "07 Benefit Days", "14 Benefit Days", "30 Benefit Days"
  const dayPattern = /(\d+)\s+Benefit\s+Days?/i;
  const match = planName.match(dayPattern);
  
  if (match) {
    return {
      days: parseInt(match[1], 10),
      planType: 'benefit_days',
      isVariable: true
    };
  }

  // Check for other day-related patterns
  const alternatePatterns = [
    /(\d+)\s*day/i,
    /(\d+)\s*-day/i,
    /day\s*(\d+)/i
  ];

  for (const pattern of alternatePatterns) {
    const altMatch = planName.match(pattern);
    if (altMatch) {
      return {
        days: parseInt(altMatch[1], 10),
        planType: 'day_based',
        isVariable: true
      };
    }
  }

  return {
    days: null,
    planType: 'unknown',
    isVariable: false
  };
}

/**
 * Analyzes benefit day configurations across multiple quotes
 * Similar to dental annual maximum analysis
 */
export function analyzeBenefitDayConfigurations(quotes: any[]): {
  availableDayOptions: number[];
  mostCommonDays: number | null;
  dayRange: { min: number; max: number } | null;
  planTypeDistribution: Record<string, number>;
} {
  const dayConfigs = quotes
    .map(quote => extractBenefitDays(quote.plan_name || ''))
    .filter(config => config.days !== null);

  const dayOptions = [...new Set(dayConfigs.map(config => config.days!))].sort((a, b) => a - b);
  
  const dayFrequency = dayConfigs.reduce((acc, config) => {
    acc[config.days!] = (acc[config.days!] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostCommon = Object.entries(dayFrequency)
    .sort(([,a], [,b]) => b - a)[0];

  const planTypeDistribution = dayConfigs.reduce((acc, config) => {
    acc[config.planType] = (acc[config.planType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    availableDayOptions: dayOptions,
    mostCommonDays: mostCommon ? parseInt(mostCommon[0]) : null,
    dayRange: dayOptions.length > 0 
      ? { min: dayOptions[0], max: dayOptions[dayOptions.length - 1] }
      : null,
    planTypeDistribution
  };
}

// Raw API structure interfaces (based on the 1767-line analysis)
export interface RawHospitalIndemnityQuote {
  key: string;
  age: number;
  gender: string;
  state: string;
  tobacco: boolean;
  plan_name: string;
  policy_fee: number;
  hh_discount: number;
  created_date: string;
  effective_date: string;
  expires_date: string;
  company: string;
  company_base: RawCompanyBase;
  base_plans: RawBasePlan[];
  riders: RawRider[];
  county: string[];
  county_excluded: string[];
  contextual_data: any;
  product_key: string | null;
  e_app_link: string;
  has_brochure: boolean;
  has_pdf_app: boolean;
  last_modified: string;
}

export interface RawCompanyBase {
  key: string;
  name: string;
  name_full: string;
  naic: string;
  ambest_rating: string;
  ambest_outlook: string;
  business_type: string;
  type: string;
  sp_rating: string;
  customer_complaint_ratio: number | null;
  customer_satisfaction_ratio: number;
  parent_company: string;
  parent_company_base: {
    key: string;
    name: string;
    code: string;
    established_year: number;
    last_modified: string;
  };
  state_marketing_data: any[];
  underwriting_data: any[];
}

export interface RawBasePlan {
  name: string;
  included: boolean;
  benefits: RawBenefit[];
  benefit_notes: string | null;
  limitation_notes: string | null;
  note: string | null;
}

export interface RawRider {
  name: string;
  included: boolean;
  benefits: RawBenefit[];
  benefit_notes: string | null;
  limitation_notes: string | null;
  note: string | null;
}

export interface RawBenefit {
  amount: string;
  rate: number;
  quantifier: string;
  dependent_riders: any[];
}

/**
 * BENEFIT STRUCTURE ANALYSIS UTILITIES
 */

export interface BenefitAnalysis {
  totalBenefits: number;
  benefitsByType: Record<string, number>;
  rateDistribution: {
    free: number; // rate = 0
    paid: number; // rate > 0
    averageRate: number;
    maxRate: number;
    minRate: number;
  };
  quantifierPatterns: Record<string, number>;
  amountRanges: Record<string, { min: number; max: number; count: number }>;
}

export function analyzeBenefitStructure(quote: RawHospitalIndemnityQuote): BenefitAnalysis {
  const allBenefits: RawBenefit[] = [];
  const benefitsByType: Record<string, number> = {};
  const quantifierPatterns: Record<string, number> = {};
  const amountRanges: Record<string, { min: number; max: number; count: number }> = {};

  // Collect all benefits from base plans and riders
  quote.base_plans.forEach(plan => {
    benefitsByType[plan.name] = (benefitsByType[plan.name] || 0) + plan.benefits.length;
    allBenefits.push(...plan.benefits);
  });

  quote.riders.forEach(rider => {
    benefitsByType[rider.name] = (benefitsByType[rider.name] || 0) + rider.benefits.length;
    allBenefits.push(...rider.benefits);
  });

  // Analyze rates
  const paidBenefits = allBenefits.filter(b => b.rate > 0);
  const freeBenefits = allBenefits.filter(b => b.rate === 0);
  const rates = paidBenefits.map(b => b.rate);

  // Analyze quantifiers
  allBenefits.forEach(benefit => {
    quantifierPatterns[benefit.quantifier] = (quantifierPatterns[benefit.quantifier] || 0) + 1;
  });

  // Analyze amount ranges by quantifier type
  allBenefits.forEach(benefit => {
    const numericAmount = parseFloat(benefit.amount.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericAmount)) {
      if (!amountRanges[benefit.quantifier]) {
        amountRanges[benefit.quantifier] = { min: numericAmount, max: numericAmount, count: 0 };
      }
      amountRanges[benefit.quantifier].min = Math.min(amountRanges[benefit.quantifier].min, numericAmount);
      amountRanges[benefit.quantifier].max = Math.max(amountRanges[benefit.quantifier].max, numericAmount);
      amountRanges[benefit.quantifier].count++;
    }
  });

  return {
    totalBenefits: allBenefits.length,
    benefitsByType,
    rateDistribution: {
      free: freeBenefits.length,
      paid: paidBenefits.length,
      averageRate: rates.length > 0 ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0,
      maxRate: rates.length > 0 ? Math.max(...rates) : 0,
      minRate: rates.length > 0 ? Math.min(...rates) : 0
    },
    quantifierPatterns,
    amountRanges
  };
}

/**
 * RIDER CLASSIFICATION UTILITIES
 */

export interface RiderClassification {
  type: 'optional' | 'included' | 'base';
  category: 'core' | 'specialty' | 'wellness' | 'facility' | 'travel' | 'ancillary';
  complexity: 'simple' | 'moderate' | 'complex';
  benefitCount: number;
  rateRange: { min: number; max: number };
}

export function classifyRider(rider: RawRider | RawBasePlan): RiderClassification {
  const benefitCount = rider.benefits.length;
  const rates = rider.benefits.map(b => b.rate).filter(r => r > 0);
  
  // Determine type
  let type: 'optional' | 'included' | 'base' = 'optional';
  if (rider.included) {
    type = 'included';
  } else if ('name' in rider && rider.name.includes('Hospital Confinement Benefit')) {
    type = 'base';
  }

  // Determine category based on name
  let category: RiderClassification['category'] = 'ancillary';
  const name = rider.name.toLowerCase();
  
  if (name.includes('hospital') || name.includes('confinement') || name.includes('intensive')) {
    category = 'core';
  } else if (name.includes('dental') || name.includes('vision') || name.includes('wellness')) {
    category = 'wellness';
  } else if (name.includes('skilled nurse') || name.includes('facility') || name.includes('hospice')) {
    category = 'facility';
  } else if (name.includes('ambulance') || name.includes('surgery') || name.includes('emergency')) {
    category = 'specialty';
  } else if (name.includes('travel') || name.includes('companion') || name.includes('pet')) {
    category = 'travel';
  }

  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (benefitCount > 20) {
    complexity = 'complex';
  } else if (benefitCount > 5) {
    complexity = 'moderate';
  }

  return {
    type,
    category,
    complexity,
    benefitCount,
    rateRange: {
      min: rates.length > 0 ? Math.min(...rates) : 0,
      max: rates.length > 0 ? Math.max(...rates) : 0
    }
  };
}

/**
 * PREMIUM CALCULATION UTILITIES
 */

export interface PremiumBreakdown {
  basePremium: number;
  riderPremiums: Record<string, number>;
  totalRiderPremium: number;
  policyFee: number;
  grossPremium: number;
  discountAmount: number;
  netPremium: number;
}

export function calculatePremiumBreakdown(
  quote: RawHospitalIndemnityQuote,
  selectedBaseBenefit?: RawBenefit,
  selectedRiderBenefits?: Record<string, RawBenefit>
): PremiumBreakdown {
  let basePremium = 0;
  const riderPremiums: Record<string, number> = {};
  
  // Calculate base premium
  if (selectedBaseBenefit) {
    basePremium = selectedBaseBenefit.rate;
  }
  
  // Calculate rider premiums
  if (selectedRiderBenefits) {
    Object.entries(selectedRiderBenefits).forEach(([riderName, benefit]) => {
      riderPremiums[riderName] = benefit.rate;
    });
  }
  
  const totalRiderPremium = Object.values(riderPremiums).reduce((sum, premium) => sum + premium, 0);
  const grossPremium = basePremium + totalRiderPremium + quote.policy_fee;
  const discountAmount = grossPremium * quote.hh_discount;
  const netPremium = grossPremium - discountAmount;
  
  return {
    basePremium,
    riderPremiums,
    totalRiderPremium,
    policyFee: quote.policy_fee,
    grossPremium,
    discountAmount,
    netPremium
  };
}

/**
 * COMPARISON UTILITIES
 */

export interface QuoteComparison {
  quotes: OptimizedHospitalIndemnityQuote[];
  commonFields: Record<string, any>;
  differences: Record<string, any[]>;
  priceComparison: {
    lowest: OptimizedHospitalIndemnityQuote;
    highest: OptimizedHospitalIndemnityQuote;
    average: number;
    spread: number;
  };
}

export function compareQuotes(quotes: OptimizedHospitalIndemnityQuote[]): QuoteComparison {
  if (quotes.length === 0) {
    throw new Error('No quotes provided for comparison');
  }

  const commonFields: Record<string, any> = {};
  const differences: Record<string, any[]> = {};
  
  // Find common fields and differences
  const firstQuote = quotes[0];
  const fieldKeys = Object.keys(firstQuote);
  
  fieldKeys.forEach(key => {
    const values = quotes.map(q => (q as any)[key]);
    const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))];
    
    if (uniqueValues.length === 1) {
      commonFields[key] = values[0];
    } else {
      differences[key] = values;
    }
  });
  
  // Price comparison
  const premiums = quotes.map(q => q.monthlyPremium);
  const lowest = quotes.find(q => q.monthlyPremium === Math.min(...premiums))!;
  const highest = quotes.find(q => q.monthlyPremium === Math.max(...premiums))!;
  const average = premiums.reduce((sum, p) => sum + p, 0) / premiums.length;
  const spread = Math.max(...premiums) - Math.min(...premiums);
  
  return {
    quotes,
    commonFields,
    differences,
    priceComparison: {
      lowest,
      highest,
      average,
      spread
    }
  };
}

/**
 * DATA VALIDATION UTILITIES
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldCoverage: number; // Percentage of expected fields present
}

export function validateQuoteData(quote: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  const requiredFields = ['key', 'age', 'gender', 'state', 'plan_name', 'company_base'];
  requiredFields.forEach(field => {
    if (!(field in quote) || quote[field] === null || quote[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check data types
  if (quote.age && typeof quote.age !== 'number') {
    errors.push('Age must be a number');
  }
  
  if (quote.tobacco && typeof quote.tobacco !== 'boolean') {
    errors.push('Tobacco must be a boolean');
  }
  
  // Check arrays
  if (quote.base_plans && !Array.isArray(quote.base_plans)) {
    errors.push('base_plans must be an array');
  }
  
  if (quote.riders && !Array.isArray(quote.riders)) {
    errors.push('riders must be an array');
  }
  
  // Check benefit structures
  if (quote.base_plans) {
    quote.base_plans.forEach((plan: any, index: number) => {
      if (!plan.benefits || !Array.isArray(plan.benefits)) {
        errors.push(`Base plan ${index} missing benefits array`);
      }
    });
  }
  
  // Check for potential issues
  if (quote.policy_fee && quote.policy_fee < 0) {
    warnings.push('Policy fee is negative');
  }
  
  if (quote.hh_discount && (quote.hh_discount < 0 || quote.hh_discount > 1)) {
    warnings.push('Household discount should be between 0 and 1');
  }
  
  // Calculate field coverage
  const totalExpectedFields = 18; // Based on our analysis
  const presentFields = Object.keys(quote).length;
  const fieldCoverage = (presentFields / totalExpectedFields) * 100;
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldCoverage
  };
}

/**
 * EXPORT UTILITIES
 */

export function exportFieldMappingCSV(quotes: OptimizedHospitalIndemnityQuote[]): string {
  const headers = [
    'Quote ID', 'Plan Name', 'Company', 'Age', 'Gender', 'State', 
    'Monthly Premium', 'Policy Fee', 'HH Discount', 'AM Best Rating'
  ];
  
  const rows = quotes.map(quote => [
    quote.id,
    quote.planName,
    quote.companyName,
    quote.age,
    quote.gender,
    quote.state,
    quote.monthlyPremium,
    quote.policyFee,
    quote.hhDiscount,
    quote.ambest?.rating || 'N/A'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function generateFieldMappingReport(quote: RawHospitalIndemnityQuote): string {
  const analysis = analyzeBenefitStructure(quote);
  const validation = validateQuoteData(quote);
  
  return `
# Hospital Indemnity Quote Analysis Report

## Quote Information
- **Quote ID:** ${quote.key}
- **Plan Name:** ${quote.plan_name}
- **Company:** ${quote.company_base.name_full}
- **Age:** ${quote.age}
- **State:** ${quote.state}

## Benefit Structure Analysis
- **Total Benefits:** ${analysis.totalBenefits}
- **Free Benefits:** ${analysis.rateDistribution.free}
- **Paid Benefits:** ${analysis.rateDistribution.paid}
- **Average Rate:** $${analysis.rateDistribution.averageRate.toFixed(2)}
- **Rate Range:** $${analysis.rateDistribution.minRate.toFixed(2)} - $${analysis.rateDistribution.maxRate.toFixed(2)}

## Data Validation
- **Valid:** ${validation.isValid ? 'Yes' : 'No'}
- **Field Coverage:** ${validation.fieldCoverage.toFixed(1)}%
- **Errors:** ${validation.errors.length}
- **Warnings:** ${validation.warnings.length}

## Rider Classification
${quote.riders.map(rider => {
  const classification = classifyRider(rider);
  return `- **${rider.name}:** ${classification.type} | ${classification.category} | ${classification.complexity} (${classification.benefitCount} benefits)`;
}).join('\n')}
  `.trim();
}