const fs = require('fs');

console.log('🧹 Cleaning med_supp_state_market_data and med_supp_national_market_data from JSON file...');

try {
  // Read the file
  const data = fs.readFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', 'utf8');
  console.log(`📖 Read file: ${Math.round(data.length / 1024)}KB`);
  
  // Parse JSON
  const quotes = JSON.parse(data);
  console.log(`📊 Found ${quotes.length} quotes`);
  
  let removedStateCount = 0;
  let removedNationalCount = 0;
  
  // Function to recursively remove market data
  function cleanObject(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (Array.isArray(obj)) {
      obj.forEach(cleanObject);
    } else {
      // Remove med_supp_state_market_data if it exists
      if ('med_supp_state_market_data' in obj) {
        delete obj.med_supp_state_market_data;
        removedStateCount++;
      }
      
      // Remove med_supp_national_market_data if it exists
      if ('med_supp_national_market_data' in obj) {
        delete obj.med_supp_national_market_data;
        removedNationalCount++;
      }
      
      // Recursively clean all nested objects
      Object.values(obj).forEach(cleanObject);
    }
  }
  
  // Clean the entire structure
  cleanObject(quotes);
  
  console.log(`🗑️ Removed ${removedStateCount} med_supp_state_market_data arrays`);
  console.log(`🗑️ Removed ${removedNationalCount} med_supp_national_market_data objects`);
  
  // Write the cleaned data back
  const cleanedData = JSON.stringify(quotes, null, 2);
  fs.writeFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', cleanedData, 'utf8');
  
  console.log(`✅ Successfully cleaned file: ${Math.round(cleanedData.length / 1024)}KB`);
  console.log(`💾 Saved ${Math.round((data.length - cleanedData.length) / 1024)}KB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
