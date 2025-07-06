
'use server';
/**
 * @fileOverview An AI agent for generating personalized retirement plans.
 *
 * - generateRetirementPlan - A function that creates a retirement plan based on user's financial data.
 * - GenerateRetirementPlanInput - The input type for the generateRetirementPlan function.
 * - GenerateRetirementPlanOutput - The return type for the generateRetirementPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// This schema should match the form in financial-plan/page.tsx
const GenerateRetirementPlanInputSchema = z.object({
  greatestConcern: z.string(),
  taxFilingStatus: z.enum(["single", "married_jointly", "married_separately", "hoh", "widow"]),
  hasSpouse: z.enum(["yes", "no"]),
  healthInsurancePremium: z.coerce.number(),
  healthInsuranceMaxOutOfPocket: z.coerce.number(),
  hasLifeInsurance: z.enum(["yes", "no"]),
  hasLTC: z.enum(["yes", "no"]),
  riskTolerance: z.enum(["low", "medium", "high"]),
  hasEmergencyFund: z.enum(["yes", "no"]),
  totalMonthlyIncome: z.coerce.number(),
  totalMonthlyExpenses: z.coerce.number(),
  wantsMarketProtection: z.enum(["yes", "no"]),
  concernedAboutOutOfMoney: z.enum(["yes", "no"]),
  hasEstatePlan: z.enum(["yes", "no"]),
  otherGoals: z.string().optional(),
});
export type GenerateRetirementPlanInput = z.infer<typeof GenerateRetirementPlanInputSchema>;

const GenerateRetirementPlanOutputSchema = z.object({
  plan: z.string().describe(
    "A brief, generalized retirement plan summary in markdown format. It should be a few paragraphs long and address the user's greatest concern. The summary must end with a clear 'Important Disclaimer' section."
  ),
});
export type GenerateRetirementPlanOutput = z.infer<typeof GenerateRetirementPlanOutputSchema>;

export async function generateRetirementPlan(input: GenerateRetirementPlanInput): Promise<GenerateRetirementPlanOutput> {
  return generateRetirementPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRetirementPlanPrompt',
  input: {schema: GenerateRetirementPlanInputSchema},
  output: {schema: GenerateRetirementPlanOutputSchema},
  prompt: `You are a fiduciary financial advisor creating a high-level, brief retirement plan summary for a client. Your tone should be encouraging, professional, and clear.

  Based on the following client data, generate a brief, generalized summary of recommendations.
  - Greatest Concern: {{{greatestConcern}}}
  - Risk Tolerance: {{{riskTolerance}}}
  - Monthly Income vs Expenses: {{{totalMonthlyIncome}}} vs {{{totalMonthlyExpenses}}}
  - Key Goals: Wants market protection ({{{wantsMarketProtection}}}), concerned about running out of money ({{{concernedAboutOutOfMoney}}}), has estate plan ({{{hasEstatePlan}}}).
  
  The summary should be written in markdown format and be no more than 3-4 short paragraphs.
  
  Start with a positive, high-level summary that addresses their stated 'greatestConcern'.
  
  Then, provide a few general recommendations covering areas like insurance, investments, or estate planning, depending on what seems most relevant from their data. Do not use headings.
  
  Finally, you **must** conclude with the following disclaimer, formatted exactly like this on a new line:
  **Important Disclaimer:** This is an AI-generated summary and a helpful starting point, but it is not a substitute for professional financial advice. We strongly recommend you meet with a qualified fiduciary advisor to review the plan, discuss your situation in detail, and implement any strategies.
  `,
});

const generateRetirementPlanFlow = ai.defineFlow(
  {
    name: 'generateRetirementPlanFlow',
    inputSchema: GenerateRetirementPlanInputSchema,
    outputSchema: GenerateRetirementPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
