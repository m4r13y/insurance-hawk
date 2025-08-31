"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Updated based on admin repository specifications
export interface CancerInsuranceQuoteParams {
  zipCode: string;
  age: number;
  gender: 'M' | 'F';
  tobaccoUse: boolean;
  familyType?: 'individual' | 'family';
  benefitAmount?: number;
  carcinomaInSitu?: boolean;
  premiumMode?: 'monthly' | 'annual';
}

export interface CancerInsuranceQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  benefits: string[];
  limitations: string[];
  benefitAmount: number;
  carcinomaInSituBenefit?: number;
}

export interface CancerInsuranceQuoteResponse {
  quotes: CancerInsuranceQuote[];
  success: boolean;
  error?: string;
}

// Helper function to extract state from zipCode (simplified for demo)
function getStateFromZipCode(zipCode: string): string {
  // This is a simplified mapping - in production, use a proper zip-to-state lookup
  const zipInt = parseInt(zipCode);
  if (zipInt >= 75000 && zipInt <= 79999) return 'TX'; // Texas zip range
  return 'TX'; // Default to TX for demo
}

export async function getCancerInsuranceQuotes(params: CancerInsuranceQuoteParams): Promise<CancerInsuranceQuoteResponse> {
  try {
    console.log('🎗️ Calling getCancerInsuranceQuote Firebase function with params:', params);
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    // Transform parameters to match admin repository API expectations
    const state = getStateFromZipCode(params.zipCode);
    
    // Cancer insurance only available in TX
    if (state !== 'TX') {
      return {
        quotes: [],
        success: false,
        error: 'Cancer insurance is only available in Texas'
      };
    }
    
    const apiParams = {
      state: state,
      age: params.age,
      gender: params.gender,
      tobaccoStatus: params.tobaccoUse,
      familyType: params.familyType || 'individual',
      benefitAmount: params.benefitAmount || 10000,
      carcinomaInSitu: params.carcinomaInSitu || false,
      premiumMode: params.premiumMode || 'monthly'
    };

    const getCancerInsuranceQuoteFunction = httpsCallable(functions, 'getCancerInsuranceQuote');
    const result = await getCancerInsuranceQuoteFunction(apiParams);
    
    console.log('🎗️ getCancerInsuranceQuote result:', result);
    
    if (result.data && typeof result.data === 'object') {
      const data = result.data as any;
      
      if (data.success && data.quotes) {
        console.log(`🎗️ Success! Received ${data.quotes.length} cancer insurance quotes`);
        return {
          quotes: data.quotes,
          success: true
        };
      } else if (data.error) {
        console.error('🎗️ API Error:', data.error);
        return {
          quotes: [],
          success: false,
          error: data.error
        };
      } else {
        console.error('🎗️ Unexpected response format:', data);
        return {
          quotes: [],
          success: false,
          error: 'Unexpected response format from cancer insurance quotes API'
        };
      }
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
