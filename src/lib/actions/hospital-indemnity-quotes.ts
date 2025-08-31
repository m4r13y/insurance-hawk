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
      tobacco: params.tobaccoUse ? 1 : 0,
      offset: params.offset || 0
    };

    const getHospitalIndemnityQuotesFunction = httpsCallable(functions, 'getHospitalIndemnityQuotes');
    const result = await getHospitalIndemnityQuotesFunction(apiParams);
    
    console.log('🏥 getHospitalIndemnityQuotes result:', result);
    
    if (result.data && typeof result.data === 'object') {
      const data = result.data as any;
      
      if (data.success && data.quotes) {
        console.log(`🏥 Success! Received ${data.quotes.length} hospital indemnity quotes`);
        return {
          quotes: data.quotes,
          success: true
        };
      } else if (data.error) {
        console.error('🏥 API Error:', data.error);
        return {
          quotes: [],
          success: false,
          error: data.error
        };
      } else {
        console.error('🏥 Unexpected response format:', data);
        return {
          quotes: [],
          success: false,
          error: 'Unexpected response format from hospital indemnity quotes API'
        };
      }
    } else {
      console.error('🏥 Invalid response:', result);
      return {
        quotes: [],
        success: false,
        error: 'Invalid response from hospital indemnity quotes service'
      };
    }
  } catch (error) {
    console.error('🏥 Error calling getHospitalIndemnityQuotes:', error);
    return {
      quotes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
