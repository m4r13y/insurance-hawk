"use server";
import { functions as firebaseFunctions } from "@/lib/firebase";
import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues, CancerQuote, CancerQuoteRequestValues } from "@/types";

// Note: As per the new architecture, firebase-admin is no longer needed here on the frontend.
// The quote logic is now handled by dedicated Cloud Functions.
import { httpsCallable } from "firebase/functions";

const mockDentalQuotes: DentalQuote[] = [
    {
        id: "dental-1",
        monthly_premium: 35.50,
        carrier: { name: "Delta Dental", logo_url: null },
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
        carrier: { name: "Guardian", logo_url: null },
        plan_name: "Advantage Gold",
        am_best_rating: "A+",
        benefit_amount: "2000",
        benefit_quantifier: "Per Person Per Year",
    },
];

const mockHospitalIndemnityQuotes: HospitalIndemnityQuote[] = [
    {
        id: "hi-1",
        carrier: { name: "Aetna", logo_url: null },
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
        carrier: { name: "Cigna", logo_url: null },
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
    // Use the same API route as Test Quotes page for Medigap quotes
    // Use absolute URL for server-side fetch
    const apiUrl = typeof window === "undefined"
      ? "http://localhost:3000/api/test-quotes"
      : "/api/test-quotes";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zip5: values.zipCode,
        age: Number(values.age),
        gender: values.gender === "male" ? "M" : "F",
        tobacco: values.tobacco === "true" ? 1 : 0,
        plan: values.plan,
        effective_date: values.effectiveDate,
        apply_discounts: values.apply_discounts ? 1 : 0,
        apply_fees: 0,
        offset: 0,
        limit: 50,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || "Failed to fetch quotes." };
    }
    const result = await response.json();
    return { raw: result };
  } catch (e: any) {
    console.error("Error in getMedigapQuotes:", e);
    return { error: e.message || "Failed to fetch quotes." };
  }
}

export async function getDentalQuotes(values: DentalQuoteRequestValues) {
    try {
        console.log("Returning mock Dental quotes for values:", values);
        return { quotes: mockDentalQuotes };

    } catch (e: any) {
        console.error("Error in getDentalQuotes:", e);
        return { error: e.message || "Failed to fetch dental quotes." };
    }
}

export async function getHospitalIndemnityQuotes(values: HospitalIndemnityQuoteRequestValues) {
    try {
       console.log("Returning mock Hospital Indemnity quotes for values:", values);
       return { quotes: mockHospitalIndemnityQuotes };

    } catch (e: any)
     {
        console.error("Error in getHospitalIndemnityQuotes:", e);
        return { error: e.message || "Failed to fetch hospital indemnity quotes." };
    }
}
