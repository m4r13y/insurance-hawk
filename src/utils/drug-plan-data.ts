import { DrugPlanQuote } from '@/types/drug-plan';

// Format currency helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get monthly premium
export const getMonthlyPremium = (plan: DrugPlanQuote): string => {
  return formatCurrency(plan.month_rate / 100);
};

// Get annual drug deductible
export const getAnnualDeductible = (plan: DrugPlanQuote): string => {
  return formatCurrency(plan.annual_drug_deductible / 100);
};

// Check if plan has gap coverage
export const hasGapCoverage = (plan: DrugPlanQuote): boolean => {
  return plan.additional_coverage_offered_in_the_gap || plan.additional_drug_coverage_offered_in_the_gap;
};

// Get gap coverage description
export const getGapCoverageDescription = (plan: DrugPlanQuote): string => {
  if (plan.additional_coverage_offered_in_the_gap) {
    return plan.additional_coverage_type || 'Generic and Brand coverage in gap';
  }
  if (plan.additional_drug_coverage_offered_in_the_gap) {
    return 'Generic coverage in gap';
  }
  return 'No gap coverage';
};

// Check if plan qualifies for low-income subsidy
export const hasLowIncomeSubsidy = (plan: DrugPlanQuote): boolean => {
  return plan.zero_premium_with_full_low_income_subsidy;
};

// Get subsidy premium for income level
export const getSubsidyPremium = (plan: DrugPlanQuote, incomeLevel: number): string => {
  const subsidy = plan.part_d_subsides[incomeLevel.toString()];
  return subsidy ? formatCurrency(subsidy / 100) : 'Not available';
};

// Get plan tier information from benefits
export const getDrugTierInfo = (plan: DrugPlanQuote): string => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  if (drugBenefit?.full_description) {
    // Count how many tiers are mentioned in the description
    const tierMatches = drugBenefit.full_description.match(/Tier \d+/g);
    const uniqueTiers = [...new Set(tierMatches)];
    return `${uniqueTiers.length} tier formulary`;
  }
  return 'Standard formulary';
};

// Check if plan covers specialty drugs
export const hasSpecialtyDrugCoverage = (plan: DrugPlanQuote): boolean => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  return drugBenefit?.full_description?.includes('Tier 5') || 
         drugBenefit?.full_description?.includes('Specialty') || false;
};

// Get preferred pharmacy information
export const hasPreferredPharmacy = (plan: DrugPlanQuote): boolean => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  return drugBenefit?.full_description?.includes('Preferred') || false;
};

// Get mail order availability
export const hasMailOrder = (plan: DrugPlanQuote): boolean => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  return drugBenefit?.full_description?.includes('Mail Order') || false;
};

// Extract tier 1 copay (preferred generic)
export const getTier1Copay = (plan: DrugPlanQuote): string => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  if (drugBenefit?.full_description) {
    // Look for Tier 1 preferred retail 30-day supply
    const tier1Match = drugBenefit.full_description.match(/Tier 1[\s\S]*?Preferred Retail:[\s\S]*?\$(\d+)/);
    if (tier1Match) {
      return `$${tier1Match[1]}`;
    }
  }
  return 'Contact plan';
};

// Extract tier 3 copay (preferred brand)
export const getTier3Copay = (plan: DrugPlanQuote): string => {
  const drugBenefit = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs');
  if (drugBenefit?.full_description) {
    // Look for Tier 3 preferred retail 30-day supply
    const tier3Match = drugBenefit.full_description.match(/Tier 3[\s\S]*?Preferred Retail:[\s\S]*?\$(\d+)/);
    if (tier3Match) {
      return `$${tier3Match[1]}`;
    }
  }
  return 'Contact plan';
};

// Get carrier website links
export const getCarrierWebsites = (plan: DrugPlanQuote) => {
  return {
    formulary: plan.contextual_data?.carrier_resources?.['Formulary Website'] || null,
    pharmacy: plan.contextual_data?.carrier_resources?.['Pharmacy Website'] || null,
    provider: plan.contextual_data?.carrier_resources?.['Physician Lookup'] || null,
  };
};

// Format star rating for display
export const getStarRatingDisplay = (rating: number): string => {
  return `${rating} ${rating === 1 ? 'star' : 'stars'}`;
};

// Extract copay amount from benefit description
export const extractCopayAmount = (description: string): string | null => {
  // Look for patterns like $10, $25, etc.
  const copayMatch = description.match(/\$(\d+(?:\.\d{2})?)/);
  if (copayMatch) {
    return `$${copayMatch[1]}`;
  }
  
  // Look for percentage patterns like 25%, 50%
  const percentMatch = description.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return `${percentMatch[1]}%`;
  }
  
  return null;
};
