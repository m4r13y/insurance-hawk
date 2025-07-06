
"use server";

import { explainMedicareTopic } from "@/ai/flows";

export async function getExplanation(topic: string) {
  try {
    const { explanation } = await explainMedicareTopic({ topic });
    return { explanation };
  } catch (e) {
    console.error(e);
    return { error: "Could not load explanation. Please try again later." };
  }
}
