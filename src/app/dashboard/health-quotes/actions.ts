
"use server";

import type { z } from "zod";
import type { healthQuoterFormSchema } from "@/components/health-insurance-quoter";
import type { HealthPlan, Drug, Provider, DrugCoverage, ProviderCoverage } from "@/types";

// Helper function to find the most relevant deductible from a plan's array of deductibles
function findDeductible(plan: any): number {
  if (!plan.deductibles || plan.deductibles.length === 0) return 0;
  
  // Prioritize In-Network, Individual deductibles
  const inNetworkIndividual = plan.deductibles.filter(
    (d: any) => d.network_tier === 'In-Network' && d.individual
  );

  if (inNetworkIndividual.length > 0) {
    // Prefer a combined medical/drug deductible if available
    const combined = inNetworkIndividual.find(
      (d: any) => d.type === 'Combined Medical and Drug EHB Deductible'
    );
    if (combined) return combined.amount;
    
    // Fallback to the first available in-network individual deductible
    return inNetworkIndividual[0].amount || 0;
  }
  
  // Fallback to the first deductible if no specific match is found
  return plan.deductibles[0].amount || 0;
}

// Helper function to find the most relevant Maximum Out-of-Pocket from a plan's array
function findOutOfPocketMax(plan: any): number {
  if (!plan.moops || plan.moops.length === 0) return 0;

  // Prioritize In-Network, Individual MOOPs
  const inNetworkIndividual = plan.moops.filter(
    (m: any) => m.network_tier === 'In-Network' && m.individual
  );

  if (inNetworkIndividual.length > 0) {
    // Prefer the total (medical + drug) MOOP if available
    const total = inNetworkIndividual.find(
      (m: any) => m.type === 'Maximum Out of Pocket for Medical and Drug EHB Benefits (Total)'
    );
    if (total) return total.amount;

    // Fallback to the first available in-network individual MOOP
    return inNetworkIndividual[0].amount || 0;
  }

  // Fallback to the first MOOP if no specific match is found
  return plan.moops[0].amount || 0;
}

export async function getHealthQuotes(values: z.infer<typeof healthQuoterFormSchema> & { offset?: number }) {
    const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
    if (!apiKey) {
        console.error("Healthcare.gov API key is not configured.");
        return { error: 'The quoting service is currently unavailable. Please contact support.' };
    }
    
    const apiGetHeaders = {
        'accept': 'application/json',
    };

    const apiPostHeaders = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
    };

    try {
        // Step 1: Get County FIPS and State from ZIP code
        const countyResponse = await fetch(`https://marketplace.api.healthcare.gov/api/v1/counties/by/zip/${values.zipCode}?apikey=${apiKey}`, {
            method: 'GET',
            headers: apiGetHeaders,
            next: { revalidate: 0 },
        });

        if (!countyResponse.ok) {
            const errorBody = await countyResponse.text();
            console.error(`County lookup failed for ZIP ${values.zipCode} with status ${countyResponse.status}: ${countyResponse.statusText}`, errorBody);
            return { error: 'Could not retrieve location information for the provided ZIP code. Please check the ZIP code and try again.' };
        }
        const countyData = await countyResponse.json();
        const county = countyData.counties?.[0];
        if (!county) {
            return { error: 'No county found for the provided ZIP code.' };
        }

        // Step 2: Construct the plan search payload
        const searchPayload: any = {
            market: "Individual",
            year: new Date().getFullYear(),
            place: {
                zipcode: values.zipCode,
                countyfips: county.fips,
                state: county.state,
            },
            household: {
                income: values.householdIncome,
                people: values.members.map(member => ({
                    age: member.age,
                    gender: member.gender,
                    uses_tobacco: member.uses_tobacco,
                    aptc_eligible: true, // Assume everyone is eligible for tax credits for simplicity
                })),
                unemployment_received: values.hadUnemployment === 'yes' ? 'Adult' : 'None',
            },
            limit: 50,
            offset: values.offset || 0,
            filter: values.filter || {},
        };

        // Step 3: Call the Plan Search API
        const planSearchResponse = await fetch(`https://marketplace.api.healthcare.gov/api/v1/plans/search?apikey=${apiKey}`, {
            method: 'POST',
            headers: apiPostHeaders,
            body: JSON.stringify(searchPayload),
            next: { revalidate: 0 },
        });

        if (!planSearchResponse.ok) {
            const errorBody = await planSearchResponse.json();
            console.error("Healthcare.gov API Error:", errorBody);
            return { error: errorBody.message || 'Failed to fetch health plans from the marketplace.' };
        }

        const planSearchData = await planSearchResponse.json();
        
        if (!planSearchData.plans || planSearchData.plans.length === 0) {
            return { plans: [], total: 0 };
        }
        
        // Step 4: Map the API response to our internal HealthPlan type
        let lowestPremium = Infinity;
        const mappedPlans: HealthPlan[] = planSearchData.plans.map((plan: any): HealthPlan => {
            const premiumWithCredit = plan.premium_w_credit ?? plan.premium;
            if (premiumWithCredit < lowestPremium) {
                lowestPremium = premiumWithCredit;
            }

            return {
                id: plan.id,
                name: plan.name.split('(')[0].trim(),
                provider: plan.issuer.name,
                premium: premiumWithCredit,
                taxCredit: (plan.premium - premiumWithCredit) > 0 ? (plan.premium - premiumWithCredit) : 0,
                deductible: findDeductible(plan),
                outOfPocketMax: findOutOfPocketMax(plan),
                network: plan.type,
                rating: plan.quality_rating?.global_rating ?? 0,
                isBestMatch: false, // will be set in the next step
                benefits_url: plan.benefits_url,
                formulary_url: plan.formulary_url,
                hsa_eligible: plan.hsa_eligible,
            };
        });

        // Step 5: Determine the "Best Match" plan(s) based on the lowest premium
        const finalPlans = mappedPlans.map(p => ({
            ...p,
            isBestMatch: p.premium === lowestPremium
        }));

        return { plans: finalPlans, total: planSearchData.total || 0 };

    } catch (e) {
        console.error("An unexpected error occurred in getHealthQuotes:", e);
        return { error: 'An unexpected error occurred while fetching quotes. Please check your network connection and API key.' };
    }
}

export async function searchDrugs(params: { query: string }): Promise<{ drugs?: Drug[], suggestions?: string[], error?: string }> {
  const { query } = params;
  if (!query || query.length < 3) return { drugs: [] };

  try {
    const response = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=40&option=1`, { next: { revalidate: 0 } });
    if (!response.ok) {
        console.error("NIH RxNav API error", response.status, response.statusText);
        return { drugs: [] };
    };

    const data = await response.json();
    const candidates = data.approximateGroup?.candidate || [];
    
    if (candidates.length === 0) {
        const suggestionsResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`);
        if (suggestionsResponse.ok) {
            const suggestionsData = await suggestionsResponse.json();
            const suggestions = suggestionsData.suggestionGroup?.suggestionList?.suggestion || [];
            return { drugs: [], suggestions: suggestions.slice(0, 5) }; // Return top 5 suggestions
        }
        return { drugs: [] }; // No drugs, no suggestions
    }

    const drugs: Drug[] = candidates
    .filter((candidate: any) => candidate.source === 'RXNORM')
    .map((candidate: any): Drug | null => {
        if (!candidate.rxcui) return null;
        
        let baseName: string;
        let fullName: string;
        let isGeneric: boolean;

        const match = candidate.name.match(/^(.*)\[(.*)\]$/);

        if (match) {
            const genericPart = match[1].trim().replace(/\s+\d.*$/, '').trim();
            baseName = match[2].trim();
            fullName = candidate.name; // Use original full name
            isGeneric = false;
        } else {
            // Handles cases like "lisinopril 20 MG Oral Tablet" or "levothyroxine Injection"
            // First, remove dosage info to consolidate different strengths
            baseName = candidate.name.replace(/\s+\d.*$/, '').trim();
            
            // If there's no dosage info (e.g., "levothyroxine Injection"), 
            // assume the first word is the base name to consolidate different forms.
            if (baseName.indexOf(' ') > -1 && !/\d/.test(candidate.name)) {
                baseName = baseName.split(' ')[0];
            }
            
            fullName = candidate.name;
            isGeneric = true;
        }
        
        return {
            id: candidate.rxcui,
            name: baseName,
            rxcui: candidate.rxcui,
            full_name: fullName,
            is_generic: isGeneric,
            strength: '', route: '', rxterms_dose_form: '', rxnorm_dose_form: '', generic: null,
        };
    }).filter((d: Drug | null): d is Drug => d !== null);

    // De-duplicate based on the extracted base name.
    const uniqueDrugs = Array.from(new Map(drugs.map(drug => [drug.name.toLowerCase(), drug])).values());
    
    return { drugs: uniqueDrugs.map(d => ({ ...d, full_name: d.name })) };
  } catch (e) {
    console.error("Failed to search drugs", e);
    return { error: 'Failed to search drugs', drugs: [] };
  }
}

export async function searchProviders(params: { query: string, zipCode: string }) {
   const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
  if (!apiKey) return { error: 'Service unavailable', providers: [] };
  
  const apiHeaders = { 'accept': 'application/json' };
  
  try {
    const response = await fetch(`https://marketplace.api.healthcare.gov/api/v1/providers/search?q=${params.query}&zipcode=${params.zipCode}&type=Individual,Facility&apikey=${apiKey}`, { headers: apiHeaders, next: { revalidate: 0 } });
    if(!response.ok) return { providers: [] };
    const data = await response.json();
    const providers: Provider[] = (data.providers || []).map((np: any) => np.provider);
    return { providers };
  } catch (e) {
     console.error("Failed to search providers", e);
    return { error: 'Failed to search providers', providers: [] };
  }
}

export async function getRelatedDrugs(params: { rxcui: string }) {
    try {
        // SBD = Semantic Branded Drug, SCD = Semantic Clinical Drug
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/Prescribe/rxcui/${params.rxcui}/related.json?tty=SBD+SCD`, { next: { revalidate: 0 } });
        if (!response.ok) return { error: 'Could not fetch drug forms.' };
        
        const data = await response.json();
        const conceptGroups = data.relatedGroup?.conceptGroup;
        if (!conceptGroups) return { drugs: [] };
        
        const drugs: Drug[] = conceptGroups.flatMap((group: any) => 
            (group.conceptProperties || []).map((prop: any) => ({
                id: prop.rxcui,
                rxcui: prop.rxcui,
                name: prop.name,
                full_name: prop.name,
                is_generic: prop.tty !== 'SBD', // Branded drugs are SBD
                // Fill other properties to satisfy the Drug type
                strength: '', route: '', rxterms_dose_form: '', rxnorm_dose_form: '', generic: null
            }))
        );
        return { drugs };

    } catch (e) {
        console.error("Failed to fetch related drugs", e);
        return { error: 'An unexpected error occurred.' };
    }
}


export async function getDrugCoverage(params: { planIds: string[], drugIds: string[] }) {
    const { planIds, drugIds } = params;
    if (planIds.length === 0 || drugIds.length === 0) return { coverage: [] };

    const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
    if (!apiKey) return { error: 'Service unavailable' };
    
    const apiHeaders = { 'accept': 'application/json' };
    const planidsParam = planIds.join(',');
    const drugsParam = drugIds.join(',');
    const year = new Date().getFullYear();

    try {
        const response = await fetch(`https://marketplace.api.healthcare.gov/api/v1/drugs/covered?year=${year}&drugs=${drugsParam}&planids=${planidsParam}&apikey=${apiKey}`, { 
            headers: apiHeaders, 
            next: { revalidate: 0 },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Drug coverage API error:', errorText);
            return { error: 'Failed to fetch drug coverage.' };
        }
        
        const data = await response.json();
        const coverage: DrugCoverage[] = data["Provider & Drug Coverage"] || [];
        return { coverage };

    } catch (e: any) {
        console.error("Failed to fetch drug coverage", e);
        return { error: 'An unexpected error occurred while fetching drug coverage.' };
    }
}

export async function getProviderCoverage(params: { planIds: string[], providerIds: string[] }) {
    const { planIds, providerIds } = params;
    if (planIds.length === 0 || providerIds.length === 0) return { coverage: [] };

    const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
    if (!apiKey) return { error: 'Service unavailable' };

    const apiHeaders = { 'accept': 'application/json' };
    const planidsParam = planIds.join(',');
    const provideridsParam = providerIds.join(',');
    const year = new Date().getFullYear();

    try {
        const response = await fetch(`https://marketplace.api.healthcare.gov/api/v1/providers/covered?year=${year}&providerids=${provideridsParam}&planids=${planidsParam}&apikey=${apiKey}`, { 
            headers: apiHeaders, 
            next: { revalidate: 0 },
            cache: 'no-store'
        });

        if (!response.ok) {
             const errorText = await response.text();
            console.error('Provider coverage API error:', errorText);
            return { error: 'Failed to fetch provider coverage.' };
        }

        const data = await response.json();
        const coverage: ProviderCoverage[] = data["Provider & Drug Coverage"] || [];
        return { coverage };

    } catch (e: any) {
        console.error("Failed to fetch provider coverage", e);
        return { error: 'An unexpected error occurred while fetching provider coverage.' };
    }
}
