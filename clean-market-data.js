const fs = require('fs');

console.log('🧹 Cleaning med_supp_market_data from JSON file...');

try {
  // Read the file
  const data = fs.readFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', 'utf8');
  console.log(`📖 Read file: ${Math.round(data.length / 1024)}KB`);
  
  // Parse JSON
  const quotes = JSON.parse(data);
  console.log(`📊 Found ${quotes.length} quotes`);
  
  let removedCount = 0;
  
  // Function to recursively remove med_supp_market_data
  function cleanObject(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (Array.isArray(obj)) {
      obj.forEach(cleanObject);
    } else {
      // Remove med_supp_market_data if it exists
      if ('med_supp_market_data' in obj) {
        delete obj.med_supp_market_data;
        removedCount++;
      }
      
      // Recursively clean all nested objects
      Object.values(obj).forEach(cleanObject);
    }
  }
  
  // Clean the entire structure
  cleanObject(quotes);
  
  console.log(`🗑️ Removed ${removedCount} med_supp_market_data arrays`);
  
  // Write the cleaned data back
  const cleanedData = JSON.stringify(quotes, null, 2);
  fs.writeFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', cleanedData, 'utf8');
  
  console.log(`✅ Successfully cleaned file: ${Math.round(cleanedData.length / 1024)}KB`);
  console.log(`💾 Saved ${Math.round((data.length - cleanedData.length) / 1024)}KB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
