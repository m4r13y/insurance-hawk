import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

// Base types for hospital indemnity field mapping
export interface HospitalIndemnityFieldMapping {
  originalField: string;
  mappedField: string;
  dataType: string;
  description: string;
  sampleValue?: any;
}

export interface HospitalIndemnityComparisonData {
  quote: OptimizedHospitalIndemnityQuote;
  fieldMappings: HospitalIndemnityFieldMapping[];
}

export interface HospitalIndemnityAnalysisResult {
  totalQuotes: number;
  uniqueCompanies: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  benefitTypes: string[];
  riderTypes: string[];
}

export interface HospitalIndemnityBenefitStructure {
  name: string;
  type: 'base' | 'rider';
  included: boolean;
  options: Array<{
    amount: string;
    rate: number;
    description?: string;
  }>;
  notes?: string;
}