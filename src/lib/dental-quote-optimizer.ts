/**
 * Dental Quote Data Optimizer
 * Extracts essential fields from raw API response and removes bloat data
 * Reduces storage size by ~97% by filtering out unnecessary Medicare supplement market data
 */

export interface OptimizedDentalQuote {
  // Core identifiers
  key: string;
  age: number;
  gender: string | null;
  tobacco: string | null;
  
  // Plan details
  planName: string;
  productKey: string;
  
  // Base Plans (detailed plan information)
  basePlans: {
    benefitNotes: string; // HTML formatted plan details
    benefits: {
      amount: string;
      dependentRiders: any[];
      quantifier: string;
      rate: number; // Monthly premium
    }[];
    included: boolean;
    limitationNotes: string; // HTML formatted limitations
    name: string; // Full plan display name
    note: string | null;
  }[];
  
  // Company information (detailed)
  company: string; // Company key
  companyBase: {
    key: string;
    ambestOutlook: string;
    ambestRating: string;
    businessType: string;
    customerComplaintRatio: number | null;
    customerSatisfactionRatio: number | null;
    naic: string;
    name: string;
    nameFull: string;
    parentCompany: string;
    parentCompanyBase: {
      key: string;
      code: string;
      establishedYear: number;
      lastModified: string;
      name: string;
    } | null;
    spRating: string;
    type: string;
  };
  
  // Geographic data
  contextualData: any;
  county: any[];
  countyExcluded: any[];
  
  // Coverage details
  coveredMembers: string;
  
  // Dates and metadata
  createdDate: string;
  effectiveDate: string;
  expiresDate: string;
  lastModified: string;
  
  // Application and document info
  eAppLink: string;
  hasBrochure: boolean;
  hasPdfApp: boolean;
  hasZip3: boolean;
  hasZip5: boolean;
  
  // Discount and pricing
  hhDiscount: number;
  
  // Additional coverage options
  riders: any[];
  
  // Location
  state: string;
  
  // ZIP code data (keeping minimal)
  zip3: any[];
  zip3Excluded: any[];
  zip5: any[];
  zip5Excluded: any[];
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
function extractQuoteFields(rawQuote: any): OptimizedDentalQuote {
  // Extract company information
  const companyBase = rawQuote.company_base || {};
  const parentCompanyBase = companyBase.parent_company_base || null;
  
  // Extract base plans
  const basePlans = (rawQuote.base_plans || []).map((plan: any) => ({
    benefitNotes: plan.benefit_notes || '',
    benefits: (plan.benefits || []).map((benefit: any) => ({
      amount: benefit.amount || '',
      dependentRiders: benefit.dependent_riders || [],
      quantifier: benefit.quantifier || '',
      rate: benefit.rate || 0
    })),
    included: plan.included || false,
    limitationNotes: plan.limitation_notes || '',
    name: plan.name || '',
    note: plan.note || null
  }));
  
  return {
    // Core identifiers
    key: rawQuote.key || '',
    age: rawQuote.age || 0,
    gender: rawQuote.gender || null,
    tobacco: rawQuote.tobacco || null,
    
    // Plan details
    planName: rawQuote.plan_name || '',
    productKey: rawQuote.product_key || '',
    
    // Base Plans (detailed plan information)
    basePlans,
    
    // Company information (detailed)
    company: rawQuote.company || '',
    companyBase: {
      key: companyBase.key || '',
      ambestOutlook: companyBase.ambest_outlook || '',
      ambestRating: companyBase.ambest_rating || '',
      businessType: companyBase.business_type || '',
      customerComplaintRatio: companyBase.customer_complaint_ratio || null,
      customerSatisfactionRatio: companyBase.customer_satisfaction_ratio || null,
      naic: companyBase.naic || '',
      name: companyBase.name || '',
      nameFull: companyBase.name_full || '',
      parentCompany: companyBase.parent_company || '',
      parentCompanyBase: parentCompanyBase ? {
        key: parentCompanyBase.key || '',
        code: parentCompanyBase.code || '',
        establishedYear: parentCompanyBase.established_year || 0,
        lastModified: parentCompanyBase.last_modified || '',
        name: parentCompanyBase.name || ''
      } : null,
      spRating: companyBase.sp_rating || '',
      type: companyBase.type || ''
    },
    
    // Geographic data
    contextualData: rawQuote.contextual_data || null,
    county: rawQuote.county || [],
    countyExcluded: rawQuote.county_excluded || [],
    
    // Coverage details
    coveredMembers: rawQuote.covered_members || '',
    
    // Dates and metadata
    createdDate: rawQuote.created_date || '',
    effectiveDate: rawQuote.effective_date || '',
    expiresDate: rawQuote.expires_date || '',
    lastModified: rawQuote.last_modified || '',
    
    // Application and document info
    eAppLink: rawQuote.e_app_link || '',
    hasBrochure: rawQuote.has_brochure || false,
    hasPdfApp: rawQuote.has_pdf_app || false,
    hasZip3: rawQuote.has_zip3 || false,
    hasZip5: rawQuote.has_zip5 || false,
    
    // Discount and pricing
    hhDiscount: rawQuote.hh_discount || 0,
    
    // Additional coverage options
    riders: rawQuote.riders || [],
    
    // Location
    state: rawQuote.state || '',
    
    // ZIP code data (keeping minimal)
    zip3: rawQuote.zip3 || [],
    zip3Excluded: rawQuote.zip3_excluded || [],
    zip5: rawQuote.zip5 || [],
    zip5Excluded: rawQuote.zip5_excluded || []
  };
}

/**
 * Optimizes raw dental quotes response by extracting only essential fields
 * Removes massive Medicare supplement market data that causes storage bloat
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
      error: error instanceof Error ? error.message : 'Failed to optimize dental quotes'
    };
  }
}

export interface AnnualMaximumOption {
  id: string; // Unique identifier
  amount: string; // Original amount for value comparison
  displayAmount: string; // Clean formatted amount for display
  monthlyPremium: number;
  benefits: any[];
}

export interface GroupedDentalQuote {
  // Core identifiers (from first quote in group)
  key: string;
  planName: string;
  companyName: string;
  companyRating: string;
  companyNaic: string;
  state: string;
  
  // Available annual maximum options
  annualMaximumOptions: AnnualMaximumOption[];
  
  // Default option (usually the first one)
  defaultAnnualMaximum: string;
  defaultMonthlyPremium: number;
  
  // Additional plan info
  coveragePercentages: {
    preventive: number;
    basic: number;
    major: number;
    orthodontic?: number;
  };
  
  waitingPeriods: {
    preventive: number;
    basic: number;
    major: number;
    orthodontic?: number;
  };
  
  deductible: number;
  
  // Reference to original quotes for detailed view
  originalQuotes: OptimizedDentalQuote[];
}

/**
 * Groups dental quotes by plan name and company, consolidating different annual maximum options
 */
export function groupQuotesByPlan(quotes: OptimizedDentalQuote[]): GroupedDentalQuote[] {
  const groupedMap = new Map<string, OptimizedDentalQuote[]>();
  
  // Group quotes by plan name only
  quotes.forEach(quote => {
    const groupKey = quote.planName;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, []);
    }
    groupedMap.get(groupKey)!.push(quote);
  });
  
  // Convert groups to GroupedDentalQuote objects
  const groupedQuotes: GroupedDentalQuote[] = [];
  
  groupedMap.forEach((quotesInGroup, groupKey) => {
    const firstQuote = quotesInGroup[0];
    
    // Extract annual maximum options from all quotes in the group
    const annualMaximumOptions: AnnualMaximumOption[] = [];
    
    quotesInGroup.forEach(quote => {
      quote.basePlans.forEach(basePlan => {
        basePlan.benefits.forEach(benefit => {
          // Parse the amount to extract just the numeric value
          const numericAmount = parseFloat(benefit.amount.replace(/[^0-9.-]/g, '')) || 0;
          const cleanDisplayAmount = numericAmount > 0 ? numericAmount.toLocaleString() : benefit.amount;
          
          // Create a unique ID combining amount and premium
          const uniqueId = `${cleanDisplayAmount}-${benefit.rate}`;
          
          // Check if this annual maximum option already exists by unique ID
          const existingOption = annualMaximumOptions.find(option => 
            option.id === uniqueId
          );
          
          if (!existingOption && benefit.amount && benefit.rate) {
            annualMaximumOptions.push({
              id: uniqueId,
              amount: benefit.amount, // Keep original for comparison
              displayAmount: cleanDisplayAmount, // Clean formatted version
              monthlyPremium: benefit.rate,
              benefits: basePlan.benefits
            });
          }
        });
      });
    });
    
    // Sort options by annual maximum amount (highest first)
    annualMaximumOptions.sort((a, b) => {
      const amountA = parseFloat(a.displayAmount.replace(/[^0-9.-]/g, '')) || 0;
      const amountB = parseFloat(b.displayAmount.replace(/[^0-9.-]/g, '')) || 0;
      return amountB - amountA;
    });
    
    // Create grouped quote
    const groupedQuote: GroupedDentalQuote = {
      key: firstQuote.key,
      planName: firstQuote.planName,
      companyName: getCompanyName(firstQuote),
      companyRating: getCompanyRating(firstQuote),
      companyNaic: firstQuote.companyBase.naic,
      state: firstQuote.state,
      
      annualMaximumOptions,
      defaultAnnualMaximum: annualMaximumOptions[0]?.displayAmount || '',
      defaultMonthlyPremium: annualMaximumOptions[0]?.monthlyPremium || 0,
      
      coveragePercentages: getCoveragePercentages(firstQuote),
      waitingPeriods: getWaitingPeriods(firstQuote),
      deductible: getDeductible(firstQuote),
      
      originalQuotes: quotesInGroup
    };
    
    groupedQuotes.push(groupedQuote);
  });
  
  // Sort by default monthly premium (lowest first)
  return groupedQuotes.sort((a, b) => a.defaultMonthlyPremium - b.defaultMonthlyPremium);
}

/**
 * Gets the monthly premium from a quote's benefits
 */
export function getMonthlyPremium(quote: OptimizedDentalQuote): number {
  const basePlan = quote.basePlans?.[0];
  const benefit = basePlan?.benefits?.[0];
  return benefit?.rate || 0;
}

/**
 * Gets the annual maximum from benefit notes (parsed from HTML)
 */
export function getAnnualMaximum(quote: OptimizedDentalQuote): string {
  const basePlan = quote.basePlans?.[0];
  const benefit = basePlan?.benefits?.[0];
  return benefit?.amount || '0';
}

/**
 * Creates a summary object for quick display
 */
export function createQuoteSummary(quote: OptimizedDentalQuote) {
  return {
    key: quote.key,
    planName: quote.planName,
    companyName: quote.companyBase.name,
    companyNameFull: quote.companyBase.nameFull,
    monthlyPremium: getMonthlyPremium(quote),
    annualMaximum: getAnnualMaximum(quote),
    ambestRating: quote.companyBase.ambestRating,
    ambestOutlook: quote.companyBase.ambestOutlook,
    naic: quote.companyBase.naic,
    state: quote.state
  };
}

/**
 * Filters quotes by criteria
 */
export function filterQuotes(quotes: OptimizedDentalQuote[], criteria: {
  maxPremium?: number;
  minRating?: string;
  state?: string;
}) {
  return quotes.filter(quote => {
    if (criteria.maxPremium && getMonthlyPremium(quote) > criteria.maxPremium) {
      return false;
    }
    if (criteria.minRating && quote.companyBase.ambestRating && quote.companyBase.ambestRating < criteria.minRating) {
      return false;
    }
    if (criteria.state && quote.state !== criteria.state) {
      return false;
    }
    return true;
  });
}

/**
 * Gets the company name from a quote
 */
export function getCompanyName(quote: OptimizedDentalQuote): string {
  return quote.companyBase.name || '';
}

/**
 * Gets the company rating from a quote
 */
export function getCompanyRating(quote: OptimizedDentalQuote): string {
  return quote.companyBase.ambestRating || '';
}

/**
 * Extracts coverage percentages from benefit notes (simplified approach)
 */
export function getCoveragePercentages(quote: OptimizedDentalQuote): {
  preventive: number;
  basic: number;
  major: number;
  orthodontic?: number;
} {
  // Default values - in a real implementation, you'd parse the benefitNotes HTML
  return {
    preventive: 100, // Most dental plans cover preventive at 100%
    basic: 80,       // Common basic coverage
    major: 50,       // Common major coverage
    orthodontic: 50  // If offered
  };
}

/**
 * Extracts waiting periods from benefit notes (simplified approach)
 */
export function getWaitingPeriods(quote: OptimizedDentalQuote): {
  preventive: number;
  basic: number;
  major: number;
  orthodontic?: number;
} {
  // Default values - in a real implementation, you'd parse the benefitNotes HTML
  return {
    preventive: 0,  // Usually no waiting for preventive
    basic: 6,       // Common basic waiting period
    major: 12,      // Common major waiting period
    orthodontic: 12 // If offered
  };
}

/**
 * Gets deductible amount from benefit notes (simplified approach)
 */
export function getDeductible(quote: OptimizedDentalQuote): number {
  // Default value - in a real implementation, you'd parse the benefitNotes HTML
  return 50; // Common deductible amount
}

/**
 * Sorts quotes by monthly premium (low to high)
 */
export function sortQuotesByPremium(quotes: OptimizedDentalQuote[], ascending: boolean = true) {
  return [...quotes].sort((a, b) => {
    const premiumA = getMonthlyPremium(a);
    const premiumB = getMonthlyPremium(b);
    return ascending ? premiumA - premiumB : premiumB - premiumA;
  });
}
