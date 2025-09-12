/**
 * Plan Builder Parser
 * Identifies constants vs variables in dental plan benefits for plan building
 */

import { ParsedBenefitCategory, parseHtmlNotes, ParsedBenefits, ParsedLimitations } from './benefit-parser';
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';

export interface VariableOption {
  id: string;
  value: string | { [year: string]: string };
  monthlyPremium: number;
  annualMaximum: number;
  displayLabel: string;
}

export interface BenefitVariable {
  category: string;
  field: string; // e.g., 'deductible.amount', 'basicServices.coinsurance'
  isVariable: boolean;
  constantValue?: string | { [year: string]: string };
  options?: VariableOption[];
  description: string;
}

export interface PlanBuilderData {
  productKey: string;
  companyName: string;
  constants: BenefitVariable[];
  variables: BenefitVariable[];
  allQuotes: OptimizedDentalQuote[];
}

/**
 * Analyzes variations within a productKey to identify constants vs variables
 */
export function analyzePlanVariations(quotes: OptimizedDentalQuote[]): PlanBuilderData {
  if (quotes.length === 0) {
    throw new Error('No quotes provided for analysis');
  }

  const productKey = quotes[0].productKey;
  const companyName = quotes[0].companyName;

  // Parse all quotes to get structured benefits
  const parsedQuotes = quotes.map(quote => ({
    ...quote,
    parsedBenefits: parseQuoteStructure(quote),
    parsedLimitations: parseQuoteLimitations(quote)
  }));

  // Analyze each benefit field to determine if it's constant or variable
  const benefitFields = [
    { field: 'deductible.amount', category: 'Deductible', description: 'Annual deductible amount' },
    { field: 'preventiveServices.coverage', category: 'Preventive Services', description: 'Coverage percentage for preventive care' },
    { field: 'diagnosticServices.coinsurance', category: 'Diagnostic Services', description: 'Coinsurance for diagnostic services' },
    { field: 'basicServices.coinsurance', category: 'Basic Services', description: 'Coinsurance for basic dental services' },
    { field: 'majorServices.coinsurance', category: 'Major Services', description: 'Coinsurance for major dental work' },
    { field: 'vision.coinsurance', category: 'Vision', description: 'Vision benefit coinsurance' },
    { field: 'vision.maximum', category: 'Vision', description: 'Vision benefit maximum' },
    { field: 'hearing.coinsurance', category: 'Hearing', description: 'Hearing benefit coinsurance' },
    { field: 'hearing.maximum', category: 'Hearing', description: 'Hearing benefit maximum' },
    { field: 'annualMaximum', category: 'Coverage', description: 'Annual maximum benefit' },
    { field: 'monthlyPremium', category: 'Cost', description: 'Monthly premium' }
  ];

  const constants: BenefitVariable[] = [];
  const variables: BenefitVariable[] = [];

  benefitFields.forEach(fieldInfo => {
    const values = parsedQuotes.map(quote => getFieldValue(quote, fieldInfo.field)).filter(v => v !== null);
    
    if (values.length === 0) return; // Skip if no values found

    const uniqueValues = Array.from(new Set(values.map(v => JSON.stringify(v))));
    
    if (uniqueValues.length === 1) {
      // Constant value across all quotes
      constants.push({
        category: fieldInfo.category,
        field: fieldInfo.field,
        isVariable: false,
        constantValue: JSON.parse(uniqueValues[0]),
        description: fieldInfo.description
      });
    } else {
      // Variable value - create options
      const options: VariableOption[] = [];
      const valueToQuotes = new Map<string, OptimizedDentalQuote[]>();
      
      // Group quotes by this field value
      parsedQuotes.forEach(quote => {
        const value = getFieldValue(quote, fieldInfo.field);
        if (value !== null) {
          const valueKey = JSON.stringify(value);
          if (!valueToQuotes.has(valueKey)) {
            valueToQuotes.set(valueKey, []);
          }
          valueToQuotes.get(valueKey)!.push(quote);
        }
      });

      // Create options from unique values
      Array.from(valueToQuotes.entries()).forEach(([valueKey, quotesWithValue], index) => {
        const value = JSON.parse(valueKey);
        const representativeQuote = quotesWithValue[0];
        
        options.push({
          id: `${fieldInfo.field}-option-${index}`,
          value: value,
          monthlyPremium: representativeQuote.monthlyPremium,
          annualMaximum: representativeQuote.annualMaximum,
          displayLabel: formatValueForDisplay(value, fieldInfo.field)
        });
      });

      variables.push({
        category: fieldInfo.category,
        field: fieldInfo.field,
        isVariable: true,
        options: options.sort((a, b) => a.monthlyPremium - b.monthlyPremium),
        description: fieldInfo.description
      });
    }
  });

  return {
    productKey,
    companyName,
    constants,
    variables,
    allQuotes: quotes
  };
}

/**
 * Gets a nested field value from a quote object
 */
function getFieldValue(quote: any, fieldPath: string): any {
  const parts = fieldPath.split('.');
  let current = quote;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Parses quote structure for benefit analysis
 */
function parseQuoteStructure(quote: OptimizedDentalQuote): any {
  const categories = parseHtmlNotes(quote.benefitNotes);
  const structured: any = {};

  categories.forEach(cat => {
    const categoryLower = cat.category.toLowerCase();

    if (categoryLower.includes('deductible')) {
      structured.deductible = { amount: cat.value || 'Not specified' };
    } else if (categoryLower.includes('preventive')) {
      structured.preventiveServices = { coverage: cat.value || extractCoverageFromItems(cat.items) };
    } else if (categoryLower.includes('diagnostic')) {
      structured.diagnosticServices = { coinsurance: cat.value || extractCoverageFromItems(cat.items) };
    } else if (categoryLower.includes('basic')) {
      structured.basicServices = { coinsurance: extractCoinsuranceLevels(cat.items) || cat.value };
    } else if (categoryLower.includes('major')) {
      structured.majorServices = { coinsurance: extractCoinsuranceLevels(cat.items) || cat.value };
    } else if (categoryLower.includes('vision')) {
      if (!structured.vision) structured.vision = {};
      if (categoryLower.includes('coinsurance')) {
        structured.vision.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        const maxMatch = (cat.items.join(' ') || cat.value || '').match(/\$(\d+)/);
        if (maxMatch) {
          structured.vision.maximum = maxMatch[0];
        }
      }
    } else if (categoryLower.includes('hearing')) {
      if (!structured.hearing) structured.hearing = {};
      if (categoryLower.includes('coinsurance')) {
        structured.hearing.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        const maxMatch = (cat.items.join(' ') || cat.value || '').match(/\$(\d+)/);
        if (maxMatch) {
          structured.hearing.maximum = maxMatch[0];
        }
      }
    }
  });

  // Add direct quote fields
  structured.annualMaximum = quote.annualMaximum;
  structured.monthlyPremium = quote.monthlyPremium;

  return structured;
}

/**
 * Parses quote limitations (simplified for now)
 */
function parseQuoteLimitations(quote: OptimizedDentalQuote): any {
  return parseHtmlNotes(quote.limitationNotes);
}

/**
 * Helper: Extract coinsurance levels from items
 */
function extractCoinsuranceLevels(items: string[]): string | { [year: string]: string } | null {
  if (!items || items.length === 0) return null;

  // Check if it's a simple coverage
  const simplePattern = /(\d+%\s*covered|100%|covered)/i;
  if (items.length === 1 && simplePattern.test(items[0])) {
    return items[0];
  }

  // Check if it's year-based coinsurance
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

  if (hasYearBased) {
    return yearBased;
  }

  return items.join(', ');
}

/**
 * Helper: Extract coverage percentage from items
 */
function extractCoverageFromItems(items: string[]): string {
  if (!items || items.length === 0) return 'Not specified';
  
  const coverageItem = items.find(item => 
    item.includes('%') || item.toLowerCase().includes('covered')
  );
  
  return coverageItem || items[0];
}

/**
 * Formats a value for display in dropdowns
 */
function formatValueForDisplay(value: any, fieldPath: string): string {
  if (typeof value === 'string') {
    if (fieldPath.includes('Premium')) {
      return `$${parseFloat(value).toFixed(2)}/month`;
    }
    if (fieldPath.includes('Maximum') || fieldPath.includes('Deductible')) {
      return value.startsWith('$') ? value : `$${value}`;
    }
    return value;
  }
  
  if (typeof value === 'number') {
    if (fieldPath.includes('Premium')) {
      return `$${value.toFixed(2)}/month`;
    }
    if (fieldPath.includes('Maximum')) {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  }
  
  if (typeof value === 'object' && value !== null) {
    // Handle year-based coinsurance
    return Object.entries(value)
      .map(([year, percent]) => `${year}: ${percent}`)
      .join(', ');
  }
  
  return String(value);
}

/**
 * Finds a matching quote based on selected options
 */
export function findMatchingQuote(
  selections: { [field: string]: any },
  allQuotes: OptimizedDentalQuote[]
): OptimizedDentalQuote | null {
  // Parse all quotes first
  const parsedQuotes = allQuotes.map(quote => ({
    ...quote,
    parsedBenefits: parseQuoteStructure(quote)
  }));

  // Find quote that matches all selections
  for (const quote of parsedQuotes) {
    let matches = true;
    
    for (const [field, selectedValue] of Object.entries(selections)) {
      const quoteValue = getFieldValue(quote, field);
      
      if (JSON.stringify(quoteValue) !== JSON.stringify(selectedValue)) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return quote;
    }
  }
  
  return null;
}
