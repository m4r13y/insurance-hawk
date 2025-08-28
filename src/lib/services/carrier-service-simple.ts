// Simple carrier service for logo URL generation
// No external dependencies - works without authentication

// Static carrier mappings for common insurance companies
const CARRIER_WEBSITES: Record<string, string> = {
  'humana': 'humana.com',
  'united healthcare': 'uhc.com',
  'unitedhealth': 'uhc.com',
  'united health': 'uhc.com',
  'aetna': 'aetna.com',
  'anthem': 'anthem.com',
  'blue cross': 'bcbs.com',
  'bcbs': 'bcbs.com',
  'cigna': 'cigna.com',
  'kaiser': 'kp.org',
  'wellcare': 'wellcare.com',
  'molina': 'molinahealthcare.com',
  'mutual of omaha': 'mutualofomaha.com',
  'manhattan life': 'manhattanlife.com',
  'gerber life': 'gerberlife.com',
  'standard life': 'standard.com',
  'transamerica': 'transamerica.com',
  'metlife': 'metlife.com',
  'prudential': 'prudential.com',
  'allstate': 'allstate.com',
  'state farm': 'statefarm.com',
  'progressive': 'progressive.com',
  'geico': 'geico.com'
};

class CarrierService {
  private logoCache = new Map<string, string>();

  /**
   * Get logo URL for a carrier by name or NAIC code
   * Falls back to name-based URL generation if not found in mappings
   */
  getLogoUrlForCarrier(identifier: string): string {
    // Check cache first
    const cacheKey = identifier.toLowerCase();
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    let logoUrl: string;

    // Try to find a known website for this carrier
    const lowerIdentifier = identifier.toLowerCase();
    let foundWebsite: string | undefined;

    for (const [key, website] of Object.entries(CARRIER_WEBSITES)) {
      if (lowerIdentifier.includes(key)) {
        foundWebsite = website;
        break;
      }
    }

    if (foundWebsite) {
      logoUrl = `https://logo.clearbit.com/${foundWebsite}`;
    } else {
      // Fallback: construct URL from identifier
      const cleanName = identifier
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, ''); // Remove special characters
      logoUrl = `https://logo.clearbit.com/${cleanName}.com`;
    }

    // Cache the result
    this.logoCache.set(cacheKey, logoUrl);

    return logoUrl;
  }

  /**
   * Clear the logo cache
   */
  clearCache(): void {
    this.logoCache.clear();
  }

  /**
   * Get a list of known carrier mappings
   */
  getKnownCarriers(): string[] {
    return Object.keys(CARRIER_WEBSITES);
  }
}

// Export singleton instance
export const carrierService = new CarrierService();
