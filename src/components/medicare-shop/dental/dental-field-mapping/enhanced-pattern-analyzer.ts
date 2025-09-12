/**
 * Enhanced Product Pattern Analyzer
 * Detects and analyzes the three main dental product grouping patterns
 */

import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { parseHtmlNotes } from './benefit-parser';

export enum ProductPattern {
  SIMPLE_ANNUAL_MAX = 'simple_annual_max',
  COMPLEX_MULTI_VARIABLE = 'complex_multi_variable', 
  MIXED_ANNUAL_BENEFIT = 'mixed_annual_benefit'
}

export interface ProductPatternAnalysis {
  pattern: ProductPattern;
  confidence: number;
  annualMaxVariations: number;
  benefitVariations: number;
  deductibleVariations: number;
  recommendedUIFlow: 'simple' | 'multi_step' | 'hybrid';
  groupingStrategy: GroupingStrategy;
}

export interface GroupingStrategy {
  primaryGroupBy: 'annualMaximum' | 'benefitTier' | 'hybrid';
  secondaryVariables: string[];
  displayPriority: string[];
}

export interface NormalizedBenefit {
  category: 'preventive' | 'basic' | 'major' | 'vision' | 'hearing' | 'orthodontic';
  coverage: string;
  yearBased: boolean;
  waitingPeriod?: string;
  deductibleApplies: boolean;
  displayName: string;
  rawValue: string;
}

export interface NormalizedQuote extends OptimizedDentalQuote {
  normalizedBenefits: {
    deductible: {
      amount: string;
      hasDisappearingFeature: boolean;
      description: string;
    };
    preventive: NormalizedBenefit;
    basic: NormalizedBenefit;
    major: NormalizedBenefit;
    vision?: NormalizedBenefit;
    hearing?: NormalizedBenefit;
    orthodontic?: NormalizedBenefit;
  };
  benefitTier?: string; // Gold, Platinum, etc.
  planVariation?: string; // 100% Preventive, Disappearing Deductible, etc.
}

/**
 * Analyzes product grouping pattern and determines optimal UI flow
 */
export function analyzeProductPattern(quotes: OptimizedDentalQuote[]): ProductPatternAnalysis {
  if (quotes.length === 0) {
    throw new Error('No quotes provided for pattern analysis');
  }

  // Count variations
  const annualMaxSet = new Set(quotes.map(q => q.annualMaximum));
  const annualMaxVariations = annualMaxSet.size;
  
  // Analyze benefit variations within same annual maximum groups
  const benefitVariations = analyzeBenefitVariationsWithinAnnualMax(quotes);
  
  // Analyze deductible variations
  const deductibleVariations = analyzeDeductibleVariations(quotes);
  
  // Determine pattern based on analysis
  const pattern = determinePattern(annualMaxVariations, benefitVariations, deductibleVariations);
  
  // Calculate confidence based on data consistency
  const confidence = calculatePatternConfidence(quotes, pattern);
  
  // Determine recommended UI flow
  const recommendedUIFlow = getRecommendedUIFlow(pattern, annualMaxVariations, benefitVariations);
  
  // Create grouping strategy
  const groupingStrategy = createGroupingStrategy(pattern, quotes);

  return {
    pattern,
    confidence,
    annualMaxVariations,
    benefitVariations,
    deductibleVariations,
    recommendedUIFlow,
    groupingStrategy
  };
}

/**
 * Normalizes quotes across different carriers to consistent structure
 */
export function normalizeQuotes(quotes: OptimizedDentalQuote[]): NormalizedQuote[] {
  return quotes.map(quote => normalizeQuote(quote));
}

function normalizeQuote(quote: OptimizedDentalQuote): NormalizedQuote {
  const categories = parseHtmlNotes(quote.benefitNotes);
  const companyName = quote.companyName.toLowerCase();
  
  // Company-specific normalization
  if (companyName.includes('loyal american') || companyName.includes('cigna')) {
    return normalizeLoyalAmericanQuote(quote, categories);
  } else if (companyName.includes('ameritas')) {
    return normalizeAmeritasQuote(quote, categories);
  } else if (companyName.includes('medico')) {
    return normalizeMedicoQuote(quote, categories);
  } else {
    return normalizeGenericQuote(quote, categories);
  }
}

function normalizeLoyalAmericanQuote(quote: OptimizedDentalQuote, categories: any[]): NormalizedQuote {
  const normalizedBenefits: NormalizedQuote['normalizedBenefits'] = {
    deductible: extractDeductibleInfo(categories, quote.fullPlanName || ''),
    preventive: normalizePreventiveBenefit(categories, 'loyal_american'),
    basic: normalizeBasicBenefit(categories, 'loyal_american'),
    major: normalizeMajorBenefit(categories, 'loyal_american')
  };

  // Add vision/hearing if present
  const visionBenefit = normalizeVisionBenefit(categories, 'loyal_american');
  const hearingBenefit = normalizeHearingBenefit(categories, 'loyal_american');
  
  if (visionBenefit) normalizedBenefits.vision = visionBenefit;
  if (hearingBenefit) normalizedBenefits.hearing = hearingBenefit;

  // Extract plan variation from fullPlanName
  const planVariation = extractPlanVariation(quote.fullPlanName || '');

  return {
    ...quote,
    normalizedBenefits,
    planVariation
  };
}

function normalizeAmeritasQuote(quote: OptimizedDentalQuote, categories: any[]): NormalizedQuote {
  const normalizedBenefits: NormalizedQuote['normalizedBenefits'] = {
    deductible: extractDeductibleInfo(categories, quote.fullPlanName || ''),
    preventive: normalizePreventiveBenefit(categories, 'ameritas'),
    basic: normalizeBasicBenefit(categories, 'ameritas'),
    major: normalizeMajorBenefit(categories, 'ameritas')
  };

  // Ameritas uses different annual max as main differentiator
  const benefitTier = quote.annualMaximum <= 1000 ? 'Lite' : 'Complete';

  return {
    ...quote,
    normalizedBenefits,
    benefitTier
  };
}

function normalizeMedicoQuote(quote: OptimizedDentalQuote, categories: any[]): NormalizedQuote {
  const normalizedBenefits: NormalizedQuote['normalizedBenefits'] = {
    deductible: extractDeductibleInfo(categories, quote.fullPlanName || ''),
    preventive: normalizePreventiveBenefit(categories, 'medico'),
    basic: normalizeBasicBenefit(categories, 'medico'),
    major: normalizeMajorBenefit(categories, 'medico')
  };

  // Extract benefit tier from plan name (Gold vs Platinum)
  const benefitTier = (quote.fullPlanName || '').toLowerCase().includes('platinum') ? 'Platinum' : 'Gold';

  return {
    ...quote,
    normalizedBenefits,
    benefitTier
  };
}

function normalizeGenericQuote(quote: OptimizedDentalQuote, categories: any[]): NormalizedQuote {
  const normalizedBenefits: NormalizedQuote['normalizedBenefits'] = {
    deductible: extractDeductibleInfo(categories, quote.fullPlanName || ''),
    preventive: normalizePreventiveBenefit(categories, 'generic'),
    basic: normalizeBasicBenefit(categories, 'generic'),
    major: normalizeMajorBenefit(categories, 'generic')
  };

  return {
    ...quote,
    normalizedBenefits
  };
}

function extractDeductibleInfo(categories: any[], planName: string) {
  const deductibleCat = categories.find(cat => 
    cat.category.toLowerCase().includes('deductible')
  );
  
  const amount = extractCurrencyFromText(deductibleCat?.category || deductibleCat?.value || '$0');
  const hasDisappearingFeature = checkForDisappearingDeductible(categories, planName);
  
  return {
    amount,
    hasDisappearingFeature,
    description: deductibleCat?.items?.join(' ') || deductibleCat?.category || 'Standard deductible'
  };
}

function normalizePreventiveBenefit(categories: any[], carrier: string): NormalizedBenefit {
  const preventiveCat = categories.find(cat => 
    cat.category.toLowerCase().includes('preventive') ||
    cat.category.toLowerCase().includes('type 1')
  );

  if (!preventiveCat) {
    return createDefaultBenefit('preventive', '100%', false);
  }

  const coverage = extractCoveragePercentage(preventiveCat.category, preventiveCat.value, preventiveCat.items);
  const yearBased = checkIfYearBased(preventiveCat.items || []);

  return {
    category: 'preventive',
    coverage,
    yearBased,
    deductibleApplies: !coverage.includes('100%'),
    displayName: 'Preventive Services',
    rawValue: preventiveCat.category || ''
  };
}

function normalizeBasicBenefit(categories: any[], carrier: string): NormalizedBenefit {
  const basicCat = categories.find(cat => 
    cat.category.toLowerCase().includes('basic') ||
    cat.category.toLowerCase().includes('type 2')
  );

  if (!basicCat) {
    return createDefaultBenefit('basic', '80%', true);
  }

  const coverage = extractCoveragePercentage(basicCat.category, basicCat.value, basicCat.items);
  const yearBased = checkIfYearBased(basicCat.items || []);

  return {
    category: 'basic',
    coverage,
    yearBased,
    deductibleApplies: true,
    displayName: 'Basic Services',
    rawValue: basicCat.category || ''
  };
}

function normalizeMajorBenefit(categories: any[], carrier: string): NormalizedBenefit {
  const majorCat = categories.find(cat => 
    cat.category.toLowerCase().includes('major') ||
    cat.category.toLowerCase().includes('type 3')
  );

  if (!majorCat) {
    return createDefaultBenefit('major', '50%', true);
  }

  const coverage = extractCoveragePercentage(majorCat.category, majorCat.value, majorCat.items);
  const yearBased = checkIfYearBased(majorCat.items || []);

  return {
    category: 'major',
    coverage,
    yearBased,
    deductibleApplies: true,
    displayName: 'Major Services',
    rawValue: majorCat.category || ''
  };
}

function normalizeVisionBenefit(categories: any[], carrier: string): NormalizedBenefit | null {
  const visionCat = categories.find(cat => 
    cat.category.toLowerCase().includes('vision')
  );

  if (!visionCat) return null;

  const coverage = extractCoveragePercentage(visionCat.category, visionCat.value, visionCat.items);
  const yearBased = checkIfYearBased(visionCat.items || []);

  return {
    category: 'vision',
    coverage,
    yearBased,
    deductibleApplies: true,
    displayName: 'Vision Services',
    rawValue: visionCat.category || ''
  };
}

function normalizeHearingBenefit(categories: any[], carrier: string): NormalizedBenefit | null {
  const hearingCat = categories.find(cat => 
    cat.category.toLowerCase().includes('hearing')
  );

  if (!hearingCat) return null;

  const coverage = extractCoveragePercentage(hearingCat.category, hearingCat.value, hearingCat.items);
  const yearBased = checkIfYearBased(hearingCat.items || []);

  return {
    category: 'hearing',
    coverage,
    yearBased,
    deductibleApplies: true,
    displayName: 'Hearing Services',
    rawValue: hearingCat.category || ''
  };
}

// Helper functions
function analyzeBenefitVariationsWithinAnnualMax(quotes: OptimizedDentalQuote[]): number {
  const groupsByAnnualMax = quotes.reduce((acc, quote) => {
    if (!acc[quote.annualMaximum]) acc[quote.annualMaximum] = [];
    acc[quote.annualMaximum].push(quote);
    return acc;
  }, {} as Record<number, OptimizedDentalQuote[]>);

  let maxVariations = 0;
  Object.values(groupsByAnnualMax).forEach(group => {
    if (group.length > 1) {
      // Check if benefits actually vary within this group
      const benefitHashes = group.map(q => hashBenefitStructure(q.benefitNotes));
      const uniqueBenefits = new Set(benefitHashes);
      maxVariations = Math.max(maxVariations, uniqueBenefits.size);
    }
  });

  return maxVariations;
}

function analyzeDeductibleVariations(quotes: OptimizedDentalQuote[]): number {
  const deductibles = new Set();
  quotes.forEach(quote => {
    const categories = parseHtmlNotes(quote.benefitNotes);
    const deductibleInfo = extractDeductibleInfo(categories, quote.fullPlanName || '');
    deductibles.add(`${deductibleInfo.amount}_${deductibleInfo.hasDisappearingFeature}`);
  });
  return deductibles.size;
}

function determinePattern(annualMaxVariations: number, benefitVariations: number, deductibleVariations: number): ProductPattern {
  // If there are multiple annual maximums AND multiple benefit variations within groups,
  // but the benefit variations are significant (like Loyal American), treat as complex multi-variable
  if (annualMaxVariations > 1 && benefitVariations > 3 && deductibleVariations > 1) {
    return ProductPattern.COMPLEX_MULTI_VARIABLE;
  }
  // Simple pattern: multiple annual max options but minimal benefit variations
  else if (annualMaxVariations > 1 && benefitVariations <= 1 && deductibleVariations <= 1) {
    return ProductPattern.SIMPLE_ANNUAL_MAX;
  } 
  // Complex pattern: same annual max but multiple benefit variables
  else if (annualMaxVariations === 1 && (benefitVariations > 1 || deductibleVariations > 1)) {
    return ProductPattern.COMPLEX_MULTI_VARIABLE;
  } 
  // Mixed pattern: multiple annual max with some benefit variations
  else {
    return ProductPattern.MIXED_ANNUAL_BENEFIT;
  }
}

function calculatePatternConfidence(quotes: OptimizedDentalQuote[], pattern: ProductPattern): number {
  // Calculate confidence based on data consistency and pattern clarity
  const sampleSize = quotes.length;
  if (sampleSize < 2) return 0.5;
  if (sampleSize < 5) return 0.7;
  return 0.9;
}

function getRecommendedUIFlow(pattern: ProductPattern, annualMaxVariations: number, benefitVariations: number): 'simple' | 'multi_step' | 'hybrid' {
  switch (pattern) {
    case ProductPattern.SIMPLE_ANNUAL_MAX:
      return 'simple';
    case ProductPattern.COMPLEX_MULTI_VARIABLE:
      return 'multi_step';
    case ProductPattern.MIXED_ANNUAL_BENEFIT:
      return annualMaxVariations > benefitVariations ? 'hybrid' : 'multi_step';
    default:
      return 'simple';
  }
}

function createGroupingStrategy(pattern: ProductPattern, quotes: OptimizedDentalQuote[]): GroupingStrategy {
  switch (pattern) {
    case ProductPattern.SIMPLE_ANNUAL_MAX:
      return {
        primaryGroupBy: 'annualMaximum',
        secondaryVariables: [],
        displayPriority: ['annualMaximum', 'monthlyPremium']
      };
    case ProductPattern.COMPLEX_MULTI_VARIABLE:
      return {
        primaryGroupBy: 'benefitTier',
        secondaryVariables: ['deductible', 'preventiveOption', 'disappearingDeductible'],
        displayPriority: ['deductible', 'preventiveOption', 'disappearingDeductible', 'monthlyPremium']
      };
    case ProductPattern.MIXED_ANNUAL_BENEFIT:
      return {
        primaryGroupBy: 'hybrid',
        secondaryVariables: ['benefitTier', 'deductible'],
        displayPriority: ['annualMaximum', 'benefitTier', 'monthlyPremium']
      };
    default:
      return {
        primaryGroupBy: 'annualMaximum',
        secondaryVariables: [],
        displayPriority: ['annualMaximum', 'monthlyPremium']
      };
  }
}

function extractCurrencyFromText(text: string): string {
  const match = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return match ? match[0] : '$0';
}

function checkForDisappearingDeductible(categories: any[], planName: string): boolean {
  const searchText = [...categories.map(c => c.category + ' ' + (c.items?.join(' ') || '')), planName].join(' ').toLowerCase();
  return searchText.includes('disappearing') || searchText.includes('reducing');
}

function extractCoveragePercentage(category: string, value: string, items: string[]): string {
  const searchText = [category, value, ...(items || [])].join(' ');
  
  // Look for year-based coverage
  const yearMatches = searchText.match(/year\s*(\d+|\d+\+):\s*(\d+%)/gi);
  if (yearMatches && yearMatches.length > 0) {
    return yearMatches.map(match => {
      const parts = match.split(':');
      return `${parts[0].trim()}: ${parts[1].trim()}`;
    }).join(', ');
  }
  
  // Look for simple percentage
  const percentMatch = searchText.match(/(\d+%)/);
  if (percentMatch) {
    return percentMatch[1];
  }
  
  // Look for "100% covered" pattern
  if (searchText.includes('100%')) {
    return '100%';
  }
  
  return 'See plan details';
}

function checkIfYearBased(items: string[]): boolean {
  const text = items.join(' ').toLowerCase();
  return text.includes('year 1') || text.includes('year 2') || text.includes('after year');
}

function createDefaultBenefit(category: NormalizedBenefit['category'], coverage: string, deductibleApplies: boolean): NormalizedBenefit {
  return {
    category,
    coverage,
    yearBased: false,
    deductibleApplies,
    displayName: category.charAt(0).toUpperCase() + category.slice(1) + ' Services',
    rawValue: 'Default coverage'
  };
}

function extractPlanVariation(planName: string): string {
  const variations = [];
  if (planName.includes('100% Preventive')) variations.push('100% Preventive');
  if (planName.includes('Disappearing Deductible')) variations.push('Disappearing Deductible');
  return variations.join(' + ') || 'Standard';
}

function hashBenefitStructure(benefitNotes: string): string {
  // Create a hash of the benefit structure for comparison
  const categories = parseHtmlNotes(benefitNotes);
  return categories.map(cat => `${cat.category}_${cat.value}_${cat.items?.length || 0}`).join('|');
}
