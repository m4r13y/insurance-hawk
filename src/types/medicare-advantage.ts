// Medicare Advantage Plan Types
export interface MedicareAdvantageQuote {
  key: string;
  plan_name: string;
  organization_name: string;
  plan_type: string;
  county: string;
  state: string;
  overall_star_rating: number;
  part_c_rate: number;
  part_d_rate: number;
  month_rate: number;
  in_network_moop: string;
  annual_drug_deductible: number;
  contract_id: string;
  plan_id: string;
  segment_id: string;
  benefits: Array<{
    benefit_type: string;
    full_description: string;
    summary_description?: {
      in_network?: string;
      out_network?: string;
    };
    pd_view_display: boolean;
  }>;
  part_d_subsides?: {
    "25": number;
    "50": number;
    "75": number;
    "100": number;
  };
  contextual_data?: {
    has_eapp: boolean;
    carrier_resources: {
      "Formulary Website"?: string;
      "Pharmacy Website"?: string;
      "Physician Lookup"?: string;
    };
  };
  company_base?: {
    name: string;
    name_full: string;
    naic?: string;
  };
  drug_benefit_type?: string;
  drug_benefit_type_detail?: string;
  zero_premium_with_full_low_income_subsidy?: boolean;
  additional_coverage_offered_in_the_gap?: boolean;
  additional_drug_coverage_offered_in_the_gap?: boolean;
  contract_year: string;
  effective_date: string;
  part_b_reduction?: string;
}

export interface FieldMapping {
  column: string;
  field: string;
  value: string | React.ReactNode;
}

export interface BenefitStatusDisplay {
  status: 'covered' | 'not-covered' | 'unclear' | 'not-found';
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface CarouselPage {
  title: string;
  id: string;
}

export interface PharmaTableData {
  tier: string;
  tierType: string;
  pharmacyType: string;
  thirtyDay: string;
  sixtyDay: string;
  ninetyDay: string;
}
