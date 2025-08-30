import type { ProductCategory } from './types';
import { ChartConfig } from "@/components/ui/chart";

const productCategories: ProductCategory[] = [
  {
    id: "medigap",
    name: "Medigap (Supplement)",
    description: "Fill the gaps in Original Medicare",
    plans: [
      {
        id: "plan-f",
        name: "Plan F",
        description: "Most comprehensive Medigap coverage",
        premiumRange: "$150-400/mo",
        monthlyPremium: 275,
        deductible: "None after Original Medicare",
        features: ["Part A deductible", "Part B deductible", "Coinsurance", "Foreign travel"],
        pros: ["First-dollar coverage", "No deductibles or copays", "Foreign travel emergency"],
        cons: ["Higher premiums", "Not available to new Medicare beneficiaries"],
        rating: 4.6,
        reviewCount: 8420,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Maximum coverage", "Frequent healthcare users", "International travelers"]
      },
      {
        id: "plan-g",
        name: "Plan G",
        description: "Comprehensive coverage, popular choice",
        isPopular: true,
        isBestValue: true,
        premiumRange: "$120-350/mo",
        monthlyPremium: 235,
        deductible: "Part B deductible only",
        features: ["Part A deductible", "Coinsurance", "Foreign travel", "Excess charges"],
        pros: ["Excellent coverage", "Popular choice", "Covers excess charges", "Lower premium than Plan F"],
        cons: ["Must pay Part B deductible"],
        rating: 4.7,
        reviewCount: 15680,
        coverageLevel: 'Premium',
        suitableFor: ["Comprehensive coverage", "Cost-conscious buyers", "Most popular choice"]
      },
      {
        id: "plan-n",
        name: "Plan N",
        description: "Good coverage with lower premiums",
        premiumRange: "$80-250/mo",
        monthlyPremium: 165,
        deductible: "Part B deductible",
        features: ["Part A deductible", "Coinsurance", "Foreign travel", "Small copays"],
        pros: ["Lower premiums", "Good coverage", "Foreign travel emergency"],
        cons: ["Copays for doctor visits", "Doesn't cover excess charges"],
        rating: 4.4,
        reviewCount: 9240,
        coverageLevel: 'Standard',
        suitableFor: ["Budget-conscious", "Infrequent healthcare users", "Balanced coverage"]
      }
    ]
  },
  {
    id: "advantage",
    name: "Medicare Advantage",
    description: "All-in-one Medicare alternative",
    plans: [
      {
        id: "hmo",
        name: "HMO Plans",
        description: "Network-based care with lower costs",
        premiumRange: "$0-100/mo",
        monthlyPremium: 50,
        deductible: "Varies by plan",
        features: ["Network providers", "Referrals required", "Lower costs", "Often includes extras"],
        pros: ["Often $0 premium", "Extra benefits included", "Prescription coverage", "Lower out-of-pocket costs"],
        cons: ["Network restrictions", "Referrals required", "Provider changes"],
        rating: 4.1,
        reviewCount: 22100,
        coverageLevel: 'Standard',
        suitableFor: ["Network-based care", "Cost-conscious", "Extra benefits"]
      },
      {
        id: "ppo",
        name: "PPO Plans",
        description: "More flexibility with higher costs",
        premiumRange: "$20-150/mo",
        monthlyPremium: 85,
        deductible: "Varies by plan",
        features: ["Out-of-network coverage", "No referrals", "Higher costs", "More flexibility"],
        pros: ["Provider flexibility", "No referrals needed", "Out-of-network coverage"],
        cons: ["Higher premiums", "Higher out-of-pocket costs"],
        rating: 4.0,
        reviewCount: 18750,
        coverageLevel: 'Premium',
        suitableFor: ["Provider flexibility", "Specialist access", "Out-of-network needs"]
      },
      {
        id: "special-needs",
        name: "Special Needs Plans",
        description: "Specialized care for specific conditions",
        premiumRange: "$0-50/mo",
        monthlyPremium: 25,
        deductible: "Low or none",
        features: ["Condition-specific", "Specialized providers", "Tailored benefits", "Care coordination"],
        pros: ["Specialized care", "Coordinated benefits", "Often low cost"],
        cons: ["Limited to specific conditions", "Restricted eligibility"],
        rating: 4.3,
        reviewCount: 5680,
        coverageLevel: 'Standard',
        suitableFor: ["Chronic conditions", "Dual eligible", "Institutional care"]
      }
    ]
  },
  {
    id: "prescription",
    name: "Drug Plan",
    description: "Prescription drug coverage",
    plans: [
      {
        id: "basic",
        name: "Basic Coverage",
        description: "Standard prescription drug coverage",
        premiumRange: "$7-80/mo",
        monthlyPremium: 43.50,
        deductible: "$505 annually",
        features: ["Standard formulary", "Generic drugs", "Brand drugs", "Mail order"],
        pros: ["Lower premiums", "Basic coverage", "Generic focus"],
        cons: ["Higher deductible", "Limited formulary", "Coverage gap"],
        rating: 3.8,
        reviewCount: 12200,
        coverageLevel: 'Basic',
        suitableFor: ["Basic drug needs", "Generic medications", "Cost-conscious"]
      },
      {
        id: "enhanced",
        name: "Enhanced Coverage",
        description: "Additional benefits and lower costs",
        premiumRange: "$15-120/mo",
        monthlyPremium: 67.50,
        deductible: "$200 annually",
        features: ["Expanded formulary", "Lower deductibles", "Gap coverage", "Preferred brands"],
        pros: ["Lower deductible", "Gap coverage", "Wider formulary", "Brand name coverage"],
        cons: ["Higher premiums"],
        rating: 4.2,
        reviewCount: 8950,
        coverageLevel: 'Premium',
        suitableFor: ["Multiple medications", "Brand name drugs", "Gap coverage needs"]
      }
    ]
  },
  {
    id: "dental",
    name: "Dental",
    description: "Comprehensive dental coverage",
    plans: [
      {
        id: "basic-dental",
        name: "Basic Dental",
        description: "Essential dental coverage",
        premiumRange: "$25-45/mo",
        monthlyPremium: 35.00,
        deductible: "$50 annually",
        features: ["Preventive care", "Basic procedures", "Cleanings", "X-rays"],
        pros: ["Lower premium", "Preventive focus", "No waiting periods", "Network coverage"],
        cons: ["Limited major procedures", "Annual maximums", "Basic coverage only"],
        rating: 3.9,
        reviewCount: 3200,
        coverageLevel: 'Basic',
        suitableFor: ["Basic dental needs", "Preventive care", "Budget-conscious"]
      },
      {
        id: "comprehensive-dental",
        name: "Comprehensive Dental",
        description: "Full dental coverage including major procedures",
        premiumRange: "$45-75/mo",
        monthlyPremium: 60.00,
        deductible: "$50 annually",
        features: ["Preventive care", "Basic procedures", "Major procedures", "Orthodontics"],
        pros: ["Comprehensive coverage", "Major procedures included", "Orthodontics coverage", "Nationwide network"],
        cons: ["Higher premium", "Annual maximums", "Orthodontics limited"],
        rating: 4.3,
        reviewCount: 5430,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Complete dental care", "Major procedures", "Family coverage"]
      }
    ]
  },
  {
    id: "hospital-indemnity",
    name: "Hospital Indemnity",
    description: "Cash benefits for hospital stays",
    plans: [
      {
        id: "basic-hospital",
        name: "Basic Hospital Indemnity",
        description: "Essential hospital cash benefits",
        premiumRange: "$15-30/mo",
        monthlyPremium: 22.50,
        deductible: "None",
        features: ["Daily cash benefits", "Hospital admission", "Surgery benefits", "Emergency room"],
        pros: ["Low premium", "Cash payments", "No deductible", "Quick claims"],
        cons: ["Lower benefit amounts", "Limited coverage", "Hospital only"],
        rating: 4.0,
        reviewCount: 2100,
        coverageLevel: 'Basic',
        suitableFor: ["Basic hospital protection", "Budget coverage", "Gap insurance"]
      },
      {
        id: "enhanced-hospital",
        name: "Enhanced Hospital Indemnity",
        description: "Comprehensive hospital cash benefits",
        premiumRange: "$30-50/mo",
        monthlyPremium: 40.00,
        deductible: "None",
        features: ["Higher daily benefits", "ICU benefits", "Surgery benefits", "Emergency room coverage"],
        pros: ["Higher benefit amounts", "ICU coverage", "Flexible use", "Covers gaps"],
        cons: ["Higher premium", "Hospital-specific", "Benefit caps"],
        rating: 4.3,
        reviewCount: 3210,
        coverageLevel: 'Premium',
        suitableFor: ["Hospital coverage gaps", "Extra income protection", "Peace of mind"]
      }
    ]
  },
  {
    id: "cancer",
    name: "Cancer Insurance",
    description: "Specialized cancer insurance coverage",
    plans: [
      {
        id: "basic-cancer",
        name: "Basic Cancer Coverage",
        description: "Essential cancer insurance protection",
        premiumRange: "$20-35/mo",
        monthlyPremium: 27.50,
        deductible: "None",
        features: ["Diagnosis benefit", "Treatment benefits", "Chemotherapy", "Radiation"],
        pros: ["Lower premium", "Lump sum benefits", "Treatment flexibility", "No deductible"],
        cons: ["Lower benefit amounts", "Cancer-specific only", "Waiting periods"],
        rating: 4.1,
        reviewCount: 1800,
        coverageLevel: 'Basic',
        suitableFor: ["Basic cancer protection", "Family history", "Budget-conscious"]
      },
      {
        id: "comprehensive-cancer",
        name: "Comprehensive Cancer Coverage",
        description: "Complete cancer insurance with enhanced benefits",
        premiumRange: "$35-60/mo",
        monthlyPremium: 47.50,
        deductible: "None",
        features: ["Higher diagnosis benefit", "Treatment benefits", "Transportation", "Lodging assistance"],
        pros: ["Higher benefits", "Transportation coverage", "Lodging assistance", "No network restrictions"],
        cons: ["Higher premium", "Cancer-specific only", "Pre-existing exclusions"],
        rating: 4.4,
        reviewCount: 2840,
        coverageLevel: 'Premium',
        suitableFor: ["Comprehensive cancer protection", "Family history", "Peace of mind"]
      }
    ]
  },
  {
    id: "final-expense",
    name: "Final Expense Life",
    description: "Life insurance for final expenses",
    plans: [
      {
        id: "basic-final-expense",
        name: "Basic Final Expense",
        description: "Essential final expense life insurance",
        premiumRange: "$30-75/mo",
        monthlyPremium: 52.50,
        deductible: "None",
        features: ["Guaranteed acceptance", "No medical exam", "Fixed premiums", "$10,000 coverage"],
        pros: ["Easy qualification", "Fixed rates", "Immediate coverage", "Affordable"],
        cons: ["Lower coverage amount", "Two-year waiting period", "Higher cost per dollar"],
        rating: 4.0,
        reviewCount: 2400,
        coverageLevel: 'Basic',
        suitableFor: ["Basic final expenses", "Easy qualification", "Burial costs"]
      },
      {
        id: "enhanced-final-expense",
        name: "Enhanced Final Expense",
        description: "Comprehensive final expense life insurance",
        premiumRange: "$75-150/mo",
        monthlyPremium: 112.50,
        deductible: "None",
        features: ["Guaranteed acceptance", "No medical exam", "Fixed premiums", "$25,000 coverage"],
        pros: ["Higher coverage", "Easy qualification", "Fixed rates", "Complete protection"],
        cons: ["Higher premium", "Coverage limits", "Two-year waiting period"],
        rating: 4.2,
        reviewCount: 4120,
        coverageLevel: 'Standard',
        suitableFor: ["Complete final expense planning", "Higher coverage needs", "Family protection"]
      }
    ]
  }
];

const chartConfig = {
  plans: {
    label: "Available Plans",
  },
  "Medicare Advantage": {
    label: "Medicare Advantage", 
    color: "hsl(var(--chart-2))",
  },
  Medigap: {
    label: "Medigap",
    color: "hsl(var(--chart-3))",
  },
  "Part D": {
    label: "Drug Plan",
    color: "hsl(var(--chart-4))",
  },
  "Dental": {
    label: "Dental",
    color: "hsl(var(--chart-5))",
  },
  "Hospital Indemnity": {
    label: "Hospital Indemnity",
    color: "hsl(var(--chart-1))",
  },
  "Cancer Insurance": {
    label: "Cancer Insurance",
    color: "hsl(var(--chart-2))",
  },
  "Final Expense Life": {
    label: "Final Expense Life",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const popularityData = [
  { name: "Plan G", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Medicare Advantage", value: 28, fill: "hsl(var(--chart-2))" },
  { name: "Plan F", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Plan N", value: 17, fill: "hsl(var(--chart-4))" },
];

export { productCategories, chartConfig, popularityData };
