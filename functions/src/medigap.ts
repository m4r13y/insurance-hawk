/**
 * @fileOverview Firebase Cloud Function for fetching Medigap quotes from the CSG API.
 */
import * as functions from "firebase-functions";
import axios from "axios";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
try {
  admin.initializeApp();
} catch (e) {
  functions.logger.info("Admin SDK already initialized.");
}

// Ensure CSG_API_KEY is set in environment config
const CSG_API_KEY = process.env.CSG_API_KEY;
if (!CSG_API_KEY) {
  functions.logger.error(
    "CSG_API_KEY environment variable not set. Medigap quotes will not work.",
  );
}

// --- TYPE DEFINITIONS ---
interface MedigapQuoteRequestData {
  zip5: string;
  age: number;
  gender: "M" | "F";
  tobacco: 0 | 1;
  naic?: string | string[]; // naic is repeatable
  plan: "F" | "G" | "N";
  effective_date?: string; // YYYY-MM-DD
  apply_discounts?: 0 | 1;
  apply_fees?: 0 | 1;
  offset?: number;
  limit?: number;
  field?: string | string[]; // field is repeatable
}

// Basic interface for the expected response structure.
// This should be updated based on the actual CSG API response.
interface MedigapQuoteResponse {
  quotes: Array<Record<string, unknown>>; // Array of quote objects
  total_count: number;
  // Add other relevant fields from the CSG API response
}

// --- MAIN CLOUD FUNCTION ---
export const getMedigapQuotes = functions.https.onCall(
  async (data: MedigapQuoteRequestData): Promise<MedigapQuoteResponse> => {
    functions.logger.info("--- Starting Medigap Quote Fetch ---", {
      structuredData: true,
    });
    functions.logger.info("1. Received input data:", {data});

    // Input Validation
    if (!data.zip5 || typeof data.zip5 !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid zip5 is required.",
      );
    }
    if (typeof data.age !== "number" || data.age < 1) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid age is required.",
      );
    }
    if (!data.gender || !["M", "F"].includes(data.gender)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid gender (M or F) is required.",
      );
    }
    if (typeof data.tobacco !== "number" || ![0, 1].includes(data.tobacco)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid tobacco status (0 or 1) is required.",
      );
    }
    if (!data.plan || !["F", "G", "N"].includes(data.plan)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid plan (F, G, or N) is required.",
      );
    }

    if (!CSG_API_KEY) {
      throw new functions.https.HttpsError(
        "internal",
        "Server configuration error: CSG API key is not set.",
      );
    }

    try {
      // Construct query parameters
      const params: Record<string, any> = {
        zip5: data.zip5,
        age: data.age,
        gender: data.gender,
        tobacco: data.tobacco,
        plan: data.plan,
        effective_date: data.effective_date || undefined, // Use undefined for default
        apply_discounts: data.apply_discounts || 0, // Default to 0
        apply_fees: data.apply_fees || 0, // Default to 0
        offset: data.offset || 0, // Default to 0
        limit: data.limit || 10, // Default to a reasonable limit, was 1 in prompt but likely need more
      };

      // Handle repeatable parameters
      if (data.naic) {
        params.naic = data.naic; // Axios handles array parameters correctly
      }
      // The API doc showed "select{select}=" which is unusual. Assuming it means select and the value for select.
      // If 'field' is the correct parameter name as shown later in the doc, we'll use that.
      if (data.field) {
        params.field = data.field; // Axios handles array parameters correctly
      } else {
        // Define some default fields if none are provided, based on the example and typical needs
        params.field = [
          "company_base.name_full",
          "plan",
          "monthly_premium",
          "payment_mode",
          "is_tobacco_rate",
          "discounts",
          "fees",
          "effective_date",
          "rating_method",
        ];
      }


      functions.logger.info("2. Constructed API parameters:", {params});

      // Make the HTTP request to the CSG API
      const apiUrl = "https://csgapi.appspot.com/v1/med_supp/quotes.json";
      functions.logger.info(`3. Making GET request to: ${apiUrl}`);

      const response = await axios.get<MedigapQuoteResponse>(apiUrl, {
        params,
        headers: {
          "x-api-token": CSG_API_KEY,
        },
      });

      functions.logger.info(
        `4. Received API response with status: ${response.status}`,
      );
      functions.logger.info("API response data summary:", {
        total_count: response.data.total_count,
        first_quote_example: response.data.quotes?.[0],
      });


      // Return the response data
      return response.data;
    } catch (error: any) {
      functions.logger.error("--- ERROR fetching Medigap Quotes ---", error);

      // Handle specific Axios errors or re-throw as HttpsError
      if (axios.isAxiosError(error)) {
        functions.logger.error("Axios error details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new functions.https.HttpsError(
          "internal",
          `Failed to fetch Medigap quotes from API: ${error.message}`,
          error.response?.data, // Include API error details if available
        );
      } else {
        // Handle other potential errors
        throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred while fetching quotes.",
        );
      }
    }
  },
);