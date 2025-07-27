import { getFunctions, httpsCallable } from "firebase/functions";
import type { DentalQuoteRequestValues } from "@/types";

export async function getDentalQuotes(values: DentalQuoteRequestValues) {
  try {
    const functions = getFunctions();
    const getDentalQuotesFn = httpsCallable(functions, "getDentalQuotes");
    const result = await getDentalQuotesFn(values);
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
    console.error("Error in getDentalQuotes:", e);
    return { error: e.message || "Failed to fetch dental quotes." };
  }
}
