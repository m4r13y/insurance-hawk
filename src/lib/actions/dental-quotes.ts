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
      covered_members: 'all',
      limit: 100, // or whatever max limit the API supports
      offset: 0,
    };
    
    const getDentalQuotesFunction = httpsCallable(functions, 'getDentalQuotes');
    const result = await getDentalQuotesFunction(apiParams);
    
    console.log('🦷 getDentalQuotes result:', result);
    
    // Handle the actual response format from Firebase function
    const data = result.data as any;
    
    // Check if data has the expected structure
    if (data && typeof data === 'object') {
      // If data has success/quotes structure
      if ('success' in data && 'quotes' in data) {
        const response = data as DentalQuotesResponse;
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
      }
      // If data is directly an array of quotes
      else if (Array.isArray(data)) {
        console.log(`✅ Successfully fetched ${data.length} dental quotes (direct array format)`);
        return {
          success: true,
          quotes: data as DentalQuote[]
        };
      }
      // If data has a 'data' property that contains the quotes
      else if ('data' in data && Array.isArray(data.data)) {
        console.log(`✅ Successfully fetched ${data.data.length} dental quotes (nested data format)`);
        return {
          success: true,
          quotes: data.data as DentalQuote[]
        };
      }
      // If data is empty or null
      else {
        console.log('📝 No dental quotes found for the given criteria');
        return {
          success: true,
          quotes: [],
          message: 'No dental insurance plans found for your area and criteria'
        };
      }
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

// Retry wrapper with exponential backoff + jitter for transient failures (e.g., deadline-exceeded)
export async function getDentalQuotesWithRetry(formData: DentalQuoteRequest, opts: { attempts?: number; baseDelayMs?: number } = {}): Promise<DentalQuotesResponse> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 750;
  let lastErr: any;
  for (let i=0;i<attempts;i++) {
    const attemptNum = i + 1;
    const res = await getDentalQuotes(formData);
    if (res.success) return res;
    lastErr = res.error;
    // Only retry on known transient codes
    const transient = typeof lastErr === 'string' && /deadline|unavailable|internal/i.test(lastErr);
    if (!transient) return res; // non-transient: bail fast
    if (attemptNum < attempts) {
      const delay = Math.min(4000, base * Math.pow(1.8, i)) + Math.random()*250;
      console.warn(`🦷 Retry dental quotes (attempt ${attemptNum}/${attempts}) after error: ${lastErr}. Waiting ${(delay).toFixed(0)}ms`);
      await new Promise(r=>setTimeout(r, delay));
      continue;
    }
  }
  return { success:false, quotes: [], error: lastErr || 'Failed after retries' };
}
