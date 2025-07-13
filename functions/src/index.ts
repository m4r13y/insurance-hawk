
/**
 * @fileOverview Calculating Cancer Insurance quotes.
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK.
try {
  admin.initializeApp();
} catch (e) {
  functions.logger.info("Admin SDK already initialized.");
}

const db = getFirestore(admin.app(), "hawknest-database");

// --- TYPE DEFINITIONS ---
interface CancerQuoteRequestData {
  state: "TX" | "GA";
  age: number;
  familyType:
    | "Applicant Only"
    | "Applicant and Spouse"
    | "Applicant and Child(ren)"
    | "Applicant and Spouse and Child(ren)";
  tobaccoStatus: "Non-Tobacco" | "Tobacco";
  premiumMode:
    | "Monthly Bank Draft"
    | "Monthly Credit Card"
    | "Monthly Direct Mail"
    | "Annual";
  carcinomaInSitu: "25%" | "100%";
  benefitAmount: number;
}

interface CancerQuoteResponse {
  monthly_premium: number;
  carrier: string;
  plan_name: string;
  benefit_amount: number;
}

interface InputVariables {
  CIS: { [key: string]: string };
  emptype: { [key: string]: string };
  tobacco: { [key: string]: string };
  "default-unit": number;
  "payment-mode": { [key: string]: number };
}

interface StatesData {
  [key: string]: {
    "premium-code": string;
    "rate-sheet": string;
  };
}


// --- HELPER FUNCTIONS ---
const mapFamilyTypeToCode = (
  familyType: CancerQuoteRequestData["familyType"],
): string => {
  const mapping: Record<CancerQuoteRequestData["familyType"], string> = {
    "Applicant Only": "applicant-only",
    "Applicant and Spouse": "applicant-and-spouse",
    "Applicant and Child(ren)": "applicant-and-children",
    "Applicant and Spouse and Child(ren)": "applicant-spouse-children",
  };
  return mapping[familyType];
};

const mapPremiumModeToKey = (
  premiumMode: CancerQuoteRequestData["premiumMode"],
): string => {
  const mapping: Record<CancerQuoteRequestData["premiumMode"], string> = {
    "Monthly Bank Draft": "monthly-bank-draft",
    "Monthly Credit Card": "monthly-credit-card",
    "Monthly Direct Mail": "monthly-direct-mail",
    "Annual": "annual",
  };
  return mapping[premiumMode];
};

// --- MAIN CLOUD FUNCTION ---
export const getCancerInsuranceQuote = functions.https.onCall(
  async (request: functions.https.CallableRequest):
  Promise<CancerQuoteResponse> => {
    const data = request.data as CancerQuoteRequestData;
    functions.logger.info("--- Starting Cancer Quote ---", {
      structuredData: true,
    });
    functions.logger.info("1. Received input data:", {data});

    // Input Validation
    if (!data.state || !["TX", "GA"].includes(data.state)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid state (TX or GA) is required.",
      );
    }
    if (typeof data.age !== "number" || data.age < 18 || data.age > 99) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Age must be between 18 and 99.",
      );
    }
    if (
      typeof data.benefitAmount !== "number" ||
      data.benefitAmount < 5000 ||
      data.benefitAmount > 75000 ||
      data.benefitAmount % 1000 !== 0
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Benefit must be $5,000-$75,000 in $1000 increments.",
      );
    }

    try {
      // 2. Fetch Firestore Configuration Data Concurrently
      const inputVariablesRef =
        db.collection("bflic-cancer-quotes").doc("input-variables");
      const statesRef = db.collection("bflic-cancer-quotes").doc("states");
      functions.logger.info("2. Fetching config documents.");

      const [inputVariablesSnap, statesSnap] = await Promise.all([
        inputVariablesRef.get(),
        statesRef.get(),
      ]);

      if (!inputVariablesSnap.exists || !statesSnap.exists) {
        functions.logger.error(
          "CRITICAL: Missing 'input-variables' or 'states' in Firestore.",
        );
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Server configuration is incomplete. Please contact support.",
        );
      }
      const inputVariables = inputVariablesSnap.data() as InputVariables;
      const statesData = statesSnap.data() as StatesData;

      if (!inputVariables || !statesData) {
        functions.logger.error("Config document data is undefined.");
        throw new functions.https.HttpsError(
          "internal",
          "Configuration data is empty.",
        );
      }

      functions.logger.info("Successfully fetched config documents.");

      // 3. Map Inputs to Codes and Get Rate Sheet Name
      const cisKey = data.carcinomaInSitu === "100%" ? "1" : "25";
      const cisCode = inputVariables.CIS[cisKey];
      const stateConfig = statesData[data.state];
      const premiumCode = stateConfig["premium-code"];
      const rateSheet = statesData[data.state]["rate-sheet"];
      const familyCode =
        inputVariables.emptype[mapFamilyTypeToCode(data.familyType)];
      const tobaccoCode =
        inputVariables.tobacco[data.tobaccoStatus === "Tobacco" ? "yes" : "no"];
      const defaultUnit = inputVariables["default-unit"];
      const premiumModeValue =
        inputVariables["payment-mode"][mapPremiumModeToKey(data.premiumMode)];

      if (
        !cisCode || !stateConfig || !premiumCode || !rateSheet ||
          !familyCode || !tobaccoCode || !defaultUnit || !premiumModeValue
      ) {
        functions.logger.error("Mapping failed.", {
          cisCode, premiumCode, rateSheet,
          familyCode, tobaccoCode, defaultUnit, premiumModeValue,
        });
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Could not process all inputs due to missing mapping data.",
        );
      }

      functions.logger.info("3. Mapped Inputs to Codes:",
        {cisCode, premiumCode, familyCode, tobaccoCode, rateSheet});

      // 4. Construct lookupId
      const lookupId =
        `${cisCode}${premiumCode}${data.age}${familyCode}${tobaccoCode}`;
      functions.logger.info(`4. Constructed lookupId: ${lookupId}`);

      // 5. Retrieve Rate Data Document
      const rateDocPath =
        `bflic-cancer-quotes/states/${rateSheet}/${lookupId}`;
      functions.logger.info(`5. Attempting ${rateDocPath}`);
      const rateDocRef = db.collection("bflic-cancer-quotes")
        .doc("states").collection(rateSheet).doc(lookupId);
      const rateDocSnap = await rateDocRef.get();

      if (!rateDocSnap.exists) {
        functions.logger.error(`Rate doc not found: ${rateDocPath}`);
        throw new functions.https.HttpsError(
          "not-found",
          "No rate found for the selected criteria. Check inputs.",
        );
      }

      const rateData = rateDocSnap.data();
      if (!rateData) {
        functions.logger.error("Rate document data is undefined.");
        throw new functions.https.HttpsError(
          "internal",
          "Rate data is empty for the selected criteria.",
        );
      }

      const rateVariable = parseFloat(rateData.inprem.toString());
      if (isNaN(rateVariable)) {
        functions.logger.error(`Invalid 'inprem' value: ${rateData.inprem}`);
        throw new functions.https.HttpsError(
          "internal",
          "Rate data is malformed. Please contact support.",
        );
      }

      functions.logger.info(`Successfully fetched rate: ${rateVariable}`);

      // 6. Calculate Premium
      const premium = ((rateVariable * 0.01) * data
        .benefitAmount / defaultUnit) * premiumModeValue;
      const roundedPremium = Math.round(premium * 100) / 100;
      functions.logger.info(`7. Calculated premium: ${roundedPremium}`);

      // 7. Return result
      return {
        monthly_premium: roundedPremium,
        carrier: "Bankers Fidelity",
        plan_name: "Cancer Insurance",
        benefit_amount: data.benefitAmount,
      };
    } catch (error) {
      functions.logger.error("--- ERROR in Quote Calculation ---", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred while calculating the quote.",
      );
    }
  },
);
