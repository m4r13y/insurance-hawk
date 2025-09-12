import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { FieldMapping, ProductVariationAnalysis } from './types';

/**
 * Groups quotes by product key
 */
export function groupQuotesByProductKey(quotes: OptimizedDentalQuote[]): { [key: string]: OptimizedDentalQuote[] } {
  const groups: { [key: string]: OptimizedDentalQuote[] } = {};
  quotes.forEach(quote => {
    if (!groups[quote.productKey]) {
      groups[quote.productKey] = [];
    }
    groups[quote.productKey].push(quote);
  });
  return groups;
}

/**
 * Generates field mappings for a quote
 */
export function generateFieldMappings(quote: OptimizedDentalQuote, allQuotes: OptimizedDentalQuote[]): FieldMapping[] {
  // Find other variations of the same product
  const sameProductVariations = allQuotes.filter(q => q.productKey === quote.productKey);
  const hasVariations = sameProductVariations.length > 1;
  
  return [
    {
      field: 'productKey',
      rawValue: quote.productKey,
      type: 'string',
      formattedValue: quote.productKey,
      notes: `Main product identifier${hasVariations ? ` (${sameProductVariations.length} variations found)` : ''}`
    },
    {
      field: 'id',
      rawValue: quote.id,
      type: 'string',
      formattedValue: quote.id,
      notes: `Specific variation/instance within product "${quote.productKey}"`
    },
    {
      field: 'planName',
      rawValue: quote.planName,
      type: 'string',
      formattedValue: quote.planName,
      notes: 'Short plan name for display'
    },
    {
      field: 'fullPlanName',
      rawValue: quote.fullPlanName,
      type: 'string',
      formattedValue: quote.fullPlanName,
      notes: 'Complete plan name with full details'
    },
    {
      field: 'companyName',
      rawValue: quote.companyName,
      type: 'string',
      formattedValue: quote.companyName,
      notes: 'Insurance carrier short name'
    },
    {
      field: 'companyFullName',
      rawValue: quote.companyFullName,
      type: 'string',
      formattedValue: quote.companyFullName,
      notes: 'Complete insurance carrier name'
    },
    {
      field: 'monthlyPremium',
      rawValue: quote.monthlyPremium,
      type: 'number',
      formattedValue: `$${quote.monthlyPremium.toFixed(2)}`,
      notes: 'Monthly premium cost in USD'
    },
    {
      field: 'annualMaximum',
      rawValue: quote.annualMaximum,
      type: 'number',
      formattedValue: `$${quote.annualMaximum.toLocaleString()}`,
      notes: 'Maximum annual benefit coverage'
    },
    {
      field: 'state',
      rawValue: quote.state,
      type: 'string',
      formattedValue: quote.state,
      notes: 'State where the plan is available'
    },
    {
      field: 'age',
      rawValue: quote.age,
      type: 'number',
      formattedValue: quote.age.toString(),
      notes: 'Applicant age used for pricing'
    },
    {
      field: 'gender',
      rawValue: quote.gender,
      type: 'string | null',
      formattedValue: quote.gender || 'Not specified',
      notes: 'Applicant gender (if provided)'
    },
    {
      field: 'tobacco',
      rawValue: quote.tobacco,
      type: 'string | null',
      formattedValue: quote.tobacco || 'Not specified',
      notes: 'Tobacco use status affecting premium'
    },
    {
      field: 'ambestRating',
      rawValue: quote.ambestRating,
      type: 'string',
      formattedValue: quote.ambestRating,
      notes: 'AM Best financial strength rating'
    },
    {
      field: 'ambestOutlook',
      rawValue: quote.ambestOutlook,
      type: 'string',
      formattedValue: quote.ambestOutlook,
      notes: 'AM Best rating outlook (Stable, Positive, etc.)'
    },
    {
      field: 'benefitNotes',
      rawValue: quote.benefitNotes,
      type: 'string',
      formattedValue: quote.benefitNotes,
      notes: 'Detailed benefit coverage information'
    },
    {
      field: 'limitationNotes',
      rawValue: quote.limitationNotes,
      type: 'string',
      formattedValue: quote.limitationNotes,
      notes: 'Plan limitations and exclusions'
    }
  ];
}

/**
 * Generates product variation analysis
 */
export function getProductVariationAnalysis(quotes: OptimizedDentalQuote[]): ProductVariationAnalysis[] {
  const groupedQuotes = groupQuotesByProductKey(quotes);
  
  return Object.entries(groupedQuotes).map(([productKey, variations]) => ({
    productKey,
    variationCount: variations.length,
    ids: variations.map(v => v.id),
    premiumRange: {
      min: Math.min(...variations.map(v => v.monthlyPremium)),
      max: Math.max(...variations.map(v => v.monthlyPremium))
    },
    maxBenefitRange: {
      min: Math.min(...variations.map(v => v.annualMaximum)),
      max: Math.max(...variations.map(v => v.annualMaximum))
    }
  }));
}

/**
 * Checks if a quote is selected for comparison
 */
export function isSelectedForComparison(quote: OptimizedDentalQuote, selectedQuotes: OptimizedDentalQuote[]): boolean {
  return selectedQuotes.some(q => q.id === quote.id);
}

/**
 * Toggles a quote in the comparison selection
 */
export function toggleQuoteForComparison(
  quote: OptimizedDentalQuote, 
  selectedQuotes: OptimizedDentalQuote[], 
  maxSelections: number = 3
): OptimizedDentalQuote[] {
  const isAlreadySelected = selectedQuotes.some(q => q.id === quote.id);
  
  if (isAlreadySelected) {
    return selectedQuotes.filter(q => q.id !== quote.id);
  } else if (selectedQuotes.length < maxSelections) {
    return [...selectedQuotes, quote];
  }
  
  return selectedQuotes; // Don't add if already at limit
}
