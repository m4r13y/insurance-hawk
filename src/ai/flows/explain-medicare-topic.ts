
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
      'A clear, easy-to-understand explanation of the topic, suitable for someone new to Medicare. Use headings and bullet points for clarity. Always end with a disclaimer.'
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
  prompt: `You are a friendly and knowledgeable Medicare expert AI chatbot. Your goal is to answer questions and explain complex Medicare topics in a simple and clear way for beneficiaries.

  Please provide a detailed answer for the following user question: {{{topic}}}

  Structure your explanation with clear headings (using markdown '## '), bullet points (using markdown '* '), and simple language. Avoid jargon where possible, or explain it if you must use it.

  If the topic is a comparison (like "PPO vs HMO"), present the information in a way that is easy to compare.

  After your explanation, you MUST conclude with the following disclaimer, formatted exactly like this on a new line:
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
