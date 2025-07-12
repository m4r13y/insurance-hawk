/**
 * @fileOverview Firebase Cloud Function for calculating Cancer Insurance quotes.
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This is done once when the function is deployed, and the instance is reused.
admin.initializeApp();
const db = admin.firestore();

// --- TYPE DEFINITIONS ---
interface CancerQuoteRequestData {
    state: "TX" | "GA";
    age: number;
    familyType: "Applicant Only" | "Applicant and Spouse" | "Applicant and Child(ren)" | "Applicant and Spouse and Child(ren)";
    tobaccoStatus: "Non-Tobacco" | "Tobacco";
    premiumMode: "Monthly Bank Draft" | "Monthly Credit Card" | "Monthly Direct Mail" | "Annual";
    carcinomaInSitu: "25%" | "100%";
    benefitAmount: number;
}

interface CancerQuoteResponse {
    monthly_premium: number;
    carrier: string;
    plan_name: string;
    benefit_amount: number;
}

// --- HELPER FUNCTIONS ---
const mapFamilyTypeToCode = (familyType: CancerQuoteRequestData['familyType']): string => {
    const mapping: Record<CancerQuoteRequestData['familyType'], string> = {
        "Applicant Only": "applicant-only",
        "Applicant and Spouse": "applicant-and-spouse",
        "Applicant and Child(ren)": "applicant-and-children",
        "Applicant and Spouse and Child(ren)": "applicant-spouse-children",
    };
    return mapping[familyType];
};

const mapPremiumModeToKey = (premiumMode: CancerQuoteRequestData['premiumMode']): string => {
    const mapping: Record<CancerQuoteRequestData['premiumMode'], string> = {
        "Monthly Bank Draft": "monthly-bank-draft",
        "Monthly Credit Card": "monthly-credit-card",
        "Monthly Direct Mail": "monthly-direct-mail",
        "Annual": "annual",
    };
    return mapping[premiumMode];
};

// --- MAIN CLOUD FUNCTION ---
export const getCancerInsuranceQuote = functions.https.onCall(async (data: CancerQuoteRequestData): Promise<CancerQuoteResponse> => {
    functions.logger.info("Starting getCancerInsuranceQuote with data:", { data });

    // 1. Input Validation
    if (!data.state || !["TX", "GA"].includes(data.state)) {
        throw new functions.https.HttpsError('invalid-argument', 'A valid state (TX or GA) is required.');
    }
    if (!data.age || data.age < 18 || data.age > 99) {
        throw new functions.https.HttpsError('invalid-argument', 'Age must be between 18 and 99.');
    }
     if (!data.benefitAmount || data.benefitAmount < 5000 || data.benefitAmount > 75000) {
        throw new functions.https.HttpsError('invalid-argument', 'Benefit amount must be between $5,000 and $75,000.');
    }
    // Add other validations as needed...

    try {
        // 2. Fetch Firestore Configuration Data Concurrently
        const inputVariablesRef = db.collection('bflic-cancer-quotes').doc('input-variables');
        const statesRef = db.collection('bflic-cancer-quotes').doc('states');

        functions.logger.info("Fetching config documents...");
        const [inputVariablesSnap, statesSnap] = await Promise.all([
            inputVariablesRef.get(),
            statesRef.get(),
        ]);

        if (!inputVariablesSnap.exists || !statesSnap.exists) {
            functions.logger.error("Missing critical configuration documents in Firestore.");
            throw new functions.https.HttpsError('failed-precondition', 'Server configuration is incomplete. Please contact support.');
        }

        const inputVariables = inputVariablesSnap.data()!;
        const statesData = statesSnap.data()!;
        functions.logger.info("Successfully fetched config documents.");


        // 3. Map Inputs to Codes
        const cisKey = data.carcinomaInSitu === "100%" ? "1" : "25";
        const cisCode = inputVariables.CIS[cisKey];
        const premiumCode = statesData[data.state]['premium-code'];
        const rateSheet = statesData[data.state]['rate-sheet'];
        const familyCode = inputVariables.emptype[mapFamilyTypeToCode(data.familyType)];
        const tobaccoCode = inputVariables.tobacco[data.tobaccoStatus === "Tobacco" ? "yes" : "no"];
        const defaultUnit = inputVariables['default-unit'];
        const premiumModeValue = inputVariables['payment-mode'][mapPremiumModeToKey(data.premiumMode)];
        
        functions.logger.info("Mapped Inputs to Codes:", {cisCode, premiumCode, rateSheet, familyCode, tobaccoCode, defaultUnit, premiumModeValue});


        // 4. Construct lookupId
        const lookupId = `${cisCode}${premiumCode}${data.age}${familyCode}${tobaccoCode}`;
        functions.logger.info(`Constructed lookupId: ${lookupId}`);


        // 5. Retrieve Rate Data Document
        const rateDocumentPath = `bflic-cancer-quotes/states/${rateSheet}/${lookupId}`;
        functions.logger.info(`Attempting to fetch rate document at path: ${rateDocumentPath}`);
        const rateDocRef = db.doc(rateDocumentPath);
        const rateDocSnap = await rateDocRef.get();

        if (!rateDocSnap.exists) {
            functions.logger.error(`No rate document found for lookupId: ${lookupId}`);
            throw new functions.https.HttpsError('not-found', `No rate found for the provided details. Please check your inputs or contact support. Lookup ID: ${lookupId}`);
        }
        
        functions.logger.info("Successfully fetched rate document.");
        const rateData = rateDocSnap.data()!;
        const rateVariable = rateData.inprem;

        // 6. Data Verification (Optional logging)
        if (rateData.plan !== cisCode) functions.logger.warn(`CIS code mismatch for ${lookupId}. Expected: ${cisCode}, Found: ${rateData.plan}`);
        if (rateData.state !== premiumCode) functions.logger.warn(`Premium code mismatch for ${lookupId}. Expected: ${premiumCode}, Found: ${rateData.state}`);
        if (rateData.age !== data.age) functions.logger.warn(`Age mismatch for ${lookupId}. Expected: ${data.age}, Found: ${rateData.age}`);
        if (rateData.tobacco !== tobaccoCode) functions.logger.warn(`Tobacco code mismatch for ${lookupId}. Expected: ${tobaccoCode}, Found: ${rateData.tobacco}`);

        // 7. Calculate Premium
        const premium = (((rateVariable * 0.01) * data.benefitAmount) / defaultUnit) * premiumModeValue;
        const roundedPremium = Math.round((premium + Number.EPSILON) * 100) / 100;
        functions.logger.info(`Calculated premium: ${roundedPremium}`);

        // 8. Return Successful Response
        return {
            monthly_premium: roundedPremium,
            carrier: "Bankers Fidelity",
            plan_name: "Cancer Insurance",
            benefit_amount: data.benefitAmount,
        };

    } catch (error) {
        functions.logger.error("Error in getCancerInsuranceQuote cloud function:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while calculating the quote.');
    }
});
