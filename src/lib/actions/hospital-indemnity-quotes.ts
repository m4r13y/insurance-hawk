"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface HospitalIndemnityQuoteParams {
  zipCode: string;
  age: number;
  gender: 'M' | 'F';
  tobaccoUse: boolean;
  offset?: number;
}

export interface HospitalIndemnityBenefit {
  rate: number;
  amount?: string;
  quantifier?: string;
  dependent_riders?: any[];
}

export interface HospitalIndemnityBasePlan {
  note: string | null;
  included: boolean;
  benefits: HospitalIndemnityBenefit[];
  name: string;
}

export interface HospitalIndemnityRider {
  note: string | null;
  included: boolean;
  benefits: HospitalIndemnityBenefit[];
  name: string;
}

export interface HospitalIndemnityCompany {
  key: string;
  business_type: string;
  established_year: number;
  name: string;
  name_full: string;
  naic: string;
  ambest_rating: string;
  ambest_outlook: string;
  sp_rating: string;
  type: string;
  customer_complaint_ratio: number | null;
  customer_satisfaction_ratio: number;
  parent_company: string | null;
  parent_company_base: any;
  med_supp_market_data: any[];
  med_supp_state_market_data: any[];
  med_supp_national_market_data: any;
  underwriting_data: any[];
  default_resources: any;
}

export interface HospitalIndemnityQuote {
  key: string;
  age: number;
  gender: string;
  tobacco: boolean | null;
  state: string;
  zip5: string[];
  zip3: string[];
  county: string[];
  zip5_excluded: string[];
  zip3_excluded: string[];
  county_excluded: string[];
  effective_date: string;
  expires_date: string;
  created_date: string | null;
  last_modified: string;
  plan_name: string;
  company: string;
  company_base: HospitalIndemnityCompany;
  policy_fee: number;
  hh_discount: number;
  has_pdf_app: boolean;
  has_brochure: boolean;
  e_app_link: string;
  base_plans: HospitalIndemnityBasePlan[];
  riders: HospitalIndemnityRider[];
}

export interface HospitalIndemnityQuoteResponse {
  quotes: HospitalIndemnityQuote[];
  success: boolean;
  error?: string;
}

export async function getHospitalIndemnityQuotes(params: HospitalIndemnityQuoteParams): Promise<HospitalIndemnityQuoteResponse> {
  try {
    console.log('🏥 Calling getHospitalIndemnityQuotes Firebase function with params:', params);
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    // Transform parameters to match API expectations
    const apiParams = {
      zip5: params.zipCode,
      age: params.age,
      gender: params.gender,
      tobacco: params.tobaccoUse ? 1 : 0
    };

    const getHospitalIndemnityQuotesFunction = httpsCallable(functions, 'getHospitalIndemnityQuotes');
    const result = await getHospitalIndemnityQuotesFunction(apiParams);
    
    console.log('🏥 getHospitalIndemnityQuotes result:', result);
    
    // Handle different response formats (matching hawknest-admin)
    let quotes: unknown[] = [];
    
    if (result.data) {
      // Check if result.data has quotes array (wrapped response)
      if (typeof result.data === "object" && "quotes" in result.data && Array.isArray((result.data as Record<string, unknown>).quotes)) {
        quotes = (result.data as Record<string, unknown>).quotes as unknown[];
      }
      // If the response is an array itself (direct response)
      else if (Array.isArray(result.data)) {
        quotes = result.data;
      }
      // If the response has a results array (alternative CSG format)
      else if (typeof result.data === "object" && "results" in result.data && Array.isArray((result.data as Record<string, unknown>).results)) {
        quotes = (result.data as Record<string, unknown>).results as unknown[];
      }
      // Check for error in response
      else if (typeof result.data === "object" && "error" in result.data) {
        console.error('🏥 API Error:', (result.data as any).error);
        return {
          quotes: [],
          success: false,
          error: (result.data as any).error
        };
      }
    }
    
    if (quotes.length === 0) {
      console.warn('🏥 No quotes returned from API');
      return {
        quotes: [],
        success: true
      };
    }
    
    console.log(`🏥 Success! Received ${quotes.length} hospital indemnity quotes`);
    return {
      quotes: quotes as HospitalIndemnityQuote[],
      success: true
    };
  } catch (error) {
    console.error('🏥 Error calling getHospitalIndemnityQuotes:', error);
    return {
      quotes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
