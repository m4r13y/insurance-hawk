/**
 * Advanced Benefit Analysis for Plan Builder
 * Extracts actual plan variables (deductible options, features) rather than using cost as variable
 */

import { parseHtmlNotes } from './benefit-parser';
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';

export interface PlanVariable {
  name: string;
  type: 'currency' | 'boolean' | 'percentage' | 'text';
  options: PlanVariableOption[];
}

export interface PlanVariableOption {
  value: any;
  displayValue: string;
  affectedQuotes: OptimizedDentalQuote[];
}

export interface AnalyzedPlanGroup {
  productKey: string;
  annualMaximum: number;
  variables: PlanVariable[];
  quotes: OptimizedDentalQuote[];
}

/**
 * Analyzes plan variations to extract actual benefit variables
 */
export function analyzePlanBenefitVariables(quotes: OptimizedDentalQuote[]): AnalyzedPlanGroup[] {
  // Group by product key and annual maximum
  const groups = new Map<string, Map<number, OptimizedDentalQuote[]>>();
  
  quotes.forEach(quote => {
    const key = quote.productKey;
    if (!groups.has(key)) {
      groups.set(key, new Map());
    }
    
    const productGroup = groups.get(key)!;
    if (!productGroup.has(quote.annualMaximum)) {
      productGroup.set(quote.annualMaximum, []);
    }
    
    productGroup.get(quote.annualMaximum)!.push(quote);
  });

  const analyzedGroups: AnalyzedPlanGroup[] = [];

  // Analyze each group
  groups.forEach((annualMaxGroups, productKey) => {
    annualMaxGroups.forEach((groupQuotes, annualMaximum) => {
      const variables = extractVariablesFromQuotes(groupQuotes);
      
      analyzedGroups.push({
        productKey,
        annualMaximum,
        variables,
        quotes: groupQuotes
      });
    });
  });

  return analyzedGroups;
}

/**
 * Extracts variables from a group of quotes with the same annual maximum
 */
function extractVariablesFromQuotes(quotes: OptimizedDentalQuote[]): PlanVariable[] {
  const variables: PlanVariable[] = [];

  // Parse all benefit notes to extract structured data
  const parsedQuotes = quotes.map(quote => ({
    quote,
    parsedBenefits: parseHtmlNotes(quote.benefitNotes)
  }));

  // Analyze Calendar-year Deductible
  const deductibleVariable = analyzeDeductibleVariable(parsedQuotes);
  if (deductibleVariable) {
    variables.push(deductibleVariable);
  }

  // Analyze Disappearing Deductible Feature
  const disappearingDeductibleVariable = analyzeDisappearingDeductibleVariable(parsedQuotes);
  if (disappearingDeductibleVariable) {
    variables.push(disappearingDeductibleVariable);
  }

  // Analyze Preventive Services Coverage
  const preventiveVariable = analyzePreventiveVariable(parsedQuotes);
  if (preventiveVariable) {
    variables.push(preventiveVariable);
  }

  // Analyze other potential variables
  const otherVariables = analyzeOtherVariables(parsedQuotes);
  variables.push(...otherVariables);

  return variables;
}

/**
 * Analyzes deductible amounts across quotes
 */
function analyzeDeductibleVariable(parsedQuotes: any[]): PlanVariable | null {
  const deductibleValues = new Map<string, OptimizedDentalQuote[]>();

  parsedQuotes.forEach(({ quote, parsedBenefits }) => {
    // Look for deductible in parsed benefits
    const deductibleCategory = parsedBenefits.find((cat: any) => 
      cat.category.toLowerCase().includes('deductible')
    );

    if (deductibleCategory) {
      const value = deductibleCategory.value || 'Not specified';
      
      if (!deductibleValues.has(value)) {
        deductibleValues.set(value, []);
      }
      deductibleValues.get(value)!.push(quote);
    }
  });

  // Only return as variable if there are multiple different values
  if (deductibleValues.size > 1) {
    const options: PlanVariableOption[] = Array.from(deductibleValues.entries()).map(([value, quotes]) => ({
      value,
      displayValue: value.startsWith('$') ? value : `$${value}`,
      affectedQuotes: quotes
    }));

    return {
      name: 'Calendar-year Deductible',
      type: 'currency',
      options
    };
  }

  return null;
}

/**
 * Analyzes disappearing deductible feature
 */
function analyzeDisappearingDeductibleVariable(parsedQuotes: any[]): PlanVariable | null {
  const featureValues = new Map<boolean, OptimizedDentalQuote[]>();

  parsedQuotes.forEach(({ quote, parsedBenefits }) => {
    // Look for disappearing deductible mentions
    const hasDisappearingDeductible = parsedBenefits.some((cat: any) => {
      const allText = [cat.category, cat.value, ...cat.items].join(' ').toLowerCase();
      return allText.includes('disappearing') && allText.includes('deductible');
    });

    if (!featureValues.has(hasDisappearingDeductible)) {
      featureValues.set(hasDisappearingDeductible, []);
    }
    featureValues.get(hasDisappearingDeductible)!.push(quote);
  });

  // Only return as variable if there are both true and false values
  if (featureValues.size > 1) {
    const options: PlanVariableOption[] = Array.from(featureValues.entries()).map(([hasFeature, quotes]) => ({
      value: hasFeature,
      displayValue: hasFeature ? 'Yes - Disappearing Deductible' : 'No - Standard Deductible',
      affectedQuotes: quotes
    }));

    return {
      name: 'Disappearing Deductible Feature',
      type: 'boolean',
      options
    };
  }

  return null;
}

/**
 * Analyzes preventive services coverage
 */
function analyzePreventiveVariable(parsedQuotes: any[]): PlanVariable | null {
  const preventiveValues = new Map<string, OptimizedDentalQuote[]>();

  parsedQuotes.forEach(({ quote, parsedBenefits }) => {
    // Look for preventive services coverage
    const preventiveCategory = parsedBenefits.find((cat: any) => 
      cat.category.toLowerCase().includes('preventive')
    );

    if (preventiveCategory) {
      const coverage = preventiveCategory.value || 
                     (preventiveCategory.items.length > 0 ? preventiveCategory.items[0] : 'Not specified');
      
      if (!preventiveValues.has(coverage)) {
        preventiveValues.set(coverage, []);
      }
      preventiveValues.get(coverage)!.push(quote);
    }
  });

  // Only return as variable if there are multiple different values
  if (preventiveValues.size > 1) {
    const options: PlanVariableOption[] = Array.from(preventiveValues.entries()).map(([value, quotes]) => ({
      value,
      displayValue: value.includes('100%') ? '100% Covered' : value,
      affectedQuotes: quotes
    }));

    return {
      name: 'Preventive Services Coverage',
      type: 'percentage',
      options
    };
  }

  return null;
}

/**
 * Analyzes other potential variables like basic/major services coinsurance
 */
function analyzeOtherVariables(parsedQuotes: any[]): PlanVariable[] {
  const variables: PlanVariable[] = [];

  // Analyze Basic Services Coinsurance
  const basicServicesVariable = analyzeServiceCoinsurance(parsedQuotes, 'basic');
  if (basicServicesVariable) {
    variables.push(basicServicesVariable);
  }

  // Analyze Major Services Coinsurance
  const majorServicesVariable = analyzeServiceCoinsurance(parsedQuotes, 'major');
  if (majorServicesVariable) {
    variables.push(majorServicesVariable);
  }

  return variables;
}

/**
 * Analyzes service coinsurance variations
 */
function analyzeServiceCoinsurance(parsedQuotes: any[], serviceType: 'basic' | 'major'): PlanVariable | null {
  const coinsuranceValues = new Map<string, OptimizedDentalQuote[]>();

  parsedQuotes.forEach(({ quote, parsedBenefits }) => {
    const serviceCategory = parsedBenefits.find((cat: any) => 
      cat.category.toLowerCase().includes(serviceType) && 
      cat.category.toLowerCase().includes('coinsurance')
    );

    if (serviceCategory) {
      let coinsuranceKey: string;
      
      if (serviceCategory.items && serviceCategory.items.length > 0) {
        // Year-based coinsurance - create a summary key
        coinsuranceKey = serviceCategory.items.join(', ');
      } else {
        coinsuranceKey = serviceCategory.value || 'Not specified';
      }
      
      if (!coinsuranceValues.has(coinsuranceKey)) {
        coinsuranceValues.set(coinsuranceKey, []);
      }
      coinsuranceValues.get(coinsuranceKey)!.push(quote);
    }
  });

  // Only return as variable if there are multiple different values
  if (coinsuranceValues.size > 1) {
    const options: PlanVariableOption[] = Array.from(coinsuranceValues.entries()).map(([value, quotes]) => ({
      value,
      displayValue: formatCoinsuranceDisplay(value),
      affectedQuotes: quotes
    }));

    return {
      name: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Services Coinsurance`,
      type: 'text',
      options
    };
  }

  return null;
}

/**
 * Formats coinsurance display value
 */
function formatCoinsuranceDisplay(value: string): string {
  // If it's a simple percentage, return as-is
  if (value.includes('%') && !value.includes('Year')) {
    return value;
  }
  
  // If it's year-based, create a summary
  if (value.includes('Year')) {
    const yearMatches = value.match(/Year \d+[+]?: \d+%/g);
    if (yearMatches && yearMatches.length > 1) {
      return `Progressive: ${yearMatches[0]} → ${yearMatches[yearMatches.length - 1]}`;
    }
  }
  
  return value;
}

/**
 * Finds quotes that match selected variable values
 */
export function findQuotesMatchingSelections(
  group: AnalyzedPlanGroup,
  selections: { [variableName: string]: any }
): OptimizedDentalQuote[] {
  if (Object.keys(selections).length === 0) {
    return group.quotes;
  }

  // Start with all quotes and filter by each selection
  let matchingQuotes = [...group.quotes];

  group.variables.forEach(variable => {
    const selectedValue = selections[variable.name];
    if (selectedValue !== undefined) {
      // Find the option that matches the selected value
      const matchingOption = variable.options.find(option => 
        JSON.stringify(option.value) === JSON.stringify(selectedValue)
      );
      
      if (matchingOption) {
        // Intersect with quotes that have this option
        matchingQuotes = matchingQuotes.filter(quote => 
          matchingOption.affectedQuotes.some(affectedQuote => affectedQuote.id === quote.id)
        );
      }
    }
  });

  return matchingQuotes;
}
