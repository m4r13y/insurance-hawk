
'use server';
/**
 * @fileOverview An AI agent for explaining Medicare topics.
 *
 * - explainMedicareTopic - A function that explains a given Medicare topic.
 * - ExplainMedicareTopicInput - The input type for the explainMedicareTopic function.
 * - ExplainMedicareTopicOutput - The return type for the explainMedicareTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMedicareTopicInputSchema = z.object({
  topic: z
    .string()
    .describe('The Medicare topic to be explained. e.g., "PPO vs HMO", "Plan G vs Plan N", "Original Medicare vs Medicare Advantage"'),
});
export type ExplainMedicareTopicInput = z.infer<typeof ExplainMedicareTopicInputSchema>;

const ExplainMedicareTopicOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      "A factual explanation of the topic, or a message indicating the question is out of scope. For valid explanations, use headings and bullet points for clarity and end with a disclaimer."
    ),
});
export type ExplainMedicareTopicOutput = z.infer<typeof ExplainMedicareTopicOutputSchema>;

export async function explainMedicareTopic(input: ExplainMedicareTopicInput): Promise<ExplainMedicareTopicOutput> {
  return explainMedicareTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMedicareTopicPrompt',
  input: {schema: ExplainMedicareTopicInputSchema},
  output: {schema: ExplainMedicareTopicOutputSchema},
  prompt: `You are an AI assistant for an insurance portal. Your primary function is to provide factual information about Medicare, general health insurance, and supplemental insurance plans.

Analyze the user's question: {{{topic}}}

First, determine if the user's question falls within your designated scope.
Your scope is strictly limited to factual questions about:
- General Medicare concepts (e.g., Parts A, B, C, D, eligibility, enrollment periods).
- General health insurance concepts (e.g., definitions of deductible, premium, copay, coinsurance, PPO, HMO).
- General supplemental insurance concepts (e.g., what is Medigap, dental, vision insurance).

Your scope EXCLUDES:
- Giving personal opinions or advice (e.g., "what is the best plan?", "should I buy...?").
- Answering questions about topics other than insurance (e.g., politics, history, personal questions).
- Providing specific quotes or costs.

**Decision and Response:**

1.  **If the question is OUTSIDE your scope:** Your entire response for the 'explanation' field must be ONLY the following text: "I can only answer factual questions about Medicare, health insurance, and supplemental plans. For personalized advice or questions about other topics, please speak with a licensed agent." Do NOT add the disclaimer in this case.

2.  **If the question is INSIDE your scope:** Provide a clear, factual, and unbiased explanation.
    - Structure your explanation with clear headings (using markdown '## ') and bullet points (using markdown '* ').
    - Avoid jargon where possible, or explain it if you must use it.
    - After your explanation, you MUST conclude with the following disclaimer, formatted exactly like this on a new line:
    **Disclaimer:** I am an AI assistant. The information provided is for educational purposes only and is not a substitute for professional advice from a licensed insurance agent. Please consult with a qualified professional to discuss your personal situation and ensure you make the best decision for your needs.`,
});

const explainMedicareTopicFlow = ai.defineFlow(
  {
    name: 'explainMedicareTopicFlow',
    inputSchema: ExplainMedicareTopicInputSchema,
    outputSchema: ExplainMedicareTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
