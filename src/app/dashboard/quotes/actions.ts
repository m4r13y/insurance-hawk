
"use server";

import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues } from "@/types";

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
    discounts: any[];
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
        }[];
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

        const quotes: DentalQuote[] = csgQuotes.map(q => ({
            id: q.key,
            plan_name: q.plan_name,
            carrier: {
                name: q.company_base.name,
                logo_url: null,
            },
            monthly_premium: q.base_plans[0]?.benefits[0]?.rate ?? 0,
            am_best_rating: q.company_base.ambest_rating,
        }));

        return { quotes };

    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to fetch dental quotes. Please try again later." };
    }
}
