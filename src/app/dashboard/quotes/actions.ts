
import axios from "axios";
import { functions as firebaseFunctions } from "@/lib/firebase";
import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues, CancerQuote, CancerQuoteRequestValues } from "@/types";

// Direct CSG API request for Medigap quotes

export async function fetchMedigapQuotesDirect(params: {
  zip5: string;
  age: number;
  gender: string;
  tobacco: number;
  plan: string;
  county?: string;
  select?: number;
  naic?: string;
  effective_date?: string;
  apply_discounts?: number;
  apply_fees?: number;
  offset?: number;
  limit?: number;
  field?: string;
}) {
  const url = "https://csgapi.appspot.com/v1/med_supp/quotes.json";
  const token = "dc4c5c9f2987ba35803f8dbfa784bb557b328b30cd2e69e3646caf40912a00fd";
  // Ensure required parameters are present
  const required = ["zip5", "age", "gender", "tobacco", "plan"];
  for (const key of required) {
    if (!(params as any)[key]) {
      return { error: `Missing required parameter: ${key}` };
    }
  }
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        "x-api-token": token
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return { error: error.response.data, status: error.response.status };
    }
    return { error: error.message };
  }
}

const mockDentalQuotes: DentalQuote[] = [
    {
        id: "dental-1",
        monthly_premium: 35.50,
        carrier: { name: "Delta Dental", full_name: "Delta Dental Insurance Company", logo_url: null },
        plan_name: "PPO Plus",
        am_best_rating: "A",
        benefit_amount: "1500",
        benefit_quantifier: "Per Person Per Year",
        benefit_notes: "<p>This is a sample benefit note. It can contain <strong>HTML</strong>.</p>",
        limitation_notes: "<p>This is a sample limitation note. It can also contain <em>HTML</em>.</p>"
    },
     {
        id: "dental-2",
        monthly_premium: 42.00,
        carrier: { name: "Guardian", full_name: "Guardian Life Insurance Company", logo_url: null },
        plan_name: "Advantage Gold",
        am_best_rating: "A+",
        benefit_amount: "2000",
        benefit_quantifier: "Per Person Per Year",
    },
];

const mockHospitalIndemnityQuotes: HospitalIndemnityQuote[] = [
    {
        id: "hi-1",
        carrier: { name: "Aetna", full_name: "Aetna Life Insurance Company", logo_url: null },
        plan_name: "Recovery Choice",
        baseBenefits: [
            { amount: "100", quantifier: "Day", rate: 25.00 },
            { amount: "200", quantifier: "Day", rate: 45.00 },
            { amount: "300", quantifier: "Day", rate: 60.00 },
        ],
        riders: [
            { name: "ER Visit", note: "Covers emergency room visits", benefits: [{ amount: "100", quantifier: "Visit", rate: 10.00 }] },
            { name: "Outpatient Surgery", note: "Covers outpatient surgery costs", benefits: [{ amount: "500", quantifier: "Occurrence", rate: 15.00 }] },
        ]
    },
    {
        id: "hi-2",
        carrier: { name: "Cigna", full_name: "Cigna Health and Life Insurance Company", logo_url: null },
        plan_name: "Hospital Assist",
        baseBenefits: [
            { amount: "150", quantifier: "Day", rate: 30.00 },
            { amount: "250", quantifier: "Day", rate: 50.00 },
        ],
        riders: [
            { name: "Ambulance", note: "Covers ambulance transport", benefits: [{ amount: "200", quantifier: "Trip", rate: 8.00 }] },
        ]
    },
];


export async function getMedigapQuotes(values: QuoteRequestValues) {
  try {
    let tobaccoValue = 0;
    if (typeof values.tobacco === "string") {
      tobaccoValue = values.tobacco === "true" ? 1 : 0;
    } else if (typeof values.tobacco === "number") {
      tobaccoValue = values.tobacco;
    }
    const params = {
      zip5: values.zipCode,
      age: Number(values.age),
      gender: values.gender === "male" ? "M" : "F",
      tobacco: tobaccoValue,
      plan: values.plan,
    };
    // Use Firebase Functions SDK to call the callable function
    const functions = getFunctions();
    const getMedigapQuotesFn = httpsCallable(functions, "getMedigapQuotes");
    const result = await getMedigapQuotesFn(params);
    // Expecting result.data to be { quotes: [...] } or similar
    if (
      result.data &&
      typeof result.data === "object" &&
      "quotes" in result.data &&
      Array.isArray((result.data as any).quotes)
    ) {
      return { quotes: (result.data as any).quotes };
    }
    // If the response is an array itself
    if (Array.isArray(result.data)) {
      return { quotes: result.data };
    }
    // If the response is an object with a 'results' array
    if (
      result.data &&
      typeof result.data === "object" &&
      "results" in result.data &&
      Array.isArray((result.data as any).results)
    ) {
      return { quotes: (result.data as any).results };
    }
    // Fallback: return error or empty
    return { quotes: [] };
  } catch (e: any) {
    console.error("Error in getMedigapQuotes:", e);
    return { error: e.message || "Failed to fetch quotes." };
  }
}

import { getFunctions, httpsCallable } from "firebase/functions";

export async function getDentalQuotes(values: DentalQuoteRequestValues) {
  try {
    const functions = getFunctions();
    // Default to individual if not provided
    const params = { ...values, covered_members: values.covered_members || "I" };
    const getDentalQuotesFn = httpsCallable(functions, "getDentalQuotes");
    const result = await getDentalQuotesFn(params);
    // Expecting result.data to be { quotes: [...] } or similar
    if (
      result.data &&
      typeof result.data === "object" &&
      "quotes" in result.data &&
      Array.isArray((result.data as any).quotes)
    ) {
      return { quotes: (result.data as any).quotes };
    }
    // If the response is an array itself
    if (Array.isArray(result.data)) {
      return { quotes: result.data };
    }
    // If the response is an object with a 'results' array
    if (
      result.data &&
      typeof result.data === "object" &&
      "results" in result.data &&
      Array.isArray((result.data as any).results)
    ) {
      return { quotes: (result.data as any).results };
    }
    // Fallback: return error or empty
    return { quotes: [] };
  } catch (e: any) {
    console.error("Error in getDentalQuotes:", e);
    return { error: e.message || "Failed to fetch dental quotes." };
  }
}

// Accepts API param shape, not form shape
export type HospitalIndemnityApiParams = {
  zip5: string;
  age: number;
  gender: 'M' | 'F';
  tobacco: number;
};

export async function getHospitalIndemnityQuotes(params: HospitalIndemnityApiParams) {
    try {
        const url = "https://csgapi.appspot.com/v1/hospital_indemnity/quotes.json";
        const token = "0529636d81a5b09e189302aac2ddb4aabb75ed48667242f3c953feb2591dc2a8";
        const response = await axios.get(url, {
            params,
            headers: {
                "x-api-token": token
            }
        });
        // API returns an array of quotes
        if (Array.isArray(response.data)) {
            return { quotes: response.data };
        }
        // If wrapped in a results property
        if (response.data && Array.isArray(response.data.results)) {
            return { quotes: response.data.results };
        }
        // Fallback: return empty
        return { quotes: [] };
    } catch (e: any) {
        console.error("Error in getHospitalIndemnityQuotes:", e);
        return { error: e.message || "Failed to fetch hospital indemnity quotes." };
    }
}
