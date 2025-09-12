/**
 * Dental Benefit Parser
 * Parses and normalizes HTML-formatted benefit and limitation notes
 * from different carriers into structured data
 */

export interface ParsedBenefitCategory {
  category: string;
  value?: string; // For simple key-value pairs like "Calendar-year Deductible: $100"
  items: string[]; // For list items under the category
  subcategories?: ParsedBenefitCategory[]; // For nested structures
}

export interface ParsedBenefits {
  deductible?: {
    amount: string;
    details?: string[];
  };
  preventiveServices?: {
    coverage: string;
    details?: string[];
  };
  basicServices?: {
    coinsurance: string | { [year: string]: string };
    waitingPeriod?: string;
    details?: string[];
  };
  majorServices?: {
    coinsurance: string | { [year: string]: string };
    waitingPeriod?: string;
    details?: string[];
  };
  vision?: {
    coinsurance?: string | { [year: string]: string };
    benefit?: string;
    maximum?: string;
    details?: string[];
  };
  hearing?: {
    coinsurance?: string | { [year: string]: string };
    benefit?: string;
    maximum?: string;
    details?: string[];
  };
  diagnosticServices?: {
    coinsurance: string;
    waitingPeriod?: string;
    details?: string[];
  };
  other: ParsedBenefitCategory[];
}

export interface ParsedLimitations {
  general?: string[];
  implants?: {
    maximum?: string;
    details?: string[];
  };
  ppoInfo?: string[];
  waitingPeriods?: { [service: string]: string };
  other: ParsedBenefitCategory[];
}

export interface GroupedByAnnualMaximum {
  annualMaximum: number;
  variations: {
    id: string;
    monthlyPremium: number;
    parsedBenefits: ParsedBenefits;
    parsedLimitations: ParsedLimitations;
    rawBenefitNotes: string;
    rawLimitationNotes: string;
  }[];
}

/**
 * Parses HTML benefit/limitation notes into structured categories
 */
export function parseHtmlNotes(htmlString: string): ParsedBenefitCategory[] {
  if (!htmlString) return [];

  const categories: ParsedBenefitCategory[] = [];
  
  // Remove outer tags and split by </ul><ul> to get individual sections
  const sections = htmlString
    .replace(/^<ul>/, '')
    .replace(/<\/ul>$/, '')
    .split('</ul><ul>');

  sections.forEach(section => {
    const category: ParsedBenefitCategory = {
      category: '',
      items: []
    };

    // Extract h5 (category) and li (items)
    const h5Match = section.match(/<h5>(.*?)<\/h5>/);
    if (h5Match) {
      const categoryText = h5Match[1];
      
      // Check if it's a key-value pair (contains colon)
      if (categoryText.includes(':')) {
        const [cat, val] = categoryText.split(':').map(s => s.trim());
        category.category = cat;
        category.value = val;
      } else {
        category.category = categoryText;
      }
    }

    // Extract all list items
    const liMatches = section.match(/<li>(.*?)<\/li>/g);
    if (liMatches) {
      category.items = liMatches.map(li => 
        li.replace(/<\/?li>/g, '').trim()
      );
    }

    if (category.category) {
      categories.push(category);
    }
  });

  return categories;
}

/**
 * Normalizes parsed categories into structured benefits
 */
export function normalizeBenefits(categories: ParsedBenefitCategory[]): ParsedBenefits {
  const benefits: ParsedBenefits = {
    other: []
  };

  categories.forEach(cat => {
    const categoryLower = cat.category.toLowerCase();

    // Deductible
    if (categoryLower.includes('deductible')) {
      benefits.deductible = {
        amount: cat.value || extractValueFromItems(cat.items, 'deductible'),
        details: cat.items.length > 0 ? cat.items : undefined
      };
    }
    // Preventive Services
    else if (categoryLower.includes('preventive')) {
      benefits.preventiveServices = {
        coverage: cat.value || extractCoverageFromItems(cat.items),
        details: cat.items.length > 0 ? cat.items : undefined
      };
    }
    // Diagnostic Services (Mutual of Omaha style)
    else if (categoryLower.includes('diagnostic')) {
      benefits.diagnosticServices = {
        coinsurance: cat.value || extractCoverageFromItems(cat.items),
        details: cat.items.length > 0 ? cat.items : undefined
      };
    }
    // Basic Services
    else if (categoryLower.includes('basic')) {
      const coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      benefits.basicServices = {
        coinsurance: coinsurance || 'Not specified',
        details: cat.items.length > 0 ? cat.items : undefined
      };
    }
    // Major Services
    else if (categoryLower.includes('major')) {
      const coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      benefits.majorServices = {
        coinsurance: coinsurance || 'Not specified',
        details: cat.items.length > 0 ? cat.items : undefined
      };
    }
    // Vision
    else if (categoryLower.includes('vision')) {
      if (!benefits.vision) benefits.vision = {};
      
      if (categoryLower.includes('coinsurance')) {
        benefits.vision.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        benefits.vision.benefit = cat.items.join('; ') || cat.value;
        // Extract maximum from benefit text
        const maxMatch = (cat.items.join(' ') || cat.value || '').match(/\$(\d+)/);
        if (maxMatch) {
          benefits.vision.maximum = maxMatch[0];
        }
      }
      
      if (cat.items.length > 0 && !benefits.vision.details) {
        benefits.vision.details = cat.items;
      }
    }
    // Hearing
    else if (categoryLower.includes('hearing')) {
      if (!benefits.hearing) benefits.hearing = {};
      
      if (categoryLower.includes('coinsurance')) {
        benefits.hearing.coinsurance = extractCoinsuranceLevels(cat.items) || cat.value;
      } else if (categoryLower.includes('benefit')) {
        benefits.hearing.benefit = cat.items.join('; ') || cat.value;
        // Extract maximum from benefit text
        const maxMatch = (cat.items.join(' ') || cat.value || '').match(/\$(\d+)/);
        if (maxMatch) {
          benefits.hearing.maximum = maxMatch[0];
        }
      }
      
      if (cat.items.length > 0 && !benefits.hearing.details) {
        benefits.hearing.details = cat.items;
      }
    }
    // Everything else goes to other
    else {
      benefits.other.push(cat);
    }
  });

  return benefits;
}

/**
 * Normalizes parsed categories into structured limitations
 */
export function normalizeLimitations(categories: ParsedBenefitCategory[]): ParsedLimitations {
  const limitations: ParsedLimitations = {
    other: []
  };

  categories.forEach(cat => {
    const categoryLower = cat.category.toLowerCase();
    const allText = [cat.category, cat.value, ...cat.items].filter(Boolean).join(' ').toLowerCase();

    // General limitations
    if (categoryLower.includes('limitations') && !categoryLower.includes('implant')) {
      limitations.general = cat.items.length > 0 ? cat.items : [cat.value || cat.category];
    }
    // Implant limitations
    else if (allText.includes('implant')) {
      if (!limitations.implants) limitations.implants = {};
      
      const maxMatch = allText.match(/\$(\d+)/);
      if (maxMatch) {
        limitations.implants.maximum = maxMatch[0];
      }
      
      limitations.implants.details = cat.items.length > 0 ? cat.items : [cat.value || cat.category];
    }
    // PPO information
    else if (allText.includes('ppo') || allText.includes('preferred provider')) {
      limitations.ppoInfo = cat.items.length > 0 ? cat.items : [cat.value || cat.category];
    }
    // Everything else
    else {
      limitations.other.push(cat);
    }
  });

  return limitations;
}

/**
 * Helper: Extract coinsurance levels from items (Year 1: 60%, etc.)
 */
function extractCoinsuranceLevels(items: string[]): string | { [year: string]: string } | null {
  if (!items || items.length === 0) return null;

  // Check if it's a simple coverage (like "100% Covered")
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

  // Return the items joined if no pattern matches
  return items.join(', ');
}

/**
 * Helper: Extract coverage percentage from items
 */
function extractCoverageFromItems(items: string[]): string {
  if (!items || items.length === 0) return 'Not specified';
  
  // Look for percentage or "covered" in items
  const coverageItem = items.find(item => 
    item.includes('%') || item.toLowerCase().includes('covered')
  );
  
  return coverageItem || items[0];
}

/**
 * Helper: Extract value from items based on keyword
 */
function extractValueFromItems(items: string[], keyword: string): string {
  if (!items || items.length === 0) return 'Not specified';
  
  const valueItem = items.find(item => 
    item.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return valueItem || items[0];
}

/**
 * Groups quotes by annual maximum and parses their benefits/limitations
 */
export function groupQuotesByAnnualMaximum(quotes: any[]): GroupedByAnnualMaximum[] {
  const groups = new Map<number, any[]>();

  // Group by annual maximum
  quotes.forEach(quote => {
    const max = quote.annualMaximum;
    if (!groups.has(max)) {
      groups.set(max, []);
    }
    groups.get(max)!.push(quote);
  });

  // Convert to structured format with parsed benefits
  return Array.from(groups.entries())
    .map(([annualMaximum, groupQuotes]) => ({
      annualMaximum,
      variations: groupQuotes.map(quote => ({
        id: quote.id,
        monthlyPremium: quote.monthlyPremium,
        parsedBenefits: normalizeBenefits(parseHtmlNotes(quote.benefitNotes)),
        parsedLimitations: normalizeLimitations(parseHtmlNotes(quote.limitationNotes)),
        rawBenefitNotes: quote.benefitNotes,
        rawLimitationNotes: quote.limitationNotes
      }))
    }))
    .sort((a, b) => a.annualMaximum - b.annualMaximum);
}
