
"use server";

import type { Quote, QuoteRequestValues } from "@/types";

export async function getQuotes(values: QuoteRequestValues) {
  try {
    const params = new URLSearchParams({
        zip5: values.zipCode,
        age: values.age.toString(),
        gender: values.gender,
        tobacco: values.tobacco,
        plan: values.plan,
        limit: '10',
        apply_discounts: values.apply_discounts.toString(),
    });

    if (values.effectiveDate) {
        params.append('effective_date', values.effectiveDate);
    }
    
    const url = `https://private-anon-c52d857fa1-medigapapi.apiary-mock.com/v1/med_supp/quotes.json?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    const data: unknown = await response.json();

    // The API might return an array of quotes directly.
    if (Array.isArray(data)) {
        return { quotes: data };
    }

    if (data && typeof data === 'object') {
        // It might be an object with an 'error' property.
        if ('error' in data) {
            const apiError = data as { error: string, message?: string };
            throw new Error(apiError.message || apiError.error);
        }

        // It might be an object with a 'quotes' property.
        if ('quotes' in data) {
            const apiResponse = data as { quotes: Quote[] };
            return { quotes: apiResponse.quotes || [] };
        }

        // If no quotes are found, the API might return an empty object.
        if (Object.keys(data).length === 0) {
            return { quotes: [] };
        }
    }


    return { error: 'Unexpected response format from API.' };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to fetch quotes. Please try again later." };
  }
}
