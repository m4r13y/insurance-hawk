/**
 * @fileOverview Firebase Cloud Function for calculating Cancer Insurance quotes.
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This is done once when the function is deployed, and the instance is reused.
try {
  admin.initializeApp();
} catch (e) {
  functions.logger.info("Admin SDK already initialized.");
}
const db = admin.firestore().collection("bflic-cancer-quotes").parent;

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
export const getCancerInsuranceQuote = functions.https.onCall(async (data: CancerQuoteRequestData, context): Promise<CancerQuoteResponse> => {
    functions.logger.info("--- Starting Cancer Quote Calculation ---", { structuredData: true });
    functions.logger.info("1. Received input data:", { data });

    // Input Validation (Example)
    if (!data.state || !["TX", "GA"].includes(data.state)) {
        throw new functions.https.HttpsError('invalid-argument', 'A valid state (TX or GA) is required.');
    }
    if (typeof data.age !== 'number' || data.age < 18 || data.age > 99) {
        throw new functions.https.HttpsError('invalid-argument', 'Age must be between 18 and 99.');
    }
    if (typeof data.benefitAmount !== 'number' || data.benefitAmount < 5000 || data.benefitAmount > 75000 || data.benefitAmount % 1000 !== 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Benefit amount must be between $5,000 and $75,000 in increments of $1000.');
    }

    try {
        const dbFirestore = admin.firestore(db, 'hawknest-database');
        
        // 2. Fetch Firestore Configuration Data Concurrently
        const inputVariablesRef = dbFirestore.collection('bflic-cancer-quotes').doc('input-variables');
        const statesRef = dbFirestore.collection('bflic-cancer-quotes').doc('states');

        functions.logger.info("2. Fetching config documents: 'input-variables' and 'states'.");
        const [inputVariablesSnap, statesSnap] = await Promise.all([
            inputVariablesRef.get(),
            statesRef.get(),
        ]);

        if (!inputVariablesSnap.exists || !statesSnap.exists) {
            functions.logger.error("CRITICAL: Missing configuration documents 'input-variables' or 'states' in Firestore.");
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
        
        functions.logger.info("3. Mapped Inputs to Codes:", {cisCode, premiumCode, familyCode, tobaccoCode, rateSheet});


        // 4. Construct lookupId
        const lookupId = `${cisCode}${premiumCode}${data.age}${familyCode}${tobaccoCode}`;
        functions.logger.info(`4. Constructed lookupId: ${lookupId}`);

        // 5. Retrieve Rate Data Document
        const rateDocPath = `bflic-cancer-quotes/states/${rateSheet}/${lookupId}`;
        functions.logger.info(`5. Attempting to fetch rate document at path: ${rateDocPath}`);
        const rateDocRef = dbFirestore.doc(rateDocPath);
        const rateDocSnap = await rateDocRef.get();

        if (!rateDocSnap.exists) {
            functions.logger.error(`Rate document not found at path: ${rateDocPath}`);
            throw new functions.https.HttpsError('not-found', 'No rate found for the selected criteria. Please check your inputs.');
        }

        const rateData = rateDocSnap.data()!;
        const rateVariable = rateData.inprem;
        functions.logger.info(`Successfully fetched rate data. Inprem value: ${rateVariable}`);
        
        // 6. Data Verification
        if (rateData.plan !== cisCode) functions.logger.warn(`Verification mismatch: plan (${rateData.plan}) vs cisCode (${cisCode})`);
        if (rateData.state !== premiumCode) functions.logger.warn(`Verification mismatch: state (${rateData.state}) vs premiumCode (${premiumCode})`);
        if (rateData.age !== data.age) functions.logger.warn(`Verification mismatch: age (${rateData.age}) vs input age (${data.age})`);
        if (rateData.tobacco !== tobaccoCode) functions.logger.warn(`Verification mismatch: tobacco (${rateData.tobacco}) vs tobaccoCode (${tobaccoCode})`);

        // 7. Calculate Premium
        const premium = (((rateVariable * 0.01) * data.benefitAmount) / defaultUnit) * premiumModeValue;
        const roundedPremium = Math.round(premium * 100) / 100;
        functions.logger.info(`7. Calculated premium: ${roundedPremium}`);

        // 8. Return result
        const result: CancerQuoteResponse = {
            monthly_premium: roundedPremium,
            carrier: "Bankers Fidelity",
            plan_name: "Cancer Insurance",
            benefit_amount: data.benefitAmount,
        };

        return result;

    } catch (error) {
        functions.logger.error("--- ERROR in Cancer Quote Calculation ---", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while calculating the quote.');
    }
});
