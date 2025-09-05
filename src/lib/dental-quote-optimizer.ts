/**
 * Dental Quote Data Optimizer
 * Extracts essential fields from raw API response and removes bloat data
 * Optimized for the new API structure with direct quote objects
 */

// Types for the raw API response
export interface RawDentalQuote {
  key: string;
  age: number;
  gender: string | null;
  plan_name: string;
  state: string;
  last_modified: string; // ISO date string
  base_plans: Array<{
    name: string; // Full plan name
    benefit_notes: string;
    limitation_notes: string;
    included: boolean;
    benefits: Array<{
      amount: string;
      rate: number;
      quantifier: string;
      dependent_riders: any[];
    }>;
  }>;
  company_base: {
    key: string;
    name: string;
    name_full: string;
    ambest_rating: string;
    ambest_outlook: string;
  };
  product_key: string;
  tobacco: string | null;
}

// Types for optimized dental quotes
export interface OptimizedDentalQuote {
  id: string;
  planName: string;
  fullPlanName: string;
  companyName: string;
  companyFullName: string;
  annualMaximum: number;
  monthlyPremium: number;
  state: string;
  benefitNotes: string;
  limitationNotes: string;
  ambestRating: string;
  ambestOutlook: string;
  productKey: string;
  age: number;
  gender: string | null;
  tobacco: string | null;
}

export interface OptimizedDentalQuotesResponse {
  success: boolean;
  quotes: OptimizedDentalQuote[];
  error?: string;
  message?: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
}

/**
 * Debug function to show all last_modified fields in a quote for verification
 */
export function debugLastModifiedFields(rawQuote: any): void {
  console.log('🔍 DEBUG: All last_modified fields in quote:', {
    quoteKey: rawQuote.key,
    quoteLevelLastModified: rawQuote.last_modified,
    planName: rawQuote.plan_name,
    companyLastModified: rawQuote.company_base?.last_modified,
    parentCompanyLastModified: rawQuote.company_base?.parent_company_base?.last_modified,
    // Show structure to verify we're at the right level
    quoteFields: Object.keys(rawQuote).slice(0, 10)
  });
}

/**
 * Validates the structure of a raw quote to ensure we're processing it correctly
 */
export function validateQuoteStructure(rawQuote: any): boolean {
  const requiredQuoteFields = ['key', 'plan_name', 'last_modified', 'base_plans', 'company_base'];
  const missingFields = requiredQuoteFields.filter(field => !rawQuote[field]);
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ Quote ${rawQuote.key || 'unknown'} missing required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  // Verify we have the right last_modified (quote level, not nested)
  const quoteLevelLastModified = rawQuote.last_modified;
  const companyLastModified = rawQuote.company_base?.last_modified;
  const parentCompanyLastModified = rawQuote.company_base?.parent_company_base?.last_modified;
  
  console.log(`🔍 Quote ${rawQuote.key} last_modified levels:`, {
    quoteLevelLastModified,
    companyLastModified,
    parentCompanyLastModified
  });
  
  return true;
}

/**
 * Checks if a quote was last modified in 2025
 * Specifically checks the quote-level last_modified field, not nested company fields
 */
export function isQuoteFrom2025(rawQuote: any): boolean {
  // Ensure we're checking the quote-level last_modified, not nested ones
  const quoteLevelLastModified = rawQuote.last_modified;
  
  if (!quoteLevelLastModified) {
    console.log(`⚠️ Quote ${rawQuote.key} has no quote-level last_modified field, skipping`);
    return false;
  }
  
  // Verify this is at the quote level by checking it's a sibling to plan_name
  if (!rawQuote.plan_name) {
    console.warn(`⚠️ Quote ${rawQuote.key} missing plan_name - may be checking wrong last_modified level`);
  }
  
  try {
    const modifiedYear = new Date(quoteLevelLastModified).getFullYear();
    const is2025 = modifiedYear === 2025;
    
    console.log(`📅 Quote ${rawQuote.key}: last_modified=${quoteLevelLastModified} (${modifiedYear}) - ${is2025 ? 'INCLUDED' : 'FILTERED OUT'}`);
    
    return is2025;
  } catch (error) {
    console.warn(`⚠️ Invalid last_modified date format for quote ${rawQuote.key}: ${quoteLevelLastModified}`);
    return false;
  }
}

/**
 * Filters dental quotes to only include those from 2025
 */
export function filter2025Quotes(quotes: any[]): any[] {
  const filtered = quotes.filter(isQuoteFrom2025);
  console.log(`🎯 Filtered from ${quotes.length} to ${filtered.length} quotes (2025 only)`);
  return filtered;
}

/**
 * Extracts essential fields from a single raw dental quote
 */
function extractQuoteFields(rawQuote: any): OptimizedDentalQuote {
  // Log the raw quote structure to debug field names
  console.log('🔍 Processing raw quote structure:', {
    key: rawQuote.key,
    plan_name: rawQuote.plan_name,
    base_plans: rawQuote.base_plans?.length,
    company_base: rawQuote.company_base?.name
  });

  // Get the main benefit from base_plans (API uses base_plans, not benefits directly)
  const basePlan = rawQuote.base_plans?.find((plan: any) => plan.included) || rawQuote.base_plans?.[0];
  
  if (!basePlan) {
    console.warn(`⚠️ No valid base plan found for quote ${rawQuote.key}`, rawQuote.base_plans);
    throw new Error(`No valid base plan found for quote ${rawQuote.key}`);
  }

  // Get the main benefit from the base plan
  const mainBenefit = basePlan.benefits?.[0];
  
  if (!mainBenefit) {
    console.warn(`⚠️ No valid benefit found in base plan for quote ${rawQuote.key}`, basePlan.benefits);
    throw new Error(`No valid benefit found in base plan for quote ${rawQuote.key}`);
  }

  console.log('💰 Main benefit found:', mainBenefit);
  console.log('🏢 Company data:', rawQuote.company_base);

  const optimized = {
    id: rawQuote.key || '',
    planName: rawQuote.plan_name || '',
    fullPlanName: basePlan.name || '',
    companyName: rawQuote.company_base?.name || '',
    companyFullName: rawQuote.company_base?.name_full || '',
    annualMaximum: parseInt(mainBenefit.amount) || 0,
    monthlyPremium: mainBenefit.rate || 0,
    state: rawQuote.state || '',
    benefitNotes: basePlan.benefit_notes || '',
    limitationNotes: basePlan.limitation_notes || '',
    ambestRating: rawQuote.company_base?.ambest_rating || '',
    ambestOutlook: rawQuote.company_base?.ambest_outlook || '',
    productKey: rawQuote.product_key || '',
    age: rawQuote.age || 0,
    gender: rawQuote.gender,
    tobacco: rawQuote.tobacco
  };

  console.log('✅ Optimized quote:', optimized);
  return optimized;
}

/**
 * Optimizes raw dental quotes response by extracting only essential fields
 */
export function optimizeDentalQuotes(rawResponse: any): OptimizedDentalQuotesResponse {
  try {
    // Calculate original size
    const originalJson = JSON.stringify(rawResponse);
    const originalSize = originalJson.length;
    
    console.log('🎯 Starting dental quotes optimization...');
    console.log('📦 Raw response structure:', {
      success: rawResponse.success,
      quotesCount: rawResponse.quotes?.length,
      firstQuoteKeys: rawResponse.quotes?.[0] ? Object.keys(rawResponse.quotes[0]).slice(0, 10) : []
    });
    
    // Validate response structure
    if (!rawResponse || !rawResponse.quotes || !Array.isArray(rawResponse.quotes)) {
      return {
        success: false,
        quotes: [],
        error: 'Invalid response structure - missing quotes array'
      };
    }
    
    console.log(`📊 Processing ${rawResponse.quotes.length} dental quotes...`);
    
    // Filter quotes to only include those with 2025 last_modified dates
    const current2025Quotes = filter2025Quotes(rawResponse.quotes);
    
    // Extract optimized quotes
    const optimizedQuotes: OptimizedDentalQuote[] = [];
    
    for (let i = 0; i < current2025Quotes.length; i++) {
      try {
        const rawQuote = current2025Quotes[i];
        console.log(`🔍 Processing quote ${i + 1}/${current2025Quotes.length}:`, rawQuote.key);
        
        // Validate the quote structure to ensure we're processing it correctly
        if (!validateQuoteStructure(rawQuote)) {
          console.warn(`⚠️ Skipping quote ${rawQuote.key} due to structure validation failure`);
          continue;
        }
        
        const optimizedQuote = extractQuoteFields(rawQuote);
        optimizedQuotes.push(optimizedQuote);
        
        console.log(`✅ Successfully optimized quote ${i + 1}: ${optimizedQuote.planName} - $${optimizedQuote.monthlyPremium}/mo`);
      } catch (error) {
        console.error(`❌ Failed to process quote ${i + 1}:`, error);
        // Continue with other quotes instead of failing completely
      }
    }
    
    // Calculate optimized size
    const optimizedResponse = {
      success: true,
      quotes: optimizedQuotes
    };
    const optimizedJson = JSON.stringify(optimizedResponse);
    const optimizedSize = optimizedJson.length;
    
    // Calculate compression ratio
    const compressionRatio = originalSize > 0 
      ? `${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`
      : '0%';
    
    console.log(`🎯 Dental quotes optimization complete:`);
    console.log(`   📦 Original size: ${originalSize.toLocaleString()} characters`);
    console.log(`   ✨ Optimized size: ${optimizedSize.toLocaleString()} characters`);
    console.log(`   🚀 Compression: ${compressionRatio} reduction`);
    console.log(`   📊 Quotes processed: ${optimizedQuotes.length}`);
    
    return {
      success: true,
      quotes: optimizedQuotes,
      originalSize,
      optimizedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('❌ Error optimizing dental quotes:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'Unknown optimization error'
    };
  }
}

/**
 * Groups quotes by plan name for display purposes
 */
export function groupQuotesByPlan(quotes: OptimizedDentalQuote[]): { [planName: string]: OptimizedDentalQuote[] } {
  return quotes.reduce((groups, quote) => {
    const planName = quote.planName;
    if (!groups[planName]) {
      groups[planName] = [];
    }
    groups[planName].push(quote);
    return groups;
  }, {} as { [planName: string]: OptimizedDentalQuote[] });
}

/**
 * Sorts quotes by monthly premium (ascending)
 */
export function sortQuotesByPremium(quotes: OptimizedDentalQuote[]): OptimizedDentalQuote[] {
  return [...quotes].sort((a, b) => a.monthlyPremium - b.monthlyPremium);
}

/**
 * Filters quotes by annual maximum range
 */
export function filterQuotesByAnnualMaximum(
  quotes: OptimizedDentalQuote[], 
  minAmount: number, 
  maxAmount: number
): OptimizedDentalQuote[] {
  return quotes.filter(quote => 
    quote.annualMaximum >= minAmount && quote.annualMaximum <= maxAmount
  );
}

/**
 * Gets unique plan names from quotes
 */
export function getUniquePlanNames(quotes: OptimizedDentalQuote[]): string[] {
  const planNames = quotes.map(quote => quote.planName);
  return Array.from(new Set(planNames)).sort();
}

/**
 * Gets unique annual maximum amounts from quotes
 */
export function getUniqueAnnualMaximums(quotes: OptimizedDentalQuote[]): number[] {
  const amounts = quotes.map(quote => quote.annualMaximum);
  return Array.from(new Set(amounts)).sort((a, b) => a - b);
}
