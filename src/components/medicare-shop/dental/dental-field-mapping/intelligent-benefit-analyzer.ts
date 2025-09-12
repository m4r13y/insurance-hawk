/**
 * Intelligent Benefit Variable Analyzer
 * Analyzes real dental quotes to identify benefit variables vs constants
 * across different carriers and product lines
 */

import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { parseHtmlNotes, ParsedBenefitCategory } from './benefit-parser';

export interface BenefitVariable {
  fieldPath: string; // e.g., 'deductible.amount', 'preventiveServices.coverage'
  displayName: string;
  category: string;
  dataType: 'currency' | 'percentage' | 'boolean' | 'text' | 'yearBased';
  isVariable: boolean;
  constantValue?: any;
  options?: BenefitOption[];
  description: string;
}

export interface BenefitOption {
  value: any;
  displayLabel: string;
  quotesWithThisOption: OptimizedDentalQuote[];
  priceImpact?: {
    averagePremium: number;
    premiumRange: { min: number; max: number };
  };
}

export interface IntelligentPlanAnalysis {
  productKey: string;
  companyName: string;
  totalQuotes: number;
  constants: BenefitVariable[];
  variables: BenefitVariable[];
  annualMaximumGroups: {
    amount: number;
    quotes: OptimizedDentalQuote[];
    variablesInGroup: BenefitVariable[];
  }[];
}

/**
 * Analyzes quotes for a specific product to identify benefit variables
 */
export function analyzeProductBenefitVariables(quotes: OptimizedDentalQuote[]): IntelligentPlanAnalysis {
  if (quotes.length === 0) {
    throw new Error('No quotes provided for analysis');
  }

  const productKey = quotes[0].productKey;
  const companyName = quotes[0].companyName;

  // Parse all benefit structures
  const parsedQuotes = quotes.map(quote => ({
    ...quote,
    parsedBenefits: parseQuoteBenefits(quote)
  }));

  // Group by annual maximum first
  const annualMaxGroups = groupByAnnualMaximum(parsedQuotes);

  // Analyze benefit fields across all quotes
  const allBenefitFields = extractAllBenefitFields(parsedQuotes);
  const constants: BenefitVariable[] = [];
  const variables: BenefitVariable[] = [];

  allBenefitFields.forEach(fieldInfo => {
    const analysis = analyzeBenefitField(parsedQuotes, fieldInfo);
    
    if (analysis.isVariable) {
      variables.push(analysis);
    } else {
      constants.push(analysis);
    }
  });

  // Analyze variables within each annual maximum group
  const annualMaximumGroups = annualMaxGroups.map(group => ({
    amount: group.annualMaximum,
    quotes: group.quotes,
    variablesInGroup: analyzeVariablesInGroup(group.quotes, allBenefitFields)
  }));

  return {
    productKey,
    companyName,
    totalQuotes: quotes.length,
    constants,
    variables,
    annualMaximumGroups
  };
}

/**
 * Parses quote benefits into structured format
 */
function parseQuoteBenefits(quote: OptimizedDentalQuote): any {
  const categories = parseHtmlNotes(quote.benefitNotes);
  const benefits: any = {
    annualMaximum: quote.annualMaximum,
    monthlyPremium: quote.monthlyPremium
  };

  categories.forEach(cat => {
    const categoryLower = cat.category.toLowerCase();

    // Deductible analysis
    if (categoryLower.includes('deductible')) {
      benefits.deductible = {
        amount: extractCurrencyAmount(cat.value || cat.category),
        hasDisappearingFeature: checkForDisappearingDeductible(cat.items, quote.planName || ''),
        details: cat.items
      };
    }
    
    // Preventive services analysis
    else if (categoryLower.includes('preventive')) {
      benefits.preventiveServices = {
        coverage: cat.value || extractCoverageFromItems(cat.items),
        is100Percent: checkFor100PercentPreventive(cat.value, cat.items, quote.planName || ''),
        details: cat.items
      };
    }
    
    // Basic services analysis
    else if (categoryLower.includes('basic')) {
      benefits.basicServices = {
        coinsurance: extractCoinsuranceLevels(cat.items) || cat.value,
        details: cat.items
      };
    }
    
    // Major services analysis
    else if (categoryLower.includes('major')) {
      benefits.majorServices = {
        coinsurance: extractCoinsuranceLevels(cat.items) || cat.value,
        details: cat.items
      };
    }
    
    // Vision analysis
    else if (categoryLower.includes('vision')) {
      if (!benefits.vision) benefits.vision = {};
      
      if (categoryLower.includes('coinsurance')) {
        benefits.vision.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        benefits.vision.maximum = extractCurrencyAmount(cat.items.join(' ') || cat.value || '');
      }
    }
    
    // Hearing analysis
    else if (categoryLower.includes('hearing')) {
      if (!benefits.hearing) benefits.hearing = {};
      
      if (categoryLower.includes('coinsurance')) {
        benefits.hearing.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        benefits.hearing.maximum = extractCurrencyAmount(cat.items.join(' ') || cat.value || '');
      }
    }
  });

  return benefits;
}

/**
 * Groups quotes by annual maximum
 */
function groupByAnnualMaximum(quotes: any[]): { annualMaximum: number; quotes: any[] }[] {
  const groups = new Map<number, any[]>();
  
  quotes.forEach(quote => {
    const max = quote.annualMaximum;
    if (!groups.has(max)) {
      groups.set(max, []);
    }
    groups.get(max)!.push(quote);
  });

  return Array.from(groups.entries())
    .map(([annualMaximum, quotes]) => ({ annualMaximum, quotes }))
    .sort((a, b) => a.annualMaximum - b.annualMaximum);
}

/**
 * Extracts all possible benefit field paths from quotes
 */
function extractAllBenefitFields(quotes: any[]): Array<{
  fieldPath: string;
  displayName: string;
  category: string;
  dataType: string;
  description: string;
}> {
  return [
    {
      fieldPath: 'deductible.amount',
      displayName: 'Calendar-year Deductible',
      category: 'Deductible',
      dataType: 'currency',
      description: 'Annual deductible amount'
    },
    {
      fieldPath: 'deductible.hasDisappearingFeature',
      displayName: 'Disappearing Deductible Feature',
      category: 'Deductible',
      dataType: 'boolean',
      description: 'Optional feature that reduces deductible over time'
    },
    {
      fieldPath: 'preventiveServices.is100Percent',
      displayName: '100% Preventive Coverage',
      category: 'Preventive',
      dataType: 'boolean',
      description: '100% coverage for preventive services'
    },
    {
      fieldPath: 'preventiveServices.coverage',
      displayName: 'Preventive Services Coverage',
      category: 'Preventive',
      dataType: 'percentage',
      description: 'Coverage percentage for preventive care'
    },
    {
      fieldPath: 'basicServices.coinsurance',
      displayName: 'Basic Services Coinsurance',
      category: 'Basic Services',
      dataType: 'yearBased',
      description: 'Coinsurance levels for basic dental services'
    },
    {
      fieldPath: 'majorServices.coinsurance',
      displayName: 'Major Services Coinsurance',
      category: 'Major Services',
      dataType: 'yearBased',
      description: 'Coinsurance levels for major dental work'
    },
    {
      fieldPath: 'vision.maximum',
      displayName: 'Vision Benefit Maximum',
      category: 'Vision',
      dataType: 'currency',
      description: 'Maximum vision benefit amount'
    },
    {
      fieldPath: 'hearing.maximum',
      displayName: 'Hearing Benefit Maximum',
      category: 'Hearing',
      dataType: 'currency',
      description: 'Maximum hearing benefit amount'
    }
  ];
}

/**
 * Analyzes a specific benefit field across all quotes
 */
function analyzeBenefitField(quotes: any[], fieldInfo: any): BenefitVariable {
  const values = quotes.map(quote => getNestedValue(quote.parsedBenefits, fieldInfo.fieldPath))
    .filter(v => v !== null && v !== undefined);

  if (values.length === 0) {
    return {
      ...fieldInfo,
      isVariable: false,
      constantValue: null
    };
  }

  // Check if all values are the same (constant)
  const uniqueValues = Array.from(new Set(values.map(v => JSON.stringify(v))));
  
  if (uniqueValues.length === 1) {
    return {
      ...fieldInfo,
      isVariable: false,
      constantValue: JSON.parse(uniqueValues[0])
    };
  }

  // Variable - create options
  const optionsMap = new Map<string, BenefitOption>();
  
  quotes.forEach(quote => {
    const value = getNestedValue(quote.parsedBenefits, fieldInfo.fieldPath);
    if (value !== null && value !== undefined) {
      const valueKey = JSON.stringify(value);
      
      if (!optionsMap.has(valueKey)) {
        optionsMap.set(valueKey, {
          value: value,
          displayLabel: formatValueForDisplay(value, fieldInfo.dataType),
          quotesWithThisOption: [],
          priceImpact: { averagePremium: 0, premiumRange: { min: 0, max: 0 } }
        });
      }
      
      optionsMap.get(valueKey)!.quotesWithThisOption.push(quote);
    }
  });

  // Calculate price impact for each option
  const options = Array.from(optionsMap.values()).map(option => {
    const premiums = option.quotesWithThisOption.map(q => q.monthlyPremium);
    return {
      ...option,
      priceImpact: {
        averagePremium: premiums.reduce((sum, p) => sum + p, 0) / premiums.length,
        premiumRange: {
          min: Math.min(...premiums),
          max: Math.max(...premiums)
        }
      }
    };
  });

  return {
    ...fieldInfo,
    isVariable: true,
    options: options.sort((a, b) => a.priceImpact!.averagePremium - b.priceImpact!.averagePremium)
  };
}

/**
 * Analyzes variables within a specific annual maximum group
 */
function analyzeVariablesInGroup(quotes: any[], allFields: any[]): BenefitVariable[] {
  return allFields.map(fieldInfo => {
    const analysis = analyzeBenefitField(quotes, fieldInfo);
    return analysis;
  }).filter(analysis => analysis.isVariable);
}

/**
 * Helper functions
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function extractCurrencyAmount(text: string): string {
  const match = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return match ? match[0] : '$0';
}

function checkForDisappearingDeductible(items: string[], planName: string): boolean {
  const searchText = [...items, planName].join(' ').toLowerCase();
  return searchText.includes('disappearing') || searchText.includes('reducing');
}

function checkFor100PercentPreventive(value: string = '', items: string[], planName: string): boolean {
  const searchText = [value, ...items, planName].join(' ').toLowerCase();
  return searchText.includes('100%') && searchText.includes('preventive');
}

function extractCoverageFromItems(items: string[]): string {
  const coverageItem = items.find(item => 
    item.includes('%') || item.toLowerCase().includes('covered')
  );
  return coverageItem || 'Not specified';
}

function extractCoinsuranceLevels(items: string[]): string | { [year: string]: string } | null {
  if (!items || items.length === 0) return null;

  // Check for year-based coinsurance
  const yearPattern = /year\s*(\d+|\d+\+):\s*(\d+%)/i;
  const yearBased: { [year: string]: string } = {};
  let hasYearBased = false;

  items.forEach(item => {
    const match = item.match(yearPattern);
    if (match) {
      yearBased[`Year ${match[1]}`] = match[2];
      hasYearBased = true;
    }
  });

  if (hasYearBased) return yearBased;

  // Simple coverage
  const simplePattern = /(\d+%\s*covered|100%|covered)/i;
  if (items.length === 1 && simplePattern.test(items[0])) {
    return items[0];
  }

  return items.join(', ');
}

function formatValueForDisplay(value: any, dataType: string): string {
  if (dataType === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (dataType === 'currency') {
    if (typeof value === 'string' && value.startsWith('$')) {
      return value;
    }
    return `$${value}`;
  }
  
  if (dataType === 'percentage') {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    return `${value}%`;
  }
  
  if (dataType === 'yearBased' && typeof value === 'object') {
    return Object.entries(value)
      .map(([year, percent]) => `${year}: ${percent}`)
      .join(', ');
  }
  
  return String(value);
}
