
"use server";

import {
  generateRetirementPlan,
  type GenerateRetirementPlanInput,
} from "@/ai/flows";

export async function getRetirementPlan(values: GenerateRetirementPlanInput) {
  try {
    const { plan } = await generateRetirementPlan(values);
    return { plan };
  } catch (e) {
    console.error(e);
    return { error: "Could not generate your retirement plan. Please try again later." };
  }
}
