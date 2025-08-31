/**
 * Test script for dental quote optimization
 * Demonstrates the storage savings from removing unnecessary data
 */

import fs from 'fs';
import path from 'path';
import { optimizeDentalQuotes, calculateStorageSavings } from './lib/services/optimize-dental-quotes.js';

async function testDentalQuoteOptimization() {
  console.log('🦷 Testing Dental Quote Data Optimization...\n');

  try {
    // Read the raw API response
    const rawDataPath = path.join(process.cwd(), 'docs', 'dental-raw-api-response.md');
    let rawContent = fs.readFileSync(rawDataPath, 'utf8');
    
    // Extract JSON from markdown (remove markdown formatting)
    const jsonStart = rawContent.indexOf('{');
    const jsonEnd = rawContent.lastIndexOf('}') + 1;
    const jsonContent = rawContent.slice(jsonStart, jsonEnd);
    
    const originalResponse = JSON.parse(jsonContent);
    console.log('✅ Successfully loaded raw API response');
    console.log(`📊 Original quotes count: ${originalResponse.quotes?.length || 0}`);
    
    // Optimize the data
    const optimizedResponse = optimizeDentalQuotes(originalResponse);
    console.log(`📊 Optimized quotes count: ${optimizedResponse.quotes?.length || 0}`);
    
    // Calculate storage savings
    const savings = calculateStorageSavings(originalResponse, optimizedResponse);
    
    console.log('\n💾 Storage Analysis:');
    console.log(`📏 Original size: ${savings.originalSize.toLocaleString()} characters`);
    console.log(`📦 Optimized size: ${savings.optimizedSize.toLocaleString()} characters`);
    console.log(`💰 Space saved: ${savings.savings.toLocaleString()} characters`);
    console.log(`📈 Reduction: ${savings.savingsPercentage}`);
    console.log(`🗜️  Compression ratio: ${savings.compressionRatio}`);
    
    // Show what was preserved in the first quote
    if (optimizedResponse.quotes.length > 0) {
      const firstQuote = optimizedResponse.quotes[0];
      console.log('\n🔍 Sample Optimized Quote Data:');
      console.log(`🆔 Quote Key: ${firstQuote.key}`);
      console.log(`👤 Age: ${firstQuote.age}`);
      console.log(`📍 State: ${firstQuote.state}`);
      console.log(`📋 Plan: ${firstQuote.plan_name}`);
      console.log(`🏢 Company: ${firstQuote.company_base?.name}`);
      console.log(`💰 Monthly Premium: $${firstQuote.base_plans?.[0]?.benefits?.[0]?.rate || 'N/A'}`);
      console.log(`⭐ Rating: ${firstQuote.company_base?.ambest_rating || 'N/A'}`);
    }
    
    // Show what massive data was removed
    console.log('\n🗑️  Removed Bloat Data:');
    const originalCompany = originalResponse.quotes?.[0]?.company_base;
    if (originalCompany?.med_supp_market_data) {
      console.log(`📊 Medicare market data years: ${originalCompany.med_supp_market_data.length}`);
      const stateDataCount = originalCompany.med_supp_market_data
        .reduce((total, year) => total + (year.med_supp_state_market_data?.length || 0), 0);
      console.log(`🗺️  State market records removed: ${stateDataCount}`);
      console.log(`❌ This data is 100% irrelevant to dental quotes!`);
    }
    
    // Write optimized data to file for comparison
    const optimizedPath = path.join(process.cwd(), 'docs', 'dental-optimized-response.json');
    fs.writeFileSync(optimizedPath, JSON.stringify(optimizedResponse, null, 2));
    console.log(`\n💾 Optimized data saved to: ${optimizedPath}`);
    
    console.log('\n✅ Optimization test completed successfully!');
    console.log('🚀 This optimized data is ready for localStorage storage');
    
  } catch (error) {
    console.error('❌ Error during optimization test:', error.message);
    process.exit(1);
  }
}

// Run the test
testDentalQuoteOptimization();
