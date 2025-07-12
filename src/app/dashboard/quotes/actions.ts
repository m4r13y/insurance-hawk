

"use server";
import { getFirestore, doc, getDoc, initializeApp, getApps, App } from "firebase-admin/firestore";
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';


import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues, CancerQuoteRequestValues, CancerQuote } from "@/types";

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


const mockMedigapQuotes: Quote[] = [
    {
      id: "quote-aetna-g",
      monthly_premium: 125.50,
      carrier: { name: "Aetna", logo_url: null },
      plan_name: "Plan G",
      plan_type: "Medigap",
      discounts: [{ name: "Household Discount", value: 0.07, type: "percent", rule: "Must live with one other adult" }],
      am_best_rating: "A",
      rate_type: "Attained"
    },
    {
      id: "quote-cigna-g",
      monthly_premium: 130.00,
      carrier: { name: "Cigna", logo_url: null },
      plan_name: "Plan G",
      plan_type: "Medigap",
      discounts: [{ name: "Household Discount", value: 0.05, type: "percent", rule: "Must live with one other adult" }],
      am_best_rating: "A-",
      rate_type: "Issue-Age"
    },
    {
      id: "quote-mutual-g",
      monthly_premium: 142.75,
      carrier: { name: "Mutual of Omaha", logo_url: null },
      plan_name: "Plan G",
      plan_type: "Medigap",
      discounts: [],
      am_best_rating: "A+",
      rate_type: "Attained"
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
        console.log("Returning mock Dental quotes for values:", values);
        return { quotes: mockDentalQuotes };

    } catch (e: any) {
        console.error("Error in getDentalQuotes:", e);
        return { error: e.message || "Failed to fetch dental quotes." };
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
       console.log("Returning mock Hospital Indemnity quotes for values:", values);
       return { quotes: mockHospitalIndemnityQuotes };

    } catch (e: any)
     {
        console.error("Error in getHospitalIndemnityQuotes:", e);
        return { error: e.message || "Failed to fetch hospital indemnity quotes." };
    }
}


export async function getCancerQuotes(values: CancerQuoteRequestValues): Promise<{ quote?: CancerQuote; error?: string }> {
    const serviceAccountPath = "/home/user/studio/medicareally-1646d176dbaa.json";
    const appName = 'CANCER_QUOTER_APP';

    try {
        let app: App;
        const existingApp = getApps().find(app => app.name === appName);
        if (existingApp) {
            app = existingApp;
        } else {
             const serviceAccountJSON = fs.readFileSync(serviceAccountPath, 'utf8');
             const serviceAccount = JSON.parse(serviceAccountJSON);
            app = initializeApp({
                credential: admin.credential.cert(serviceAccount)
            }, appName);
        }
        
        const db = getFirestore(app, 'hawknest-database');

        // 1. Fetch mapping data from Firestore
        const inputVariablesDoc = await getDoc(doc(db, 'bflic-cancer-quotes', 'input-variables'));
        const statesDoc = await getDoc(doc(db, 'bflic-cancer-quotes', 'states'));

        if (!inputVariablesDoc.exists() || !statesDoc.exists()) {
            return { error: "Configuration data is missing. Please contact support." };
        }
        const inputData = inputVariablesDoc.data()!;
        const statesData = statesDoc.data()!;

        // 2. Map user inputs to codes
        const cisCode = inputData.CIS[values.carcinomaInSitu === '25%' ? '25' : '100'];
        const premiumCode = statesData[values.state]?.['premium-code'];
        const familyCodeMap = { 'Applicant Only': 'EE', 'Applicant and Spouse': 'ES', 'Applicant and Child(ren)': '1F', 'Applicant and Spouse and Child(ren)': '2F'};
        const familyCode = inputData.emptype[values.familyType.toLowerCase().replace(/\s/g, '-').replace(/[()]/g, '')] || familyCodeMap[values.familyType];
        const tobaccoCode = inputData.tobacco[values.tobaccoStatus === 'Tobacco' ? 'yes' : 'no'];
        const rateSheet = statesData[values.state]?.['rate-sheet'];
        const defaultUnit = inputData['default-unit'];
        
        const paymentModeMap = { 'Monthly Bank Draft': 'monthly-bank-draft', 'Monthly Credit Card': 'monthly-credit-card', 'Monthly Direct Mail': 'monthly-direct-mail', 'Annual': 'annual' };
        const paymentModeKey = paymentModeMap[values.premiumMode];
        const paymentModeValue = inputData['payment-mode'][paymentModeKey];


        if (!cisCode || !premiumCode || !familyCode || !tobaccoCode || !rateSheet || !defaultUnit || !paymentModeValue) {
            console.error('Failed to map one or more inputs:', {cisCode, premiumCode, familyCode, tobaccoCode, rateSheet, defaultUnit, paymentModeValue});
            return { error: "Could not process all inputs. Please check your selections and try again." };
        }

        // 3. Construct the lookup ID
        const lookupId = `${cisCode}${premiumCode}${values.age}${familyCode}${tobaccoCode}`;
        
        // 4. Fetch the rate document
        const rateDocRef = doc(db, `bflic-cancer-quotes/${rateSheet}/rows`, lookupId);
        const rateDoc = await getDoc(rateDocRef);

        if (!rateDoc.exists()) {
            return { error: `No rate found for the selected criteria (Lookup ID: ${lookupId}). Please adjust your selections.` };
        }
        
        const rateData = rateDoc.data()!;
        const inprem = rateData.inprem;

        // Optional: Verification step
        if (String(rateData.plan) !== String(cisCode) || String(rateData.state) !== String(premiumCode) || Number(rateData.age) !== values.age) {
             console.warn(`Verification failed for ${lookupId}. Data mismatch.`);
        }

        // 5. Calculate the premium
        const rateVariable = parseFloat(inprem);
        const premium = (((rateVariable * 0.01) * values.benefitAmount) / defaultUnit) * paymentModeValue;
        const roundedPremium = Math.round(premium * 100) / 100;
        
        return {
            quote: {
                monthly_premium: roundedPremium,
                carrier: "Bankers Fidelity",
                plan_name: "Cancer Insurance",
                benefit_amount: values.benefitAmount,
            },
        };

    } catch (e: any) {
        console.error("Error in getCancerQuotes:", e);
        if (e.code === 'ENOENT') { // File not found error
             return { error: "Could not find service account credentials. Please contact support." };
        }
        return { error: e.message || "An unexpected error occurred while fetching the cancer quote." };
    }
}
