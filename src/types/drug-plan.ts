// Drug Plan (PDP) Type Definitions
export interface DrugPlanBenefit {
  benefit_type: string;
  full_description: string;
  pd_view_display: boolean;
  summary_description: string | null;
}

export interface DrugPlanCompany {
  company_identifier: number;
  naic: string | null;
  name: string;
  name_full: string;
}

export interface DrugPlanCarrierResources {
  'Formulary Website'?: string;
  'Pharmacy Website'?: string;
  'Physician Lookup'?: string;
}

export interface DrugPlanContextualData {
  carrier_resources: DrugPlanCarrierResources;
  has_eapp: boolean;
}

export interface DrugPlanFipsRegion {
  county_name: string;
  fips_code: string;
  state: string;
}

export interface DrugPlanSubsides {
  [key: string]: number; // 25, 50, 75, 100 percentage levels
}

export interface DrugPlanQuote {
  // Basic plan information
  key: string;
  plan_name: string;
  plan_id: string;
  contract_id: string;
  segment_id: string;
  contract_year: string;
  organization_name: string;
  plan_type: string;
  medicare_type: string; // Should be "pdp" for drug plans
  
  // Ratings and costs
  overall_star_rating: number;
  month_rate: number; // Monthly premium in cents
  part_d_rate: number; // Part D premium in cents
  annual_drug_deductible: number; // In cents
  
  // Geographic information
  state: string;
  county: string;
  fips_region: DrugPlanFipsRegion;
  
  // Company information
  company: string;
  company_base: DrugPlanCompany;
  
  // Benefits and coverage
  benefits: DrugPlanBenefit[];
  drug_benefit_type: string;
  drug_benefit_type_detail: string;
  
  // Gap coverage
  additional_coverage_offered_in_the_gap: boolean;
  additional_drug_coverage_offered_in_the_gap: boolean;
  additional_coverage_type: string | null;
  
  // Subsidies and financial assistance
  part_d_subsides: DrugPlanSubsides;
  zero_premium_with_full_low_income_subsidy: boolean;
  
  // Coverage limits
  in_network_moop: string | null;
  in_network_moop_sort: number | null;
  
  // Metadata
  contextual_data: DrugPlanContextualData;
  effective_date: string;
  created_date: string;
  last_modified: string;
  status: number;
  version: number;
  
  // Optional fields
  part_b_reduction: string | null;
  part_c_rate: number | null;
  special_needs_plan_type: string | null;
  has_brochure: boolean | null;
  has_pdf_app: boolean | null;
  e_app_link: string | null;
  excluded_zip5: string | null;
  benefit_type_detail: string | null;
}

// Carousel page configuration for drug plans
export interface DrugPlanCarouselPage {
  title: string;
  id: string;
}
