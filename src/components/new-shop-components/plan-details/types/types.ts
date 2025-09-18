// Central type exports for plan details domain
export interface QuoteData {
  plan: string;
  rate: { month: number; annual?: number; quarter?: number; semi_annual?: number; [k: string]: any };
  rate_type?: string;
  age?: number;
  gender?: string;
  tobacco?: boolean;
  company?: string;
  company_base: {
    name: string;
    name_full?: string;
    naic?: string;
    type?: string;
    established_year?: number;
    parent_company_base?: { name: string; established_year?: number };
    ambest_rating?: string;
    ambest_outlook?: string;
    sp_rating?: string;
    customer_complaint_ratio?: number | null;
    customer_satisfaction_ratio?: number;
    med_supp_market_data?: any[];
  };
  discount_category?: string;
  discounts?: Array<{ name: string; type: 'percent' | 'fixed'; value: number; rule?: string }>;
  rating_class?: string;
  riders?: any[];
  view_type?: string | string[];
  location_base?: { state?: string; zip5?: string[]; county?: string[] };
  [key: string]: any;
}
