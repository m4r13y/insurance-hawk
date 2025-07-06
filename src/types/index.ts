

export type Plan = {
  id: string;
  name: string;
  provider: string;
  type: 'HMO' | 'PPO' | 'FFS' | 'SNP';
  premium: number;
  deductible: number;
  maxOutOfPocket: number;
  rating: number;
  features: {
    dental: boolean;
    vision: boolean;
    hearing: boolean;
    prescriptionDrug: boolean;
  }
};

export type Document = {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
};

export type QuoteRequestValues = {
  zipCode: string;
  age: number;
  gender: 'female' | 'male';
  tobacco: 'false' | 'true';
  plan: 'A' | 'F' | 'G' | 'N';
  effectiveDate?: string;
  apply_discounts: boolean;
};

export type CsgDiscount = {
    name: string;
    value: number;
    type: 'percent' | 'fixed';
    rule: string;
};

export type Quote = {
    id: string;
    premium: number;
    monthly_premium: number;
    carrier: {
        name: string;
        logo_url: string | null;
    };
    plan_name: string;
    plan_type: string;
    discounts: CsgDiscount[];
    am_best_rating: string;
    rate_type?: string;
};

export type DentalQuoteRequestValues = {
  zipCode: string;
  age: number;
  gender: 'female' | 'male';
  tobacco: 'false' | 'true';
};

export type DentalQuote = {
    id: string;
    monthly_premium: number;
    carrier: {
        name: string;
        logo_url: string | null;
    };
    plan_name: string;
    am_best_rating: string;
    benefit_amount: string;
    benefit_quantifier: string;
    benefit_notes?: string;
    limitation_notes?: string;
};

export type HospitalIndemnityQuoteRequestValues = {
  zipCode: string;
  age: number;
  gender: 'female' | 'male';
  tobacco: 'false' | 'true';
};

export type HospitalIndemnityRider = {
    name: string;
    note: string | null;
    benefits: {
        amount: string;
        quantifier: string;
        rate: number;
    }[];
};

export type HospitalIndemnityQuote = {
    id: string;
    carrier: {
        name: string;
        logo_url: string | null;
    };
    plan_name: string;
    monthly_premium: number;
    benefit_amount: string;
    benefit_quantifier: string;
    riders: HospitalIndemnityRider[];
};
