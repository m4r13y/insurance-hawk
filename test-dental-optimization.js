/**
 * Test script for dental quote optimization
 * Demonstrates the massive storage savings achieved by filtering out bloat data
 */

import fs from 'fs';
import path from 'path';
import { optimizeDentalQuotes, createQuoteSummary, sortQuotesByPremium } from './src/lib/dental-quote-optimizer.js';

// Read the raw API response
const rawDataPath = path.join(process.cwd(), 'docs', 'dental-raw-api-response.md');

try {
  console.log('🦷 Testing Dental Quote Optimization...\n');
  
  // Read the markdown file
  let fileContent = fs.readFileSync(rawDataPath, 'utf8');
  
  // Extract JSON from markdown (remove ```markdown and ``` wrapper)
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
  
  // Show sample quotes
  console.log(`\n📋 Sample Optimized Quotes:`);
  const sortedQuotes = sortQuotesByPremium(optimizedResult.quotes);
  
  sortedQuotes.slice(0, 5).forEach((quote, index) => {
    const summary = createQuoteSummary(quote);
    console.log(`   ${index + 1}. ${summary.companyName}`);
    console.log(`      Plan: ${summary.planName}`);
    console.log(`      Premium: $${summary.monthlyPremium}/month`);
    console.log(`      Max Benefit: $${summary.annualMaximum}`);
    console.log(`      Rating: ${summary.ambestRating}`);
    console.log(`      State: ${summary.state}`);
    console.log('');
  });
  
  // Show what was removed
  console.log(`🗑️  Removed bloat data:`);
  console.log(`   ❌ Medicare supplement market data (7 years × 50 states)`);
  console.log(`   ❌ Detailed underwriting data arrays`);
  console.log(`   ❌ Contextual data objects`);
  console.log(`   ❌ County inclusion/exclusion arrays`);
  console.log(`   ❌ ZIP code arrays`);
  console.log(`   ❌ Parent company nested data`);
  
  console.log(`\n✅ Kept essential data:`);
  console.log(`   ✅ Monthly premium rates`);
  console.log(`   ✅ Plan names and details`);
  console.log(`   ✅ Company information`);
  console.log(`   ✅ Benefit descriptions (HTML)`);
  console.log(`   ✅ Limitation notes`);
  console.log(`   ✅ A.M. Best ratings`);
  console.log(`   ✅ Application links`);
  
  // Write optimized data to file for comparison
  const optimizedPath = path.join(process.cwd(), 'docs', 'dental-optimized-response.json');
  fs.writeFileSync(optimizedPath, JSON.stringify(optimizedResult, null, 2));
  console.log(`\n💾 Optimized data saved to: ${optimizedPath}`);
  
  console.log(`\n🎉 Optimization complete! Storage usage reduced by ${optimizedResult.compressionRatio}!`);
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
