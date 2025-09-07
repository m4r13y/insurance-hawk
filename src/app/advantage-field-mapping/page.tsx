'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon as Check, Cross1Icon as X } from "@radix-ui/react-icons";
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
  // Use the direct API field if available
  if (plan.annual_drug_deductible !== undefined) {
    return plan.annual_drug_deductible === 0 ? '$0' : `$${plan.annual_drug_deductible}`;
  }
  return 'Contact Plan';
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
    b.benefit_type.toLowerCase().includes("specialist")
  );
  
  if (doctorVisitBenefit?.summary_description?.in_network) {
    const summary = doctorVisitBenefit.summary_description.in_network;
    // Extract specialist copay from text
    const specialistMatch = summary.match(/\$\d+\s+copay.*specialist/i);
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
      
      return (
        <div className="space-y-4">
          {Object.entries(tierGroups).map(([tier, data]) => (
            <div key={tier} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 font-semibold text-sm">
                {tier} ({data[0].tierType})
              </div>
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
                    {data.map((row, index) => (
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
          ))}
          
          {/* Debug information */}
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-blue-600">Debug: View Original HTML</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap text-xs">
              {text}
            </pre>
          </details>
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
          <details className="text-xs">
            <summary className="cursor-pointer text-blue-600">Debug: View Raw HTML</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap text-xs">
              {text}
            </pre>
          </details>
        </div>
      );
    }
  }
  
  // Clean HTML tags for non-pharmaceutical data
  let cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  // Add space between number and dollar sign for better separation (e.g., "5$0" -> "5 $0")
  cleanText = cleanText.replace(/(\d)(\$)/g, '$1 $2');
  
  // Add line breaks between separate dollar amounts (e.g., "20 $214" -> "20\n$214")
  cleanText = cleanText.replace(/(\d+)\s+(\$[\d,]+)/g, '$1\n$2');
  
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
              // - Percentage ranges: 0-20%, 10-50%
              const parts = line.split(/(\$[\d,]+(?:\.\d{2})?(?:-(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+-?\d*%)/g);
              
              return (
                <div key={lineIndex}>
                  {parts.map((part, partIndex) => {
                    // Check if this part is a dollar amount, dollar range, percentage, or percentage range
                    if (/^(\$[\d,]+(?:\.\d{2})?(?:-(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+-?\d*%)$/.test(part)) {
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
  const [loading, setLoading] = useState(true);

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

  const fieldMappings = [
    {
      column: 'Plan Info',
      field: 'plan_name + organization_name + rating',
      value: selectedPlan ? `${selectedPlan.plan_name} | ${selectedPlan.organization_name} | ${selectedPlan.overall_star_rating}⭐` : 'N/A'
    },
    {
      column: 'Monthly Premium',
      field: 'month_rate',
      value: selectedPlan ? formatCurrency(selectedPlan.month_rate) : 'N/A'
    },
    {
      column: 'Annual Cost',
      field: 'month_rate * 12',
      value: selectedPlan ? formatCurrency(selectedPlan.month_rate * 12) : 'N/A'
    },
    {
      column: 'Max Out-of-Pocket',
      field: 'in_network_moop',
      value: selectedPlan ? selectedPlan.in_network_moop : 'N/A'
    },
    {
      column: 'Drug Deductible',
      field: 'annual_drug_deductible',
      value: selectedPlan ? getDrugDeductible(selectedPlan) : 'N/A'
    },
    {
      column: 'Medical Deductible',
      field: 'benefits["Health Plan Deductible"]',
      value: selectedPlan ? getMedicalDeductible(selectedPlan) : 'N/A'
    },
    {
      column: 'Primary Care Co-pay',
      field: 'benefits["Doctor\'s office visits"]',
      value: selectedPlan ? getPrimaryCareData(selectedPlan) : 'N/A'
    },
    {
      column: 'Specialist Co-pay',
      field: 'benefits["Doctor\'s office visits"]',
      value: selectedPlan ? getSpecialistCareData(selectedPlan) : 'N/A'
    },
    {
      column: 'OTC Benefit',
      field: 'benefits["Otc Items"]',
      value: selectedPlan ? getOTCBenefit(selectedPlan) : 'N/A'
    },
    {
      column: 'Dental',
      field: 'benefits["Comprehensive Dental Service"]',
      value: selectedPlan ? (hasBenefitType(selectedPlan, 'Comprehensive Dental Service') ? '✅' : '❌') : 'N/A'
    },
    {
      column: 'Vision',
      field: 'benefits["Vision"]',
      value: selectedPlan ? (hasBenefitType(selectedPlan, 'Vision') ? '✅' : '❌') : 'N/A'
    },
    {
      column: 'Hearing',
      field: 'benefits["Hearing services"]',
      value: selectedPlan ? (hasBenefitType(selectedPlan, 'Hearing services') ? '✅' : '❌') : 'N/A'
    },
    {
      column: 'Transport',
      field: 'benefits["Transportation"]',
      value: selectedPlan ? (hasBenefitType(selectedPlan, 'Transportation') ? '✅' : '❌') : 'N/A'
    }
  ];

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medicare Advantage Field Mapping Test</h1>
        <Badge variant="outline">
          {plans.length} Plans Loaded
        </Badge>
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Plan to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {plans.map((plan) => {
                  // Check if this plan has pharmaceutical data with dollar amounts or percentages
                  const pharmaData = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs')?.full_description || '';
                  const hasDollarAmounts = pharmaData.includes('$') && pharmaData.match(/\$[1-9]\d*/);
                  const hasPercentages = pharmaData.includes('%');
                  const hasRealValues = hasDollarAmounts || hasPercentages;
                  
                  return (
                    <Button
                      key={plan.key}
                      variant={selectedPlan?.key === plan.key ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{plan.plan_name}</div>
                          {hasRealValues && (
                            <span className="text-green-600 text-xs">
                              💊{hasDollarAmounts ? '$' : ''}{hasPercentages ? '%' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{plan.organization_name}</div>
                        <div className="text-xs">{plan.overall_star_rating}⭐ | {formatCurrency(plan.month_rate)}/mo</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Field Mapping Results */}
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>API Field</TableHead>
                    <TableHead>Extracted Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldMappings.map((mapping, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mapping.column}</TableCell>
                      <TableCell className="text-xs font-mono">{mapping.field}</TableCell>
                      <TableCell>{mapping.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raw Benefit Types Analysis */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Benefit Types in Selected Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedPlan.benefits.map((benefit, index) => {
                // Check if this is pharmaceutical data that needs wider display
                const isPharmaData = benefit.benefit_type === 'Outpatient prescription drugs' || 
                                   (benefit.full_description && benefit.full_description.includes('Tier ') && benefit.full_description.includes('Not Supported'));
                
                return (
                  <div key={index} className={`p-3 border rounded ${isPharmaData ? 'col-span-full' : ''}`}>
                    <div className="font-medium text-sm">{benefit.benefit_type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      PD Display: {benefit.pd_view_display ? '✅' : '❌'}
                    </div>
                    {benefit.summary_description?.in_network && (
                      <div className="text-xs mt-1 p-2 bg-green-50 rounded">
                        <strong>In-Network:</strong>
                        <div className="mt-1">
                          {formatBenefitText(benefit.summary_description.in_network)}
                        </div>
                      </div>
                    )}
                    {benefit.summary_description?.out_network && (
                      <div className="text-xs mt-1 p-2 bg-blue-50 rounded">
                        <strong>Out-Network:</strong>
                        <div className="mt-1">
                          {formatBenefitText(benefit.summary_description.out_network)}
                        </div>
                      </div>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600">View Full Description</summary>
                      <div className="text-xs mt-1 p-2 bg-gray-50 rounded">
                        {formatBenefitText(benefit.full_description)}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefit Detection Logic Analysis */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Benefit Detection Logic Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Legend:</strong></p>
                <p>✅ = Has actual coverage | ⚠️ = Listed but no coverage | ❌ = Not listed</p>
                <p>PD: T/F = pd_view_display true/false</p>
              </div>
              
              {/* Test specific benefits known to have edge cases */}
              {['Vision', 'Dental', 'Comprehensive Dental Service', 'Otc Items', 'Transportation', 'Hearing services'].map(testBenefit => {
                const benefit = selectedPlan.benefits.find(b => 
                  b.benefit_type.toLowerCase() === testBenefit.toLowerCase() ||
                  b.benefit_type.toLowerCase().includes(testBenefit.toLowerCase())
                );
                
                if (!benefit) return null;
                
                const hasActualCoverage = hasBenefitType(selectedPlan, testBenefit);
                
                return (
                  <div key={testBenefit} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{benefit.benefit_type}</span>
                      <div className="flex items-center gap-2">
                        <span>{hasActualCoverage ? '✅ Has Coverage' : '⚠️ No Coverage'}</span>
                        <span className="text-xs bg-blue-100 px-1 rounded">
                          PD: {benefit.pd_view_display ? 'True' : 'False'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      {benefit.summary_description?.in_network && (
                        <div className="p-2 bg-green-50 rounded">
                          <strong>In-Network Summary:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.in_network)}
                          </div>
                        </div>
                      )}
                      {benefit.summary_description?.out_network && (
                        <div className="p-2 bg-blue-50 rounded">
                          <strong>Out-Network Summary:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.out_network)}
                          </div>
                        </div>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">View Full Description</summary>
                        <div className="mt-1 p-2 bg-gray-50 rounded">
                          {formatBenefitText(benefit.full_description)}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
                const isAvailable = hasBenefitType(selectedPlan, benefitType);
                const benefit = selectedPlan.benefits.find(b => 
                  b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                  b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                );
                
                // For pharmaceutical data, use the original full_description with HTML intact
                const benefitData = isAvailable && benefit ? benefit.full_description : 'Not Available';
                
                // Debug pharmaceutical data
                if (benefit) {
                  console.log('=== PHARMACEUTICAL BENEFIT DEBUG ===');
                  console.log('Benefit type:', benefit.benefit_type);
                  console.log('Full description length:', benefit.full_description?.length);
                  console.log('Full description preview:', benefit.full_description?.substring(0, 500));
                  console.log('Summary description:', benefit.summary_description);
                  console.log('PD view display:', benefit.pd_view_display);
                }
                
                return (
                  <div key={`pharma-${index}`} className={`p-3 border rounded w-full ${isAvailable ? 'bg-green-50 border-green-200' : benefit ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{benefitType}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{isAvailable ? '✅' : benefit ? '⚠️' : '❌'}</span>
                        {benefit && (
                          <span className="text-xs bg-blue-100 px-1 rounded">
                            PD: {benefit.pd_view_display ? 'T' : 'F'}
                          </span>
                        )}
                      </div>
                    </div>
                    {benefit && (
                      <div className="text-xs text-gray-600">
                        <div className="mb-1">
                          <strong>Status:</strong> {isAvailable ? 'Has Coverage' : 'Listed but No Coverage'}
                        </div>
                        {isAvailable && (
                          <div>
                            {formatBenefitText(benefitData)}
                          </div>
                        )}
                        {!isAvailable && benefit && (
                          <div className="text-gray-500 italic">
                            Benefit listed but appears to have no coverage based on content analysis
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Grid layout for other benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBenefitTypes.filter(benefitType => benefitType !== 'Outpatient prescription drugs').map((benefitType, index) => {
                  const isAvailable = hasBenefitType(selectedPlan, benefitType);
                  const benefitData = isAvailable ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                  const benefit = selectedPlan.benefits.find(b => 
                    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                  );
                  
                  return (
                    <div key={index} className={`p-3 border rounded ${isAvailable ? 'bg-green-50 border-green-200' : benefit ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{benefitType}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{isAvailable ? '✅' : benefit ? '⚠️' : '❌'}</span>
                        {benefit && (
                          <span className="text-xs bg-blue-100 px-1 rounded">
                            PD: {benefit.pd_view_display ? 'T' : 'F'}
                          </span>
                        )}
                      </div>
                    </div>
                    {benefit && (
                      <div className="text-xs text-gray-600">
                        <div className="mb-1">
                          <strong>Status:</strong> {isAvailable ? 'Has Coverage' : 'Listed but No Coverage'}
                        </div>
                        {isAvailable && (
                          <div>
                            {formatBenefitText(benefitData)}
                          </div>
                        )}
                        {!isAvailable && benefit && (
                          <div className="text-gray-500 italic">
                            Benefit listed but appears to have no coverage based on content analysis
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
