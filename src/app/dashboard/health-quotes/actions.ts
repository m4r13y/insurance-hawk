
"use server";

import type { z } from "zod";
import type { healthQuoterFormSchema } from "@/components/health-insurance-quoter";
import type { HealthPlan } from "@/types";

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


export async function getHealthQuotes(values: z.infer<typeof healthQuoterFormSchema>) {
    const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
    if (!apiKey) {
        console.error("Healthcare.gov API key is not configured.");
        return { error: 'The quoting service is currently unavailable. Please contact support.' };
    }

    try {
        // Step 1: Get County FIPS and State from ZIP code
        const countyResponse = await fetch(`https://marketplace.api.healthcare.gov/api/v1/counties/by/zip/${values.zipCode}?apikey=${apiKey}`);
        if (!countyResponse.ok) {
            console.error(`County lookup failed for ZIP ${values.zipCode}: ${countyResponse.statusText}`);
            return { error: 'Could not retrieve location information for the provided ZIP code. Please check the ZIP code and try again.' };
        }
        const countyData = await countyResponse.json();
        const county = countyData.counties?.[0];
        if (!county) {
            return { error: 'No county found for the provided ZIP code.' };
        }

        // Step 2: Construct the plan search payload
        const searchPayload = {
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
            // Add a limit for performance
            limit: 50,
        };

        // Step 3: Call the Plan Search API
        const planSearchResponse = await fetch(`https://marketplace.api.healthcare.gov/api/v1/plans/search?apikey=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchPayload),
        });

        if (!planSearchResponse.ok) {
            const errorBody = await planSearchResponse.json();
            console.error("Healthcare.gov API Error:", errorBody);
            return { error: errorBody.message || 'Failed to fetch health plans from the marketplace.' };
        }

        const planSearchData = await planSearchResponse.json();
        
        if (!planSearchData.plans || planSearchData.plans.length === 0) {
            return { plans: [] };
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
                name: plan.name,
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
            };
        });

        // Step 5: Determine the "Best Match" plan(s) based on the lowest premium
        const finalPlans = mappedPlans.map(p => ({
            ...p,
            isBestMatch: p.premium === lowestPremium
        }));

        return { plans: finalPlans };

    } catch (e) {
        console.error("An unexpected error occurred in getHealthQuotes:", e);
        return { error: 'An unexpected error occurred while fetching quotes.' };
    }
}
