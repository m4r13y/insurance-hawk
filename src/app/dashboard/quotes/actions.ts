

"use server";

import type { Quote, QuoteRequestValues, DentalQuote, DentalQuoteRequestValues, CsgDiscount, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, HospitalIndemnityQuoteRequestValues, CancerQuote, CancerQuoteRequestValues } from "@/types";

import * as admin from 'firebase-admin';
import { getFirestore, doc, getDoc } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';


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

// --- Cancer Quote Logic ---

const CANCER_QUOTER_APP_NAME = 'CANCER_QUOTER_APP';

function getCancerQuoterAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        const existingApp = admin.apps.find(app => app?.name === CANCER_QUOTER_APP_NAME);
        if (existingApp) {
            return existingApp;
        }
    }

    try {
        const serviceAccountPath = '/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json';
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        }, CANCER_QUOTER_APP_NAME);
    } catch (error) {
        console.error('Error initializing dedicated Firebase Admin SDK for Cancer Quoter:', error);
        throw new Error("Could not initialize Firebase Admin SDK. Please check service account credentials.");
    }
}


export async function getCancerQuotes(values: CancerQuoteRequestValues): Promise<{ quote?: CancerQuote; error?: string; }> {
    try {
        const app = getCancerQuoterAdminApp();
        const db = getFirestore(app);

        // All the logic will go here...
        // For now, let's just return the constructed lookupId for debugging.

        const inputVariablesRef = db.collection('bflic-cancer-quotes').doc('input-variables');
        const statesRef = db.collection('bflic-cancer-quotes').doc('states');
        
        const [inputVariablesSnap, statesSnap] = await Promise.all([
            inputVariablesRef.get(),
            statesRef.get(),
        ]);

        if (!inputVariablesSnap.exists || !statesSnap.exists) {
            console.error("CRITICAL: Missing configuration documents 'input-variables' or 'states' in Firestore.");
            return { error: 'Server configuration is incomplete. Please contact support.' };
        }

        const inputVariables = inputVariablesSnap.data()!;
        const statesData = statesSnap.data()!;

        const mapFamilyTypeToCode = (familyType: CancerQuoteRequestValues['familyType']): string => {
            const mapping: Record<CancerQuoteRequestValues['familyType'], string> = {
                "Applicant Only": "applicant-only",
                "Applicant and Spouse": "applicant-and-spouse",
                "Applicant and Child(ren)": "applicant-and-children",
                "Applicant and Spouse and Child(ren)": "applicant-spouse-children",
            };
            return mapping[familyType];
        };
        
        const cisKey = values.carcinomaInSitu === "100%" ? "1" : "25";
        const cisCode = inputVariables.CIS[cisKey];
        const premiumCode = statesData[values.state]['premium-code'];
        const familyCode = inputVariables.emptype[mapFamilyTypeToCode(values.familyType)];
        const tobaccoCode = inputVariables.tobacco[values.tobaccoStatus === "Tobacco" ? "yes" : "no"];

        const lookupId = `${cisCode}${premiumCode}${values.age}${familyCode}${tobaccoCode}`;

        return {
            quote: {
                monthly_premium: 0,
                carrier: "DEBUG MODE",
                plan_name: `lookupId: ${lookupId}`,
                benefit_amount: 0,
            }
        };

    } catch (error: any) {
        console.error("Error calling getCancerInsuranceQuote cloud function:", error);
        const errorMessage = error.message || "An unexpected error occurred.";
        return { error: errorMessage };
    }
}

export async function testFirestoreFetch(): Promise<{ data?: any; error?: string; }> {
    try {
        const app = getCancerQuoterAdminApp();
        const db = getFirestore(app);
        
        const docRef = db.collection('bflic-cancer-quotes').doc('states').collection('TX_44').doc('577544371FS');
        
        console.log(`[testFirestoreFetch] Attempting to fetch document at path: ${docRef.path}`);

        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log(`[testFirestoreFetch] Document not found at path: ${docRef.path}`);
            return { error: 'Test document not found. Check the path and database.' };
        }

        const data = docSnap.data();
        console.log('[testFirestoreFetch] Successfully fetched document:', data);
        return { data };

    } catch (error: any) {
        console.error('[testFirestoreFetch] Error:', error);
        return { error: error.message || 'An unknown error occurred during the test fetch.' };
    }
}
