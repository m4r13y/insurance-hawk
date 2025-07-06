"use server";

import type { Quote, QuoteRequestValues } from "@/types";

type ApiResponse = {
    quotes: Quote[];
} | {
    error: string;
    message?: string;
};

export async function getQuotes(values: QuoteRequestValues) {
  try {
    const params = new URLSearchParams({
        zip5: values.zipCode,
        age: values.age.toString(),
        gender: values.gender,
        tobacco: values.tobacco,
        plan: values.plan,
        limit: '10',
        apply_discounts: 'true',
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
    
    const data: ApiResponse = await response.json();

    if ('error' in data) {
        throw new Error(data.message || data.error);
    }

    if ('quotes' in data) {
        return { quotes: data.quotes };
    }

    return { error: 'Unexpected response format from API.' };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to fetch quotes. Please try again later." };
  }
}
