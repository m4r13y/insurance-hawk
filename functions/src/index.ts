/**
 * @fileOverview Cancer Insurance quotes using Firebase Cloud Functions v2.
 */
import * as v2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import axios, {isAxiosError} from "axios";

// Initialize the Firebase Admin SDK.ffirebqa
let app: admin.app.App;
try {
  app = admin.initializeApp();
} catch (e) {
  v2.logger.info("Admin SDK already initialized.");
  app = admin.app();
}

const db = getFirestore(app, "hawknest-database");

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

interface UserProfile {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  gender?: string;
}

interface SaveUserDataRequest {
  step: string;
  personalInfo?: UserProfile;
  [key: string]: unknown;
}

// --- HELPER v2 ---
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

// --- USER DATA MANAGEMENT FUNCTIONS ---

// Get user profile data
export const getUserData = v2.https.onCall(
  async (request: v2.https.CallableRequest): Promise<{
    profile: UserProfile;
    policiesCount: number;
    documentsCount: number;
    hasProfile: boolean;
  }> => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to access profile data."
      );
    }

    try {
      v2.logger.info("--- Starting Get User Data ---");
      v2.logger.info("Fetching data for user:", {
        userId: uid,
        email: request.auth?.token?.email || "unknown",
      });

      // Get user document from Firestore
      const userDocRef = db.collection("users").doc(uid);
      const userDocSnap = await userDocRef.get();

      let profile: UserProfile = {};
      let hasProfile = false;

      if (userDocSnap.exists) {
        const userData = userDocSnap.data();
        if (userData?.personalInfo) {
          profile = userData.personalInfo;
          hasProfile = true;
        }
      }

      // Get policies count
      const policiesSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("policies")
        .get();
      const policiesCount = policiesSnapshot.size;

      // Get documents count
      const documentsSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("documents")
        .get();
      const documentsCount = documentsSnapshot.size;

      const result = {
        profile,
        policiesCount,
        documentsCount,
        hasProfile,
      };

      v2.logger.info("User data fetched successfully", {
        userId: uid,
        policiesCount,
        documentsCount,
        hasProfile,
      });

      return result;
    } catch (error) {
      v2.logger.error("Error getting user data:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to retrieve user profile data."
      );
    }
  }
);

// Ensure CSG_API_KEY is set in environment variable
const CSG_API_KEY = process.env.CSG_API_KEY;
if (!CSG_API_KEY) {
  v2.logger.error(
    "CSG_API_KEY not set in environment. Medigap quotes will not work."
  );
}

// Interface for CSG API token response
interface CsgTokenResponse {
  token: string;
  expires_date: string;
  user: Record<string, unknown>;
  key: string;
  created_date: string;
}

// Interface for stored token data
interface StoredTokenData {
  token: string;
  expires_date: string;
  created_date: string;
  updated_at: admin.firestore.Timestamp;
}

/**
 * Get current valid token from Firestore or refresh if needed
 */
async function getCurrentToken(): Promise<string> {
  try {
    // Check if we have a valid stored token
    const tokenDoc = await db.collection("system").doc("csg_token").get();
    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data() as StoredTokenData;
      const expiresDate = new Date(tokenData.expires_date);
      const now = new Date();
      // Check if token is still valid (with 30 minute buffer)
      const bufferTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      if (expiresDate.getTime() > now.getTime() + bufferTime) {
        v2.logger.info("Using existing valid token");
        return tokenData.token;
      } else {
        v2.logger.info("Token expired or expiring soon, refreshing...");
      }
    } else {
      v2.logger.info("No stored token found, creating new one...");
    }

    // Token doesn't exist or is expired, get a new one
    return await refreshToken();
  } catch (error) {
    v2.logger.error("Error getting current token:", error);
    // Fallback to environment token if available
    const fallbackToken = process.env.CSG_API_TOKEN;
    if (fallbackToken) {
      v2.logger.warn("Using fallback token from environment");
      return fallbackToken;
    }
    throw new Error("Unable to get valid CSG API token");
  }
}

/**
 * Refresh the CSG API token
 */
async function refreshToken(): Promise<string> {
  if (!CSG_API_KEY) {
    throw new Error("CSG_API_KEY not configured");
  }

  try {
    v2.logger.info("Refreshing CSG API token...");

    const response = await axios.post<CsgTokenResponse>(
      "https://csgapi.appspot.com/v1/auth.json",
      {
        api_key: CSG_API_KEY,
        portal_name: "csg_individual",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const tokenData = response.data;

    // Store the new token in Firestore
    await db.collection("system").doc("csg_token").set({
      token: tokenData.token,
      expires_date: tokenData.expires_date,
      created_date: tokenData.created_date,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    v2.logger.info("Successfully refreshed and stored CSG API token", {
      expires_date: tokenData.expires_date,
    });

    return tokenData.token;
  } catch (error) {
    v2.logger.error("Error refreshing CSG API token:", error);
    if (isAxiosError(error)) {
      v2.logger.error("API Error details:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error("Failed to refresh CSG API token");
  }
}

// Scheduled function to refresh token every 7 hours
export const refreshCsgToken = v2.scheduler.onSchedule({
  schedule: "0 */7 * * *", // Every 7 hours
  timeZone: "America/Chicago",
}, async () => {
  try {
    v2.logger.info("Scheduled token refresh triggered");
    await refreshToken();
    v2.logger.info("Scheduled token refresh completed successfully");
  } catch (error) {
    v2.logger.error("Scheduled token refresh failed:", error);
    // Don't throw here to prevent the scheduler from retrying excessively
  }
});

// Medigap quotes function


export const getMedigapQuotes = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    zip5: string;
    age: number;
    gender: string;
    tobacco: number;
    plan: string;
  }>) => {
    v2.logger.info("getMedigapQuotes called", {data: request.data});
    try {
      // Only use required parameters
      const {zip5, age, gender, tobacco, plan} = request.data;
      const apiUrl = "https://csgapi.appspot.com/v1/med_supp/quotes.json";
      const token = await getCurrentToken();
      const params = {zip5, age, gender, tobacco, plan};
      v2.logger.info("Calling CSG API", {apiUrl, token, params});
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          "x-api-token": token,
        },
      });
      v2.logger.info("CSG API response", {response: response.data});
      return response.data;
    } catch (error) {
      v2.logger.error("Error in getMedigapQuotes", {error});
      throw new v2.https.HttpsError("internal", "Error fetching quotes", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Save user profile data
export const saveUserData = v2.https.onCall(
  async (request: v2.https.CallableRequest<SaveUserDataRequest>):
  Promise<{success: boolean}> => {
    const uid = request.auth?.uid;
    const data = request.data;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to save profile data."
      );
    }

    if (!data || !data.personalInfo) {
      throw new v2.https.HttpsError(
        "invalid-argument",
        "Personal info data is required."
      );
    }

    try {
      v2.logger.info(`Saving user data for UID: ${uid}`, {data});

      // Update user document in Firestore
      const userDocRef = db.collection("users").doc(uid);

      // Use merge to update only the provided fields
      await userDocRef.set({
        personalInfo: data.personalInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      // Also save to user-data collection structure for compatibility
      const userDataDocRef = db.collection("user-data").doc(uid);
      const userDataUpdate: Record<string, string> = {};

      if (data.personalInfo.firstName) {
        userDataUpdate["first-name"] = data.personalInfo.firstName;
      }
      if (data.personalInfo.lastName) {
        userDataUpdate["last-name"] = data.personalInfo.lastName;
      }
      if (data.personalInfo.dob) {
        userDataUpdate["date-of-birth"] = data.personalInfo.dob;
      }
      if (data.personalInfo.email) {
        userDataUpdate.email = data.personalInfo.email;
      }
      if (data.personalInfo.phone) {
        userDataUpdate.phone = data.personalInfo.phone;
      }

      if (Object.keys(userDataUpdate).length > 0) {
        await userDataDocRef.set(userDataUpdate, {merge: true});
      }

      v2.logger.info(`Successfully saved user data for ${uid}`);

      return {success: true};
    } catch (error) {
      v2.logger.error("Error saving user data:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to save user profile data."
      );
    }
  }
);

// --- MAIN CLOUD FUNCTION ---
export const getCancerInsuranceQuote = v2.https.onCall(
  async (request: v2.https.CallableRequest<CancerQuoteRequestData>):
  Promise<CancerQuoteResponse> => {
    const data = request.data;
    v2.logger.info("--- Starting Cancer Quote ---", {
      structuredData: true,
    });
    v2.logger.info("1. Received input data:", {data});

    // Input Validation
    if (!data.state || !["TX", "GA"].includes(data.state)) {
      throw new v2.https.HttpsError(
        "invalid-argument",
        "A valid state (TX or GA) is required.",
      );
    }
    if (typeof data.age !== "number" || data.age < 18 || data.age > 99) {
      throw new v2.https.HttpsError(
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
      throw new v2.https.HttpsError(
        "invalid-argument",
        "Benefit must be $5,000-$75,000 in $1000 increments.",
      );
    }

    try {
      // 2. Fetch Firestore Configuration Data Concurrently
      const inputVariablesRef =
        db.collection("bflic-cancer-quotes").doc("input-variable-id");
      const statesRef = db.collection("bflic-cancer-quotes").doc("states");
      v2.logger.info("2. Fetching config documents.");

      const [inputVariablesSnap, statesSnap] = await Promise.all([
        inputVariablesRef.get(),
        statesRef.get(),
      ]);

      if (!inputVariablesSnap.exists || !statesSnap.exists) {
        v2.logger.error(
          "CRITICAL: Missing 'input-variable-id' or 'states' in Firestore.",
        );
        throw new v2.https.HttpsError(
          "failed-precondition",
          "Server configuration is incomplete. Please contact support.",
        );
      }
      const inputVariables = inputVariablesSnap.data() as InputVariables;
      const statesData = statesSnap.data() as StatesData;

      if (!inputVariables || !statesData) {
        v2.logger.error("Config document data is undefined.");
        throw new v2.https.HttpsError(
          "internal",
          "Configuration data is empty.",
        );
      }

      v2.logger.info("Successfully fetched config documents.");

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
        v2.logger.error("Mapping failed.", {
          cisCode, premiumCode, rateSheet,
          familyCode, tobaccoCode, defaultUnit, premiumModeValue,
        });
        throw new v2.https.HttpsError(
          "failed-precondition",
          "Could not process all inputs due to missing mapping data.",
        );
      }

      v2.logger.info("3. Mapped Inputs to Codes:",
        {cisCode, premiumCode, familyCode, tobaccoCode, rateSheet});

      // 4. Construct lookupId
      const lookupId =
        `${cisCode}${premiumCode}${data.age}${familyCode}${tobaccoCode}`;
      v2.logger.info(`4. Constructed lookupId: ${lookupId}`);

      // 5. Retrieve Rate Data Document
      const rateDocPath =
        `bflic-cancer-quotes/states/${rateSheet}/${lookupId}`;
      v2.logger.info(`5. Attempting ${rateDocPath}`);
      const rateDocRef = db.collection("bflic-cancer-quotes")
        .doc("states").collection(rateSheet).doc(lookupId);
      const rateDocSnap = await rateDocRef.get();

      if (!rateDocSnap.exists) {
        v2.logger.error(`Rate doc not found: ${rateDocPath}`);
        throw new v2.https.HttpsError(
          "not-found",
          "No rate found for the selected criteria. Check inputs.",
        );
      }

      const rateData = rateDocSnap.data();
      if (!rateData) {
        v2.logger.error("Rate document data is undefined.");
        throw new v2.https.HttpsError(
          "internal",
          "Rate data is empty for the selected criteria.",
        );
      }

      const rateVariable = parseFloat(rateData.inprem.toString());
      if (isNaN(rateVariable)) {
        v2.logger.error(`Invalid 'inprem' value: ${rateData.inprem}`);
        throw new v2.https.HttpsError(
          "internal",
          "Rate data is malformed. Please contact support.",
        );
      }

      v2.logger.info(`Successfully fetched rate: ${rateVariable}`);

      // 6. Calculate Premium
      const premium = ((rateVariable * 0.01) * data
        .benefitAmount / defaultUnit) * premiumModeValue;
      const roundedPremium = Math.round(premium * 100) / 100;
      v2.logger.info(`7. Calculated premium: ${roundedPremium}`);

      // 7. Return result
      return {
        monthly_premium: roundedPremium,
        carrier: "Bankers Fidelity",
        plan_name: "Cancer Insurance",
        benefit_amount: data.benefitAmount,
      };
    } catch (error) {
      v2.logger.error("--- ERROR in Quote Calculation ---", error);
      if (error instanceof v2.https.HttpsError) {
        throw error;
      }
      throw new v2.https.HttpsError(
        "internal",
        "An unexpected error occurred while calculating the quote.",
      );
    }
  },
);

// --- ENHANCED USER DATA MANAGEMENT FUNCTIONS ---

// Delete user profile data
export const deleteUserData = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    dataType: string;
    itemId?: string;
  }>): Promise<{success: boolean}> => {
    const uid = request.auth?.uid;
    const {dataType, itemId} = request.data;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to delete data."
      );
    }

    try {
      v2.logger.info(`Deleting ${dataType} for user: ${uid}`, {itemId});

      switch (dataType) {
      case "profile":
        // Clear personal info but keep user document
        await db.collection("users").doc(uid).update({
          personalInfo: admin.firestore.FieldValue.delete(),
        });
        break;

      case "policy":
        if (!itemId) throw new Error("Policy ID required for deletion");
        await db.collection("users").doc(uid).collection("policies")
          .doc(itemId).delete();
        // Also delete from user-data structure
        await db.collection("user-data").doc(uid).collection("policies")
          .doc(itemId).delete();
        break;

      case "document":
        if (!itemId) throw new Error("Document ID required for deletion");
        await db.collection("users").doc(uid).collection("documents")
          .doc(itemId).delete();
        break;

      case "allData": {
        // Complete user data deletion
        const userDoc = db.collection("users").doc(uid);
        const collections = ["policies", "documents", "quotes"];

        for (const collectionName of collections) {
          const snapshot = await userDoc.collection(collectionName).get();
          const batch = db.batch();
          snapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }

        // Delete main user document
        await userDoc.delete();

        // Delete user-data structure
        await db.collection("user-data").doc(uid).delete();
        break;
      }

      default:
        throw new Error(`Unsupported data type: ${dataType}`);
      }

      v2.logger.info(`Successfully deleted ${dataType} for user: ${uid}`);
      return {success: true};
    } catch (error) {
      v2.logger.error(`Error deleting ${dataType}:`, error);
      throw new v2.https.HttpsError(
        "internal",
        `Failed to delete ${dataType}.`
      );
    }
  }
);

// Update specific user data
export const updateUserData = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    dataType: string;
    itemId?: string;
    updateData: Record<string, unknown>;
  }>): Promise<{success: boolean}> => {
    const uid = request.auth?.uid;
    const {dataType, itemId, updateData} = request.data;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to update data."
      );
    }

    try {
      const logData = {itemId, updateFields: Object.keys(updateData)};
      v2.logger.info(`Updating ${dataType} for user: ${uid}`, logData);

      switch (dataType) {
      case "profile":
        await db.collection("users").doc(uid).update({
          personalInfo: updateData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "policy":
        if (!itemId) throw new Error("Policy ID required for update");
        await db.collection("users").doc(uid).collection("policies")
          .doc(itemId).update({
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        break;

      case "document":
        if (!itemId) throw new Error("Document ID required for update");
        await db.collection("users").doc(uid).collection("documents")
          .doc(itemId).update({
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        break;

      default:
        throw new Error(`Unsupported data type: ${dataType}`);
      }

      v2.logger.info(`Successfully updated ${dataType} for user: ${uid}`);
      return {success: true};
    } catch (error) {
      v2.logger.error(`Error updating ${dataType}:`, error);
      throw new v2.https.HttpsError(
        "internal",
        `Failed to update ${dataType}.`
      );
    }
  }
);

// Get comprehensive user data analytics
export const getUserAnalytics = v2.https.onCall(
  async (request: v2.https.CallableRequest): Promise<{
    profileCompleteness: number;
    totalPolicies: number;
    totalDocuments: number;
    totalQuotes: number;
    dataHealth: {
      hasBasicInfo: boolean;
      hasContactInfo: boolean;
      hasAddress: boolean;
      missingFields: string[];
    };
  }> => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to access analytics."
      );
    }

    try {
      v2.logger.info("Generating user analytics for:", uid);

      // Get user profile
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data();
      const profile = userData?.personalInfo || {};

      // Calculate profile completeness
      const requiredFields = [
        "firstName", "lastName", "dob", "email", "phone",
        "address", "city", "state", "zip",
      ];
      const completedFields = requiredFields.filter(
        (field) => profile[field] && profile[field].toString().trim()
      );
      const profileCompleteness = Math.round(
        (completedFields.length / requiredFields.length) * 100
      );

      // Get counts
      const [policiesSnap, documentsSnap, quotesSnap] = await Promise.all([
        db.collection("users").doc(uid).collection("policies").get(),
        db.collection("users").doc(uid).collection("documents").get(),
        db.collection("users").doc(uid).collection("quotes").get(),
      ]);

      // Data health analysis
      const missingFields = requiredFields.filter(
        (field) => !profile[field] || !profile[field].toString().trim()
      );
      const dataHealth = {
        hasBasicInfo: !!(profile.firstName && profile.lastName && profile.dob),
        hasContactInfo: !!(profile.email && profile.phone),
        hasAddress: !!(profile.address && profile.city &&
                       profile.state && profile.zip),
        missingFields,
      };

      const analytics = {
        profileCompleteness,
        totalPolicies: policiesSnap.size,
        totalDocuments: documentsSnap.size,
        totalQuotes: quotesSnap.size,
        dataHealth,
      };

      v2.logger.info("User analytics generated successfully", {uid});
      return analytics;
    } catch (error) {
      v2.logger.error("Error generating user analytics:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to generate user analytics."
      );
    }
  }
);

// Get user medications from medications collection
export const getUserMedications = v2.https.onCall(
  async (request: v2.https.CallableRequest): Promise<{
    medications: Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      rxcui?: string;
      addedDate: admin.firestore.Timestamp | null;
    }>;
    totalCount: number;
  }> => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to access medications."
      );
    }

    try {
      v2.logger.info("Fetching medications for user:", uid);

      // Get medications from medications collection
      const medicationsSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("medications")
        .orderBy("addedDate", "desc")
        .get();

      const medications = medicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        dosage: doc.data().dosage || "",
        frequency: doc.data().frequency || "",
        rxcui: doc.data().rxcui,
        addedDate: doc.data().addedDate,
      }));

      const logMessage = `Found ${medications.length} medications for ` +
        `user: ${uid}`;
      v2.logger.info(logMessage);

      return {
        medications,
        totalCount: medications.length,
      };
    } catch (error) {
      v2.logger.error("Error getting medications:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to retrieve medications."
      );
    }
  }
);

// Save user medications to medications collection
export const saveMedications = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      rxcui?: string;
    }>;
  }>): Promise<{success: boolean}> => {
    const uid = request.auth?.uid;
    const {medications} = request.data;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to save medications."
      );
    }

    if (!medications || !Array.isArray(medications)) {
      throw new v2.https.HttpsError(
        "invalid-argument",
        "Medications array is required."
      );
    }

    try {
      const logMessage = `Saving ${medications.length} medications for ` +
        `user: ${uid}`;
      v2.logger.info(logMessage);

      // Clear existing medications first
      const existingMedicationsSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("medications")
        .get();

      const batch = db.batch();
      existingMedicationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new medications
      const medicationsCol = db.collection("users").doc(uid)
        .collection("medications");

      for (const medication of medications) {
        const medicationRef = medicationsCol.doc();
        batch.set(medicationRef, {
          name: medication.name,
          dosage: medication.dosage || "",
          frequency: medication.frequency || "",
          rxcui: medication.rxcui || "",
          addedDate: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();

      const successMessage = `Successfully saved ${medications.length} ` +
        `medications for user: ${uid}`;
      v2.logger.info(successMessage);
      return {success: true};
    } catch (error) {
      v2.logger.error("Error saving medications:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to save medications."
      );
    }
  }
);

// Check for recent quotes (within last 7 days)
export const checkRecentQuotes = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    productType: string;
  }>): Promise<{
    hasRecentQuote: boolean;
    recentQuote?: {
      id: string;
      type: string;
      timestamp: admin.firestore.Timestamp;
      resultData: Record<string, unknown>;
    };
    daysOld?: number;
  }> => {
    const uid = request.auth?.uid;
    const {productType} = request.data;

    if (!uid) {
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to check quotes."
      );
    }

    if (!productType) {
      throw new v2.https.HttpsError(
        "invalid-argument",
        "Product type is required."
      );
    }

    try {
      v2.logger.info(`Checking recent quotes for ${productType}:`, uid);

      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get recent quotes of the specified type
      const quotesSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("quotes")
        .where("type", "==", productType)
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(
          sevenDaysAgo
        ))
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (quotesSnapshot.empty) {
        const logMessage = `No recent ${productType} quotes found for ` +
          `user: ${uid}`;
        v2.logger.info(logMessage);
        return {hasRecentQuote: false};
      }

      const recentQuoteDoc = quotesSnapshot.docs[0];
      const quoteData = recentQuoteDoc.data();
      const quoteTimestamp = quoteData.timestamp as admin.firestore.Timestamp;

      // Calculate how many days old the quote is
      const daysOld = Math.floor(
        (Date.now() - quoteTimestamp.toMillis()) / (1000 * 60 * 60 * 24)
      );

      v2.logger.info(
        `Found recent ${productType} quote (${daysOld} days old) for: ${uid}`
      );

      return {
        hasRecentQuote: true,
        recentQuote: {
          id: recentQuoteDoc.id,
          type: quoteData.type,
          timestamp: quoteTimestamp,
          resultData: quoteData.resultData || {},
        },
        daysOld,
      };
    } catch (error) {
      v2.logger.error("Error checking recent quotes:", error);
      throw new v2.https.HttpsError(
        "internal",
        "Failed to check recent quotes."
      );
    }
  }
);
