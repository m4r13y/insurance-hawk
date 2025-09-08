import React from 'react';
import { CheckIcon as Check, Cross1Icon as X, ExclamationTriangleIcon as Warning } from "@radix-ui/react-icons";
import { MedicareAdvantageQuote, BenefitStatusDisplay } from '@/types/medicare-advantage';

export const getBenefitStatusDisplay = (plan: MedicareAdvantageQuote, benefitType: string): BenefitStatusDisplay => {
  const benefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
  );
  
  if (!benefit) {
    return {
      status: 'not-found',
      icon: <X className="w-5 h-5 text-gray-600" />,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600'
    };
  }
  
  // Get all text content and clean HTML
  const fullDesc = (benefit.full_description || '').replace(/<[^>]*>/g, ' ').toLowerCase();
  const inNetwork = (benefit.summary_description?.in_network || '').toLowerCase();
  const outNetwork = (benefit.summary_description?.out_network || '').toLowerCase();
  const allText = `${fullDesc} ${inNetwork} ${outNetwork}`.replace(/\s+/g, ' ').trim();
  
  console.log(`Analyzing ${benefitType}:`, { fullDesc: fullDesc.substring(0, 100), allText: allText.substring(0, 100) });
  
  // Priority check: If benefit has in-network or out-of-network coverage data, it has coverage
  const hasNetworkCoverage = (benefit.summary_description?.in_network && benefit.summary_description.in_network.trim().length > 0) ||
                             (benefit.summary_description?.out_network && benefit.summary_description.out_network.trim().length > 0);
  
  if (hasNetworkCoverage) {
    console.log(`${benefitType}: Has network coverage data - marking as covered`);
    return {
      status: 'covered',
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  }
  
  // Check for explicit "not covered" indicators - be more specific
  const strongNegativeIndicators = [
    'not covered', 'no coverage', 'not available', 'excluded', 'not included', 
    'no benefit', ': not covered', 'benefit: not covered', 'not supported'
  ];
  
  const hasStrongNegative = strongNegativeIndicators.some(indicator => allText.includes(indicator));
  
  // Check for vague/unclear indicators that should be yellow
  const unclearIndicators = [
    'some coverage', 'contact plan', 'see plan', 'varies', 'may be covered'
  ];
  
  const hasUnclearIndicators = unclearIndicators.some(indicator => allText.includes(indicator));
  
  // Check for positive coverage indicators (specific dollar amounts, copays, etc.)
  const positiveIndicators = [
    '$0', '$', 'copay', 'coinsurance', 'per visit', 'per day', 
    'per year', 'included', 'available', 'deductible', 'maximum', 'limit', 'allowance',
    'in-network', 'out-of-network', 'days 1', 'tier 1', 'fitting evaluation', 'hearing exam',
    'contact lenses', 'eyeglasses frames', 'routine eye exam', 'foot exams'
  ];
  
  const hasPositiveIndicators = positiveIndicators.some(indicator => 
    allText.includes(indicator) && !allText.includes(`${indicator} not covered`) && !allText.includes(`not covered ${indicator}`)
  );
  
  // Enhanced check for concrete coverage values (dollar amounts, percentages, specific copays)
  const hasConcreteCoverage = /\$\d+[-\d]*|\d+%|copay|coinsurance|deductible|\$\d+\-\$\d+/.test(allText);
  
  // Special logic for pharmaceutical benefits - if we have dollar amounts and tiers, it's covered
  const isPharmaceutical = benefitType.toLowerCase().includes('prescription') || benefitType.toLowerCase().includes('drug');
  const hasDollarAmounts = /\$\d+/.test(allText);
  const hasTiers = /tier \d+/i.test(allText);
  
  if (isPharmaceutical && hasDollarAmounts && hasTiers) {
    console.log(`${benefitType}: Pharmaceutical with dollar amounts and tiers detected - marking as covered`);
    return {
      status: 'covered',
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  }
  
  console.log(`${benefitType}: hasStrongNegative=${hasStrongNegative}, hasUnclearIndicators=${hasUnclearIndicators}, hasPositiveIndicators=${hasPositiveIndicators}, hasConcreteCoverage=${hasConcreteCoverage}`);
  
  // Determine status - prioritize concrete coverage values over unclear language
  if (hasConcreteCoverage && !hasStrongNegative) {
    // Has concrete coverage values (dollar amounts, percentages) - mark as covered
    return {
      status: 'covered',
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  } else if (hasPositiveIndicators && !hasStrongNegative) {
    // Clear positive coverage
    return {
      status: 'covered',
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  } else if ((hasPositiveIndicators || hasConcreteCoverage) && hasStrongNegative) {
    // Mixed coverage - has some positive but also some negatives
    return {
      status: 'unclear',
      icon: <Warning className="w-5 h-5 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    };
  } else if (hasStrongNegative) {
    // Only negatives, no positives
    return {
      status: 'not-covered',
      icon: <X className="w-5 h-5 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    };
  } else if (hasUnclearIndicators) {
    return {
      status: 'unclear',
      icon: <Warning className="w-5 h-5 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    };
  } else if (hasPositiveIndicators) {
    return {
      status: 'covered',
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  } else {
    return {
      status: 'unclear',
      icon: <Warning className="w-5 h-5 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    };
  }
};
