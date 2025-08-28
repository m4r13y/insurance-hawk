'use client';

import { signInAnonymously, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';

// Type definitions for quote responses
interface QuoteResponse<T> {
  quotes?: T[];
  error?: string;
  success?: boolean;
}

// Quote service that handles authentication and Firebase function calls
class QuoteService {
  private currentUser: User | null = null;
  private functions: ReturnType<typeof getFunctions>;

  constructor() {
    this.functions = getFunctions(undefined, 'us-central1');
  }

  /**
   * Authenticate anonymously for quote requests
   */
  private async ensureAuthenticated(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    try {
      const result = await signInAnonymously(auth);
      this.currentUser = result.user;
      return this.currentUser;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate for quote request');
    }
  }

  /**
   * Get Medigap quotes from Firebase function for multiple plans
   */
  async getMedigapQuotes(quoteData: {
    zipCode: string;
    age: number;
    gender: 'Male' | 'Female';
    tobaccoUse: boolean;
    effectiveDate: string;
    plans?: string[]; // Optional array of plans, defaults to F, G, N
  }): Promise<QuoteResponse<any>> {
    try {
      // Ensure user is authenticated
      await this.ensureAuthenticated();
      
      // Default to the most common Medigap plans if not specified
      const plansToQuote = quoteData.plans || ['F', 'G', 'N'];
      
      // Convert to the exact format the Firebase function expects
      const baseParams = {
        zip5: quoteData.zipCode,
        age: quoteData.age,
        gender: quoteData.gender === 'Male' ? 'M' as const : 'F' as const,
        tobacco: quoteData.tobaccoUse ? 1 : 0
      };
      
      // Call the Firebase function for each plan in parallel
      const getMedigapQuotesFunction = httpsCallable(this.functions, 'getMedigapQuotes');
      const allQuotes: any[] = [];
      
      // Run all plan requests in parallel
      const planPromises = plansToQuote.map(async (plan) => {
        try {
          const functionParams = {
            ...baseParams,
            plan: plan
          };
          
          const result = await getMedigapQuotesFunction(functionParams);
          
          // Handle different response formats from Firebase function
          let quotes: any[] = [];
          
          if (result.data) {
            // If the response has a quotes array (wrapped response)
            if (typeof result.data === 'object' && 'quotes' in result.data && Array.isArray(result.data.quotes)) {
              quotes = result.data.quotes;
            }
            // If the response is an array itself (direct response)
            else if (Array.isArray(result.data)) {
              quotes = result.data;
            }
            // If it's a single object, wrap it in an array
            else if (typeof result.data === 'object') {
              quotes = [result.data];
            }
          }
          
          // Add plan identifier to each quote if missing
          quotes = quotes.map(quote => ({
            ...quote,
            plan: quote.plan || plan
          }));

          // Sort quotes for this plan by premium (lowest first)
          quotes.sort((a, b) => {
            const premiumA = a.monthly_premium || (a.rate?.month ? a.rate.month / 100 : 0);
            const premiumB = b.monthly_premium || (b.rate?.month ? b.rate.month / 100 : 0);
            return premiumA - premiumB;
          });

          return quotes;
        } catch (planError) {
          console.warn(`Failed to get quotes for plan ${plan}:`, planError);
          return [];
        }
      });

      // Wait for all plan requests to complete
      const planResults = await Promise.all(planPromises);
      
      // Combine all quotes
      planResults.forEach(quotes => {
        allQuotes.push(...quotes);
      });
      
      // Final sort by monthly premium (lowest first) across all plans
      allQuotes.sort((a, b) => {
        const premiumA = a.monthly_premium || (a.rate?.month ? a.rate.month / 100 : 0);
        const premiumB = b.monthly_premium || (b.rate?.month ? b.rate.month / 100 : 0);
        return premiumA - premiumB;
      });

      console.log(`Total quotes retrieved: ${allQuotes.length} across ${plansToQuote.length} plans`);

      return { 
        quotes: allQuotes,
        success: true
      };    } catch (error) {
      console.error('Error getting Medigap quotes:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to get quotes',
        success: false
      };
    }
  }

  /**
   * Get Dental quotes from Firebase function
   */
  async getDentalQuotes(quoteData: any) {
    try {
      console.log('🔄 Getting Dental quotes...', quoteData);
      
      await this.ensureAuthenticated();
      
      const getDentalQuotesFunction = httpsCallable(this.functions, 'getDentalQuotes');
      const result = await getDentalQuotesFunction(quoteData);
      
      console.log('✅ Dental quotes received:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error getting Dental quotes:', error);
      throw error;
    }
  }

  /**
   * Get Hospital Indemnity quotes from Firebase function
   */
  async getHospitalIndemnityQuotes(quoteData: any) {
    try {
      console.log('🔄 Getting Hospital Indemnity quotes...', quoteData);
      
      await this.ensureAuthenticated();
      
      const getHospitalIndemnityQuotesFunction = httpsCallable(this.functions, 'getHospitalIndemnityQuotes');
      const result = await getHospitalIndemnityQuotesFunction(quoteData);
      
      console.log('✅ Hospital Indemnity quotes received:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error getting Hospital Indemnity quotes:', error);
      throw error;
    }
  }

  /**
   * Get Cancer Insurance quotes from Firebase function
   */
  async getCancerInsuranceQuote(quoteData: any) {
    try {
      console.log('🔄 Getting Cancer Insurance quotes...', quoteData);
      
      await this.ensureAuthenticated();
      
      const getCancerInsuranceQuoteFunction = httpsCallable(this.functions, 'getCancerInsuranceQuote');
      const result = await getCancerInsuranceQuoteFunction(quoteData);
      
      console.log('✅ Cancer Insurance quotes received:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error getting Cancer Insurance quotes:', error);
      throw error;
    }
  }

  /**
   * Get Final Expense Life quotes from Firebase function
   */
  async getFinalExpenseLifeQuotes(quoteData: any) {
    try {
      console.log('🔄 Getting Final Expense Life quotes...', quoteData);
      
      await this.ensureAuthenticated();
      
      const getFinalExpenseLifeQuotesFunction = httpsCallable(this.functions, 'getFinalExpenseLifeQuotes');
      const result = await getFinalExpenseLifeQuotesFunction(quoteData);
      
      console.log('✅ Final Expense Life quotes received:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error getting Final Expense Life quotes:', error);
      throw error;
    }
  }

  /**
   * Get Medicare Advantage quotes from Firebase function
   */
  async getMedicareAdvantageQuotes(quoteData: any) {
    try {
      console.log('🔄 Getting Medicare Advantage quotes...', quoteData);
      
      await this.ensureAuthenticated();
      
      const getMedicareAdvantageQuotesFunction = httpsCallable(this.functions, 'getMedicareAdvantageQuotes');
      const result = await getMedicareAdvantageQuotesFunction(quoteData);
      
      console.log('✅ Medicare Advantage quotes received:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error getting Medicare Advantage quotes:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const quoteService = new QuoteService();
