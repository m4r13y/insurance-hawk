import type { NAICCarrier } from '@/types';

/**
 * Convert text to proper title case, handling special cases for insurance names
 */
function toTitleCase(str: string): string {
  // List of words that should remain lowercase (except when at the beginning)
  const lowercaseWords = ['of', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'];
  // List of words that should remain uppercase
  const uppercaseWords = ['LLC', 'L.L.C', 'INC', 'CORP', 'HMO', 'USA', 'TX', 'CO', 'NY', 'CA', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'VA', 'WA', 'AZ', 'MA', 'IN', 'TN', 'MO', 'MD', 'WI', 'MN', 'CO', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'IA', 'MS', 'AR', 'KS', 'UT', 'NV', 'NM', 'WV', 'NE', 'ID', 'HI', 'NH', 'ME', 'RI', 'MT', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY', 'DC'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Keep uppercase words uppercase
      if (uppercaseWords.includes(cleanWord.toUpperCase())) {
        return word.toUpperCase();
      }
      
      // Keep lowercase words lowercase (except at the beginning)
      if (index > 0 && lowercaseWords.includes(cleanWord.toLowerCase())) {
        return word.toLowerCase();
      }
      
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * NAIC Carrier Reference Data
 * 
 * This data structure contains carrier information with NAIC codes that can be used to:
 * 1. Filter quote results to only show carriers with matching NAIC codes
 * 2. Generate logo URLs using Clearbit or fallback to website favicons
 * 3. Provide contact information and carrier details
 * 
 * Logo URLs are generated from the carrier's website using Clearbit's logo API
 */

export const naicCarriers: NAICCarrier[] = [
  {
    carrierId: "fd6c1c35dbbd4787ab5b54268a71a1a7",
    carrierName: "Aetna Health Insurance Company",
    naicCode: "72052",
    phone: "800-872-3862",
    website: "https://aetnaseniorproducts.com",
    shortName: "Aetna",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "f7078f09710e44559620e7e7294c3ef7",
    carrierName: "Accendo Insurance Company",
    naicCode: "63444",
    phone: "615-807-7500",
    website: "https://www.aetnaseniorproducts.com",
    shortName: "Accendo",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "5c0f3c1172c54d9fb7d438cb9ea27a56",
    carrierName: "Ace Property and Casualty Insurance Company",
    naicCode: "20699",
    phone: "215-640-1000",
    website: "https://www.chubb.com",
    shortName: "Ace Property",
    logoUrl: "https://logo.clearbit.com/chubb.com"
  },
  {
    carrierId: "f9bd5b6fe3a2409cbe2a759a5a1bdd90",
    carrierName: "Aetna Dental INC (a Texas Corporation)",
    naicCode: "95910",
    phone: "800-872-3862",
    website: "https://www.aetna.com",
    shortName: "Aetna Dental",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "8d67a4e42ef746c280aaa73254313376",
    carrierName: "Aetna Health INC (a Texas Corporation)",
    naicCode: "95490",
    phone: "800-872-3862",
    website: "https://www.aetna.com",
    shortName: "Aetna Health",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "0620397b647845ba9e36754541feaac5",
    carrierName: "Aetna Life Insurance Company",
    naicCode: "60054",
    phone: "800-872-3862",
    website: "https://www.aetna.com",
    shortName: "Aetna",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "08312a35aeb747efbd655b678b156fd0",
    carrierName: "All Savers Insurance Company",
    naicCode: "82406",
    phone: "317-715-7056",
    website: "https://myallsavers.com",
    shortName: "All Savers",
    logoUrl: "https://logo.clearbit.com/allsavers.com"
  },
  {
    carrierId: "1ea8d1c9c16e4fcb99956aa269cbb82f",
    carrierName: "American Family Life Assurance Company of Columbus (AFLAC)",
    naicCode: "60380",
    phone: "800-992-3522",
    website: "https://aflac.com",
    shortName: "Aflac",
    logoUrl: "https://logo.clearbit.com/aflac.com"
  },
  {
    carrierId: "459740dc97814471afa2a63516c04d48",
    carrierName: "American Heritage Life Insurance Company",
    naicCode: "60534",
    phone: "904-992-1776",
    website: "https://www.standard.com",
    shortName: "American Heritage",
    logoUrl: "https://logo.clearbit.com/standard.com"
  },
  {
    carrierId: "7d6379ef0bf14f1e8fc6c406d377b936",
    carrierName: "Ameritas Life Insurance CORP",
    naicCode: "61301",
    phone: "402-467-1122",
    website: "https://www.ameritas.com",
    shortName: "Ameritas",
    logoUrl: "https://logo.clearbit.com/ameritas.com"
  },
  {
    carrierId: "4a99159f57cf4d1296f334f62e1a4283",
    carrierName: "Baylor Scott & White Insurance Company",
    naicCode: "11670",
    phone: "254-298-3000",
    website: "https://www.swhp.org",
    shortName: "Baylor Scott & White",
    logoUrl: "https://logo.clearbit.com/swhp.org"
  },
  {
    carrierId: "8fc7f96ed3d148b0a89221fe16e8fbe8",
    carrierName: "Bankers Fidelity Life Insurance Company",
    naicCode: "61239",
    phone: "800-241-1439",
    website: "https://www.bankersfidelitylife.com",
    shortName: "Bankers Fidelity",
    logoUrl: "https://logo.clearbit.com/bankersfidelitylife.com"
  },
  {
    carrierId: "f1cadac0f67e4e4a97cbf0a92dea3b2d",
    carrierName: "Bankers Fidelity Assurance Company",
    naicCode: "71919",
    phone: "800-241-1439",
    website: "https://www.bankersfidelitylife.com",
    shortName: "Bankers Fidelity",
    logoUrl: "https://logo.clearbit.com/bankersfidelitylife.com"
  },
  {
    carrierId: "f4d3faef975e45558fdfc8b5d831ff74",
    carrierName: "Continental Life Insurance Company of Brentwood, Tennessee",
    naicCode: "68500",
    phone: "800-264-4000",
    website: "https://www.aetnaseniorproducts.com",
    shortName: "Continental of Brentwood, Tennessee",
    logoUrl: "https://logo.clearbit.com/aetna.com"
  },
  {
    carrierId: "35f5d3433bcd4bc792b9a9df5fe65573",
    carrierName: "Care Improvement Plus South Central Insurance Company",
    naicCode: "12567",
    phone: "952-936-1300",
    website: "https://www.uhcmedicaresolutions.com",
    shortName: "Care Improvement Plus South Central",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "21bb8a83e0c5452dbf042e0f5ae3a3ac",
    carrierName: "CHA HMO Inc",
    naicCode: "95158",
    phone: "502-580-1000",
    website: "https://www.humana.com",
    shortName: "CHA HMO",
    logoUrl: "https://logo.clearbit.com/humana.com"
  },
  {
    carrierId: "2e06bddec7724bebb67a9252fde10a4a",
    carrierName: "Metropolitan Life Insurance Company",
    naicCode: "65978",
    phone: "212-578-2640",
    website: "https://www.metlife.com",
    shortName: "Metropolitan",
    logoUrl: "https://logo.clearbit.com/metlife.com"
  },
  {
    carrierId: "1353b0707b43427eab128443f626582c",
    carrierName: "Hartford Life and Accident Insurance Company",
    naicCode: "70815",
    phone: "860-547-5000",
    website: "https://www.thehartford.com",
    shortName: "Hartford and Accident",
    logoUrl: "https://logo.clearbit.com/thehartford.com"
  },
  {
    carrierId: "abf14c2dc23e4e6cb67a5d9a178a38a4",
    carrierName: "HCSC Insurance Services Company",
    naicCode: "78611",
    phone: "312-653-6000",
    website: "https://www.hcsc.com",
    shortName: "HCSC Services",
    logoUrl: "https://logo.clearbit.com/hcsc.com"
  },
  {
    carrierId: "e1b105cfffd643e69f795b6bb2d1f2c9",
    carrierName: "Guarantee Trust Life Insurance Company",
    naicCode: "64211",
    phone: "847-699-0600",
    website: "https://www.gtlic.com",
    shortName: "Guarantee Trust",
    logoUrl: "https://logo.clearbit.com/gtlic.com"
  },
  {
    carrierId: "0db82c5c4afd440c9ff78c01bb90d172",
    carrierName: "Health Care Service Corporation, a Mutual Legal Reserve Company",
    naicCode: "70670",
    phone: "312-653-6000",
    website: "https://www.hcsc.com",
    shortName: "Healthspring",
    logoUrl: "https://logo.clearbit.com/hcsc.com"
  },
  {
    carrierId: "6a1deaa3e96b42b0811e194a2f5d595e",
    carrierName: "Humana Insurance Company of Kentucky",
    naicCode: "60219",
    phone: "502-580-1000",
    website: "https://www.humana.com",
    shortName: "Humana",
    logoUrl: "https://logo.clearbit.com/humana.com"
  },
  {
    carrierId: "88595001", // Generated unique ID for Humana Insurance Company
    carrierName: "Humana Insurance Company",
    naicCode: "88595",
    phone: "502-580-1000",
    website: "https://www.humana.com",
    shortName: "Humana",
    logoUrl: "https://logo.clearbit.com/humana.com"
  },
  {
    carrierId: "da771dcace664d548a84b185a11f4568",
    carrierName: "Healthspring Insurance Company, Formerly Cigna Insurance Company",
    naicCode: "65269",
    phone: "512-451-2224",
    website: "https://www.hcsc.com",
    shortName: "Healthspring",
    logoUrl: "https://logo.clearbit.com/hcsc.com"
  },
  {
    carrierId: "b1fda7f4884f4f81a237eaab4d0262fc",
    carrierName: "Healthspring National Health Insurance Company, Formerly Cigna National Health Insurance Company",
    naicCode: "61727",
    phone: "512-451-2224",
    website: "https://www.hcsc.com",
    shortName: "Healthspring National Health",
    logoUrl: "https://logo.clearbit.com/hcsc.com"
  },
  {
    carrierId: "7fbf23083ffd495f900be9461ddffa2a",
    carrierName: "Humana Insurance Company",
    naicCode: "73288",
    phone: "920-336-1100",
    website: "https://www.humana.com",
    shortName: "Humana",
    logoUrl: "https://logo.clearbit.com/humana.com"
  },
  {
    carrierId: "3ff6565736474d768d9ec98aa5372d62",
    carrierName: "Investors Heritage Life Insurance Company",
    naicCode: "64904",
    phone: "502-223-2361",
    website: "https://www.investorsheritage.com",
    shortName: "Investors Heritage",
    logoUrl: "https://logo.clearbit.com/investorsheritage.com"
  },
  {
    carrierId: "93b15fde452e4223ad2a3365a83d9b3b",
    carrierName: "Loyal American Life Insurance Company",
    naicCode: "65722",
    phone: "512-451-2224",
    website: "https://www.hcsc.com",
    shortName: "Loyal American",
    logoUrl: "https://logo.clearbit.com/hcsc.com"
  },
  {
    carrierId: "fdb4be0af9a8460c8717d517b095274d",
    carrierName: "The Lincoln National Life Insurance Company",
    naicCode: "65676",
    phone: "800-444-2363",
    website: "https://www.lincolnfinancial.com",
    shortName: "The Lincoln National",
    logoUrl: "https://logo.clearbit.com/lincolnfinancial.com"
  },
  {
    carrierId: "78ca988726a64e429f9a9956c90db290",
    carrierName: "Mutual of Omaha Insurance Company",
    naicCode: "71412",
    phone: "402-342-7600",
    website: "https://www.mutualofomaha.com",
    shortName: "Mutual of Omaha",
    logoUrl: "https://logo.clearbit.com/mutualofomaha.com"
  },
  {
    carrierId: "bf8cce6ec15d4392ba240284d55f49aa",
    carrierName: "National Health Insurance Company",
    naicCode: "82538",
    phone: "800-526-0332",
    website: "https://www.nationalgeneral.com",
    shortName: "National Health",
    logoUrl: "https://logo.clearbit.com/nationalgeneral.com"
  },
  {
    carrierId: "187fec99c98243aa8b198b27e73f1b41",
    carrierName: "UnitedHealthcare Insurance Company of America",
    naicCode: "84549",
    phone: "224-231-1451",
    website: "https://www.uhc.com",
    shortName: "United Healthcare",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "1c817afa73344599a4bd28d265d10a34",
    carrierName: "UnitedHealthcare Community Plan of Texas, L.L.C",
    naicCode: "11141",
    phone: "832-500-6437",
    website: "https://uhccommunityplan.com",
    shortName: "United Healthcare",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "38af80470e8a425285d3f9969b263d90",
    carrierName: "National Pacific Dental, Inc",
    naicCode: "95251",
    phone: "713-803-8100",
    website: "https://www.uhc.com",
    shortName: "National Pacific Dental",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "a037524f7a5543c3a2fadc49c2347196",
    carrierName: "UnitedHealthcare Insurance Company",
    naicCode: "79413",
    phone: "877-832-7734",
    website: "https://www.unitedhealthgroup.com",
    shortName: "United Healthcare",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "318197372e154db396b7877ee145fd1e",
    carrierName: "UnitedHealthCare of Texas, Inc",
    naicCode: "95765",
    phone: "469-633-8512",
    website: "https://www.uhc.com",
    shortName: "United HealthCare of Texas",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "e9f7ce06be6f4a328a067169a22e985c",
    carrierName: "North American Company for Life and Health Insurance",
    naicCode: "66974",
    phone: "515-440-5500",
    website: "https://www.northamericancompany.com",
    shortName: "North American for and Health",
    logoUrl: "https://logo.clearbit.com/northamericancompany.com"
  },
  {
    carrierId: "e49cb91dd6664d76b5a06e1d8509892a",
    carrierName: "UnitedHealthcare Benefits of Texas Inc",
    naicCode: "95174",
    phone: "952-979-7329",
    website: "https://www.uhcwest.com",
    shortName: "UnitedHealthcare Benefits of Texas",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "5f001e8c4bb74cca91b5d08cc373df7b",
    carrierName: "Pekin Life Insurance Company",
    naicCode: "67628",
    phone: "309-346-1161",
    website: "https://www.pekininsurance.com",
    shortName: "Pekin",
    logoUrl: "https://logo.clearbit.com/pekininsurance.com"
  },
  {
    carrierId: "ccaf2668294544c7b4159c191c7a5aa6",
    carrierName: "Physicians Health Choice of Texas, LLC",
    naicCode: "11494",
    phone: "952-936-1300",
    website: "https://www.uhc.com",
    shortName: "Physicians Health Choice of Texas",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "7f413909c9b34affb954b3c387e6599b",
    carrierName: "PacifiCare Life and Health Insurance Company",
    naicCode: "70785",
    phone: "612-383-4182",
    website: "https://www.uhc.com",
    shortName: "PacifiCare and Health",
    logoUrl: "https://logo.clearbit.com/uhc.com"
  },
  {
    carrierId: "b53d37c96cb745a9a40db1398b43d779",
    carrierName: "Reserve National Insurance Company",
    naicCode: "68462",
    phone: "800-654-9106",
    website: "https://www.medmutualprotect.com",
    shortName: "Reserve National",
    logoUrl: "https://logo.clearbit.com/medmutualprotect.com"
  },
  {
    carrierId: "2aa01b95934a423fa0fea90520375767",
    carrierName: "Scott & White Care Plans",
    naicCode: "16426",
    phone: "254-298-3000",
    website: "https://www.swhp.org",
    shortName: "Scott & White Care Plans",
    logoUrl: "https://logo.clearbit.com/swhp.org"
  },
  {
    carrierId: "bf3d6fa12d1f48a78df4d8f9a3c54aa7",
    carrierName: "Scott & White Health Plan",
    naicCode: "95099",
    phone: "254-298-3000",
    website: "https://www.swhp.org",
    shortName: "Scott & White Health Plan",
    logoUrl: "https://logo.clearbit.com/swhp.org"
  },
  {
    carrierId: "cdd463c9a9d8487eb5c63e6a2b2947e9",
    carrierName: "Sentinel Security Life Insurance Company",
    naicCode: "68802",
    phone: "801-484-8514",
    website: "https://www.sslco.com",
    shortName: "Sentinel Security",
    logoUrl: "https://logo.clearbit.com/sslco.com"
  },
  {
    carrierId: "fab1d0667f38435087f793cb701edc2f",
    carrierName: "Transamerica Life Insurance Company",
    naicCode: "86231",
    phone: "319-355-8511",
    website: "https://www.transamerica.com",
    shortName: "Transamerica",
    logoUrl: "https://logo.clearbit.com/transamerica.com"
  },
  {
    carrierId: "fd9a796793374512913ef6d5e096eb5b",
    carrierName: "SHA, L.L.C",
    naicCode: "95138",
    phone: "254-298-3000",
    website: "https://www.firstcare.com",
    shortName: "SHA, L.L.C",
    logoUrl: "https://logo.clearbit.com/firstcare.com"
  },
    {
    carrierId: "",
    carrierName: "Nassau",
    naicCode: "93734",
    phone: "",
    website: "https://salesnet.nfg.com/",
    shortName: "Nassau",
    logoUrl: "https://logo.clearbit.com/salesnet.nfg.com/"
  },
  {
    carrierId: "3c37002a94b541b5b72d100e661cda28",
    carrierName: "United National Life Insurance Company of America",
    naicCode: "92703",
    phone: "800-207-8050",
    website: "https://www.unlinsurance.com",
    shortName: "United National of America",
    logoUrl: "https://logo.clearbit.com/unlinsurance.com"
  },
/*
  {
    carrierId: "409c1570dd844afd8615047536c80417",
    carrierName: "Woodmen Of The World Life Insurance Society",
    naicCode: "57320",
    phone: "402-342-1890",
    website: "https://www.woodmenlife.org",
    shortName: "Woodmen Of The World Society",
    logoUrl: "https://logo.clearbit.com/woodmenlife.org"
  }
*/
];

/**
 * Helper functions for working with NAIC carrier data
 */

// Create a map for quick lookups by NAIC code
export const naicCarriersByCode = new Map(
  naicCarriers.map(carrier => [carrier.naicCode, carrier])
);

// Create a map for quick lookups by carrier ID
export const naicCarriersById = new Map(
  naicCarriers.map(carrier => [carrier.carrierId, carrier])
);

/**
 * Get carrier information by NAIC code
 */
export function getCarrierByNaicCode(naicCode: string): NAICCarrier | undefined {
  return naicCarriersByCode.get(naicCode);
}

/**
 * Get carrier information by carrier ID
 */
export function getCarrierById(carrierId: string): NAICCarrier | undefined {
  return naicCarriersById.get(carrierId);
}

/**
 * Filter quote results to only include carriers with valid NAIC codes
 * @param quotes Array of quote objects that should have a naicCode property
 * @returns Filtered quotes array with only valid NAIC carriers
 */
export function filterQuotesByValidNaicCodes<T extends { naicCode?: string }>(quotes: T[]): T[] {
  return quotes.filter(quote => 
    quote.naicCode && naicCarriersByCode.has(quote.naicCode)
  );
}

/**
 * Get logo URL for a carrier by NAIC code
 * Falls back to website favicon if Clearbit logo is not available
 */
export function getCarrierLogoUrl(naicCode: string): string | undefined {
  const carrier = getCarrierByNaicCode(naicCode);
  if (!carrier) return undefined;
  
  return carrier.logoUrl || `${carrier.website}/favicon.ico`;
}

/**
 * Get proper logo URL for a carrier, handling fallbacks gracefully
 * This function should be used instead of constructing logo URLs manually
 */
export function getProperLogoUrl(naicCode?: string, carrierName?: string): string {
  // First try to get logo from NAIC database
  if (naicCode) {
    const carrier = getCarrierByNaicCode(naicCode);
    if (carrier?.logoUrl) {
      return carrier.logoUrl;
    }
  }
  
  // If no NAIC carrier found, try to generate from carrier name
  if (carrierName) {
    // Don't try to generate URLs from NAIC codes that were passed as carrier names
    const isNaicCode = /^\d{5}$/.test(carrierName.trim());
    if (isNaicCode) {
      console.warn(`NAIC code ${carrierName} not found in database, using placeholder`);
      return '/images/carrier-placeholder.svg';
    }
    
    // Clean up carrier name for URL generation
    const cleanName = carrierName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/insurance|company|inc|corp|llc|ltd/g, '')
      .trim();
    
    if (cleanName && cleanName.length > 2) {
      return `https://logo.clearbit.com/${cleanName}.com`;
    }
  }
  
  // Final fallback - return a placeholder or default logo
  return '/images/carrier-placeholder.svg';
}

/**
 * Get all unique NAIC codes for filtering purposes
 */
export function getAllNaicCodes(): string[] {
  return Array.from(naicCarriersByCode.keys());
}

/**
 * Search carriers by name (partial match, case insensitive)
 */
export function searchCarriersByName(searchTerm: string): NAICCarrier[] {
  const term = searchTerm.toLowerCase();
  return naicCarriers.filter(carrier => 
    carrier.carrierName.toLowerCase().includes(term) ||
    carrier.shortName.toLowerCase().includes(term)
  );
}
