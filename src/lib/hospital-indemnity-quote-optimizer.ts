/**
 * Hospital Indemnity Quote Data Optimizer
 * Extracts essential fields from raw API response and removes bloat data
 * Optimized for the new API structure with direct quote objects
 */

import { HospitalIndemnityQuote } from "@/lib/actions/hospital-indemnity-quotes";

// Types for optimized hospital indemnity quotes
export interface OptimizedHospitalIndemnityQuote {
  id: string;
  planName: string;
  companyName: string;
  companyFullName: string;
  age: number;
  gender: string;
  state: string;
  monthlyPremium: number;
  policyFee: number;
  hhDiscount: number;
  tobacco: boolean;
  ambest: {
    rating: string;
    outlook: string;
  };
  basePlans: Array<{
    name: string;
    included: boolean;
    benefitOptions: Array<{
      amount: string;
      rate: number;
      quantifier?: string;
    }>;
    notes: string | null;
  }>;
  riders: Array<{
    name: string;
    included: boolean;
    benefitOptions: Array<{
      amount: string;
      rate: number;
      quantifier?: string;
    }>;
    notes: string | null;
  }>;
  lastModified: string;
  hasApplications: {
    brochure: boolean;
    pdfApp: boolean;
    eApp: boolean;
  };
}

/**
 * Extracts quote fields from raw API data using snake_case field names
 */
export function extractQuoteFields(quote: HospitalIndemnityQuote): OptimizedHospitalIndemnityQuote {
  // Get the lowest rate from base plans for monthly premium calculation
  const baseLowestRate = quote.base_plans.reduce((min: number, plan: any) => {
    const planMin = plan.benefits.reduce((planMinRate: number, benefit: any) => 
      Math.min(planMinRate, benefit.rate), Infinity);
    return Math.min(min, planMin);
  }, Infinity);

  return {
    id: quote.key,
    planName: quote.plan_name,
    companyName: quote.company_base.name,
    companyFullName: quote.company_base.name_full,
    age: quote.age,
    gender: quote.gender,
    state: quote.state,
    monthlyPremium: baseLowestRate === Infinity ? 0 : baseLowestRate,
    policyFee: quote.policy_fee,
    hhDiscount: quote.hh_discount,
    tobacco: quote.tobacco || false,
    ambest: {
      rating: quote.company_base.ambest_rating,
      outlook: quote.company_base.ambest_outlook,
    },
    basePlans: quote.base_plans.map((plan: any) => ({
      name: plan.name,
      included: plan.included,
      benefitOptions: plan.benefits.map((benefit: any) => ({
        amount: benefit.amount,
        rate: benefit.rate,
        quantifier: benefit.quantifier,
      })),
      notes: plan.benefit_notes || plan.limitation_notes || plan.note,
    })),
    riders: quote.riders.map((rider: any) => ({
      name: rider.name,
      included: rider.included,
      benefitOptions: rider.benefits.map((benefit: any) => ({
        amount: benefit.amount,
        rate: benefit.rate,
        quantifier: benefit.quantifier,
      })),
      notes: rider.benefit_notes || rider.limitation_notes || rider.note,
    })),
    lastModified: quote.last_modified,
    hasApplications: {
      brochure: quote.has_brochure,
      pdfApp: quote.has_pdf_app,
      eApp: Boolean(quote.e_app_link),
    },
  };
}

/**
 * Validates the structure of a quote to ensure it has the expected fields
 */
export function validateQuoteStructure(quote: any): quote is HospitalIndemnityQuote {
  const requiredFields = [
    'key', 'plan_name', 'company_base', 'last_modified', 
    'base_plans', 'riders', 'age', 'gender', 'state'
  ];
  
  const hasRequiredFields = requiredFields.every(field => field in quote);
  
  if (!hasRequiredFields) {
    console.log('❌ Missing required fields in quote:', 
      requiredFields.filter(field => !(field in quote)));
    return false;
  }
  
  // Check company_base structure
  if (!quote.company_base?.name || !quote.company_base?.naic) {
    console.log('❌ Invalid company_base structure');
    return false;
  }
  
  console.log('✅ Quote structure is valid');
  return true;
}

/**
 * Checks if a quote is from 2025 based on last_modified date
 */
export function isQuoteFrom2025(quote: any): boolean {
  try {
    const lastModified = quote.last_modified;
    if (!lastModified) {
      console.log('❌ No last_modified field found');
      return false;
    }
    
    const date = new Date(lastModified);
    const year = date.getFullYear();
    const is2025 = year === 2025;
    
    console.log(`📅 Quote last_modified: ${lastModified} -> Year: ${year} -> Is 2025: ${is2025}`);
    return is2025;
  } catch (error) {
    console.log('❌ Error parsing date:', error);
    return false;
  }
}

/**
 * Filters quotes to only include those from 2025
 */
export function filter2025Quotes(quotes: any[]): any[] {
  console.log(`🔍 Filtering ${quotes.length} quotes for 2025 dates...`);
  
  const filtered = quotes.filter(quote => {
    const isValid = validateQuoteStructure(quote);
    const is2025 = isQuoteFrom2025(quote);
    const shouldInclude = isValid && is2025;
    
    console.log(`Quote ${quote.key || 'unknown'}: Valid=${isValid}, Is2025=${is2025}, Include=${shouldInclude}`);
    return shouldInclude;
  });
  
  console.log(`✅ Filtered to ${filtered.length} quotes from 2025`);
  return filtered;
}

/**
 * Optimizes an array of raw hospital indemnity quotes
 */
export function optimizeHospitalIndemnityQuotes(rawQuotes: HospitalIndemnityQuote[]): OptimizedHospitalIndemnityQuote[] {
  console.log(`🔄 Optimizing ${rawQuotes.length} hospital indemnity quotes...`);
  
  // Filter for 2025 quotes first
  const quotes2025 = filter2025Quotes(rawQuotes);
  
  const optimized = quotes2025.map(quote => {
    try {
      return extractQuoteFields(quote);
    } catch (error) {
      console.error('Error optimizing quote:', quote.key, error);
      return null;
    }
  }).filter(Boolean) as OptimizedHospitalIndemnityQuote[];
  
  console.log(`✅ Successfully optimized ${optimized.length} hospital indemnity quotes`);
  return optimized;
}

/**
 * Calculates storage savings from optimization
 */
export function calculateStorageSavings(
  rawQuotes: HospitalIndemnityQuote[], 
  optimizedQuotes: OptimizedHospitalIndemnityQuote[]
): { originalSize: number; optimizedSize: number; savingsPercent: number } {
  const originalSize = JSON.stringify(rawQuotes).length;
  const optimizedSize = JSON.stringify(optimizedQuotes).length;
  const savingsPercent = ((originalSize - optimizedSize) / originalSize) * 100;
  
  console.log(`💾 Storage optimization results:
    - Original size: ${(originalSize / 1024).toFixed(2)} KB
    - Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB  
    - Savings: ${savingsPercent.toFixed(1)}%`);
  
  return { originalSize, optimizedSize, savingsPercent };
}

/**
 * Debug function to analyze the structure of last_modified fields
 */
export function debugLastModifiedFields(quote: any): void {
  console.log('🔍 Debugging last_modified fields in quote:');
  console.log('Quote level last_modified:', quote.last_modified);
  console.log('Company level last_modified:', quote.company_base?.last_modified);
  console.log('Parent company level last_modified:', quote.company_base?.parent_company_base?.last_modified);
}
