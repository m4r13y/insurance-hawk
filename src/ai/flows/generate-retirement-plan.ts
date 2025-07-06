
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
    "A comprehensive, personalized retirement plan document written in markdown. It should address the user's greatest concerns and provide actionable recommendations across Insurance, Investments, Tax Planning, and Estate Planning. Start with a positive summary. Use '##' for main headings and '*' for bullet points. It must end with a clear 'Important Disclaimer' section."
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
  prompt: `You are a fiduciary financial advisor creating a personalized retirement plan for a client. Your tone should be encouraging, professional, and clear.

  Client's Data:
  - Greatest Concern: {{{greatestConcern}}}
  - Tax Filing Status: {{{taxFilingStatus}}}
  - Has Spouse: {{{hasSpouse}}}
  - Health Insurance Premium: {{{healthInsurancePremium}}}
  - Health Insurance Max Out-of-Pocket: {{{healthInsuranceMaxOutOfPocket}}}
  - Has Life Insurance: {{{hasLifeInsurance}}}
  - Has Long-Term Care Insurance: {{{hasLTC}}}
  - Risk Tolerance: {{{riskTolerance}}}
  - Has Emergency Fund: {{{hasEmergencyFund}}}
  - Total Monthly Income: {{{totalMonthlyIncome}}}
  - Total Monthly Expenses: {{{totalMonthlyExpenses}}}
  - Wants Market Protection: {{{wantsMarketProtection}}}
  - Concerned About Running Out of Money: {{{concernedAboutOutOfMoney}}}
  - Has Estate Plan: {{{hasEstatePlan}}}
  - Other Goals: {{{otherGoals}}}

  Based on this data, generate a personalized retirement plan document in markdown format. The document must be a single string.
  Use markdown. For each main '##' heading, just write the title.
  
  Structure the plan as follows:

  ## Retirement Plan Summary
  Start with a positive, high-level summary of their financial situation and how this plan will help them achieve their goals. Directly address their stated 'greatestConcern'.

  ## Insurance Review
  - Analyze their current insurance situation (Health, Life, LTC).
  - Recommend specific actions. For example, if they have no LTC insurance but high assets, suggest looking into it. If their health insurance out-of-pocket maximum is high compared to their income, mention this as a potential risk.
  - If 'Protecting my health and insuring my assets' is their concern, make this section very detailed.

  ## Investment & Income Strategy
  - Based on their 'riskTolerance', income, and expenses, provide a general investment strategy.
  - If they are 'concernedAboutOutOfMoney', suggest strategies to ensure a stable income stream in retirement.
  - If they want 'wantsMarketProtection', suggest products or strategies that offer downside protection.
  - If they have no 'hasEmergencyFund', strongly recommend establishing one.
  
  ## Tax Planning
  - Provide 1-2 actionable tax-saving strategies relevant to a retiree, like reviewing IRA distributions or considering Roth conversions if appropriate.

  ## Estate Planning
  - Based on whether they have an estate plan ('hasEstatePlan'), recommend next steps. If 'no', suggest consulting with an attorney to create a will/trust. If 'yes', recommend reviewing it periodically.

  ## Next Steps
  - Conclude with a clear list of 2-3 immediate action items for the client.
  - Encourage them to contact us to implement the plan.

  ## Important Disclaimer
  Conclude with a clear disclaimer. State that this plan was generated by an AI, and while it's a helpful starting point, it is not a substitute for professional financial advice. Strongly recommend that the client meet with a qualified fiduciary advisor to review the plan, discuss their situation in detail, and implement any strategies. Mention that AI can make mistakes and that personalized advice is crucial for financial success.
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
