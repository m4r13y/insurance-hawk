"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Updated based on admin repository specifications
export interface CancerInsuranceQuoteParams {
  state: "TX" | "GA";
  age: number;
  familyType: "Applicant Only" | "Applicant and Spouse" | "Applicant and Child(ren)" | "Applicant and Spouse and Child(ren)";
  tobaccoStatus: "Non-Tobacco" | "Tobacco";
  premiumMode: "Monthly Bank Draft" | "Monthly Credit Card" | "Monthly Direct Mail" | "Annual";
  carcinomaInSitu: "25%" | "100%";
  benefitAmount: number;
}

export interface CancerInsuranceQuote {
  monthly_premium: number;
  carrier: string;
  plan_name: string;
  benefit_amount: number;
}

export interface CancerInsuranceQuoteResponse {
  quotes: CancerInsuranceQuote[];
  success: boolean;
  error?: string;
}

export async function getCancerInsuranceQuotes(params: CancerInsuranceQuoteParams): Promise<CancerInsuranceQuoteResponse> {
  try {
    console.log('🎗️ Calling getCancerInsuranceQuote Firebase function with params:', params);
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    const apiParams = {
      state: params.state,
      age: params.age,
      familyType: params.familyType,
      tobaccoStatus: params.tobaccoStatus,
      premiumMode: params.premiumMode,
      carcinomaInSitu: params.carcinomaInSitu,
      benefitAmount: params.benefitAmount
    };

    const getCancerQuoteFunction = httpsCallable(functions, 'getCancerInsuranceQuote');
    const result = await getCancerQuoteFunction(apiParams);
    
    console.log('🎗️ getCancerInsuranceQuote result:', result);
    
    if (result.data && typeof result.data === 'object') {
      // Cancer quotes returns a single quote object, not an array
      // Transform to match expected format
      const quote = result.data as CancerInsuranceQuote;
      
      console.log('🎗️ Success! Received cancer insurance quote');
      return {
        quotes: [quote],
        success: true
      };
    } else {
      console.error('🎗️ Invalid response:', result);
      return {
        quotes: [],
        success: false,
        error: 'Invalid response from cancer insurance quotes service'
      };
    }
  } catch (error) {
    console.error('🎗️ Error calling getCancerInsuranceQuote:', error);
    return {
      quotes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
