
export type Plan = {
  id: string;
  name: string;
  provider: string;
  category: string;
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
  downloadURL: string;
  storagePath: string;
};

export type Policy = {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogoUrl: string;
  carrierWebsite: string;
  policyCategoryId: string;
  policyCategoryName: string;
  policySubcategoryId?: string;
  policySubcategoryName?: string;
  planName: string;
  premium?: number;
  enrollmentDate?: string;
  benefitAmount?: number;
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

export type HospitalIndemnityBenefit = {
    amount: string;
    quantifier: string;
    rate: number;
};

export type HospitalIndemnityRider = {
    name: string;
    note: string | null;
    benefits: HospitalIndemnityBenefit[];
    included?: boolean;
};

export type HospitalIndemnityQuote = {
    id: string; 
    carrier: {
        name: string;
        logo_url: string | null;
    };
    plan_name: string;
    baseBenefits: HospitalIndemnityBenefit[];
    riders: HospitalIndemnityRider[];
};

export type HealthPlan = {
    id: string;
    name: string;
    provider: string;
    isBestMatch: boolean;
    premium: number; // This will be the premium *with* tax credit
    taxCredit: number;
    deductible: number;
    outOfPocketMax: number;
    network: string;
    rating: number;
    benefits_url: string;
    formulary_url: string;
    hsa_eligible: boolean;
};

export type Drug = {
  id: string;
  name: string;
  rxcui: string;
  strength: string;
  route: string;
  full_name: string;
  rxterms_dose_form: string;
  rxnorm_dose_form: string;
  is_generic: boolean;
  generic: {
    rxcui: string;
    name: string;
  } | null;
};

export type Provider = {
  name: string;
  gender: string;
  specialties: string[];
  type: string;
  npi: string;
  languages: string[];
  affiliations?: { name: string; type: string; }[];
};

export type DrugCoverage = {
  rxcui: string;
  plan_id: string;
  coverage: 'Covered' | 'NotCovered' | 'DataNotProvided' | 'GenericCovered';
  generic_rxcui: string | null;
  drugName?: string; // For UI display
};

export type ProviderCoverage = {
  npi: string;
  plan_id: string;
  coverage: 'Covered' | 'NotCovered';
  addresses: { city: string, state: string, street_1: string, zipcode: string }[];
  accepting: string;
  providerName?: string; // For UI display
};

export type SelectedDrug = Drug & {
    quantity: number;
    frequency: string;
    package: string;
};

export type SelectedProvider = Provider & {
    selectedAffiliation?: string;
};

    