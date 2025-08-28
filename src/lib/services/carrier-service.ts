/**
 * Carrier service for fetching carrier data from DataConnect
 * Uses the hawknest-admin DataConnect service to get carrier information
 */

import { dataConnect } from "@/lib/firebase";

// Define carrier interface based on your DataConnect schema
interface Carrier {
  id: string;
  naicCode: string;
  fullCompanyName: string;
  shortName: string;
  website?: string | null;
  companyWebsite?: string | null;
  insuranceTypes: string[];
  licensedStates: string[];
  companyAddress?: string | null;
  companyCity?: string | null;
  companyState?: string | null;
  companyZip?: string | null;
  companyPhone?: string | null;
  isActive: boolean;
  lastUpdated?: string | null;
}

// Cache for carriers to avoid repeated API calls
let carrierCache: Carrier[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CarrierService {
  /**
   * Fetch carriers from DataConnect with caching
   */
  async getCarriers(): Promise<Carrier[]> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (carrierCache && (now - lastCacheTime) < CACHE_DURATION) {
      return carrierCache;
    }

    try {
      if (!dataConnect) {
        console.warn('DataConnect not initialized, returning empty carrier list');
        return [];
      }

      // Import DataConnect functions dynamically to avoid import issues
      const { executeQuery, queryRef } = await import('firebase/data-connect');
      
      // Create a query reference for listing carriers
      const carriersQuery = queryRef(dataConnect, 'ListCarriers', { 
        limit: 1000 // Get a large number of carriers
      });
      
      const result = await executeQuery(carriersQuery);
      
      // Type assertion for DataConnect result
      const dataResult = result.data as { carriers?: Carrier[] } | null;
      
      if (dataResult?.carriers && Array.isArray(dataResult.carriers)) {
        carrierCache = dataResult.carriers;
        lastCacheTime = now;
        console.log(`Loaded ${dataResult.carriers.length} carriers from DataConnect`);
        return dataResult.carriers;
      } else {
        console.warn('No carriers data received from DataConnect');
        return [];
      }
    } catch (error: any) {
      // Check if it's an authentication error
      if (error?.message?.includes('unauthenticated') || error?.message?.includes('UNAUTHENTICATED')) {
        console.warn('DataConnect requires authentication, using fallback carrier logic');
        return [];
      }
      
      console.error('Error fetching carriers from DataConnect:', error);
      return [];
    }
  }

  /**
   * Find carrier by NAIC code
   */
  async getCarrierByNaic(naicCode: string): Promise<Carrier | null> {
    const carriers = await this.getCarriers();
    return carriers.find(carrier => carrier.naicCode === naicCode) || null;
  }

  /**
   * Find carrier by name (fuzzy match)
   */
  async getCarrierByName(name: string): Promise<Carrier | null> {
    const carriers = await this.getCarriers();
    
    // Try exact match first
    let carrier = carriers.find(c => 
      c.fullCompanyName.toLowerCase() === name.toLowerCase() ||
      c.shortName.toLowerCase() === name.toLowerCase()
    );
    
    if (carrier) return carrier;
    
    // Try partial match
    carrier = carriers.find(c => 
      c.fullCompanyName.toLowerCase().includes(name.toLowerCase()) ||
      c.shortName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.shortName.toLowerCase())
    );
    
    return carrier || null;
  }

  /**
   * Get carrier logo URL using website from DataConnect
   */
  getCarrierLogoUrl(carrier: Carrier): string {
    // Use website from DataConnect if available
    const website = carrier.companyWebsite || carrier.website;
    
    if (website && website.trim() !== "" && website !== "https://") {
      try {
        const hostname = new URL(website).hostname;
        return `https://logo.clearbit.com/${hostname}`;
      } catch {
        // If URL parsing fails, fall through to fallback
      }
    }
    
    // Fallback: construct URL from carrier name
    const cleanName = carrier.shortName || carrier.fullCompanyName;
    const normalizedName = cleanName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
      
    return `https://logo.clearbit.com/${normalizedName}.com`;
  }

  /**
   * Enhanced carrier logo function that takes a carrier name or NAIC
   * and returns the best logo URL
   */
  async getLogoUrlForCarrier(carrierNameOrNaic: string): Promise<string> {
    try {
      // Try to find carrier by NAIC first
      let carrier = await this.getCarrierByNaic(carrierNameOrNaic);
      
      // If not found by NAIC, try by name
      if (!carrier) {
        carrier = await this.getCarrierByName(carrierNameOrNaic);
      }
      
      if (carrier) {
        return this.getCarrierLogoUrl(carrier);
      }
    } catch (error) {
      console.warn(`Error finding carrier ${carrierNameOrNaic} in DataConnect:`, error);
    }
    
    // Fallback to original method if carrier not found in database or on error
    const cleanName = carrierNameOrNaic
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
      
    return `https://logo.clearbit.com/${cleanName}.com`;
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    carrierCache = null;
    lastCacheTime = 0;
  }
}

// Export singleton instance
export const carrierService = new CarrierService();
export type { Carrier };
