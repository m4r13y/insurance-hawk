import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { HospitalIndemnityAnalysisResult } from './types';

// Utility functions for hospital indemnity data processing
export function analyzeHospitalIndemnityQuotes(quotes: OptimizedHospitalIndemnityQuote[]): HospitalIndemnityAnalysisResult {
  if (quotes.length === 0) {
    return {
      totalQuotes: 0,
      uniqueCompanies: 0,
      priceRange: { min: 0, max: 0, average: 0 },
      benefitTypes: [],
      riderTypes: []
    };
  }

  const uniqueCompanies = new Set(quotes.map(q => q.companyName)).size;
  const premiums = quotes.map(q => q.monthlyPremium);
  const benefitTypes = new Set<string>();
  const riderTypes = new Set<string>();

  quotes.forEach(quote => {
    quote.basePlans.forEach(plan => benefitTypes.add(plan.name));
    quote.riders.forEach(rider => riderTypes.add(rider.name));
  });

  return {
    totalQuotes: quotes.length,
    uniqueCompanies,
    priceRange: {
      min: Math.min(...premiums),
      max: Math.max(...premiums),
      average: premiums.reduce((sum, premium) => sum + premium, 0) / premiums.length
    },
    benefitTypes: Array.from(benefitTypes),
    riderTypes: Array.from(riderTypes)
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function groupQuotesByCompany(quotes: OptimizedHospitalIndemnityQuote[]): Record<string, OptimizedHospitalIndemnityQuote[]> {
  return quotes.reduce((groups, quote) => {
    const company = quote.companyName;
    if (!groups[company]) {
      groups[company] = [];
    }
    groups[company].push(quote);
    return groups;
  }, {} as Record<string, OptimizedHospitalIndemnityQuote[]>);
}

export function extractUniqueFieldValues(quotes: OptimizedHospitalIndemnityQuote[], fieldPath: string): any[] {
  const values = new Set();
  
  quotes.forEach(quote => {
    const value = getNestedValue(quote, fieldPath);
    if (value !== undefined && value !== null) {
      values.add(value);
    }
  });
  
  return Array.from(values);
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}