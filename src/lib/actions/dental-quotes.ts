"use server"

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { optimizeDentalQuotes, OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { saveDentalQuotesToStorage, loadDentalQuotesFromStorage } from '@/lib/dental-storage';

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
  quotes: OptimizedDentalQuote[];
  error?: string;
  message?: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
}

export async function getDentalQuotes(formData: DentalQuoteRequest): Promise<DentalQuotesResponse> {
  try {
    console.log('🦷 Calling getDentalQuotes Firebase function with data:', formData);
    
    // Check for cached results first
    const cachedQuotes = loadDentalQuotesFromStorage();
    
    if (cachedQuotes && cachedQuotes.quotes.length > 0) {
      // Check if cached data matches current search parameters
      const searchParams = {
        age: parseInt(formData.age.toString()),
        zipCode: formData.zipCode,
        gender: formData.gender,
        tobacco: formData.tobaccoUse || false
      };
      
      if (cachedQuotes.searchParams.age === searchParams.age &&
          cachedQuotes.searchParams.zipCode === searchParams.zipCode &&
          cachedQuotes.searchParams.gender === searchParams.gender &&
          cachedQuotes.searchParams.tobacco === searchParams.tobacco) {
        console.log('✅ Using cached dental quotes:', cachedQuotes.quotes.length, 'quotes');
        return {
          success: true,
          quotes: cachedQuotes.quotes,
          originalSize: cachedQuotes.optimizationStats?.originalSize,
          optimizedSize: cachedQuotes.optimizationStats?.optimizedSize,
          compressionRatio: cachedQuotes.optimizationStats?.compressionRatio
        };
      }
    }
    
    if (!functions) {
      throw new Error('Firebase functions not initialized');
    }
    
    // Transform parameters to match admin repository API expectations
    const apiParams = {
      zip5: formData.zipCode,
      age: parseInt(formData.age.toString()),
      gender: formData.gender,
      tobacco: formData.tobaccoUse ? 1 : 0,
      covered_members: 'all',
      offset: 10 // Skip first 10 results to potentially reduce response size
    };
    
    const getDentalQuotesFunction = httpsCallable(functions, 'getDentalQuotes');
    const result = await getDentalQuotesFunction(apiParams);
    
    console.log('🦷 getDentalQuotes result:', result);
    
    // Handle the actual response format from Firebase function
    const data = result.data as any;
    
    // Check if data has the expected structure
    if (data && typeof data === 'object') {
      console.log('🔄 Optimizing dental quotes data to remove bloat...');
      
      // Optimize the raw response to remove massive Medicare supplement data
      const optimizedResult = optimizeDentalQuotes(data);
      
      if (!optimizedResult.success) {
        console.error('❌ Failed to optimize dental quotes:', optimizedResult.error);
        return {
          success: false,
          quotes: [],
          error: optimizedResult.error || 'Failed to optimize quote data'
        };
      }
      
      console.log(`✅ Successfully optimized ${optimizedResult.quotes.length} dental quotes`);
      console.log(`🎯 Storage reduction: ${optimizedResult.compressionRatio}`);
      
      // Save optimized results to localStorage for future use
      const saveParams = {
        age: parseInt(formData.age.toString()),
        zipCode: formData.zipCode,
        gender: formData.gender,
        tobaccoUse: formData.tobaccoUse || false
      };
      
      const saved = saveDentalQuotesToStorage(
        optimizedResult.quotes,
        saveParams,
        {
          originalSize: optimizedResult.originalSize || 0,
          optimizedSize: optimizedResult.optimizedSize || 0,
          compressionRatio: optimizedResult.compressionRatio || '0%',
          quotesCount: optimizedResult.quotes.length
        }
      );
      
      if (saved) {
        console.log('💾 Optimized dental quotes saved to localStorage');
      } else {
        console.warn('⚠️ Failed to save quotes to localStorage');
      }
      
      return {
        success: true,
        quotes: optimizedResult.quotes,
        originalSize: optimizedResult.originalSize,
        optimizedSize: optimizedResult.optimizedSize,
        compressionRatio: optimizedResult.compressionRatio
      };
    } else {
      throw new Error('Invalid response format from Firebase function');
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
