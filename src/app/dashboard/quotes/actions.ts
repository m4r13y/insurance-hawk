
"use server";

import type { Quote, QuoteRequestValues } from "@/types";

// The raw response from the csgapi
type CsgQuote = {
    key: string;
    rate: {
        month: number; // in pennies
    };
    company_base: {
        name: string;
        ambest_rating: string;
    };
    plan: string;
    discounts: any[];
};

export async function getQuotes(values: QuoteRequestValues) {
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

    // The API may return an object with an error message.
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

