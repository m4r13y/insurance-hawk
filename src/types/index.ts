

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
    discounts: any[];
    am_best_rating: string;
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
};
