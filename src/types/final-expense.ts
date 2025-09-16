// Final Expense Life Insurance Types

export interface FinalExpenseCarrier {
  name: string;
  full_name?: string;
  logo_url?: string | null;
}

export interface FinalExpenseCompanyBase {
  key?: string;
  name?: string;
  full_name?: string;
  logo_url?: string | null;
}

export interface FinalExpenseQuote {
  id?: string;
  monthly_rate: number;
  annual_rate: number;
  face_value: number;
  face_amount_min?: number;
  face_amount_max?: number;
  
  // Carrier information
  carrier?: FinalExpenseCarrier | null;
  company_name?: string;
  company_base?: FinalExpenseCompanyBase;
  
  // Plan details
  plan_name?: string;
  benefit_name?: string;
  naic?: string;
  
  // Dates
  effective_date?: string;
  expires_date?: string;
  
  // Underwriting
  underwriting_type?: 'guaranteed' | 'simplified' | 'full';
  
  // Ratings and fees
  am_best_rating?: string;
  monthly_fee?: number;
  annual_fee?: number;
  
  // Application options
  is_down_payment_plan?: boolean;
  has_pdf_app?: boolean;
  e_app_link?: string;
  
  // Metadata
  key?: string;
}

export interface FinalExpenseShopContentProps {
  quotes: FinalExpenseQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: FinalExpenseQuote) => void;
}

// Grouped quotes interface for company-based display
export interface GroupedFinalExpenseQuotes {
  company_key: string;
  company_name: string;
  company_full_name: string;
  company_logo_url?: string;
  quotes: FinalExpenseQuote[];
  price_range: {
    min: number;
    max: number;
  };
  plan_count: number;
}

// Helper function to group quotes by company_base.key
export const groupFinalExpenseQuotesByCompany = (quotes: FinalExpenseQuote[]): GroupedFinalExpenseQuotes[] => {
  const groupedMap = new Map<string, GroupedFinalExpenseQuotes>();

  quotes.forEach(quote => {
    const companyKey = quote.company_base?.key || quote.company_name || 'unknown';
    const companyName = getFinalExpenseCarrierName(quote);
    const companyFullName = getFinalExpenseCarrierFullName(quote);
    const monthlyRate = quote.monthly_rate || 0;

    if (!groupedMap.has(companyKey)) {
      groupedMap.set(companyKey, {
        company_key: companyKey,
        company_name: companyName,
        company_full_name: companyFullName,
        company_logo_url: quote.company_base?.logo_url || quote.carrier?.logo_url || undefined,
        quotes: [],
        price_range: {
          min: monthlyRate,
          max: monthlyRate
        },
        plan_count: 0
      });
    }

    const group = groupedMap.get(companyKey)!;
    group.quotes.push(quote);
    group.plan_count = group.quotes.length;
    
    // Update price range
    if (monthlyRate < group.price_range.min) {
      group.price_range.min = monthlyRate;
    }
    if (monthlyRate > group.price_range.max) {
      group.price_range.max = monthlyRate;
    }
  });

  return Array.from(groupedMap.values()).sort((a, b) => 
    a.price_range.min - b.price_range.min
  );
};

export interface FinalExpenseSidebarProps {
  selectedQuote?: FinalExpenseQuote;
  className?: string;
}

export interface FinalExpenseEmptyStateProps {
  title?: string;
  description?: string;
}

// Utility functions for consistent data access
export const getFinalExpenseCarrierName = (quote: FinalExpenseQuote): string => {
  return quote.carrier?.name || quote.company_name || quote.company_base?.name || 'Unknown Carrier';
};

export const getFinalExpenseCarrierFullName = (quote: FinalExpenseQuote): string => {
  return quote.carrier?.full_name || quote.company_base?.full_name || getFinalExpenseCarrierName(quote);
};

export const getFinalExpenseCarrierLogo = (quote: FinalExpenseQuote): string | null => {
  return quote.carrier?.logo_url || quote.company_base?.logo_url || null;
};