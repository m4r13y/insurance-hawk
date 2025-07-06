
"use server";

import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues } from "@/types";

// The raw response from the Medigap csgapi
type CsgQuote = {
    key: string;
    rate: {
        month: number;
    };
    company_base: {
        name: string;
        ambest_rating: string;
    };
    plan: string;
    discounts: CsgDiscount[];
    rate_type?: string;
};

export async function getMedigapQuotes(values: QuoteRequestValues) {
  try {
    const params = new URLSearchParams({
        zip5: values.zipCode,
        age: values.age.toString(),
        gender: values.gender === 'female' ? 'F' : 'M',
        tobacco: values.tobacco === 'true' ? '1' : '0',
        plan: values.plan,
        limit: '10',
        apply_discounts: values.apply_discounts ? '1' : '0',
    });

    if (values.effectiveDate) {
        params.append('effective_date', values.effectiveDate);
    }
    
    const url = `https://private-anon-9ce7a8b71f-medigapapi.apiary-mock.com/v1/med_supp/quotes.json?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'x-api-token': '0529636d81a5b09e189302aac2ddb4aabb75ed48667242f3c953feb2591dc2a8'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || `API request failed: ${response.statusText}`);
        } catch {
            throw new Error(errorText || `API request failed: ${response.statusText}`);
        }
    }
    
    const data: unknown = await response.json();

    if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
         throw new Error((data as {message: string}).message);
    }
    
    if (!Array.isArray(data)) {
      console.error("API Error: Unexpected response format", data);
      throw new Error('Unexpected response format from API. Expected an array of quotes.');
    }

    const csgQuotes = data as CsgQuote[];

    const quotes: Quote[] = csgQuotes.map(q => ({
        id: q.key,
        monthly_premium: q.rate.month / 100,
        premium: q.rate.month / 100,
        carrier: {
            name: q.company_base.name,
            logo_url: null,
        },
        plan_name: `Plan ${q.plan}`,
        plan_type: q.plan,
        discounts: q.discounts,
        am_best_rating: q.company_base.ambest_rating,
        rate_type: q.rate_type,
    }));
    
    return { quotes };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to fetch quotes. Please try again later." };
  }
}

// The raw response from the Dental csgapi
type CsgDentalQuote = {
    key: string;
    plan_name: string;
    company_base: {
        name: string;
        ambest_rating: string;
    };
    base_plans: {
        benefits: {
            rate: number;
            amount: string;
            quantifier: string;
        }[];
        benefit_notes?: string;
        limitation_notes?: string;
    }[];
};

export async function getDentalQuotes(values: DentalQuoteRequestValues) {
    try {
        const params = new URLSearchParams({
            zip5: values.zipCode,
            age: values.age.toString(),
            gender: values.gender === 'female' ? 'F' : 'M',
            tobacco: values.tobacco === 'true' ? '1' : '0',
            covered_members: 'all',
            limit: '10',
        });

        const url = `https://private-anon-b21e065ee3-dentalvisionandhearingapi.apiary-mock.com/v1/dental/quotes.json?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                'x-api-token': '0529636d81a5b09e189302aac2ddb4aabb75ed48667242f3c953feb2591dc2a8'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Dental API Error Response:", errorText);
            throw new Error(`Dental API request failed: ${response.statusText}`);
        }

        const data: unknown = await response.json();

        if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
            throw new Error((data as { message: string }).message);
        }

        if (!Array.isArray(data)) {
            console.error("Dental API Error: Unexpected response format", data);
            throw new Error('Unexpected response format from Dental API. Expected an array of quotes.');
        }

        const csgQuotes = data as CsgDentalQuote[];

        const quotes: DentalQuote[] = csgQuotes.map(q => {
            const firstBasePlan = q.base_plans?.[0];
            const firstBenefit = firstBasePlan?.benefits?.[0];
            return {
                id: q.key,
                plan_name: q.plan_name,
                carrier: {
                    name: q.company_base.name,
                    logo_url: null,
                },
                monthly_premium: firstBenefit?.rate ?? 0,
                am_best_rating: q.company_base.ambest_rating,
                benefit_amount: firstBenefit?.amount ?? 'N/A',
                benefit_quantifier: firstBenefit?.quantifier ?? 'N/A',
                benefit_notes: firstBasePlan?.benefit_notes,
                limitation_notes: firstBasePlan?.limitation_notes,
            };
        });

        return { quotes };

    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to fetch dental quotes. Please try again later." };
    }
}

// The raw response from the Hospital Indemnity csgapi
type CsgHospitalIndemnityQuote = {
    key: string;
    plan_name: string;
    company_base: {
        name: string;
    };
    base_plans: {
        benefits: {
            rate: number;
            amount: string;
            quantifier: string;
        }[];
    }[];
    riders: HospitalIndemnityRider[];
};

export async function getHospitalIndemnityQuotes(values: HospitalIndemnityQuoteRequestValues) {
    try {
        const params = new URLSearchParams({
            zip5: values.zipCode,
            age: values.age.toString(),
            gender: values.gender === 'female' ? 'F' : 'M',
            tobacco: values.tobacco === 'true' ? '1' : '0',
            limit: '10',
        });

        const url = `https://private-anon-1df7339add-hospitalindemnityapi.apiary-mock.com/v1/hospital_indemnity/quotes.json?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                'x-api-token': '0529636d81a5b09e189302aac2ddb4aabb75ed48667242f3c953feb2591dc2a8'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hospital Indemnity API Error Response:", errorText);
            throw new Error(`Hospital Indemnity API request failed: ${response.statusText}`);
        }

        const data: unknown = await response.json();

        if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
            throw new Error((data as { message: string }).message);
        }

        if (!Array.isArray(data)) {
            console.error("Hospital Indemnity API Error: Unexpected response format", data);
            throw new Error('Unexpected response format from Hospital Indemnity API. Expected an array of quotes.');
        }

        const csgQuotes = data as CsgHospitalIndemnityQuote[];

        const quotes: HospitalIndemnityQuote[] = csgQuotes.map(q => {
            const baseBenefits = q.base_plans?.flatMap(bp => bp.benefits) || [];
            return {
                id: q.key,
                carrier: {
                    name: q.company_base.name,
                    logo_url: null,
                },
                plan_name: q.plan_name,
                baseBenefits: baseBenefits,
                riders: q.riders,
            };
        });

        return { quotes };

    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to fetch hospital indemnity quotes. Please try again later." };
    }
}
