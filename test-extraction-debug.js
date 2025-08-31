/**
 * Debug test for dental quote extraction
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts essential fields from a single raw dental quote (debug version)
 */
function extractQuoteFieldsDebug(rawQuote) {
  console.log('=== DEBUG: Processing quote ===');
  console.log('Quote key:', rawQuote.key);
  console.log('Plan name:', rawQuote.plan_name);
  
  // Extract company information
  const companyBase = rawQuote.company_base || {};
  console.log('Company base exists:', !!rawQuote.company_base);
  console.log('Company name:', companyBase.name);
  
  const parentCompanyBase = companyBase.parent_company_base || null;
  console.log('Parent company exists:', !!parentCompanyBase);
  
  // Extract base plans
  const basePlans = (rawQuote.base_plans || []).map((plan) => {
    console.log('Processing plan:', plan.name);
    return {
      benefitNotes: plan.benefit_notes || '',
      benefits: (plan.benefits || []).map((benefit) => {
        console.log('Processing benefit rate:', benefit.rate);
        return {
          amount: benefit.amount || '',
          dependentRiders: benefit.dependent_riders || [],
          quantifier: benefit.quantifier || '',
          rate: benefit.rate || 0
        };
      }),
      included: plan.included || false,
      limitationNotes: plan.limitation_notes || '',
      name: plan.name || '',
      note: plan.note || null
    };
  });
  
  const result = {
    // Core identifiers
    key: rawQuote.key || '',
    age: rawQuote.age || 0,
    gender: rawQuote.gender || null,
    tobacco: rawQuote.tobacco || null,
    
    // Plan details
    planName: rawQuote.plan_name || '',
    productKey: rawQuote.product_key || '',
    
    // Base Plans (detailed plan information)
    basePlans,
    
    // Company information (detailed)
    company: rawQuote.company || '',
    companyBase: {
      key: companyBase.key || '',
      ambestOutlook: companyBase.ambest_outlook || '',
      ambestRating: companyBase.ambest_rating || '',
      businessType: companyBase.business_type || '',
      customerComplaintRatio: companyBase.customer_complaint_ratio || null,
      customerSatisfactionRatio: companyBase.customer_satisfaction_ratio || null,
      naic: companyBase.naic || '',
      name: companyBase.name || '',
      nameFull: companyBase.name_full || '',
      parentCompany: companyBase.parent_company || '',
      parentCompanyBase: parentCompanyBase ? {
        key: parentCompanyBase.key || '',
        code: parentCompanyBase.code || '',
        establishedYear: parentCompanyBase.established_year || 0,
        lastModified: parentCompanyBase.last_modified || '',
        name: parentCompanyBase.name || ''
      } : null,
      spRating: companyBase.sp_rating || '',
      type: companyBase.type || ''
    },
    
    // Basic metadata
    state: rawQuote.state || '',
    coveredMembers: rawQuote.covered_members || ''
  };
  
  console.log('=== DEBUG: Result summary ===');
  console.log('Company name in result:', result.companyBase.name);
  console.log('Plan name in result:', result.planName);
  console.log('Premium in result:', result.basePlans?.[0]?.benefits?.[0]?.rate);
  
  return result;
}

// Read the raw API response
const rawDataPath = path.join(process.cwd(), 'docs', 'dental-raw-api-response.md');

try {
  console.log('🦷 Testing Dental Quote Extraction (Debug)...\n');
  
  // Read the markdown file
  let fileContent = fs.readFileSync(rawDataPath, 'utf8');
  
  // Extract JSON from markdown
  const jsonStart = fileContent.indexOf('{');
  const jsonEnd = fileContent.lastIndexOf('}') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error('No JSON found in markdown file');
  }
  
  const jsonContent = fileContent.slice(jsonStart, jsonEnd);
  console.log(`📦 JSON content size: ${jsonContent.length.toLocaleString()} characters`);
  
  // Parse the JSON
  const rawResponse = JSON.parse(jsonContent);
  console.log(`📊 Raw quotes found: ${rawResponse.quotes?.length || 0}`);
  
  // Test extraction on first quote
  if (rawResponse.quotes && rawResponse.quotes.length > 0) {
    const optimizedQuote = extractQuoteFieldsDebug(rawResponse.quotes[0]);
    
    console.log('\n✅ Extraction Results:');
    console.log(`   Company: ${optimizedQuote.companyBase.name}`);
    console.log(`   Full Name: ${optimizedQuote.companyBase.nameFull}`);
    console.log(`   Plan: ${optimizedQuote.planName}`);
    console.log(`   Premium: $${optimizedQuote.basePlans?.[0]?.benefits?.[0]?.rate}/month`);
    console.log(`   Rating: ${optimizedQuote.companyBase.ambestRating}`);
    console.log(`   NAIC: ${optimizedQuote.companyBase.naic}`);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Error details:', error);
}
