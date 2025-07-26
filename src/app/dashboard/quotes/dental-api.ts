import axios from "axios";
import type { DentalQuoteRequestValues } from "@/types";

const API_URL = "https://csgapi.appspot.com/v1/dental/quotes.json";
const API_TOKEN = "0529636d81a5b09e189302aac2ddb4aabb75ed48667242f3c953feb2591dc2a8";

export async function fetchDentalQuotesAPI(values: DentalQuoteRequestValues) {
  const params = {
    zip5: values.zip5,
    age: values.age,
    gender: values.gender === "M" ? "M" : "F",
    tobacco: values.tobacco ? 1 : 0,
    covered_members: "all"
  };
  try {
    const response = await axios.get(API_URL, {
      params,
      headers: {
        "x-api-token": API_TOKEN
      }
    });
    return { quotes: response.data };
  } catch (e: any) {
    return { error: e.message || "Failed to fetch dental quotes." };
  }
}
