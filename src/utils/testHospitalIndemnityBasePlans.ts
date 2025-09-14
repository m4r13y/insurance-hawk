/**
 * Test utilities for Hospital Indemnity Base Plan Detection System
 * Validates that the enhanced plan builder can handle all base plan types
 */

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import {
  detectBasePlanType,
  getPrimaryBenefitSource,
  getAvailableDailyBenefits,
  getPremiumForDailyBenefit,
  analyzeQuoteStructure,
  hasValidBenefitOptions,
  BasePlanType
} from './hospitalIndemnityBasePlans';

// Test quotes representing each of the 3 base plan types
export const createTestQuotes = (): OptimizedHospitalIndemnityQuote[] => {
  const baseQuoteTemplate = {
    id: "test-quote",
    companyName: "Test Insurance Co",
    companyFullName: "Test Insurance Company",
    age: 45,
    gender: "M" as const,
    state: "TX",
    tobacco: false,
    monthlyPremium: 31.00,
    policyFee: 25,
    hhDiscount: 0.1,
    ambest: {
      rating: "A-",
      outlook: "Stable"
    },
    lastModified: "2025-01-01T00:00:00Z",
    hasApplications: {
      brochure: false,
      pdfApp: false,
      eApp: false
    },
    riders: []
  };

  return [
    // Type 1: Hospital Confinement Benefit (most common - 27 occurrences)
    {
      ...baseQuoteTemplate,
      id: "test-hospital-confinement",
      planName: "07 Benefit Days - Hospital Confinement",
      basePlans: [{
        name: "Hospital Confinement Benefit",
        included: true,
        notes: null,
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 15.50 },
          { amount: "200", quantifier: "per Day", rate: 31.00 },
          { amount: "300", quantifier: "per Day", rate: 46.50 }
        ]
      }]
    },

    // Type 2: Inpatient Hospital Confinement Benefits (7 occurrences)
    {
      ...baseQuoteTemplate,
      id: "test-inpatient-confinement",
      planName: "14 Benefit Days - Inpatient Care",
      basePlans: [{
        name: "Inpatient Hospital Confinement Benefits",
        included: true,
        notes: null,
        benefitOptions: [
          { amount: "150", quantifier: "per Day", rate: 22.75 },
          { amount: "250", quantifier: "per Day", rate: 37.50 },
          { amount: "350", quantifier: "per Day", rate: 52.25 }
        ]
      }]
    },

    // Type 3: Hospital Admission Benefit (5 occurrences)
    {
      ...baseQuoteTemplate,
      id: "test-hospital-admission",
      planName: "30 Benefit Days - Admission Based",
      basePlans: [{
        name: "Hospital Admission Benefit",
        included: true,
        notes: null,
        benefitOptions: [
          { amount: "500", quantifier: "per Admission", rate: 18.25 },
          { amount: "750", quantifier: "per Admission", rate: 27.50 },
          { amount: "1000", quantifier: "per Admission", rate: 36.75 }
        ]
      }]
    },

    // Type 4: Hybrid case - primary benefit in riders (when base plan is minimal)
    {
      ...baseQuoteTemplate,
      id: "test-hybrid-rider-base",
      planName: "14 Benefit Days - Rider Primary",
      basePlans: [], // No base plans or minimal base plan
      riders: [
        {
          name: "Hospital Confinement Benefits",
          included: false,
          notes: "Primary benefit as rider",
          benefitOptions: [
            { amount: "125", quantifier: "per Day", rate: 19.50 },
            { amount: "225", quantifier: "per Day", rate: 34.25 },
            { amount: "325", quantifier: "per Day", rate: 49.00 }
          ]
        },
        {
          name: "Ambulance Services Rider",
          included: false,
          notes: "Secondary rider",
          benefitOptions: [
            { amount: "250", quantifier: "per Occurrence", rate: 1.48 }
          ]
        }
      ]
    },

    // Type 5: Invalid quote (no usable benefits)
    {
      ...baseQuoteTemplate,
      id: "test-invalid-quote",
      planName: "Invalid Plan - No Benefits",
      basePlans: [{
        name: "Unknown Benefit Type",
        included: true,
        notes: null,
        benefitOptions: [] // No benefit options
      }],
      riders: []
    }
  ];
};

/**
 * Test all base plan detection functions
 */
export const runBasePlanDetectionTests = () => {
  const testQuotes = createTestQuotes();
  const results: Array<{
    quoteId: string;
    planName: string;
    detectedType: BasePlanType;
    primarySource: any;
    availableBenefits: number[];
    isValid: boolean;
    analysis: any;
  }> = [];

  testQuotes.forEach(quote => {
    const detectedType = detectBasePlanType(quote);
    const primarySource = getPrimaryBenefitSource(quote);
    const availableBenefits = getAvailableDailyBenefits(quote);
    const isValid = hasValidBenefitOptions(quote);
    const analysis = analyzeQuoteStructure(quote);

    results.push({
      quoteId: quote.id,
      planName: quote.planName,
      detectedType,
      primarySource,
      availableBenefits,
      isValid,
      analysis
    });

    // Test premium calculation for each available benefit
    availableBenefits.forEach(benefit => {
      const premium = getPremiumForDailyBenefit(quote, benefit);
      console.log(`Quote ${quote.id} - Benefit $${benefit}: Premium $${premium}`);
    });
  });

  return results;
};

/**
 * Validate expected results
 */
export const validateDetectionResults = () => {
  const results = runBasePlanDetectionTests();
  const validationResults: Array<{
    test: string;
    passed: boolean;
    message: string;
  }> = [];

  // Test 1: Hospital Confinement Benefit detection
  const hospitalConfinementTest = results.find(r => r.quoteId === 'test-hospital-confinement');
  validationResults.push({
    test: 'Hospital Confinement Detection',
    passed: hospitalConfinementTest?.detectedType === 'hospital-confinement',
    message: `Expected 'hospital-confinement', got '${hospitalConfinementTest?.detectedType}'`
  });

  // Test 2: Inpatient Hospital Confinement Benefits detection
  const inpatientTest = results.find(r => r.quoteId === 'test-inpatient-confinement');
  validationResults.push({
    test: 'Inpatient Confinement Detection',
    passed: inpatientTest?.detectedType === 'inpatient-confinement',
    message: `Expected 'inpatient-confinement', got '${inpatientTest?.detectedType}'`
  });

  // Test 3: Hospital Admission Benefit detection
  const admissionTest = results.find(r => r.quoteId === 'test-hospital-admission');
  validationResults.push({
    test: 'Hospital Admission Detection',
    passed: admissionTest?.detectedType === 'hospital-admission',
    message: `Expected 'hospital-admission', got '${admissionTest?.detectedType}'`
  });

  // Test 4: Hybrid rider-base detection
  const hybridTest = results.find(r => r.quoteId === 'test-hybrid-rider-base');
  validationResults.push({
    test: 'Hybrid Rider-Base Detection',
    passed: hybridTest?.detectedType === 'hybrid-rider-base' && hybridTest?.primarySource.source === 'rider',
    message: `Expected 'hybrid-rider-base' with rider source, got '${hybridTest?.detectedType}' with '${hybridTest?.primarySource.source}' source`
  });

  // Test 5: Invalid quote filtering
  const invalidTest = results.find(r => r.quoteId === 'test-invalid-quote');
  validationResults.push({
    test: 'Invalid Quote Filtering',
    passed: !invalidTest?.isValid,
    message: `Expected invalid quote to be filtered out, isValid: ${invalidTest?.isValid}`
  });

  // Test 6: Premium calculations
  const premiumTests = results.filter(r => r.isValid);
  const allHavePremiums = premiumTests.every(r => r.availableBenefits.length > 0);
  validationResults.push({
    test: 'Premium Calculations',
    passed: allHavePremiums,
    message: `All valid quotes should have benefit options, ${premiumTests.length} valid quotes checked`
  });

  // Print results
  console.log('\n=== Hospital Indemnity Base Plan Detection Test Results ===');
  validationResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${result.test} - ${result.message}`);
  });

  const passedTests = validationResults.filter(r => r.passed).length;
  const totalTests = validationResults.length;
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);

  return {
    results,
    validationResults,
    passed: passedTests === totalTests
  };
};

/**
 * Generate summary for debugging
 */
export const generateDetectionSummary = () => {
  const testResults = validateDetectionResults();
  
  console.log('\n=== Detection Summary ===');
  testResults.results.forEach(result => {
    console.log(`\nQuote: ${result.quoteId}`);
    console.log(`Plan: ${result.planName}`);
    console.log(`Type: ${result.detectedType}`);
    console.log(`Source: ${result.primarySource.source}`);
    console.log(`Benefits: [${result.availableBenefits.join(', ')}]`);
    console.log(`Valid: ${result.isValid}`);
    console.log(`Analysis: ${JSON.stringify(result.analysis.basePlanTypeDescription)}`);
  });

  return testResults;
};