
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
      'A clear, easy-to-understand explanation of the topic, suitable for someone new to Medicare. Use headings and bullet points for clarity.'
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
  prompt: `You are a friendly and knowledgeable Medicare expert. Your goal is to explain complex Medicare topics in a simple and clear way for beneficiaries.

  Please provide a detailed explanation for the following topic: {{{topic}}}

  Structure your explanation with clear headings (using markdown '## '), bullet points (using markdown '* '), and simple language. Avoid jargon where possible, or explain it if you must use it.

  If the topic is a comparison (like "PPO vs HMO"), present the information in a way that is easy to compare, perhaps using pros and cons for each or a comparative table-like structure using markdown. The response must be a single string.`,
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
