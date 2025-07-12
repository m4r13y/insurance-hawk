

"use server";

import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues, CancerQuote, CancerQuoteRequestValues } from "@/types";

// Note: As per the new architecture, firebase-admin is no longer needed here.
// The cancer quote logic is now handled by a dedicated Cloud Function.


const mockMedigapQuotes: Quote[] = [
    {
        id: "quote-aetna-g",
        monthly_premium: 125.50,
        carrier: { name: "Aetna", logo_url: null },
        plan_name: "Plan G",
        plan_type: "Medigap",
        discounts: [{ name: "Household Discount", value: 0.07, type: "percent", rule: "Must live with one other adult" }],
        am_best_rating: "A",
        rate_type: "Attained",
        premium: 0
    },
    {
        id: "quote-cigna-g",
        monthly_premium: 130.00,
        carrier: { name: "Cigna", logo_url: null },
        plan_name: "Plan G",
        plan_type: "Medigap",
        discounts: [{ name: "Household Discount", value: 0.05, type: "percent", rule: "Must live with one other adult" }],
        am_best_rating: "A-",
        rate_type: "Issue-Age",
        premium: 0
    },
    {
        id: "quote-mutual-g",
        monthly_premium: 142.75,
        carrier: { name: "Mutual of Omaha", logo_url: null },
        plan_name: "Plan G",
        plan_type: "Medigap",
        discounts: [],
        am_best_rating: "A+",
        rate_type: "Attained",
        premium: 0
    },
];

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
    // Return mock data for testing
    console.log("Returning mock Medigap quotes for values:", values);
    const filteredQuotes = mockMedigapQuotes.map(q => ({
        ...q,
        plan_name: `Plan ${values.plan}`
    }));
    return { quotes: filteredQuotes };

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
