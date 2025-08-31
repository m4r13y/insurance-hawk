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
 * Sorts quotes by monthly premium (low to high)
 */
export function sortQuotesByPremium(quotes: OptimizedDentalQuote[], ascending: boolean = true) {
  return [...quotes].sort((a, b) => {
    const premiumA = getMonthlyPremium(a);
    const premiumB = getMonthlyPremium(b);
    return ascending ? premiumA - premiumB : premiumB - premiumA;
  });
}
