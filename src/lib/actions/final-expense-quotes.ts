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
  offset?: number;
}

// Updated to match hawknest-admin successful response format
export interface FinalExpenseQuote {
  id?: string;
  monthly_rate: number;
  annual_rate: number;
  face_value: number;
  face_amount_min: number;
  face_amount_max: number;
  carrier?: { 
    name: string;
    full_name?: string;
    logo_url?: string | null;
  } | null;
  plan_name?: string;
  company_name?: string;
  company_base?: { 
    name?: string;
    full_name?: string; 
    logo_url?: string | null;
  };
  benefit_name?: string;
  naic?: string;
  effective_date?: string;
  expires_date?: string;
  underwriting_type?: string;
  am_best_rating?: string;
  monthly_fee?: number;
  annual_fee?: number;
  is_down_payment_plan?: boolean;
  has_pdf_app?: boolean;
  e_app_link?: string;
  key?: string;
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
    
    // Transform parameters to match hawknest-admin Firebase function format
    const functionParams: any = {
      zip5: params.zipCode,
      age: params.age,
      gender: params.gender,
      tobacco: params.tobaccoUse ? 1 : 0,
      offset: params.offset || 0
    };

    // Add state if zipCode not provided
    if (!params.zipCode && params.state) {
      functionParams.state = params.state;
    }

    // Add quote type and value parameters (matching hawknest-admin)
    if (params.desiredRate) {
      functionParams.quote_type = 'by_rate';
      functionParams.desired_rate = params.desiredRate;
    } else if (params.desiredFaceValue) {
      functionParams.quote_type = 'by_face_value';
      functionParams.desired_face_value = params.desiredFaceValue;
    } else {
      // Default to by_face_value if no specific type is requested
      functionParams.quote_type = 'by_face_value';
      functionParams.desired_face_value = 10000; // Default $10,000 face value
    }

    console.log('💰 Transformed function parameters:', functionParams);

    const getFinalExpenseLifeQuotesFunction = httpsCallable(functions, 'getFinalExpenseLifeQuotes');
    const result = await getFinalExpenseLifeQuotesFunction(functionParams);
    
    console.log('💰 getFinalExpenseLifeQuotes result:', result);
    
    // Handle different response formats (matching hawknest-admin)
    let rawQuotes: unknown[] = [];
    
    if (result.data) {
      // Check if result.data has quotes array (wrapped response)
      if (typeof result.data === "object" && "quotes" in result.data && Array.isArray((result.data as Record<string, unknown>).quotes)) {
        rawQuotes = (result.data as Record<string, unknown>).quotes as unknown[];
      }
      // If the response is an array itself (direct response)
      else if (Array.isArray(result.data)) {
        rawQuotes = result.data;
      }
      // If the response has a results array (alternative CSG format)
      else if (typeof result.data === "object" && "results" in result.data && Array.isArray((result.data as Record<string, unknown>).results)) {
        rawQuotes = (result.data as Record<string, unknown>).results as unknown[];
      }
      // Check for error in response
      else if (typeof result.data === "object" && "error" in result.data) {
        console.error('💰 API Error:', (result.data as any).error);
        return {
          quotes: [],
          success: false,
          error: (result.data as any).error
        };
      }
    }
    
    if (rawQuotes.length === 0) {
      console.log('💰 No quotes found in response');
      return { quotes: [], success: true };
    }
    
    // Transform quotes to match expected format (hawknest-admin style)
    const transformedQuotes = rawQuotes.map((q: unknown, idx: number) => {
      const quoteData = q as Record<string, unknown>;
      const companyBase = (quoteData.company_base as Record<string, unknown>) || {};
      
      // Extract rates and face values
      const monthly_rate = (quoteData.monthly_rate as number) || 0;
      const annual_rate = (quoteData.annual_rate as number) || 0;
      const face_value = (quoteData.face_value as number) || 0;
      const face_amount_min = (quoteData.face_amount_min as number) || 0;
      const face_amount_max = (quoteData.face_amount_max as number) || 0;
      
      // Build carrier object (prioritize company_base data)
      const carrier = {
        name: (companyBase.name as string) || (quoteData.company_name as string) || 'Unknown Carrier',
        full_name: (companyBase.full_name as string) || (companyBase.name as string) || (quoteData.company_name as string),
        logo_url: (companyBase.logo_url as string) || null
      };
      
      // Generate stable ID
      const id = (quoteData.id as string) || (quoteData.key as string) || `final-expense-${carrier.name}-${idx}`;
      
      const quote: FinalExpenseQuote = {
        id,
        monthly_rate,
        annual_rate,
        face_value,
        face_amount_min,
        face_amount_max,
        carrier,
        plan_name: (quoteData.plan_name as string) || 'Final Expense Life Insurance',
        company_name: (quoteData.company_name as string) || carrier.name,
        company_base: companyBase,
        benefit_name: (quoteData.benefit_name as string),
        naic: quoteData.naic as string,
        effective_date: quoteData.effective_date as string,
        expires_date: quoteData.expires_date as string,
        underwriting_type: (quoteData.underwriting_type as string),
        am_best_rating: quoteData.am_best_rating as string,
        monthly_fee: quoteData.monthly_fee as number,
        annual_fee: quoteData.annual_fee as number,
        is_down_payment_plan: quoteData.is_down_payment_plan as boolean,
        has_pdf_app: quoteData.has_pdf_app as boolean,
        e_app_link: quoteData.e_app_link as string,
        key: quoteData.key as string
      };
      
      return quote;
    });
    
    // Sort by monthly rate (lowest first)
    transformedQuotes.sort((a, b) => a.monthly_rate - b.monthly_rate);

    console.log('💰 Transformed quotes:', transformedQuotes.length, 'quotes found');
    
    return { 
      quotes: transformedQuotes, 
      success: true 
    };
  } catch (error) {
    console.error('💰 Error calling getFinalExpenseLifeQuotes:', error);
    return {
      quotes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
