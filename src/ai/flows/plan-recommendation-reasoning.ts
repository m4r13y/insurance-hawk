// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent for explaining plan recommendations.
 *
 * - explainPlanRecommendation - A function that explains why a specific plan is recommended.
 * - ExplainPlanRecommendationInput - The input type for the explainPlanRecommendation function.
 * - ExplainPlanRecommendationOutput - The return type for the explainPlanRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainPlanRecommendationInputSchema = z.object({
  userDetails: z
    .string()
    .describe('Details about the user, including their age, health conditions, and preferences.'),
  planDetails: z
    .string()
    .describe('Details about the specific Medicare plan being recommended.'),
  otherAvailablePlans: z
    .string()
    .describe('Details about other available plans the user might be eligible for.'),
});
export type ExplainPlanRecommendationInput = z.infer<
  typeof ExplainPlanRecommendationInputSchema
>;

const ExplainPlanRecommendationOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A clear and concise explanation of why the plan is recommended for the user, comparing against other available plans.'
    ),
});
export type ExplainPlanRecommendationOutput = z.infer<
  typeof ExplainPlanRecommendationOutputSchema
>;

export async function explainPlanRecommendation(
  input: ExplainPlanRecommendationInput
): Promise<ExplainPlanRecommendationOutput> {
  return explainPlanRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainPlanRecommendationPrompt',
  input: {schema: ExplainPlanRecommendationInputSchema},
  output: {schema: ExplainPlanRecommendationOutputSchema},
  prompt: `You are an expert Medicare advisor explaining plan recommendations to users.

  Based on the user's details and the plan's features, explain why this plan is a good recommendation for the user. Compare and contrast with other available plans to highlight the benefits.

  User Details: {{{userDetails}}}
  Plan Details: {{{planDetails}}}
  Other Available Plans: {{{otherAvailablePlans}}}

  Provide a clear and concise explanation.
  `,
});

const explainPlanRecommendationFlow = ai.defineFlow(
  {
    name: 'explainPlanRecommendationFlow',
    inputSchema: ExplainPlanRecommendationInputSchema,
    outputSchema: ExplainPlanRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
