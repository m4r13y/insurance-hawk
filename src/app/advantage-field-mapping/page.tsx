'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon as Check, Cross1Icon as X, ExclamationTriangleIcon as Warning, StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { 
  FaStethoscope, FaHospital, FaAmbulance, FaPhone, FaEye, FaHeadphones, FaBrain, FaWalking,
  FaPills, FaHeart, FaCar, FaUtensils, FaDumbbell, FaSyringe, FaVials, FaChartLine,
  FaShieldAlt, FaBolt, FaGlobe, FaMapMarkerAlt, FaGift, FaCalendarAlt,
  FaUserMd, FaBuilding, FaCreditCard, FaDollarSign, FaClipboardList, FaTruck,
  FaThermometerHalf, FaBandAid, FaBroadcastTower, FaTooth, FaGamepad, FaFlask, FaHandHoldingMedical,
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes
} from "react-icons/fa";
import { loadFromStorage, ADVANTAGE_QUOTES_KEY } from '@/lib/services/storage-bridge';

// Copy the interface and helper functions from the main component
interface MedicareAdvantageQuote {
  key: string;
  plan_name: string;
  organization_name: string;
  plan_type: string;
  county: string;
  state: string;
  overall_star_rating: number;
  part_c_rate: number;
  part_d_rate: number;
  month_rate: number;
  in_network_moop: string;
  annual_drug_deductible: number;
  contract_id: string;
  plan_id: string;
  segment_id: string;
  benefits: Array<{
    benefit_type: string;
    full_description: string;
    summary_description?: {
      in_network?: string;
      out_network?: string;
    };
    pd_view_display: boolean;
  }>;
  part_d_subsides?: {
    "25": number;
    "50": number;
    "75": number;
    "100": number;
  };
  contextual_data?: {
    has_eapp: boolean;
    carrier_resources: {
      "Formulary Website"?: string;
      "Pharmacy Website"?: string;
      "Physician Lookup"?: string;
    };
  };
  company_base?: {
    name: string;
    name_full: string;
    naic?: string;
  };
  drug_benefit_type?: string;
  drug_benefit_type_detail?: string;
  zero_premium_with_full_low_income_subsidy?: boolean;
  additional_coverage_offered_in_the_gap?: boolean;
  additional_drug_coverage_offered_in_the_gap?: boolean;
  contract_year: string;
  effective_date: string;
  part_b_reduction?: string;
}

// Helper functions for data extraction
const getMedicalDeductible = (plan: MedicareAdvantageQuote): string => {
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

const getDrugDeductible = (plan: MedicareAdvantageQuote): string => {
  // Use the direct API field if available (convert from cents to dollars)
  if (plan.annual_drug_deductible !== undefined) {
    const deductibleInDollars = plan.annual_drug_deductible / 100;
    return deductibleInDollars === 0 ? '$0' : `$${deductibleInDollars.toFixed(2)}`;
  }
  return 'Contact Plan';
};

const hasDrugCoverage = (plan: MedicareAdvantageQuote): boolean => {
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

const getPrimaryCareData = (plan: MedicareAdvantageQuote): string => {
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

const getSpecialistCareData = (plan: MedicareAdvantageQuote): string => {
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

const getOTCBenefit = (plan: MedicareAdvantageQuote): string => {
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

const getMOOPData = (plan: MedicareAdvantageQuote): { inNetwork: string; combined: string } => {
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

const hasBenefitType = (plan: MedicareAdvantageQuote, benefitType: string): boolean => {
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

const getBenefitStatusDisplay = (plan: MedicareAdvantageQuote, benefitType: string) => {
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

const getBenefitData = (plan: MedicareAdvantageQuote, benefitType: string): string => {
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to format benefit descriptions with bold dollar values, percentages, ranges and line breaks
const formatBenefitText = (text: string): React.ReactNode => {
  if (!text) return 'Not Available';
  
  // Add debugging for pharmaceutical data
  console.log('formatBenefitText called with:', text.substring(0, 200) + '...');
  
  // Check if this looks like pharmaceutical/prescription drug data BEFORE cleaning HTML
  const isPharmaData = text.includes('Tier ') && text.includes('<table>');
  console.log('isPharmaData:', isPharmaData, 'has Tier:', text.includes('Tier '), 'has table:', text.includes('<table>'));
  
  if (isPharmaData) {
    console.log('Detected pharmaceutical data, parsing...');
    
    // Test with a small sample first to verify parsing logic
    const testHtml = `<p><b>Tier 1 (Preferred Generic)</b></p><table><th><b>Pharmacy Type</b></th><th><b>30 Days Supply</b></th><th><b>60 Days Supply</b></th><th><b>90 Days Supply</b></th><tr><td>Standard Retail:</td><td>$2</td><td>Not Supported</td><td>$6</td></tr></table>`;
    console.log('Testing parsing with sample HTML...');
    
    // Test regex on sample
    const testPattern = /<p><b>Tier (\d+) \(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
    const testMatch = testPattern.exec(testHtml);
    if (testMatch) {
      console.log('✅ Test regex matched sample HTML');
      console.log('Tier:', testMatch[1], 'Type:', testMatch[2]);
      
      // Test row parsing
      const testRowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
      const testRowMatch = testRowPattern.exec(testMatch[0]);
      if (testRowMatch) {
        console.log('✅ Test row parsing successful:', testRowMatch[1], '|', testRowMatch[2], '|', testRowMatch[3], '|', testRowMatch[4]);
      } else {
        console.log('❌ Test row parsing failed');
      }
    } else {
      console.log('❌ Test regex failed on sample HTML');
    }
    
    // Define types for pharmaceutical data
    interface PharmaTableData {
      tier: string;
      tierType: string;
      pharmacyType: string;
      thirtyDay: string;
      sixtyDay: string;
      ninetyDay: string;
    }
    
    // Parse HTML table structure for pharmaceutical data - use original text with HTML
    const tableData: PharmaTableData[] = [];
    
    // First, let's extract each tier section with its complete HTML
    const tierPattern = /<p><b>Tier (\d+) \(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
    const tierMatches = [];
    let match;
    while ((match = tierPattern.exec(text)) !== null) {
      tierMatches.push(match);
    }
    
    console.log('Tier matches found:', tierMatches.length);
    console.log('Raw text length:', text.length);
    console.log('First 1000 chars of text:', text.substring(0, 1000));
    
    tierMatches.forEach((tierMatch, index) => {
      const tierNumber = tierMatch[1];
      const tierType = tierMatch[2];
      const tableHtml = tierMatch[0];
      
      console.log(`Processing Tier ${tierNumber} (${tierType})`);
      console.log('Table HTML:', tableHtml.substring(0, 500));
      
      // Extract table rows from the HTML - looking for pattern like:
      // <tr><td>Standard Retail:</td><td>$2</td><td>Not Supported</td><td>$6</td></tr>
      const rowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
      const rowMatches = [];
      let rowMatch;
      while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
        rowMatches.push(rowMatch);
        console.log(`Row found: ${rowMatch[1]} | ${rowMatch[2]} | ${rowMatch[3]} | ${rowMatch[4]}`);
      }
      
      console.log(`Found ${rowMatches.length} rows for Tier ${tierNumber}`);
      
      // If no matches with the above pattern, try a simpler approach
      if (rowMatches.length === 0) {
        console.log('No rows found with regex, trying manual parsing...');
        // Split the table HTML by <tr> tags and process each row
        const trSections = tableHtml.split('<tr>').slice(1); // Skip first empty section
        trSections.forEach(trSection => {
          const trContent = trSection.split('</tr>')[0];
          const tdMatches = trContent.match(/<td>([^<]*?)<\/td>/g);
          if (tdMatches && tdMatches.length >= 4) {
            const cells = tdMatches.map(td => td.replace(/<\/?td>/g, ''));
            console.log('Manually parsed row:', cells);
            if (cells[0].includes(':')) {
              tableData.push({
                tier: `Tier ${tierNumber}`,
                tierType: tierType,
                pharmacyType: cells[0].replace(':', ''),
                thirtyDay: cells[1] || 'N/A',
                sixtyDay: cells[2] || 'N/A',
                ninetyDay: cells[3] || 'N/A'
              });
            }
          }
        });
      } else {
        rowMatches.forEach(rowMatch => {
          tableData.push({
            tier: `Tier ${tierNumber}`,
            tierType: tierType,
            pharmacyType: rowMatch[1],
            thirtyDay: rowMatch[2] || 'N/A',
            sixtyDay: rowMatch[3] || 'N/A',
            ninetyDay: rowMatch[4] || 'N/A'
          });
        });
      }
    });
    
    console.log('Final parsed pharmaceutical data:', tableData);
    
    if (tableData.length > 0) {
      // Group data by tier for better display
      const tierGroups = tableData.reduce((acc, item) => {
        if (!acc[item.tier]) acc[item.tier] = [];
        acc[item.tier].push(item);
        return acc;
      }, {} as Record<string, PharmaTableData[]>);
      
      // Convert to array for easier navigation
      const tierEntries = Object.entries(tierGroups);
      
      // Check if all values across all tiers are "Not Covered"
      const allNotCovered = tierEntries.every(([_, tierData]) => 
        tierData.every(row => 
          (row.thirtyDay === 'Not Supported' || row.thirtyDay === 'Not Covered') &&
          (row.sixtyDay === 'Not Supported' || row.sixtyDay === 'Not Covered') &&
          (row.ninetyDay === 'Not Supported' || row.ninetyDay === 'Not Covered')
        )
      );
      
      // If all values are not covered, show simple message
      if (allNotCovered) {
        return (
          <div className="text-center py-4 text-gray-600">
            <div className="text-sm font-medium">No Drug Coverage</div>
          </div>
        );
      }
      
      // Create a carousel component
      const PharmacyCarousel = () => {
        const [currentTierIndex, setCurrentTierIndex] = useState(0);
        
        const nextTier = () => {
          setCurrentTierIndex((prev) => (prev + 1) % tierEntries.length);
        };
        
        const prevTier = () => {
          setCurrentTierIndex((prev) => (prev - 1 + tierEntries.length) % tierEntries.length);
        };
        
        if (tierEntries.length === 0) return null;
        
        const [currentTier, currentData] = tierEntries[currentTierIndex];
        
        return (
          <div className="space-y-3">
            {/* Carousel Header with Navigation - Compact Row */}
            <div className="bg-blue-50 px-3 py-2 rounded-lg flex items-center justify-between gap-2 min-w-80 w-fit">
              <div className="font-semibold text-sm">
                {currentTier} ({currentData[0].tierType})
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevTier}
                  disabled={tierEntries.length <= 1}
                  className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous tier"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={nextTier}
                  disabled={tierEntries.length <= 1}
                  className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next tier"
                >
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Current Tier Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium">Pharmacy Type</th>
                      <th className="border border-gray-300 px-2 py-1 text-center font-medium">30 Days</th>
                      <th className="border border-gray-300 px-2 py-1 text-center font-medium">60 Days</th>
                      <th className="border border-gray-300 px-2 py-1 text-center font-medium">90 Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-1 font-medium">{row.pharmacyType}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.thirtyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.thirtyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.thirtyDay}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.sixtyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.sixtyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.sixtyDay}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.ninetyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.ninetyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.ninetyDay}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tier Indicators */}
            {tierEntries.length > 1 && (
              <div className="relative flex justify-center">
                <div className="flex space-x-2">
                  {tierEntries.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTierIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTierIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={`Go to ${tierEntries[index][0]}`}
                    />
                  ))}
                </div>
                <div className="absolute right-0 text-xs text-gray-600">
                  {currentTierIndex + 1} of {tierEntries.length} tiers
                </div>
              </div>
            )}
          </div>
        );
      };

      return (
        <div className="space-y-4">
          <PharmacyCarousel />
        </div>
      );
    } else {
      // If parsing failed, show debug info
      return (
        <div className="space-y-2">
          <div className="p-3 border border-yellow-300 bg-yellow-50 rounded">
            <strong>Pharmaceutical Data Parsing Failed</strong>
            <p className="text-sm mt-1">Could not parse tier data from HTML structure.</p>
          </div>
        </div>
      );
    }
  }
  
  // Clean HTML tags for non-pharmaceutical data
  let cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  // Replace "In and Out-of-network" with "Combined"
  cleanText = cleanText.replace(/In and Out-of-network/gi, 'Combined');
  
  // Add line breaks before dollar amounts that follow text or numbers, but not before network types
  cleanText = cleanText.replace(/([a-zA-Z0-9])\s*(\$[\d,]+)(?!\s*(In-network|Out-of-network))/gi, '$1\n$2');
  
  // Add line breaks between different dollar amounts with network types
  cleanText = cleanText.replace(/(\$[\d,]+\s*(?:In-network|Out-of-network|Combined))\s*(\$[\d,]+)/gi, '$1\n$2');
  
  // Split by periods and filter out empty strings
  const sentences = cleanText.split('.').filter(sentence => sentence.trim().length > 0);
  
  return (
    <div className="space-y-1">
      {sentences.map((sentence, index) => {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) return null;
        
        // Split by newlines first to handle our custom line breaks
        const lines = trimmedSentence.split('\n');
        
        return (
          <div key={index} className="leading-relaxed space-y-1">
            {lines.map((line, lineIndex) => {
              if (!line.trim()) return null;
              
              // Enhanced regex to match:
              // - Dollar amounts: $0, $15, $1,500.00
              // - Dollar ranges: $0-$50, $10-$100, $0-200 (without second $)
              // - Percentages: 20%, 0%, 100%
              // - Percentage ranges: 0-20%, 10-50%, 0 - 50% (with spaces)
              const parts = line.split(/(\$[\d,]+(?:\.\d{2})?(?:\s*-\s*(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+\s*-?\s*\d*%|\d+%)/g);
              
              return (
                <div key={lineIndex}>
                  {parts.map((part, partIndex) => {
                    // Check if this part is a dollar amount, dollar range, percentage, or percentage range
                    if (/^(\$[\d,]+(?:\.\d{2})?(?:\s*-\s*(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+\s*-\s*\d*%|\d+%)$/.test(part)) {
                      return <strong key={partIndex} className="font-semibold text-green-700">{part}</strong>;
                    }
                    return part;
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function AdvantageFieldMappingPage() {
  const [plans, setPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MedicareAdvantageQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5; // Show 5 plans at a time
  const [loading, setLoading] = useState(true);
  const [currentCarouselPage, setCurrentCarouselPage] = useState(0);

  // Carousel pages configuration
  const carouselPages = [
    { title: 'Field Mapping', id: 'field-mapping' },
    { title: 'Specialty & Benefits', id: 'specialty-benefits' },
    { title: 'Outpatient Services', id: 'outpatient-services' },
    { title: 'Inpatient/Facility', id: 'inpatient-facility' },
    { title: 'Prescriptions', id: 'prescriptions' }
  ];

  // Categorize benefit types
  const getBenefitsByCategory = (category: string) => {
    if (!selectedPlan) return [];
    
    const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
    
    switch (category) {
      case 'specialty-benefits':
        return allBenefitTypes.filter(type => 
          type.toLowerCase().includes('dental') ||
          type.toLowerCase().includes('vision') ||
          type.toLowerCase().includes('hearing') ||
          type.toLowerCase().includes('transportation') ||
          type.toLowerCase().includes('meal') ||
          type.toLowerCase().includes('otc') ||
          type.toLowerCase().includes('over-the-counter') ||
          type.toLowerCase().includes('fitness') ||
          type.toLowerCase().includes('wellness')
        );
      case 'outpatient-services':
        return allBenefitTypes.filter(type => 
          type.toLowerCase().includes('doctor') ||
          type.toLowerCase().includes('office visits') ||
          type.toLowerCase().includes('preventive') ||
          type.toLowerCase().includes('diagnostic') ||
          type.toLowerCase().includes('lab') ||
          type.toLowerCase().includes('x-ray') ||
          type.toLowerCase().includes('outpatient') ||
          type.toLowerCase().includes('ambulatory')
        );
      case 'inpatient-facility':
        return allBenefitTypes.filter(type => 
          type.toLowerCase().includes('inpatient') ||
          type.toLowerCase().includes('hospital') ||
          type.toLowerCase().includes('facility') ||
          type.toLowerCase().includes('skilled nursing') ||
          type.toLowerCase().includes('rehab') ||
          type.toLowerCase().includes('emergency')
        );
      case 'prescriptions':
        return allBenefitTypes.filter(type => 
          type.toLowerCase().includes('prescription') ||
          type.toLowerCase().includes('drug') ||
          type.toLowerCase().includes('pharmacy') ||
          type.toLowerCase().includes('formulary')
        );
      default:
        return [];
    }
  };

  useEffect(() => {
    // Load plans from Firestore instead of localStorage
    const loadPlans = async () => {
      try {
        console.log('📥 Loading Medicare Advantage quotes from Firestore...');
        const savedPlans = await loadFromStorage<MedicareAdvantageQuote[]>(ADVANTAGE_QUOTES_KEY, []);
        
        if (savedPlans && savedPlans.length > 0) {
          console.log('📋 Total plans loaded from Firestore:', savedPlans.length);
          console.log('🔍 First plan benefit count:', savedPlans[0].benefits?.length || 0);
          console.log('🔍 First plan benefits:', savedPlans[0].benefits?.map((b: any) => b.benefit_type) || []);
          
          // Check for specific benefits that should exist
          const firstPlan = savedPlans[0];
          const problemBenefits = [
            'Health Plan Deductible', 'Hearing services', 'Inpatient Hospital', 
            'Maximum Oopc', 'Medical Equipment', 'Vision', 'Preventive Care'
          ];
          
          console.log('🔍 Checking for problem benefits:');
          problemBenefits.forEach(benefitName => {
            const found = firstPlan.benefits?.find((b: any) => b.benefit_type === benefitName);
            console.log(`  ${benefitName}: ${found ? '✅ FOUND' : '❌ MISSING'}`);
            if (found) {
              console.log(`    - Full description: ${found.full_description}`);
              console.log(`    - Summary: ${JSON.stringify(found.summary_description)}`);
            }
          });
          
          setPlans(savedPlans);
          setSelectedPlan(savedPlans[0]);
        } else {
          console.log('📭 No plans found in Firestore');
        }
      } catch (error) {
        console.error('Error loading plans from Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Dynamic field mappings based on plan type
  const getFieldMappings = () => {
    if (!selectedPlan) return [];
    
    const planType = selectedPlan.plan_type?.toLowerCase() || '';
    const moopData = getMOOPData(selectedPlan);
    
    // Always include all possible fields for consistency
    return [
      {
        column: 'Monthly Premium',
        field: 'month_rate',
        value: formatCurrency(selectedPlan.month_rate / 100)
      },
      {
        column: 'Annual Cost',
        field: 'month_rate * 12',
        value: formatCurrency((selectedPlan.month_rate / 100) * 12)
      },
      {
        column: 'MOOP In-Network',
        field: 'benefits["Maximum Oopc"].summary_description.in_network',
        value: moopData.inNetwork !== 'N/A' && moopData.inNetwork !== 'Contact Plan' ? moopData.inNetwork : 'N/A'
      },
      {
        column: 'MOOP Combined',
        field: 'benefits["Maximum Oopc"].summary_description.out_network',
        value: moopData.combined !== 'N/A' && moopData.combined !== 'Contact Plan' ? moopData.combined : 'N/A'
      },
      {
        column: 'Drug Deductible',
        field: 'annual_drug_deductible',
        value: hasDrugCoverage(selectedPlan) ? getDrugDeductible(selectedPlan) : 'No Drug Coverage'
      },
      {
        column: 'Medical Deductible',
        field: 'benefits["Health Plan Deductible"]',
        value: getMedicalDeductible(selectedPlan)
      },
      {
        column: 'Primary Care Co-pay',
        field: 'benefits["Doctor\'s office visits"]',
        value: getPrimaryCareData(selectedPlan)
      },
      {
        column: 'Specialist Co-pay',
        field: 'benefits["Doctor\'s office visits"]',
        value: getSpecialistCareData(selectedPlan)
      },
      {
        column: 'OTC Benefit',
        field: 'benefits["Otc Items"]',
        value: getOTCBenefit(selectedPlan)
      },
      {
        column: 'Dental',
        field: 'benefits["Comprehensive Dental Service"]',
        value: hasBenefitType(selectedPlan, 'Comprehensive Dental Service') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Vision',
        field: 'benefits["Vision"]',
        value: hasBenefitType(selectedPlan, 'Vision') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Hearing',
        field: 'benefits["Hearing services"]',
        value: hasBenefitType(selectedPlan, 'Hearing services') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Transport',
        field: 'benefits["Transportation"]',
        value: hasBenefitType(selectedPlan, 'Transportation') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      }
    ];
  };

  const fieldMappings = getFieldMappings();

  // Icon mapping for each benefit type
  const getBenefitIcon = (benefitType: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'Additional Telehealth Services': <FaPhone className="w-4 h-4" />,
      'Ambulance': <FaAmbulance className="w-4 h-4" />,
      'Annual Physical Exam': <FaUserMd className="w-4 h-4" />,
      'Comprehensive Dental Service': <FaTooth className="w-4 h-4" />,
      'Defined Supplemental Benefits': <FaGift className="w-4 h-4" />,
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': <FaVials className="w-4 h-4" />,
      'Dialysis Services': <FaHandHoldingMedical className="w-4 h-4" />,
      'Doctor\'s office visits': <FaStethoscope className="w-4 h-4" />,
      'Emergency Care': <FaAmbulance className="w-4 h-4" />,
      'Foot care (podiatry services)': <FaWalking className="w-4 h-4" />,
      'Health Plan Deductible': <FaDollarSign className="w-4 h-4" />,
      'Hearing services': <FaHeadphones className="w-4 h-4" />,
      'Inpatient Hospital': <FaHospital className="w-4 h-4" />,
      'Meal Benefit': <FaUtensils className="w-4 h-4" />,
      'Medical Equipment': <FaFlask className="w-4 h-4" />,
      'Medicare Part B': <FaClipboardList className="w-4 h-4" />,
      'Mental health care': <FaBrain className="w-4 h-4" />,
      'Non Opioid Pain Management': <FaBandAid className="w-4 h-4" />,
      'Opioid Treatment Services': <FaBandAid className="w-4 h-4" />,
      'Optional Supplemental Benefits': <FaGift className="w-4 h-4" />,
      'Otc Items': <FaPills className="w-4 h-4" />,
      'Other Deductibles': <FaDollarSign className="w-4 h-4" />,
      'Outpatient Hospital': <FaBuilding className="w-4 h-4" />,
      'Outpatient prescription drugs': <FaPills className="w-4 h-4" />,
      'Outpatient rehabilitation': <FaChartLine className="w-4 h-4" />,
      'Preventive Care': <FaShieldAlt className="w-4 h-4" />,
      'Preventive Dental Service': <FaTooth className="w-4 h-4" />,
      'Skilled Nursing Facility (SNF)': <FaBuilding className="w-4 h-4" />,
      'Transportation': <FaCar className="w-4 h-4" />,
      'Transportation Services': <FaCar className="w-4 h-4" />,
      'Vision': <FaEye className="w-4 h-4" />,
      'Wellness Programs': <FaHeart className="w-4 h-4" />,
      'Worldwide Emergency Urgent Coverage': <FaGlobe className="w-4 h-4" />
    };
    
    return iconMap[benefitType] || <FaClipboardList className="w-4 h-4" />;
  };

  // All available benefit types from the API
  const allBenefitTypes = [
    'Additional Telehealth Services',
    'Ambulance',
    'Annual Physical Exam',
    'Comprehensive Dental Service',
    'Defined Supplemental Benefits',
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
    'Dialysis Services',
    'Doctor\'s office visits',
    'Emergency Care',
    'Foot care (podiatry services)',
    'Health Plan Deductible',
    'Hearing services',
    'Inpatient Hospital',
    'Maximum Oopc',
    'Meal Benefit',
    'Medical Equipment',
    'Medicare Part B',
    'Mental health care',
    'Non Opioid Pain Management',
    'Opioid Treatment Services',
    'Optional Supplemental Benefits',
    'Otc Items',
    'Other Deductibles',
    'Outpatient Hospital',
    'Outpatient rehabilitation',
    'Preventive Care',
    'Preventive Dental Service',
    'Skilled Nursing Facility (SNF)',
    'Transportation',
    'Transportation Services',
    'Vision',
    'Wellness Programs',
    'Worldwide Emergency Urgent Coverage',
    'Outpatient prescription drugs'
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="container mt-20 mx-auto p-6 space-y-6">
      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No Medicare Advantage plans found.</p>
              <p className="text-sm mt-2">Please generate quotes first by visiting the Medicare Advantage shop. Data is now stored in Firestore, not localStorage.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col xl:grid xl:grid-cols-2 gap-6">
          {/* Plan Selection */}
          <div>
            <div className="flex flex-col min-h-96">
              <div className="flex-1 space-y-2">
                {plans.slice(currentPage * plansPerPage, (currentPage + 1) * plansPerPage).map((plan) => {
                  // Check if this plan has pharmaceutical data with dollar amounts or percentages
                  const pharmaData = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs')?.full_description || '';
                  const hasDollarAmounts = pharmaData.includes('$') && pharmaData.match(/\$[1-9]\d*/);
                  const hasPercentages = pharmaData.includes('%');
                  const hasRealValues = hasDollarAmounts || hasPercentages;
                  
                  return (
                    <Button
                      key={plan.key}
                      variant={selectedPlan?.key === plan.key ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3 sm:p-4"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="w-full">
                        {/* Mobile Layout (stacked) */}
                        <div className="block sm:hidden space-y-3">
                          <div className="space-y-1">
                            <div className={`font-semibold text-sm ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                              {plan.plan_name}
                            </div>
                            <div className={`text-xs font-mono ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                              {plan.contract_id}-{plan.plan_id}-{plan.segment_id} ({plan.contract_year})
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => 
                                  i < plan.overall_star_rating ? (
                                    <StarFilled 
                                      key={i} 
                                      className="w-3 h-3 text-yellow-500" 
                                    />
                                  ) : (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'}`}
                                    />
                                  )
                                )}
                              </div>
                              <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                                {plan.organization_name}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(plan.month_rate / 100)}/mo
                              </div>
                              {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                                <div className="text-green-400 font-medium text-xs">Giveback: ${plan.part_b_reduction}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' && (
                                <FaTooth className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                              )}
                              {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                                <FaEye className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                              )}
                              {getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered' && (
                                <FaHeadphones className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                              )}
                              {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                                <FaCar className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                              )}
                              {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                                <FaUtensils className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                              )}
                            </div>
                            
                            <div className={`text-xs space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                              <div className="flex items-center justify-end gap-1">
                                <FaStethoscope className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className="font-medium text-xs">{getMedicalDeductible(plan)}</span>
                                {hasDrugCoverage(plan) && (
                                  <>
                                    <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                    <FaPills className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className="font-medium text-xs">{getDrugDeductible(plan)}</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="font-medium text-xs text-right">
                                <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                                {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                                  <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                                )}
                                {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                                  <span>
                                    {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                                      <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                    ) : ' '}
                                    {getMOOPData(plan).combined}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Desktop Layout (grid) */}
                        <div className="hidden sm:block">
                          <div className="grid grid-cols-3 gap-4 lg:gap-6">
                            <div className="col-span-2 space-y-2">
                              <div>
                                <div className={`font-semibold text-base lg:text-lg ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                                  {plan.plan_name}
                                </div>
                                <div className={`text-xs mt-0.5 font-mono ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {plan.contract_id}-{plan.plan_id}-{plan.segment_id} ({plan.contract_year})
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => 
                                  i < plan.overall_star_rating ? (
                                    <StarFilled 
                                      key={i} 
                                      className="w-4 h-4 text-yellow-500" 
                                    />
                                  ) : (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'}`}
                                    />
                                  )
                                )}
                              </div>
                              
                              <div className={`text-sm font-medium ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                                {plan.organization_name}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' && (
                                  <FaTooth className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                                )}
                                {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                                  <FaEye className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                                )}
                                {getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered' && (
                                  <FaHeadphones className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                                )}
                                {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                                  <FaCar className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                                )}
                                {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                                  <FaUtensils className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                                )}
                              </div>
                            </div>
                            
                            <div className="col-span-1 text-right flex flex-col justify-between h-full py-1">
                              <div className={`text-xl font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(plan.month_rate / 100)}/mo
                              </div>
                              
                              <div className={`text-sm space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                                {/* Show giveback if available */}
                                {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                                  <div className="text-green-400 font-medium">Giveback: ${plan.part_b_reduction}</div>
                                )}
                                
                                <div className="flex items-center justify-end gap-1.5">
                                  <FaStethoscope className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                                  <span className="font-medium">{getMedicalDeductible(plan)}</span>
                                  {/* Only show drug deductible if plan has drug coverage */}
                                  {hasDrugCoverage(plan) && (
                                    <>
                                      <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                      <FaPills className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                                      <span className="font-medium">{getDrugDeductible(plan)}</span>
                                    </>
                                  )}
                                </div>
                                
                                <div className="font-medium">
                                  <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                                  {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                                    <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                                  )}
                                  {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                                    <span>
                                      {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                                        <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                      ) : ' '}
                                      {getMOOPData(plan).combined}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {plans.length > plansPerPage && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage + 1} of {Math.ceil(plans.length / plansPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(plans.length / plansPerPage) - 1, prev + 1))}
                    disabled={currentPage >= Math.ceil(plans.length / plansPerPage) - 1}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Results */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedPlan ? (
                  <div>
                    <div>{selectedPlan.plan_name}</div>
                    <div className="text-sm font-normal text-gray-600 mt-1 flex items-center gap-2">
                      <span>{selectedPlan.organization_name}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => 
                          i < selectedPlan.overall_star_rating ? (
                            <StarFilled 
                              key={i} 
                              className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" 
                            />
                          ) : (
                            <Star 
                              key={i} 
                              className="w-3 h-3 lg:w-4 lg:h-4 text-gray-300" 
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  'Plan Details'
                )}
              </CardTitle>
              
              {/* Carousel Navigation - moved below stars */}
              <div className="flex items-center gap-2 mt-3 min-w-100 justify-end">
                <button
                  onClick={() => setCurrentCarouselPage(prev => Math.max(0, prev - 1))}
                  disabled={currentCarouselPage === 0}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
                  {carouselPages[currentCarouselPage]?.title}
                </div>
                
                <button
                  onClick={() => setCurrentCarouselPage(prev => Math.min(carouselPages.length - 1, prev + 1))}
                  disabled={currentCarouselPage === carouselPages.length - 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Field Mapping Page */}
              {currentCarouselPage === 0 && (
                <Table>
                  <TableBody>
                    {fieldMappings.map((mapping, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{mapping.column}</TableCell>
                        <TableCell>{mapping.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {/* Specialty & Benefits Page */}
              {currentCarouselPage === 1 && selectedPlan && (
                <div className="space-y-4">
                  {(() => {
                    const specialtyBenefits = [
                      'Vision',
                      'Hearing services',
                      'Mental health care',
                      'Foot care (podiatry services)',
                      'Comprehensive Dental Service',
                      'Preventive Dental Service',
                      'Transportation',
                      'Transportation Services',
                      'Wellness Programs',
                      'Meal Benefit',
                      'Otc Items',
                      'Defined Supplemental Benefits',
                      'Optional Supplemental Benefits',
                      'Worldwide Emergency Urgent Coverage'
                    ];

                    const displayNameMap: Record<string, string> = {
                      'Comprehensive Dental Service': 'Dental (Comprehensive)',
                      'Preventive Dental Service': 'Dental (Preventive)'
                    };

                    const benefitPriority: Record<string, number> = {
                      'Preventive Dental Service': 1,
                      'Comprehensive Dental Service': 2,
                      'Vision': 3,
                      'Hearing services': 4,
                      'Otc Items': 5,
                      'Transportation': 6,
                      'Transportation Services': 7,
                      'Meal Benefit': 8,
                      'Wellness Programs': 9,
                      'Foot care (podiatry services)': 10,
                      'Mental health care': 11,
                      'Defined Supplemental Benefits': 12,
                      'Optional Supplemental Benefits': 13,
                      'Worldwide Emergency Urgent Coverage': 14
                    };

                    const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
                    const benefitObjects = allBenefitTypes
                      .filter(benefitType => specialtyBenefits.includes(benefitType))
                      .map((benefitType, index) => {
                        const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                        const benefit = selectedPlan.benefits.find(b => 
                          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                        );
                        
                        return {
                          benefitType,
                          displayName: displayNameMap[benefitType] || benefitType,
                          index: `specialty-${index}`,
                          statusDisplay,
                          benefitData,
                          benefit,
                          priority: benefitPriority[benefitType] || 999
                        };
                      });

                    const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
                    const sortedBenefits = benefitObjects.sort((a, b) => {
                      const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                      if (statusDiff !== 0) return statusDiff;
                      return a.priority - b.priority;
                    });

                    return sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
                      <div key={index} className="p-3 border rounded border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getBenefitIcon(benefitType)}
                            <span className="text-sm font-medium">{displayName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusDisplay.icon}
                          </div>
                        </div>
                        {benefit && (
                          <div className="text-xs text-gray-600">
                            {/* Show separate In-Network and Out-of-Network sections */}
                            {benefit.summary_description?.in_network && (
                              <div className="mt-2 p-2 bg-green-50 rounded">
                                <strong>In-Network:</strong>
                                <div className="mt-1">
                                  {formatBenefitText(benefit.summary_description.in_network)}
                                </div>
                              </div>
                            )}
                            {benefit.summary_description?.out_network && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <strong>Out-of-Network:</strong>
                                <div className="mt-1">
                                  {formatBenefitText(benefit.summary_description.out_network)}
                                </div>
                              </div>
                            )}
                            {!benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-gray-500">
                                {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                                 statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                                 'Benefit information not available'}
                              </div>
                            )}
                          </div>
                        )}
                        {!benefit && (
                          <div className="text-xs text-gray-500">Not available in this plan</div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
              
              {/* Outpatient Services Page */}
              {currentCarouselPage === 2 && selectedPlan && (
                <div className="space-y-4">
                  {(() => {
                    const outpatientServices = [
                      'Doctor\'s office visits',
                      'Annual Physical Exam', 
                      'Preventive Care',
                      'Outpatient Hospital',
                      'Outpatient rehabilitation',
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
                      'Additional Telehealth Services',
                      'Emergency Care',
                      'Ambulance'
                    ];

                    const displayNameMap: Record<string, string> = {
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
                    };

                    const benefitPriority: Record<string, number> = {
                      'Doctor\'s office visits': 1,
                      'Annual Physical Exam': 2,
                      'Preventive Care': 3,
                      'Emergency Care': 4,
                      'Ambulance': 5,
                      'Outpatient Hospital': 6,
                      'Outpatient rehabilitation': 7,
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 8,
                      'Additional Telehealth Services': 9
                    };

                    const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
                    const benefitObjects = allBenefitTypes
                      .filter(benefitType => outpatientServices.includes(benefitType))
                      .map((benefitType, index) => {
                        const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                        const benefit = selectedPlan.benefits.find(b => 
                          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                        );
                        
                        return {
                          benefitType,
                          displayName: displayNameMap[benefitType] || benefitType,
                          index: `outpatient-${index}`,
                          statusDisplay,
                          benefitData,
                          benefit,
                          priority: benefitPriority[benefitType] || 999
                        };
                      });

                    const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
                    const sortedBenefits = benefitObjects.sort((a, b) => {
                      const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                      if (statusDiff !== 0) return statusDiff;
                      return a.priority - b.priority;
                    });

                    return sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
                      <div key={index} className="p-3 border rounded border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getBenefitIcon(benefitType)}
                            <span className="text-sm font-medium">{displayName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusDisplay.icon}
                          </div>
                        </div>
                        {benefit && (
                          <div className="text-xs text-gray-600">
                            {benefitData && benefitData !== 'Not Available' ? (
                              <div>
                                {formatBenefitText(benefitData)}
                              </div>
                            ) : (
                              <div className="text-gray-500">No coverage details available</div>
                            )}
                          </div>
                        )}
                        {!benefit && (
                          <div className="text-xs text-gray-500">Not available in this plan</div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
              
              {/* Inpatient/Facility Page */}
              {currentCarouselPage === 3 && selectedPlan && (
                <div className="space-y-4">
                  {(() => {
                    const inpatientFacility = [
                      'Inpatient Hospital',
                      'Skilled Nursing Facility (SNF)',
                      'Dialysis Services',
                      'Medical Equipment',
                      'Health Plan Deductible',
                      'Other Deductibles',
                      'Medicare Part B',
                      'Non Opioid Pain Management',
                      'Opioid Treatment Services'
                    ];

                    const benefitPriority: Record<string, number> = {
                      'Inpatient Hospital': 1,
                      'Skilled Nursing Facility (SNF)': 2,
                      'Dialysis Services': 3,
                      'Medical Equipment': 4,
                      'Health Plan Deductible': 5,
                      'Other Deductibles': 6,
                      'Medicare Part B': 7,
                      'Non Opioid Pain Management': 8,
                      'Opioid Treatment Services': 9
                    };

                    const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
                    const benefitObjects = allBenefitTypes
                      .filter(benefitType => inpatientFacility.includes(benefitType))
                      .map((benefitType, index) => {
                        const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                        const benefit = selectedPlan.benefits.find(b => 
                          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                        );
                        
                        return {
                          benefitType,
                          displayName: benefitType,
                          index: `inpatient-${index}`,
                          statusDisplay,
                          benefitData,
                          benefit,
                          priority: benefitPriority[benefitType] || 999
                        };
                      });

                    const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
                    const sortedBenefits = benefitObjects.sort((a, b) => {
                      const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                      if (statusDiff !== 0) return statusDiff;
                      return a.priority - b.priority;
                    });

                    return sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
                      <div key={index} className="p-3 border rounded border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getBenefitIcon(benefitType)}
                            <span className="text-sm font-medium">{displayName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusDisplay.icon}
                          </div>
                        </div>
                        {benefit && (
                          <div className="text-xs text-gray-600">
                            {benefitData && benefitData !== 'Not Available' ? (
                              <div>
                                {formatBenefitText(benefitData)}
                              </div>
                            ) : (
                              <div className="text-gray-500">No coverage details available</div>
                            )}
                          </div>
                        )}
                        {!benefit && (
                          <div className="text-xs text-gray-500">Not available in this plan</div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
              
              {/* Prescriptions Page */}
              {currentCarouselPage === 4 && selectedPlan && (
                <div className="space-y-4">
                  {/* Pharmaceutical data - full width */}
                  {(() => {
                    const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
                    return allBenefitTypes.filter(benefitType => benefitType === 'Outpatient prescription drugs').map((benefitType, index) => {
                      const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                      const benefit = selectedPlan.benefits.find(b => 
                        b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                        b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                      );
                      
                      const benefitData = benefit ? benefit.full_description : 'Not Available';
                      
                      return (
                        <div key={`pharma-${index}`} className="p-3 border rounded w-full border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getBenefitIcon(benefitType)}
                              <span className="text-sm font-medium">{benefitType}</span>
                            </div>
                          </div>
                          {benefit && (
                            <div className="text-xs text-gray-600">
                              {benefitData && benefitData !== 'Not Available' ? (
                                <div>
                                  {formatBenefitText(benefitData)}
                                </div>
                              ) : (
                                <div className="p-3 text-center text-gray-500">
                                  No drug coverage available
                                </div>
                              )}
                            </div>
                          )}
                          {!benefit && (
                            <div className="p-3 text-center text-gray-500">
                              No drug coverage available
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Available Benefit Types Analysis */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>All Available Benefit Types Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Full-width items for pharmaceutical data */}
              {allBenefitTypes.filter(benefitType => benefitType === 'Outpatient prescription drugs').map((benefitType, index) => {
                const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                const benefit = selectedPlan.benefits.find(b => 
                  b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                  b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                );
                
                // For pharmaceutical data, always use the full_description when available
                const benefitData = benefit ? benefit.full_description : 'Not Available';
                
                return (
                  <div key={`pharma-${index}`} className="p-3 border rounded w-full border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getBenefitIcon(benefitType)}
                        <span className="text-sm font-medium">{benefitType}</span>
                      </div>
                    </div>
                    {benefit && (
                      <div className="text-xs text-gray-600">
                        {/* Show pharmaceutical table if available, otherwise show no coverage message */}
                        {benefitData && benefitData !== 'Not Available' ? (
                          <div>
                            {formatBenefitText(benefitData)}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            No drug coverage available
                          </div>
                        )}
                      </div>
                    )}
                    {!benefit && (
                      <div className="p-3 text-center text-gray-500">
                        No drug coverage available
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Grid layout for other benefits - organized by service setting */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(() => {
                  // Categorize benefits by service setting
                  const outpatientServices = [
                    'Doctor\'s office visits',
                    'Annual Physical Exam', 
                    'Preventive Care',
                    'Outpatient Hospital',
                    'Outpatient rehabilitation',
                    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
                    'Additional Telehealth Services',
                    'Emergency Care',
                    'Ambulance'
                  ];
                  
                  const inpatientFacility = [
                    'Inpatient Hospital',
                    'Skilled Nursing Facility (SNF)',
                    'Dialysis Services',
                    'Medical Equipment',
                    'Health Plan Deductible',
                    'Other Deductibles',
                    'Medicare Part B',
                    'Non Opioid Pain Management',
                    'Opioid Treatment Services'
                  ];
                  
                  const specialtyBenefits = [
                    'Vision',
                    'Hearing services',
                    'Mental health care',
                    'Foot care (podiatry services)',
                    'Comprehensive Dental Service',
                    'Preventive Dental Service',
                    'Transportation',
                    'Transportation Services',
                    'Wellness Programs',
                    'Meal Benefit',
                    'Otc Items',
                    'Defined Supplemental Benefits',
                    'Optional Supplemental Benefits',
                    'Worldwide Emergency Urgent Coverage'
                  ];

                  // Create benefit objects for each category
                  const createBenefitCards = (categoryBenefits: string[], categoryName: string) => {
                    // Display name mappings for better UX
                    const displayNameMap: Record<string, string> = {
                      'Comprehensive Dental Service': 'Dental (Comprehensive)',
                      'Preventive Dental Service': 'Dental (Preventive)',
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
                    };
                    
                    // Description mappings for benefits that need additional context
                    const descriptionMap: Record<string, string> = {
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Costs for these services may be different if received in an outpatient surgery setting'
                    };
                    
                    // Priority order within each category (lower number = higher priority)
                    const benefitPriority: Record<string, number> = {
                      // Specialty & Benefits priority order
                      'Preventive Dental Service': 1,
                      'Comprehensive Dental Service': 2,
                      'Vision': 3,
                      'Hearing services': 4,
                      'Otc Items': 5,
                      'Transportation': 6,
                      'Transportation Services': 7,
                      'Meal Benefit': 8,
                      'Wellness Programs': 9,
                      'Foot care (podiatry services)': 10,
                      'Mental health care': 11,
                      'Defined Supplemental Benefits': 12,
                      'Optional Supplemental Benefits': 13,
                      'Worldwide Emergency Urgent Coverage': 14,
                      
                      // Outpatient Services priority order
                      'Doctor\'s office visits': 1,
                      'Annual Physical Exam': 2,
                      'Preventive Care': 3,
                      'Emergency Care': 4,
                      'Ambulance': 5,
                      'Outpatient Hospital': 6,
                      'Outpatient rehabilitation': 7,
                      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 8,
                      'Additional Telehealth Services': 9,
                      
                      // Inpatient/Facility priority order
                      'Inpatient Hospital': 1,
                      'Skilled Nursing Facility (SNF)': 2,
                      'Dialysis Services': 3,
                      'Medical Equipment': 4,
                      'Health Plan Deductible': 5,
                      'Other Deductibles': 6,
                      'Medicare Part B': 7,
                      'Non Opioid Pain Management': 8,
                      'Opioid Treatment Services': 9
                    };
                    
                    const benefitObjects = allBenefitTypes
                      .filter(benefitType => benefitType !== 'Outpatient prescription drugs' && categoryBenefits.includes(benefitType))
                      .map((benefitType, index) => {
                        const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                        const benefit = selectedPlan.benefits.find(b => 
                          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                        );
                        
                        return {
                          benefitType,
                          displayName: displayNameMap[benefitType] || benefitType,
                          description: descriptionMap[benefitType],
                          index: `${categoryName}-${index}`,
                          statusDisplay,
                          benefitData,
                          benefit,
                          priority: benefitPriority[benefitType] || 999
                        };
                      });
                    
                    // Sort by status within each category, then by priority within status
                    const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
                    return benefitObjects.sort((a, b) => {
                      // First sort by coverage status
                      const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                      if (statusDiff !== 0) return statusDiff;
                      
                      // Then sort by priority within the same status
                      return a.priority - b.priority;
                    });
                  };

                  const outpatientCards = createBenefitCards(outpatientServices, 'outpatient');
                  const inpatientCards = createBenefitCards(inpatientFacility, 'inpatient');
                  const specialtyCards = createBenefitCards(specialtyBenefits, 'specialty');

                  return (
                    <>
                      {/* Specialty & Benefits Column */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Specialty & Benefits</h3>
                        {specialtyCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                          <div key={index} className="p-3 border rounded border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getBenefitIcon(benefitType)}
                                <span className="text-sm font-medium">{displayName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusDisplay.icon}
                              </div>
                            </div>
                            {description && (
                              <div className="text-xs text-gray-500 mb-2 italic">
                                {description}
                              </div>
                            )}
                            {benefit && (
                              <div className="text-xs text-gray-600">
                                {/* Show separate In-Network and Out-of-Network sections */}
                                {benefit.summary_description?.in_network && (
                                  <div className="mt-2 p-2 bg-green-50 rounded">
                                    <strong>In-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.in_network)}
                                    </div>
                                  </div>
                                )}
                                {benefit.summary_description?.out_network && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded">
                                    <strong>Out-of-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.out_network)}
                                    </div>
                                  </div>
                                )}
                                {!benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-gray-500">
                                    {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                                     statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                                     'Benefit information not available'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Outpatient Services Column */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Outpatient Services</h3>
                        {outpatientCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                          <div key={index} className="p-3 border rounded border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getBenefitIcon(benefitType)}
                                <span className="text-sm font-medium">{displayName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusDisplay.icon}
                              </div>
                            </div>
                            {description && (
                              <div className="text-xs text-gray-500 mb-2 italic">
                                {description}
                              </div>
                            )}
                            {benefit && (
                              <div className="text-xs text-gray-600">
                                {/* Show separate In-Network and Out-of-Network sections */}
                                {benefit.summary_description?.in_network && (
                                  <div className="mt-2 p-2 bg-green-50 rounded">
                                    <strong>In-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.in_network)}
                                    </div>
                                  </div>
                                )}
                                {benefit.summary_description?.out_network && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded">
                                    <strong>Out-of-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.out_network)}
                                    </div>
                                  </div>
                                )}
                                {/* Fallback to combined data if separate network data isn't available */}
                                {(statusDisplay.status === 'covered' || statusDisplay.status === 'unclear') && !benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                                  <div className="mt-2">
                                    {formatBenefitText(benefitData)}
                                  </div>
                                )}
                                {statusDisplay.status !== 'covered' && benefit && (
                                  <div className={`italic ${statusDisplay.textColor}`}>
                                    {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                                     statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                                     'Benefit information not available'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Inpatient/Facility Column */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Inpatient/Facility</h3>
                        {inpatientCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                          <div key={index} className="p-3 border rounded border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getBenefitIcon(benefitType)}
                                <span className="text-sm font-medium">{displayName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusDisplay.icon}
                              </div>
                            </div>
                            {description && (
                              <div className="text-xs text-gray-500 mb-2 italic">
                                {description}
                              </div>
                            )}
                            {benefit && (
                              <div className="text-xs text-gray-600">
                                {/* Show separate In-Network and Out-of-Network sections */}
                                {benefit.summary_description?.in_network && (
                                  <div className="mt-2 p-2 bg-green-50 rounded">
                                    <strong>In-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.in_network)}
                                    </div>
                                  </div>
                                )}
                                {benefit.summary_description?.out_network && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded">
                                    <strong>Out-of-Network:</strong>
                                    <div className="mt-1">
                                      {formatBenefitText(benefit.summary_description.out_network)}
                                    </div>
                                  </div>
                                )}
                                {/* Fallback to combined data if separate network data isn't available */}
                                {(statusDisplay.status === 'covered' || statusDisplay.status === 'unclear') && !benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                                  <div className="mt-2">
                                    {formatBenefitText(benefitData)}
                                  </div>
                                )}
                                {statusDisplay.status !== 'covered' && benefit && (
                                  <div className={`italic ${statusDisplay.textColor}`}>
                                    {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                                     statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                                     'Benefit information not available'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
