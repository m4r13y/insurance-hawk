// Shared types for Medicare shop components

export interface QuoteFormData {
  age: number | '';
  zipCode: string;
  gender: 'male' | 'female' | '';
  tobaccoUse: boolean | null;
  email?: string;
  firstName?: string;
  effectiveDate?: string;
}

export interface CartItem {
  planId: string;
  categoryId: string;
  planName: string;
  monthlyPremium: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  premiumRange: string;
  monthlyPremium: number;
  deductible?: string;
  features: string[];
  pros: string[];
  cons?: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
  isNew?: boolean;
  rating: number | null;
  reviewCount: number | null;
  coverageLevel: 'Basic' | 'Standard' | 'Premium' | 'Comprehensive';
  suitableFor: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
  plans: Plan[];
}

// Medigap-specific quote interface
export interface MedigapQuote {
  id?: string;
  monthly_premium: number;
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null;
  plan_name?: string;
  plan?: string;
  naic?: string;
  company?: string;
  company_base?: { name?: string; full_name?: string; logo_url?: string | null };
  effective_date?: string;
  discounts?: Array<{ name: string; amount: number }>;
  fees?: Array<{ name: string; amount: number }>;
  rate?: { month?: number };
  plan_type?: string;
  am_best_rating?: string;
  rate_type?: string;
}

// Generic quote interface for other types
export interface GenericQuote {
  id?: string;
  premium: number;
  carrier: {
    name: string;
    logo_url?: string;
  };
  plan_name: string;
  features: string[];
  [key: string]: any; // Allow for type-specific properties
}

export type QuoteType = 'medigap' | 'advantage' | 'partd' | 'dental' | 'hospital' | 'cancer' | 'final-expense';

export interface FilterState {
  searchQuery: string;
  sortBy: 'price' | 'rating' | 'popularity';
  priceRange: [number, number];
  selectedCoverageLevel: string;
  applyDiscounts: boolean;
  paymentMode: 'monthly' | 'quarterly' | 'annually';
}

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  displayType: 'grouped' | 'individual';
}

export interface CarrierGroup {
  carrierId: string;
  carrierName: string;
  quotes: any[];
  averagePremium: number;
}
