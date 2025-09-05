/**
 * Simplified Carrier System
 * 
 * This module combines NAIC carrier data with preferred carriers configuration
 * in a clean, extensible way that's ready for future product categories.
 */

import type { NAICCarrier } from '@/types';

// Import Firebase for fetching agent preferred carriers
import { hawknestDb } from './firebase';
import { doc, getDoc, collection } from 'firebase/firestore';

// ===== TYPES =====

export type ProductCategory = 
  | 'medicare-supplement' 
  | 'medicare-advantage' 
  | 'dental' 
  | 'final-expense' 
  | 'hospital-indemnity'
  | 'cancer'
  | 'drug-plan';

export interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;
  naicCode: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
}

export interface PreferredCarrier {
  id: string;
  displayName: string;
  category: ProductCategory;
  priority: number;
  naicCodes: string[];
  namePatterns: string[];
  website?: string;
  phone?: string;
  logoUrl?: string;
  isActive: boolean;
}

// ===== CORE CARRIER DATA =====

/**
 * Essential carrier information with NAIC codes
 * This is the single source of truth for carrier data
 */
export const CARRIERS: CarrierInfo[] = [
  // Medicare Supplement carriers
  {
    id: 'bankers-fidelity-61239',
    name: 'Bankers Fidelity Life Insurance Company',
    shortName: 'Bankers Fidelity',
    naicCode: '61239',
    phone: '800-241-1439',
    website: 'https://www.bankersfidelitylife.com',
    logoUrl: 'https://logo.clearbit.com/bankersfidelitylife.com'
  },
  {
    id: 'bankers-fidelity-71919',
    name: 'Bankers Fidelity Assurance Company',
    shortName: 'Bankers Fidelity',
    naicCode: '71919',
    phone: '800-241-1439',
    website: 'https://www.bankersfidelitylife.com',
    logoUrl: 'https://logo.clearbit.com/bankersfidelitylife.com'
  },
  {
    id: 'insurance-company-north-america',
    name: 'Insurance Company of North America',
    shortName: 'Chubb',
    naicCode: '19445',
    phone: '215-640-1000',
    website: 'https://www.chubb.com',
    logoUrl: 'https://logo.clearbit.com/chubb.com'
  },
  {
    id: 'cigna-65269',
    name: 'Healthspring Insurance Company, Formerly Cigna Insurance Company',
    shortName: 'Cigna',
    naicCode: '65269',
    phone: '512-451-2224',
    website: 'https://www.cigna.com',
    logoUrl: 'https://logo.clearbit.com/cigna.com'
  },
  {
    id: 'cigna-61727',
    name: 'Healthspring National Health Insurance Company, Formerly Cigna National Health Insurance Company',
    shortName: 'Cigna',
    naicCode: '61727',
    phone: '512-451-2224',
    website: 'https://www.cigna.com',
    logoUrl: 'https://logo.clearbit.com/cigna.com'
  },
  {
    id: 'aflac',
    name: 'American Family Life Assurance Company of Columbus (AFLAC)',
    shortName: 'Aflac',
    naicCode: '60380',
    phone: '800-992-3522',
    website: 'https://aflac.com',
    logoUrl: 'https://logo.clearbit.com/aflac.com'
  },
  {
    id: 'mutual-of-omaha',
    name: 'Mutual of Omaha Insurance Company',
    shortName: 'Mutual of Omaha',
    naicCode: '71412',
    phone: '402-342-7600',
    website: 'https://www.mutualofomaha.com',
    logoUrl: 'https://logo.clearbit.com/mutualofomaha.com'
  },
  {
    id: 'aetna-72052',
    name: 'Aetna Health Insurance Company',
    shortName: 'Aetna',
    naicCode: '72052',
    phone: '800-872-3862',
    website: 'https://www.aetna.com',
    logoUrl: 'https://logo.clearbit.com/aetna.com'
  },
  {
    id: 'nassau-life',
    name: 'Nassau Life Insurance Company',
    shortName: 'Nassau Life',
    naicCode: '93734',
    phone: '516-394-2000',
    website: 'https://www.nassaulife.com',
    logoUrl: 'https://logo.clearbit.com/nassaulife.com'
  },
  {
    id: 'united-healthcare-84549',
    name: 'UnitedHealthcare Insurance Company of America',
    shortName: 'UnitedHealthcare',
    naicCode: '84549',
    phone: '224-231-1451',
    website: 'https://www.uhc.com',
    logoUrl: 'https://logo.clearbit.com/uhc.com'
  },
  {
    id: 'united-healthcare-79413',
    name: 'UnitedHealthcare Insurance Company',
    shortName: 'UnitedHealthcare',
    naicCode: '79413',
    phone: '877-832-7734',
    website: 'https://www.uhc.com',
    logoUrl: 'https://logo.clearbit.com/uhc.com'
  },
  {
    id: 'humana-60219',
    name: 'Humana Insurance Company of Kentucky',
    shortName: 'Humana',
    naicCode: '60219',
    phone: '502-580-1000',
    website: 'https://www.humana.com',
    logoUrl: 'https://logo.clearbit.com/humana.com'
  },
  {
    id: 'humana-73288',
    name: 'Humana Insurance Company',
    shortName: 'Humana',
    naicCode: '73288',
    phone: '920-336-1100',
    website: 'https://www.humana.com',
    logoUrl: 'https://logo.clearbit.com/humana.com'
  },
  {
    id: 'humana-88595',
    name: 'Humana Insurance Company',
    shortName: 'Humana',
    naicCode: '88595',
    phone: '502-580-1000',
    website: 'https://www.humana.com',
    logoUrl: 'https://logo.clearbit.com/humana.com'
  },
  // Add more carriers as needed for other product categories
  {
    id: 'united-national-life',
    name: 'United National Life Insurance Company of America',
    shortName: 'United National Life',
    naicCode: '92703',
    phone: '800-207-8050',
    website: 'https://www.unlinsurance.com',
    logoUrl: 'https://logo.clearbit.com/unlinsurance.com'
  },
  // Missing carriers from quote data
  {
    id: 'medmutual-protect',
    name: 'MedMutual Protect',
    shortName: 'MedMutual Protect',
    naicCode: '62375',
    phone: '800-962-1688',
    website: 'https://www.medmutualprotect.com',
    logoUrl: 'https://logo.clearbit.com/medmutual.com'
  },
  {
    id: 'atlantic-capital-life',
    name: 'Atlantic Capital Life Assurance Company',
    shortName: 'Atlantic Capital Life',
    naicCode: '17393',
    phone: '800-241-1439',
    website: 'https://www.bankersfidelitylife.com',
    logoUrl: 'https://logo.clearbit.com/bankersfidelitylife.com'
  },
  {
    id: 'medico-life-health',
    name: 'Medico Life and Health Insurance Company',
    shortName: 'Medico',
    naicCode: '31119',
    phone: '800-445-6100',
    website: 'https://www.medico.com',
    logoUrl: 'https://logo.clearbit.com/medico.com'
  },
  {
    id: 'bcbs-hcsc',
    name: 'Blue Cross Blue Shield (HCSC)',
    shortName: 'Blue Cross Blue Shield',
    naicCode: '65269',
    phone: '877-774-2267',
    website: 'https://www.bcbs.com',
    logoUrl: 'https://logo.clearbit.com/bcbs.com'
  },
  {
    id: 'members-health',
    name: 'Members Health Insurance Company',
    shortName: 'Members Health',
    naicCode: '70024',
    phone: '800-633-4227',
    website: 'https://www.membershealth.com',
    logoUrl: '/images/carrier-placeholder.svg'
  }
];

// ===== LOOKUP FUNCTIONS =====

/**
 * Create lookup maps for efficient searches
 */
const carriersByNaicCode = new Map(CARRIERS.map(c => [c.naicCode, c]));
const carriersById = new Map(CARRIERS.map(c => [c.id, c]));

/**
 * Get carrier information by NAIC code
 */
export function getCarrierByNaicCode(naicCode: string): CarrierInfo | undefined {
  return carriersByNaicCode.get(naicCode);
}

/**
 * Get carrier information by ID
 */
export function getCarrierById(id: string): CarrierInfo | undefined {
  return carriersById.get(id);
}

/**
 * Get proper logo URL for a carrier
 */
export function getCarrierLogoUrl(naicCode: string, carrierName: string): string {
  const carrier = getCarrierByNaicCode(naicCode);
  if (carrier?.logoUrl) {
    return carrier.logoUrl;
  }
  
  // Fallback to placeholder
  return '/images/carrier-placeholder.svg';
}

/**
 * Get display name for a carrier (prefer short name from carrier data)
 */
export function getCarrierDisplayName(carrierName: string, naicCode: string): string {
  const carrier = getCarrierByNaicCode(naicCode);
  return carrier?.shortName || carrierName;
}

// ===== PREFERRED CARRIERS FUNCTIONS =====

/**
 * Find preferred carrier match for a quote
 */
/**
 * Find carrier by NAIC code
 */
export function findCarrierByNAIC(naicCode: string): CarrierInfo | null {
  return CARRIERS.find(carrier => carrier.naicCode === naicCode) || null;
}

/**
 * Find preferred carrier by name and NAIC (requires agent ID for dynamic lookup)
 * @deprecated Use findAgentPreferredCarrier instead for agent-specific results
 */
export function findPreferredCarrierByParams(
  carrierName: string, 
  naicCode?: string,
  category: ProductCategory = 'medicare-supplement'
): PreferredCarrier | null {
  // This function is deprecated - all preferred carrier lookups should be agent-specific
  console.warn('findPreferredCarrierByParams is deprecated. Use findAgentPreferredCarrier with agentId instead.');
  return null;
}

/**
 * @deprecated Use findAgentPreferredCarrier instead for agent-specific results
 */
export function findPreferredCarrier(quote: any, category: ProductCategory): PreferredCarrier | null {
  console.warn('findPreferredCarrier is deprecated. Use findAgentPreferredCarrier with agentId instead.');
  return null;
}

/**
 * @deprecated Use agent-specific preferred carrier checking instead
 */
export function isPreferredCarrier(quote: any, category: ProductCategory): boolean {
  console.warn('isPreferredCarrier is deprecated. Use agent-specific preferred carrier checking instead.');
  return false;
}

/**
 * Filter quotes to only include preferred carriers
 */
export function filterPreferredCarriers(quotes: any[], category: ProductCategory): any[] {
  return quotes.filter(quote => isPreferredCarrier(quote, category));
}

/**
 * Sort quotes by preferred carrier priority
 */
export function sortByPreferredCarrierPriority(quotes: any[], category: ProductCategory): any[] {
  return quotes.sort((a, b) => {
    const carrierA = findPreferredCarrier(a, category);
    const carrierB = findPreferredCarrier(b, category);
    
    // Preferred carriers first
    if (carrierA && !carrierB) return -1;
    if (!carrierA && carrierB) return 1;
    
    // Both preferred - sort by priority
    if (carrierA && carrierB) {
      if (carrierA.priority !== carrierB.priority) {
        return carrierA.priority - carrierB.priority;
      }
    }
    
    // Same priority or both non-preferred - sort by premium
    const premiumA = a.monthly_premium || (a.rate?.month ? a.rate.month / 100 : 0);
    const premiumB = b.monthly_premium || (b.rate?.month ? b.rate.month / 100 : 0);
    return premiumA - premiumB;
  });
}

/**
 * Get enhanced carrier display information for a quote
 */
export function getEnhancedCarrierInfo(quote: any, category: ProductCategory) {
  const naicCode = quote.naic || '';
  const carrierName = quote.carrier?.name || quote.company_base?.name || '';
  
  // Get basic carrier info
  const carrierInfo = getCarrierByNaicCode(naicCode);
  
  // Get preferred carrier info
  const preferredCarrier = findPreferredCarrier(quote, category);
  
  return {
    displayName: preferredCarrier?.displayName || carrierInfo?.shortName || carrierName,
    logoUrl: preferredCarrier?.logoUrl || carrierInfo?.logoUrl || '/images/carrier-placeholder.svg',
    website: preferredCarrier?.website || carrierInfo?.website,
    phone: preferredCarrier?.phone || carrierInfo?.phone,
    isPreferred: !!preferredCarrier,
    priority: preferredCarrier?.priority
  };
}

// ===== BACKWARD COMPATIBILITY =====

/**
 * Legacy compatibility - getProperLogoUrl alias
 */
export { getCarrierLogoUrl as getProperLogoUrl };

// Export legacy NAIC carrier format for compatibility
export const naicCarriers: NAICCarrier[] = CARRIERS.map(carrier => ({
  carrierId: carrier.id,
  carrierName: carrier.name,
  naicCode: carrier.naicCode,
  phone: carrier.phone || '',
  website: carrier.website || '',
  shortName: carrier.shortName,
  logoUrl: carrier.logoUrl || '/images/carrier-placeholder.svg'
}));

// ===== AGENT PREFERRED CARRIERS (FIRESTORE) =====

interface AgentAppointment {
  carrierId: string; // NAIC code
  // Add other appointment fields as needed
}

interface AgentBusinessInfo {
  appointments: AgentAppointment[];
}

interface AgentBusiness {
  businessInfo: AgentBusinessInfo;
}

interface AgentSettings {
  business: AgentBusiness;
}

/**
 * Fetches an agent's preferred carriers from Firestore based on their appointments
 */
export async function getAgentPreferredCarriers(
  agentId: string, 
  category: ProductCategory = 'medicare-supplement'
): Promise<PreferredCarrier[]> {
  try {
    if (!hawknestDb) {
      console.warn('Hawknest database not initialized, returning empty preferred carriers');
      return [];
    }

    // Get agent's settings document
    const settingsDocRef = doc(hawknestDb, 'agents', agentId, 'preferences', 'settings');
    const settingsDoc = await getDoc(settingsDocRef);

    if (!settingsDoc.exists()) {
      console.warn(`No settings found for agent ${agentId}, returning empty preferred carriers`);
      return [];
    }

    const settings = settingsDoc.data() as AgentSettings;
    const appointments = settings?.business?.businessInfo?.appointments || [];

    if (appointments.length === 0) {
      console.warn(`No appointments found for agent ${agentId}, returning empty preferred carriers`);
      return [];
    }

    // Convert NAIC codes to preferred carriers
    const agentPreferredCarriers: PreferredCarrier[] = [];
    
    for (const appointment of appointments) {
      const carrier = findCarrierByNAIC(appointment.carrierId);
      if (carrier) {
        agentPreferredCarriers.push({
          id: carrier.id,
          displayName: carrier.shortName || carrier.name,
          category: category,
          priority: agentPreferredCarriers.length + 1, // Assign priority based on order
          naicCodes: [carrier.naicCode],
          namePatterns: [carrier.name, carrier.shortName].filter(Boolean),
          website: carrier.website,
          phone: carrier.phone,
          logoUrl: carrier.logoUrl,
          isActive: true
        });
      }
    }

    return agentPreferredCarriers;
  } catch (error) {
    console.error(`Error fetching agent preferred carriers for ${agentId}:`, error);
    return [];
  }
}

/**
 * Finds preferred carrier by name or NAIC, with priority on agent's appointments
 */
export async function findAgentPreferredCarrier(
  agentId: string,
  carrierName: string, 
  naicCode?: string,
  category: ProductCategory = 'medicare-supplement'
): Promise<PreferredCarrier | null> {
  try {
    // Get agent's preferred carriers
    const agentPreferredCarriers = await getAgentPreferredCarriers(agentId, category);
    
    // First try to match with agent's preferred carriers
    const agentMatch = agentPreferredCarriers.find(carrier => {
      // Check name patterns first (prioritized)
      const nameMatch = carrier.namePatterns?.some(pattern => 
        carrierName.toLowerCase().includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(carrierName.toLowerCase())
      );
      
      // Check NAIC codes as fallback
      const naicMatch = naicCode && carrier.naicCodes?.includes(naicCode);
      
      return nameMatch || naicMatch;
    });

    if (agentMatch) {
      return agentMatch;
    }

    // No static fallback - agent must have appointments for preferred carriers
    return null;
  } catch (error) {
    console.error(`Error finding agent preferred carrier:`, error);
    return null;
  }
}
