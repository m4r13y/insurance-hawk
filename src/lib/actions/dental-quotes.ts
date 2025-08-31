"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface DentalQuoteRequest {
  age: string | number;
  zipCode: string;
  gender: string;
  tobaccoUse: boolean | null;
  // Dental-specific fields
  currentDentalCoverage?: boolean;
  lastDentalVisit?: string;
  needsImmediate?: boolean;
  preferredCoverage?: 'basic' | 'comprehensive' | 'preventive';
  coveredMembers?: number;
}

export interface DentalQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  annualMaximum: number;
  deductible: number;
  preventiveCoverage: number; // percentage
  basicCoverage: number; // percentage
  majorCoverage: number; // percentage
  orthodonticCoverage?: number; // percentage
  waitingPeriods: {
    preventive: number; // months
    basic: number; // months
    major: number; // months
    orthodontic?: number; // months
  };
  networkType: string;
  benefits: string[];
  limitations: string[];
  carrierLogo?: string;
  rating?: number;
}

export interface DentalQuotesResponse {
  success: boolean;
  quotes: DentalQuote[];
  error?: string;
  message?: string;
}

export async function getDentalQuotes(formData: DentalQuoteRequest): Promise<DentalQuotesResponse> {
  try {
    console.log('🦷 Calling getDentalQuotes Firebase function with data:', formData);
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    // Transform parameters to match admin repository API expectations
    const apiParams = {
      zip5: formData.zipCode,
      age: parseInt(formData.age.toString()),
      gender: formData.gender,
      tobacco: formData.tobaccoUse ? 1 : 0,
      covered_members: formData.coveredMembers || 1
    };
    
    const getDentalQuotesFunction = httpsCallable(functions, 'getDentalQuotes');
    const result = await getDentalQuotesFunction(apiParams);
    
    console.log('🦷 getDentalQuotes result:', result);
    
    const response = result.data as DentalQuotesResponse;
    
    if (response.success && response.quotes) {
      console.log(`✅ Successfully fetched ${response.quotes.length} dental quotes`);
      return response;
    } else {
      console.error('❌ Dental quotes request failed:', response.error || response.message);
      return {
        success: false,
        quotes: [],
        error: response.error || response.message || 'Failed to fetch dental quotes'
      };
    }
  } catch (error) {
    console.error('❌ Error fetching dental quotes:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
