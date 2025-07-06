"use server";

import { z } from "zod";
import {
  initialRecommendationPrompt,
  explainPlanRecommendation,
} from "@/ai/flows";
import { mockPlans } from "@/lib/mock-data";
import type { Plan } from "@/types";

const formSchema = z.object({
  age: z.coerce.number().min(64, "Must be at least 64"),
  zipCode: z.string().length(5, "Enter a valid 5-digit zip code"),
  healthStatus: z.enum(["excellent", "good", "fair", "poor"]),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

export async function getInitialRecommendationInstructions(userName: string) {
  try {
    const { instructions } = await initialRecommendationPrompt({ userName });
    return { instructions };
  } catch (e) {
    console.error(e);
    return { error: "Could not load instructions." };
  }
}

export async function getPlanRecommendation(
  values: z.infer<typeof formSchema>
) {
  try {
    // In a real app, you would have logic to find the best plan based on user input.
    // For this demo, we'll pick a suitable mock plan.
    const recommendedPlan: Plan =
      values.healthStatus === "poor" || (values.conditions && values.conditions?.length > 0)
        ? mockPlans.find(p => p.type === 'SNP')!
        : mockPlans.find(p => p.type === 'PPO')!;

    const otherAvailablePlans = mockPlans.filter(
      (p) => p.id !== recommendedPlan.id
    ).slice(0, 2);

    const userDetails = `
      - Age: ${values.age}
      - Location: Zip code ${values.zipCode}
      - Health Status: ${values.healthStatus}
      - Chronic Conditions: ${values.conditions || "None specified"}
      - Medications: ${values.medications || "None specified"}
    `;

    const planDetails = JSON.stringify(recommendedPlan, null, 2);
    const otherPlansDetails = JSON.stringify(otherAvailablePlans, null, 2);

    const { explanation } = await explainPlanRecommendation({
      userDetails,
      planDetails: planDetails,
      otherAvailablePlans: otherPlansDetails,
    });

    return {
      recommendation: {
        plan: recommendedPlan,
        explanation,
      },
    };
  } catch (e) {
    console.error(e);
    return { error: "Failed to generate recommendation. Please try again." };
  }
}
