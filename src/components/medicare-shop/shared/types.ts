interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
  plans: Plan[];
}

interface Plan {
  id: string;
  name: string;
  description: string;
  premiumRange: string;
  monthlyPremium: number; // For sorting/filtering
  deductible?: string;
  features: string[];
  pros: string[];
  cons?: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
  isNew?: boolean;
  rating: number | null; // 1-5 star rating, null for real quotes
  reviewCount: number | null;
  coverageLevel: 'Basic' | 'Standard' | 'Premium' | 'Comprehensive';
  suitableFor: string[];
}

interface CartItem {
  planId: string;
  categoryId: string;
  planName: string;
  monthlyPremium: number;
}

interface QuoteFormData {
  age: number | '';
  zipCode: string;
  gender: 'male' | 'female' | '';
  tobaccoUse: boolean | null;
  email?: string;
  firstName?: string;
  effectiveDate?: string;
  // Cancer Insurance specific fields
  familyType?: 'individual' | 'family' | '';
  carcinomaInSitu?: boolean | null;
  premiumMode?: 'monthly' | 'annual' | '';
  // Dental Insurance specific fields
  coveredMembers?: string;
  // Final Expense specific fields
  desiredFaceValue?: string;
  desiredRate?: string;
  underwritingType?: 'Guaranteed' | 'Simplified' | 'Full' | 'No Preference' | '';
  // Cancer Insurance specific fields
  benefitAmount?: string;
  // State field for cancer insurance
  state?: string;
}

interface MedigapQuote {
  id?: string
  monthly_premium: number
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null
  plan_name?: string
  plan?: string
  naic?: string
  company?: string
  company_base?: { name?: string; full_name?: string; logo_url?: string | null }
  effective_date?: string
  discounts?: Array<{ name: string; amount: number }>
  fees?: Array<{ name: string; amount: number }>
  rate?: { month?: number }
  plan_type?: string
  am_best_rating?: string
  rate_type?: string
}

export type { ProductCategory, Plan, CartItem, QuoteFormData, MedigapQuote };
