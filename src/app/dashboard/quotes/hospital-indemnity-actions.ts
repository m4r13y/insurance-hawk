

import { getFunctions, httpsCallable } from "firebase/functions";
import type { HospitalIndemnityQuoteRequestValues } from "@/types";

export async function getHospitalIndemnityQuotes(values: HospitalIndemnityQuoteRequestValues) {
  try {
    // Map form values to API params
    const params = {
      zip5: values.zipCode,
      age: values.age,
      gender: values.gender === "male" ? "M" : "F",
      tobacco: values.tobacco === "true" ? 1 : 0,
    };
    const functions = getFunctions();
    const getHospitalIndemnityQuotesFn = httpsCallable(functions, "getHospitalIndemnityQuotes");
    const result = await getHospitalIndemnityQuotesFn(params);
    // Expecting result.data to be { quotes: [...] } or similar
    if (
      result.data &&
      typeof result.data === "object" &&
      "quotes" in result.data &&
      Array.isArray((result.data as any).quotes)
    ) {
      return { quotes: (result.data as any).quotes };
    }
    // If the response is an array itself
    if (Array.isArray(result.data)) {
      return { quotes: result.data };
    }
    // If the response is an object with a 'results' array
    if (
      result.data &&
      typeof result.data === "object" &&
      "results" in result.data &&
      Array.isArray((result.data as any).results)
    ) {
      return { quotes: (result.data as any).results };
    }
    // Fallback: return error or empty
    return { quotes: [] };
  } catch (e: any) {
    console.error("Error in getHospitalIndemnityQuotes:", e);
    return { error: e.message || "Failed to fetch hospital indemnity quotes." };
  }
}
