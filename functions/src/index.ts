/**
 * @fileOverview Cancer Insurance quotes using Firebase Cloud Functions v2.
 */
import * as v2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK.
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

// --- USER DATA MANAGEMENT INTERFACES ---
interface UserPersonalInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "male" | "female";
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

interface UserMedication {
  name: string;
  rxcui?: string;
  dosage: string;
  quantityCount: string;
  quantityPeriod: string;
}

interface UserDoctor {
  name: string;
  specialty: string;
  zipCode: string;
  npi?: string;
}

interface UserPolicy {
  policyType?: string;
  benefitAmount?: number;
  quotePrice?: number;
  status?: "pending" | "approved" | "declined" | "submitted";
  planName?: string;
  carrierName?: string;
  enrollmentDate?: string;
}

interface UserUnderwriting {
  height?: string;
  weight?: string;
  smoker?: boolean;
  income?: string;
  occupation?: string;
}

interface UserMedicalQuestions {
  hasConditions?: boolean;
  conditions?: string[];
  medications?: string[];
  recentTreatments?: boolean;
  treatmentDetails?: string;
}

interface UserSignature {
  signatureName: string;
  signatureDate: string;
  agreed: boolean;
}

interface UserDataDocument {
  userId: string;
  userEmail: string;
  updatedAt: admin.firestore.FieldValue;
  createdAt?: admin.firestore.FieldValue;
  submittedAt?: admin.firestore.FieldValue;
  applicationStep: string;
  status?: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
  };
  underwriting?: UserUnderwriting;
  medicalQuestions?: UserMedicalQuestions;
  signature?: UserSignature & {
    ipAddress?: string;
    userAgent?: string;
  };
  policy?: UserPolicy;
}

interface SaveUserDataRequest {
  personalInfo?: UserPersonalInfo;
  underwriting?: UserUnderwriting;
  medicalQuestions?: UserMedicalQuestions;
  signature?: UserSignature;
  medications?: UserMedication[];
  doctors?: UserDoctor[];
  policy?: UserPolicy;
  applicationStep?: "personal" | "underwriting" | "medical" |
    "signature" | "complete";
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

// --- USER DATA MANAGEMENT CLOUD FUNCTION ---
export const saveUserData = v2.https.onCall(
  async (request: v2.https.CallableRequest<SaveUserDataRequest>):
  Promise<{success: boolean; documentId: string; message: string}> => {
    const data = request.data;
    const auth = request.auth;

    v2.logger.info("--- Starting Save User Data ---", {
      structuredData: true,
    });

    // Authentication check
    if (!auth || !auth.uid) {
      v2.logger.warn("Unauthenticated request attempted");
      throw new v2.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to save data.",
      );
    }

    const userId = auth.uid;
    const userEmail = auth.token?.email || "unknown";
    v2.logger.info("Processing data for user:", {
      userId,
      email: userEmail,
      step: data.applicationStep || "unknown",
    });

    // Input validation
    if (!data || Object.keys(data).length === 0) {
      v2.logger.warn("Empty data received");
      throw new v2.https.HttpsError(
        "invalid-argument",
        "No data provided to save.",
      );
    }

    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const userDataRef = db.collection("user-data").doc(userId);

      // Build the document data structure
      const documentData: Partial<UserDataDocument> = {
        userId,
        userEmail,
        updatedAt: timestamp,
        applicationStep: data.applicationStep || "unknown",
      };

      // Handle personal information
      if (data.personalInfo) {
        v2.logger.info("Processing personal information");
        documentData.personalInfo = {
          firstName: data.personalInfo.firstName?.trim(),
          lastName: data.personalInfo.lastName?.trim(),
          dateOfBirth: data.personalInfo.dob,
          gender: data.personalInfo.gender,
          address: {
            street: data.personalInfo.address?.trim(),
            city: data.personalInfo.city?.trim(),
            state: data.personalInfo.state?.trim(),
            zipCode: data.personalInfo.zip?.trim(),
          },
          phone: data.personalInfo.phone?.trim(),
          email: data.personalInfo.email?.trim().toLowerCase(),
        };
      }

      // Handle underwriting information
      if (data.underwriting) {
        v2.logger.info("Processing underwriting information");
        documentData.underwriting = {
          height: data.underwriting.height,
          weight: data.underwriting.weight,
          smoker: data.underwriting.smoker,
          income: data.underwriting.income,
          occupation: data.underwriting.occupation,
        };
      }

      // Handle medical questions
      if (data.medicalQuestions) {
        v2.logger.info("Processing medical questions");
        documentData.medicalQuestions = {
          hasConditions: data.medicalQuestions.hasConditions,
          conditions: data.medicalQuestions.conditions || [],
          medications: data.medicalQuestions.medications || [],
          recentTreatments: data.medicalQuestions.recentTreatments,
          treatmentDetails: data.medicalQuestions.treatmentDetails,
        };
      }

      // Handle signature
      if (data.signature) {
        v2.logger.info("Processing signature information");
        documentData.signature = {
          signatureName: data.signature.signatureName?.trim(),
          signatureDate: data.signature.signatureDate,
          agreed: data.signature.agreed,
          ipAddress: request.rawRequest.ip,
          userAgent: request.rawRequest.get("user-agent"),
        };
      }

      // Handle policy information
      if (data.policy) {
        v2.logger.info("Processing policy information");
        
        // Filter out undefined values
        const policyInfo: UserPolicy = {};
        const policyFields = [
          "policyType", "benefitAmount", "quotePrice",
          "status", "planName", "carrierName", "enrollmentDate",
        ] as const;
        
        for (const field of policyFields) {
          if (data.policy[field] !== undefined) {
            (policyInfo as Record<string, unknown>)[field] = data.policy[field];
          }
        }
        
        documentData.policy = policyInfo;
      }

      // Set creation timestamp only for new documents
      const existingDoc = await userDataRef.get();
      if (!existingDoc.exists) {
        documentData.createdAt = timestamp;
        documentData.status = "draft";
        v2.logger.info("Creating new user data document");
      } else {
        v2.logger.info("Updating existing user data document");
      }

      // Update status based on application step
      if (data.applicationStep === "complete" && data.signature?.agreed) {
        documentData.status = "submitted";
        documentData.submittedAt = timestamp;
        
        // Create a policy entry when application is completed
        v2.logger.info("Creating policy from completed application");
        
        const firstName = documentData.personalInfo?.firstName || "";
        const lastName = documentData.personalInfo?.lastName || "";
        const applicantName = `${firstName} ${lastName}`.trim();
        
        const policyData = {
          // Use policy data if provided, otherwise derive from application
          planName: data.policy?.planName || "Cancer Insurance",
          premium: data.policy?.quotePrice || 0,
          policyCategoryName: data.policy?.policyType || "Cancer Insurance",
          policyCategoryId: "cancer",
          carrierName: data.policy?.carrierName || "Unknown",
          carrierId: "unknown",
          enrollmentDate: new Date().toISOString().split("T")[0],
          applicationDate: timestamp,
          applicantName,
          status: "pending",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        
        // Save policy to user's policies sub-collection
        const policiesRef = db.collection(`users/${userId}/policies`);
        await policiesRef.add(policyData);
        
        v2.logger.info("Policy created successfully", {
          planName: policyData.planName,
          premium: policyData.premium,
          carrierName: policyData.carrierName,
        });
      }

      // Save the main document
      await userDataRef.set(documentData, {merge: true});

      // Handle medications as sub-collection if provided
      if (data.medications && data.medications.length > 0) {
        v2.logger.info(`Processing ${data.medications.length} medications`);
        const medicationsBatch = db.batch();

        for (const [index, medication] of data.medications.entries()) {
          const medicationRef = userDataRef
            .collection("medications")
            .doc(`medication_${index + 1}`);

          medicationsBatch.set(medicationRef, {
            name: medication.name?.trim(),
            rxcui: medication.rxcui,
            dosage: medication.dosage?.trim(),
            quantityCount: medication.quantityCount,
            quantityPeriod: medication.quantityPeriod,
            addedAt: timestamp,
          });
        }

        await medicationsBatch.commit();
        v2.logger.info("Medications saved successfully");
      }

      // Handle doctors as sub-collection if provided
      if (data.doctors && data.doctors.length > 0) {
        v2.logger.info(`Processing ${data.doctors.length} doctors`);
        const doctorsBatch = db.batch();

        for (const [index, doctor] of data.doctors.entries()) {
          const doctorRef = userDataRef
            .collection("doctors")
            .doc(`doctor_${index + 1}`);

          doctorsBatch.set(doctorRef, {
            name: doctor.name?.trim(),
            specialty: doctor.specialty?.trim(),
            zipCode: doctor.zipCode?.trim(),
            npi: doctor.npi,
            addedAt: timestamp,
          });
        }

        await doctorsBatch.commit();
        v2.logger.info("Doctors saved successfully");
      }

      // Log successful completion
      v2.logger.info("User data saved successfully", {
        userId,
        documentId: userId,
        step: data.applicationStep,
        status: documentData.status,
      });

      return {
        success: true,
        documentId: userId,
        message: "User data saved successfully",
      };
    } catch (error) {
      v2.logger.error("Error saving user data:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        step: data.applicationStep,
      });

      if (error instanceof v2.https.HttpsError) {
        throw error;
      }

      throw new v2.https.HttpsError(
        "internal",
        "An error occurred while saving user data. Please try again.",
      );
    }
  },
);

interface UserDataResponse {
  profile: Record<string, unknown> | null;
  policies: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  userId: string;
}

/**
 * Cloud Function to fetch user data (policies, documents, profile)
 */
export const getUserData = v2.https.onCall(
  {
    cors: true,
    enforceAppCheck: false,
  },
  async (request): Promise<UserDataResponse> => {
    try {
      v2.logger.info("--- Starting Get User Data ---");

      // Validate authentication
      if (!request.auth) {
        throw new v2.https.HttpsError(
          "unauthenticated",
          "You must be authenticated to fetch user data.",
        );
      }

      const userId = request.auth.uid;
      const email = request.auth.token?.email;
      
      v2.logger.info({
        message: "Fetching data for user:",
        userId,
        email,
      });

      // Fetch user profile from user-data collection
      const userDocRef = db.doc(`user-data/${userId}`);
      const userDoc = await userDocRef.get();
      
      let profile = null;
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Flatten the profile data structure to match frontend expectations
        profile = {
          firstName: userData?.personalInfo?.firstName || "",
          lastName: userData?.personalInfo?.lastName || "",
          dob: userData?.personalInfo?.dateOfBirth || "",
          email: userData?.personalInfo?.email || "",
          phone: userData?.personalInfo?.phone || "",
          address: userData?.personalInfo?.address?.street || "",
          city: userData?.personalInfo?.address?.city || "",
          state: userData?.personalInfo?.address?.state || "",
          zip: userData?.personalInfo?.address?.zipCode || "",
          medicareId: userData?.medicareId || "",
          // Include other fields that might be needed
          ...userData,
        };
      }

      // Fetch policies
      const policiesRef = db.collection(`users/${userId}/policies`);
      const policiesSnapshot = await policiesRef.get();
      const policies = policiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch documents
      const documentsRef = db.collection(`users/${userId}/documents`);
      const documentsSnapshot = await documentsRef.get();
      const documents = documentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const result: UserDataResponse = {
        profile,
        policies,
        documents,
        userId,
      };

      v2.logger.info({
        message: "User data fetched successfully",
        userId,
        policiesCount: policies.length,
        documentsCount: documents.length,
        hasProfile: !!profile,
      });

      return result;
    } catch (error: unknown) {
      v2.logger.error("Error fetching user data:", error);

      if (error instanceof v2.https.HttpsError) {
        throw error;
      }

      throw new v2.https.HttpsError(
        "internal",
        "An error occurred while fetching user data. Please try again.",
      );
    }
  },
);
