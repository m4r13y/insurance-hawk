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
  planName: string;
  name: string; // Full plan name
  state: string;
  benefits: Array<{
    amount: string;
    rate: number;
    quantifier: string;
    dependentRiders: any[];
    included: boolean;
  }>;
  benefitNotes: string;
  limitationNotes: string;
  companyBase: {
    key: string;
    name: string;
    nameFull: string;
    naic: string;
    ambestRating: string;
    ambestOutlook: string;
  };
  productKey: string;
  riders: any[];
  tobacco: string | null;
}

// Types for optimized dental quotes
export interface OptimizedDentalQuote {
  id: string;
  planName: string;
  fullPlanName: string;
  companyName: string;
  companyFullName: string;
  naic: string;
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
 * Extracts essential fields from a single raw dental quote
 */
function extractQuoteFields(rawQuote: RawDentalQuote): OptimizedDentalQuote {
  // Get the main benefit (should be first one with included: true)
  const mainBenefit = rawQuote.benefits?.find(b => b.included) || rawQuote.benefits?.[0];
  
  if (!mainBenefit) {
    throw new Error(`No valid benefit found for quote ${rawQuote.key}`);
  }

  return {
    id: rawQuote.key,
    planName: rawQuote.planName,
    fullPlanName: rawQuote.name,
    companyName: rawQuote.companyBase?.name || '',
    companyFullName: rawQuote.companyBase?.nameFull || '',
    naic: rawQuote.companyBase?.naic || '',
    annualMaximum: parseInt(mainBenefit.amount) || 0,
    monthlyPremium: mainBenefit.rate || 0,
    state: rawQuote.state,
    benefitNotes: rawQuote.benefitNotes || '',
    limitationNotes: rawQuote.limitationNotes || '',
    ambestRating: rawQuote.companyBase?.ambestRating || '',
    ambestOutlook: rawQuote.companyBase?.ambestOutlook || '',
    productKey: rawQuote.productKey,
    age: rawQuote.age,
    gender: rawQuote.gender,
    tobacco: rawQuote.tobacco
  };
}

/**
 * Optimizes raw dental quotes response by extracting only essential fields
 */
export function optimizeDentalQuotes(rawResponse: any): OptimizedDentalQuotesResponse {
  try {
    // Calculate original size
    const originalJson = JSON.stringify(rawResponse);
    const originalSize = originalJson.length;
    
    // Validate response structure
    if (!rawResponse || !rawResponse.quotes || !Array.isArray(rawResponse.quotes)) {
      return {
        success: false,
        quotes: [],
        error: 'Invalid response structure - missing quotes array'
      };
    }
    
    // Extract optimized quotes
    const optimizedQuotes: OptimizedDentalQuote[] = rawResponse.quotes.map((rawQuote: any) => {
      return extractQuoteFields(rawQuote);
    });
    
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
  return [...new Set(planNames)].sort();
}

/**
 * Gets unique annual maximum amounts from quotes
 */
export function getUniqueAnnualMaximums(quotes: OptimizedDentalQuote[]): number[] {
  const amounts = quotes.map(quote => quote.annualMaximum);
  return [...new Set(amounts)].sort((a, b) => a - b);
}
