import { MedicareAdvantageQuote } from '@/types/medicare-advantage';

// Helper functions for data extraction (non-JSX utilities)
export const getMedicalDeductible = (plan: MedicareAdvantageQuote): string => {
  const deductibleBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes('health plan deductible') ||
    b.benefit_type.toLowerCase().includes('medical deductible')
  );
  
  if (deductibleBenefit) {
    if (deductibleBenefit.summary_description?.in_network) {
      return deductibleBenefit.summary_description.in_network;
    }
    // Clean HTML tags and extract value
    const cleanText = deductibleBenefit.full_description.replace(/<[^>]*>/g, '').trim();
    return cleanText || '$0';
  }
  return 'Contact Plan';
};

export const getDrugDeductible = (plan: MedicareAdvantageQuote): string => {
  // Use the direct API field if available (convert from cents to dollars)
  if (plan.annual_drug_deductible !== undefined) {
    const deductibleInDollars = plan.annual_drug_deductible / 100;
    return deductibleInDollars === 0 ? '$0' : `$${deductibleInDollars.toFixed(2)}`;
  }
  return 'Contact Plan';
};

export const hasDrugCoverage = (plan: MedicareAdvantageQuote): boolean => {
  // Find prescription/drug benefits
  const drugBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes('prescription') || 
    b.benefit_type.toLowerCase().includes('drug')
  );
  
  if (!drugBenefit) {
    return false;
  }
  
  // Check if the benefit contains pharmaceutical data with tiers
  const benefitText = drugBenefit.full_description;
  const isPharmaData = benefitText.includes('Tier ') && benefitText.includes('<table>');
  
  if (!isPharmaData) {
    return false;
  }
  
  // Parse the pharmaceutical data to check if all values are "Not Covered" or "Not Supported"
  const tierPattern = /<p><b>Tier \d+ \([^)]+\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
  const tableData: any[] = [];
  let tierMatch;
  
  while ((tierMatch = tierPattern.exec(benefitText)) !== null) {
    const tierHtml = tierMatch[0];
    const rowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
    let rowMatch;
    
    while ((rowMatch = rowPattern.exec(tierHtml)) !== null) {
      tableData.push({
        thirtyDay: rowMatch[2] || 'N/A',
        sixtyDay: rowMatch[3] || 'N/A', 
        ninetyDay: rowMatch[4] || 'N/A'
      });
    }
  }
  
  if (tableData.length === 0) {
    return false;
  }
  
  // Check if all values are "Not Covered" or "Not Supported"
  const allNotCovered = tableData.every(row => 
    (row.thirtyDay === 'Not Supported' || row.thirtyDay === 'Not Covered') &&
    (row.sixtyDay === 'Not Supported' || row.sixtyDay === 'Not Covered') &&
    (row.ninetyDay === 'Not Supported' || row.ninetyDay === 'Not Covered')
  );
  
  return !allNotCovered;
};

export const getPrimaryCareData = (plan: MedicareAdvantageQuote): string => {
  const doctorVisitBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes("doctor's office visits") ||
    b.benefit_type.toLowerCase().includes("primary care")
  );
  
  if (doctorVisitBenefit?.summary_description?.in_network) {
    const summary = doctorVisitBenefit.summary_description.in_network;
    // Extract primary care copay from text like "$0 copay for Primary. $35 copay per visit for Specialist"
    const primaryMatch = summary.match(/\$\d+\s+copay\s+for\s+Primary/i);
    return primaryMatch ? primaryMatch[0] : summary;
  }
  return 'Contact Plan';
};

export const getSpecialistCareData = (plan: MedicareAdvantageQuote): string => {
  const doctorVisitBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes("doctor's office visits") ||
    b.benefit_type.toLowerCase().includes("primary care")
  );
  
  if (doctorVisitBenefit?.summary_description?.in_network) {
    const summary = doctorVisitBenefit.summary_description.in_network;
    // Extract specialist copay from text like "$0 copay for Primary. $35 copay per visit for Specialist"
    const specialistMatch = summary.match(/\$[\d\-]+\s+copay\s+(?:per\s+visit\s+)?for\s+Specialist/i);
    return specialistMatch ? specialistMatch[0] : summary;
  }
  return 'Contact Plan';
};

export const getOTCBenefit = (plan: MedicareAdvantageQuote): string => {
  const otcBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === 'otc items' ||
    b.benefit_type.toLowerCase().includes('over-the-counter') ||
    b.benefit_type.toLowerCase().includes('over the counter')
  );
  
  if (otcBenefit) {
    if (otcBenefit.summary_description?.in_network) {
      return otcBenefit.summary_description.in_network;
    }
    // Extract benefit amount from full description
    const amountMatch = otcBenefit.full_description.match(/\$\d+/);
    if (amountMatch) {
      return amountMatch[0];
    }
    // Check if it mentions "Some Coverage"
    if (otcBenefit.full_description.toLowerCase().includes('some coverage')) {
      return 'Some Coverage';
    }
  }
  return 'Not Covered';
};

export const getMOOPData = (plan: MedicareAdvantageQuote): { inNetwork: string; combined: string } => {
  const moopBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === 'maximum oopc' ||
    b.benefit_type.toLowerCase().includes('maximum out-of-pocket') ||
    b.benefit_type.toLowerCase().includes('maximum out of pocket')
  );
  
  const planType = plan.plan_type?.toLowerCase() || '';
  
  if (moopBenefit) {
    // First try summary_description if available
    if (moopBenefit.summary_description?.in_network && moopBenefit.summary_description.in_network.trim()) {
      const inNetwork = moopBenefit.summary_description.in_network;
      const outNetwork = moopBenefit.summary_description.out_network || '';
      
      if (planType.includes('hmo') || !outNetwork) {
        return {
          inNetwork: inNetwork,
          combined: 'N/A'
        };
      } else {
        return {
          inNetwork: inNetwork,
          combined: outNetwork
        };
      }
    }
    
    // If summary_description is empty, parse full_description
    if (moopBenefit.full_description) {
      const cleanDesc = moopBenefit.full_description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Parse patterns like "$11,300 In and Out-of-network $6,700 In-network"
      const combinedMatch = cleanDesc.match(/\$[\d,]+(?=\s+In\s+and\s+Out-of-network)/i);
      const inNetworkMatch = cleanDesc.match(/\$[\d,]+(?=\s+In-network)/i);
      
      const inNetwork = inNetworkMatch ? inNetworkMatch[0] : 'Contact Plan';
      const combined = combinedMatch ? combinedMatch[0] : 'N/A';
      
      if (planType.includes('hmo')) {
        return {
          inNetwork: inNetwork,
          combined: 'N/A' // HMO doesn't typically have out-of-network
        };
      } else {
        return {
          inNetwork: inNetwork,
          combined: combined
        };
      }
    }
  }
  
  // Fallback to the API field - handle PFFS and other plan types
  if (plan.in_network_moop) {
    // Check if it's a combined MOOP (contains "In and Out-of-network")
    if (plan.in_network_moop.toLowerCase().includes('in and out-of-network') || planType.includes('pffs')) {
      // Extract just the dollar amount for PFFS/combined MOOP
      const amountMatch = plan.in_network_moop.match(/\$[\d,]+/);
      const amount = amountMatch ? amountMatch[0] : plan.in_network_moop;
      
      return {
        inNetwork: 'N/A', // PFFS doesn't distinguish in-network
        combined: amount
      };
    } else if (planType.includes('hmo')) {
      // HMO only has in-network
      return {
        inNetwork: plan.in_network_moop,
        combined: 'N/A'
      };
    } else {
      // PPO - treat as in-network if no other info available
      return {
        inNetwork: plan.in_network_moop,
        combined: 'Contact Plan'
      };
    }
  }
  
  return {
    inNetwork: 'Contact Plan',
    combined: 'Contact Plan'
  };
};

export const hasBenefitType = (plan: MedicareAdvantageQuote, benefitType: string): boolean => {
  const benefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
  );
  
  if (!benefit) return false;
  
  // Get all text content and clean HTML
  const fullDesc = (benefit.full_description || '').replace(/<[^>]*>/g, ' ').toLowerCase().trim();
  const inNetwork = (benefit.summary_description?.in_network || '').toLowerCase().trim();
  const outNetwork = (benefit.summary_description?.out_network || '').toLowerCase().trim();
  const allText = `${fullDesc} ${inNetwork} ${outNetwork}`.replace(/\s+/g, ' ').trim();
  
  // Debug logging for specific benefits
  if (['Maximum Oopc', 'Vision', 'Inpatient Hospital', 'Health Plan Deductible', 'Hearing services', 'Medical Equipment', 'Mental health care', 'Preventive Care'].includes(benefit.benefit_type)) {
    console.log(`=== ${benefit.benefit_type} ===`);
    console.log('Full description:', benefit.full_description);
    console.log('In network:', benefit.summary_description?.in_network);
    console.log('Cleaned text:', allText);
    
    // Test each positive indicator individually
    const positiveIndicators = [
      '$0', '$', 'copay', 'coinsurance', 'covered', 'some coverage',
      'per visit', 'per day', 'per year', 'included', 'available',
      'deductible', 'maximum', 'limit', 'allowance', 'in-network', 'days 1', 'tier 1'
    ];
    
    console.log('Positive indicators found:');
    positiveIndicators.forEach(indicator => {
      if (allText.includes(indicator)) {
        console.log(`  ✅ "${indicator}" found in text`);
      }
    });
    
    const strongNegativeIndicators = [
      'not covered', 'no coverage', 'not available', 'excluded', 'not included', 'no benefit'
    ];
    
    console.log('Negative indicators found:');
    strongNegativeIndicators.forEach(indicator => {
      if (allText.includes(indicator)) {
        console.log(`  ❌ "${indicator}" found in text`);
      }
    });
  }
  
  // If no content at all, assume no benefit
  if (!allText || allText === '') return false;
  
  // Strong positive indicators first (these override negatives)
  const positiveIndicators = [
    '$0',
    '$', // Any dollar amount
    'copay',
    'coinsurance', 
    'covered',
    'some coverage',
    'per visit',
    'per day',
    'per year',
    'included',
    'available',
    'deductible',
    'maximum',
    'limit',
    'allowance',
    'in-network',
    'days 1',
    'tier 1'
  ];
  
  // Check for positive indicators first
  const hasPositive = positiveIndicators.some(indicator => 
    allText.includes(indicator)
  );
  
  // Strong negative indicators - only applies if NO positive indicators found
  const strongNegativeIndicators = [
    'not covered',
    'no coverage',
    'not available',
    'excluded',
    'not included',
    'no benefit'
  ];
  
  // If we have positive indicators, it's positive (mixed benefits favor positive)
  if (hasPositive) {
    console.log(`${benefit.benefit_type}: Positive detected - ${allText}`);
    return true;
  }
  
  // Only check for negatives if no positives found
  const hasStrongNegative = strongNegativeIndicators.some(indicator => 
    allText.includes(indicator)
  );
  
  if (hasStrongNegative) {
    console.log(`${benefit.benefit_type}: Negative detected - ${allText}`);
    return false;
  }
  
  // Check for simple "covered" or "yes" responses
  const simplePositives = ['covered', 'yes', 'some coverage'];
  const hasSimplePositive = simplePositives.some(indicator => 
    allText.includes(indicator)
  );
  
  if (hasSimplePositive) {
    console.log(`${benefit.benefit_type}: Simple positive - ${allText}`);
    return true;
  }
  
  console.log(`${benefit.benefit_type}: No indicators found - ${allText}`);
  return false;
};

export const getBenefitData = (plan: MedicareAdvantageQuote, benefitType: string): string => {
  const benefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
  );
  
  if (benefit) {
    if (benefit.summary_description?.in_network) {
      return benefit.summary_description.in_network;
    }
    // Clean HTML tags and extract meaningful text
    const cleanText = benefit.full_description.replace(/<[^>]*>/g, '').trim();
    // Return full text for display
    return cleanText;
  }
  return 'Not Available';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
