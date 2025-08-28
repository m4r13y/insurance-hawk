export interface QuoteData {
  key: string;
  age: number;
  age_increases: number[];
  company: string;
  company_base: {
    key: string;
    name: string;
    name_full: string;
    naic: string;
    ambest_rating: string;
    ambest_outlook: string;
    sp_rating: string;
    type: string;
    established_year: number;
    customer_complaint_ratio: number | null;
    customer_satisfaction_ratio: number;
    med_supp_market_data: any[];
    parent_company_base?: {
      name: string;
      code: string;
      established_year: number;
    };
  };
  discount_category: string;
  discounts: Array<{
    name: string;
    type: 'percent' | 'fixed';
    value: number;
    rule?: string;
  }>;
  e_app_link: string;
  effective_date: string;
  expires_date: string;
  fees: Array<{
    name: string;
    type: 'fixed' | 'percent';
    value: number;
  }>;
  gender: string;
  has_brochure: boolean;
  has_pdf_app: boolean;
  plan: string;
  rate: {
    annual: number;
    month: number;
    quarter: number;
    semi_annual: number;
  };
  rate_increases: any[];
  rate_type: string;
  rating_class: string;
  riders: any[];
  tobacco: boolean;
  location_base: {
    state: string;
    zip5: string[];
    county: string[];
  };
}
