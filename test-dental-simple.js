/**
 * Simple test script for dental quote optimization (CommonJS)
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts essential fields from a single raw dental quote
 */
function extractQuoteFields(rawQuote) {
  // Extract company information
  const companyBase = rawQuote.company_base || {};
  const parentCompanyBase = companyBase.parent_company_base || null;
  
  // Extract base plans
  const basePlans = (rawQuote.base_plans || []).map((plan) => ({
    benefitNotes: plan.benefit_notes || '',
    benefits: (plan.benefits || []).map((benefit) => ({
      amount: benefit.amount || '',
      dependentRiders: benefit.dependent_riders || [],
      quantifier: benefit.quantifier || '',
      rate: benefit.rate || 0
    })),
    included: plan.included || false,
    limitationNotes: plan.limitation_notes || '',
    name: plan.name || '',
    note: plan.note || null
  }));
  
  return {
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
    
    // Geographic data
    contextualData: rawQuote.contextual_data || null,
    county: rawQuote.county || [],
    countyExcluded: rawQuote.county_excluded || [],
    
    // Coverage details
    coveredMembers: rawQuote.covered_members || '',
    
    // Dates and metadata
    createdDate: rawQuote.created_date || '',
    effectiveDate: rawQuote.effective_date || '',
    expiresDate: rawQuote.expires_date || '',
    lastModified: rawQuote.last_modified || '',
    
    // Application and document info
    eAppLink: rawQuote.e_app_link || '',
    hasBrochure: rawQuote.has_brochure || false,
    hasPdfApp: rawQuote.has_pdf_app || false,
    hasZip3: rawQuote.has_zip3 || false,
    hasZip5: rawQuote.has_zip5 || false,
    
    // Discount and pricing
    hhDiscount: rawQuote.hh_discount || 0,
    
    // Additional coverage options
    riders: rawQuote.riders || [],
    
    // Location
    state: rawQuote.state || '',
    
    // ZIP code data (keeping minimal)
    zip3: rawQuote.zip3 || [],
    zip3Excluded: rawQuote.zip3_excluded || [],
    zip5: rawQuote.zip5 || [],
    zip5Excluded: rawQuote.zip5_excluded || []
  };
}

/**
 * Optimizes raw dental quotes response
 */
function optimizeDentalQuotes(rawResponse) {
  try {
    // Calculate original size
    const originalJson = JSON.stringify(rawResponse);
    const originalSize = originalJson.length;
    
    // Validate response structure
    if (!rawResponse || !rawResponse.quotes || !Array.isArray(rawResponse.quotes)) {
      return {
        success: false,
        quotes: [],
        error: 'Invalid response structure - missing quotes array'
      };
    }
    
    // Extract optimized quotes
    const optimizedQuotes = rawResponse.quotes.map(rawQuote => {
      return extractQuoteFields(rawQuote);
    });
    
    // Calculate optimized size
    const optimizedResponse = {
      success: true,
      quotes: optimizedQuotes
    };
    const optimizedJson = JSON.stringify(optimizedResponse);
    const optimizedSize = optimizedJson.length;
    
    // Calculate compression ratio
    const compressionRatio = originalSize > 0 
      ? `${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`
      : '0%';
    
    return {
      success: true,
      quotes: optimizedQuotes,
      originalSize,
      optimizedSize,
      compressionRatio
    };
    
  } catch (error) {
    console.error('❌ Error optimizing dental quotes:', error);
    return {
      success: false,
      quotes: [],
      error: error.message || 'Failed to optimize dental quotes'
    };
  }
}

// Read the raw API response
const rawDataPath = path.join(process.cwd(), 'docs', 'dental-raw-api-response.md');

try {
  console.log('🦷 Testing Dental Quote Optimization...\n');
  
  // Read the markdown file
  let fileContent = fs.readFileSync(rawDataPath, 'utf8');
  
  // Extract JSON from markdown
  const jsonStart = fileContent.indexOf('{');
  const jsonEnd = fileContent.lastIndexOf('}') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error('No JSON found in markdown file');
  }
  
  const jsonContent = fileContent.slice(jsonStart, jsonEnd);
  console.log(`📄 Raw file size: ${fileContent.length.toLocaleString()} characters`);
  console.log(`📦 JSON content size: ${jsonContent.length.toLocaleString()} characters`);
  
  // Parse the JSON
  const rawResponse = JSON.parse(jsonContent);
  console.log(`📊 Raw quotes found: ${rawResponse.quotes?.length || 0}`);
  
  // Show what a raw quote looks like
  if (rawResponse.quotes && rawResponse.quotes.length > 0) {
    const sampleQuote = rawResponse.quotes[0];
    console.log(`\n🔍 Sample raw quote structure:`);
    console.log(`   Keys: ${Object.keys(sampleQuote).join(', ')}`);
    
    // Debug company structure
    if (sampleQuote.company_base) {
      console.log(`   🏢 Company base keys: ${Object.keys(sampleQuote.company_base).join(', ')}`);
      console.log(`   🏢 Company name: ${sampleQuote.company_base.name}`);
    }
    
    // Debug base plans structure
    if (sampleQuote.base_plans && sampleQuote.base_plans.length > 0) {
      console.log(`   📋 Base plans count: ${sampleQuote.base_plans.length}`);
      console.log(`   📋 First plan keys: ${Object.keys(sampleQuote.base_plans[0]).join(', ')}`);
      if (sampleQuote.base_plans[0].benefits) {
        console.log(`   💰 Benefits count: ${sampleQuote.base_plans[0].benefits.length}`);
        if (sampleQuote.base_plans[0].benefits[0]) {
          console.log(`   💰 First benefit: rate=${sampleQuote.base_plans[0].benefits[0].rate}, amount=${sampleQuote.base_plans[0].benefits[0].amount}`);
        }
      }
    }
    
    // Check for the bloat data
    if (sampleQuote.company_base && sampleQuote.company_base.med_supp_market_data) {
      console.log(`   🚨 BLOAT DETECTED: med_supp_market_data array found!`);
      const marketData = sampleQuote.company_base.med_supp_market_data;
      console.log(`   📊 Market data years: ${marketData.length}`);
      if (marketData.length > 0 && marketData[0].med_supp_state_market_data) {
        console.log(`   📊 States per year: ${marketData[0].med_supp_state_market_data.length}`);
      }
    }
  }
  
  // Optimize the quotes
  const optimizedResult = optimizeDentalQuotes(rawResponse);
  
  if (!optimizedResult.success) {
    console.error('❌ Optimization failed:', optimizedResult.error);
    process.exit(1);
  }
  
  console.log(`\n✅ Optimization Results:`);
  console.log(`   📈 Original size: ${optimizedResult.originalSize?.toLocaleString()} chars`);
  console.log(`   📉 Optimized size: ${optimizedResult.optimizedSize?.toLocaleString()} chars`);
  console.log(`   🎯 Space saved: ${optimizedResult.compressionRatio}`);
  console.log(`   🦷 Quotes processed: ${optimizedResult.quotes.length}`);
  
  // Show sample optimized quotes
  console.log(`\n📋 Sample Optimized Quotes:`);
  optimizedResult.quotes.slice(0, 3).forEach((quote, index) => {
    console.log(`\n=== Quote ${index + 1} Debug ===`);
    console.log('Quote keys:', Object.keys(quote));
    console.log('Company base keys:', Object.keys(quote.companyBase || {}));
    console.log('Base plans length:', quote.basePlans?.length);
    
    const basePlan = quote.basePlans?.[0];
    const benefit = basePlan?.benefits?.[0];
    const monthlyPremium = benefit?.rate || 0;
    const annualMax = benefit?.amount || '0';
    
    console.log(`   ${index + 1}. Company: ${quote.companyBase?.name || 'Unknown Company'}`);
    console.log(`      Full Name: ${quote.companyBase?.nameFull || 'N/A'}`);
    console.log(`      Plan: ${quote.planName}`);
    console.log(`      Plan Details: ${basePlan?.name || 'N/A'}`);
    console.log(`      Premium: $${monthlyPremium}/month`);
    console.log(`      Annual Max: $${annualMax}`);
    console.log(`      Rating: ${quote.companyBase?.ambestRating || 'N/A'} (${quote.companyBase?.ambestOutlook || 'N/A'})`);
    console.log(`      NAIC: ${quote.companyBase?.naic || 'N/A'}`);
    console.log(`      Business Type: ${quote.companyBase?.businessType || 'N/A'}`);
    console.log(`      State: ${quote.state}`);
    console.log(`      Covered Members: ${quote.coveredMembers}`);
    if (quote.companyBase?.parentCompanyBase) {
      console.log(`      Parent Company: ${quote.companyBase.parentCompanyBase.name} (${quote.companyBase.parentCompanyBase.code})`);
    }
    console.log('');
  });
  
  console.log(`🎉 Optimization complete! Storage usage reduced by ${optimizedResult.compressionRatio}!`);
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
