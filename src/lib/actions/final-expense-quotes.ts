"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface FinalExpenseQuoteParams {
  zipCode?: string;
  state?: string; // Alternative to zipCode
  age: number;
  gender: 'M' | 'F';
  tobaccoUse: boolean;
  desiredRate?: number; // For quotes by monthly rate
  desiredFaceValue?: number; // For quotes by face value
  benefitName?: string; // Filter by benefit type
  underwritingType?: 'Full' | 'Simplified' | 'Guaranteed';
  offset?: number;
}

export interface FinalExpenseRider {
  [key: string]: any;
}

export interface FinalExpenseCompanyBase {
  name: string;
}

export interface FinalExpenseQuote {
  key: string;
  benefit_name: string;
  face_amount_max: number;
  face_amount_min: number;
  annual_rate: number;
  annual_rate_max: number;
  annual_rate_min: number;
  monthly_fee: number;
  monthly_rate: number;
  quarterly_fee: number;
  quarterly_rate: number;
  semi_annual_fee: number;
  semi_annual_rate: number;
  annual_fee: number;
  county_excluded: string[];
  face_value: number;
  plan_name: string;
  company_name: string;
  zip5_excluded: string[];
  benefit_rate: number;
  zip3: string[];
  zip3_excluded: string[];
  state: string;
  zip5: string[];
  age: number;
  county: string[];
  created_date: string;
  riders: FinalExpenseRider[];
  hh_discount: number;
  tobacco: boolean;
  last_modified: string;
  monthly_modal_factor: number;
  gender: string;
  monthly_single_pay_face: number | null;
  company_base: FinalExpenseCompanyBase;
  is_down_payment_plan: boolean;
  has_pdf_app: boolean;
  semi_annual_modal_factor: number;
  single_pay_annual_rate: number | null;
  quarterly_pay_face: number | null;
  full_underwriting: boolean;
  monthly_pay_face: number | null;
  effective_date: string;
  semi_annual_single_pay_face: string | null;
  single_pay_quarterly_rate: number | null;
  company: string;
  e_app_link: string;
  expires_date: string;
  quarterly_modal_factor: number;
  single_pay_monthly_rate: number | null;
  single_pay_semi_annual_rate: number | null;
  has_brochure: boolean;
  semi_annual_pay_face: string;
  annual_single_pay_face: string;
  underwriting_type: string;
  annual_pay_face: number | null;
  quarterly_single_pay_face: number | null;
  down_payment_value: number | null;
}

export interface FinalExpenseQuoteResponse {
  quotes: FinalExpenseQuote[];
  success: boolean;
  error?: string;
}

export async function getFinalExpenseLifeQuotes(params: FinalExpenseQuoteParams): Promise<FinalExpenseQuoteResponse> {
  try {
    console.log('💰 Calling getFinalExpenseLifeQuotes Firebase function with params:', params);
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    // Transform parameters to match API expectations
    const apiParams: any = {
      age: params.age,
      gender: params.gender,
      tobacco: params.tobaccoUse ? 1 : 0,
      offset: params.offset || 0
    };

    // Add location parameter (zip5 OR state, not both)
    if (params.zipCode) {
      apiParams.zip5 = params.zipCode;
    } else if (params.state) {
      apiParams.state = params.state;
    } else {
      throw new Error('Either zipCode or state must be provided');
    }

    // Add query type parameters - quote_type is required
    if (params.desiredRate) {
      apiParams.quote_type = 'by_rate';
      apiParams.desired_rate = params.desiredRate;
    } else if (params.desiredFaceValue) {
      apiParams.quote_type = 'by_face_value';
      apiParams.desired_face_value = params.desiredFaceValue;
    } else {
      // Default to by_face_value if no specific type is requested
      apiParams.quote_type = 'by_face_value';
      apiParams.desired_face_value = 10000; // Default $10,000 face value
    }

    // Optional filters
    if (params.benefitName) {
      apiParams.benefit_name = params.benefitName;
    }
    
    if (params.underwritingType) {
      apiParams.underwriting_type = params.underwritingType;
    }

    const getFinalExpenseLifeQuotesFunction = httpsCallable(functions, 'getFinalExpenseLifeQuotes');
    const result = await getFinalExpenseLifeQuotesFunction(apiParams);
    
    console.log('💰 getFinalExpenseLifeQuotes result:', result);
    
    if (result.data && typeof result.data === 'object') {
      const data = result.data as any;
      
      if (data.success && data.quotes) {
        console.log(`💰 Success! Received ${data.quotes.length} final expense life quotes`);
        return {
          quotes: data.quotes,
          success: true
        };
      } else if (data.error) {
        console.error('💰 API Error:', data.error);
        return {
          quotes: [],
          success: false,
          error: data.error
        };
      } else {
        console.error('💰 Unexpected response format:', data);
        return {
          quotes: [],
          success: false,
          error: 'Unexpected response format from final expense life quotes API'
        };
      }
    } else {
      console.error('💰 Invalid response:', result);
      return {
        quotes: [],
        success: false,
        error: 'Invalid response from final expense life quotes service'
      };
    }
  } catch (error) {
    console.error('💰 Error calling getFinalExpenseLifeQuotes:', error);
    return {
      quotes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
