const fs = require('fs');

console.log('🧹 Cleaning company fields from JSON file...');

try {
  // Read the file
  const data = fs.readFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', 'utf8');
  console.log(`📖 Read file: ${Math.round(data.length / 1024)}KB`);
  
  // Parse JSON
  const quotes = JSON.parse(data);
  console.log(`📊 Found ${quotes.length} quotes`);
  
  let removedImageUrlCount = 0;
  let removedComplaintRatioCount = 0;
  let removedSatisfactionRatioCount = 0;
  let removedDefaultResourcesCount = 0;
  
  // Function to recursively remove specified fields
  function cleanObject(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (Array.isArray(obj)) {
      obj.forEach(cleanObject);
    } else {
      // Remove company_image_url if it exists
      if ('company_image_url' in obj) {
        delete obj.company_image_url;
        removedImageUrlCount++;
      }
      
      // Remove customer_complaint_ratio if it exists
      if ('customer_complaint_ratio' in obj) {
        delete obj.customer_complaint_ratio;
        removedComplaintRatioCount++;
      }
      
      // Remove customer_satisfaction_ratio if it exists
      if ('customer_satisfaction_ratio' in obj) {
        delete obj.customer_satisfaction_ratio;
        removedSatisfactionRatioCount++;
      }
      
      // Remove default_resources if it exists
      if ('default_resources' in obj) {
        delete obj.default_resources;
        removedDefaultResourcesCount++;
      }
      
      // Recursively clean all nested objects
      Object.values(obj).forEach(cleanObject);
    }
  }
  
  // Clean the entire structure
  cleanObject(quotes);
  
  console.log(`🗑️ Removed ${removedImageUrlCount} company_image_url fields`);
  console.log(`🗑️ Removed ${removedComplaintRatioCount} customer_complaint_ratio fields`);
  console.log(`🗑️ Removed ${removedSatisfactionRatioCount} customer_satisfaction_ratio fields`);
  console.log(`🗑️ Removed ${removedDefaultResourcesCount} default_resources objects`);
  
  // Write the cleaned data back
  const cleanedData = JSON.stringify(quotes, null, 2);
  fs.writeFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', cleanedData, 'utf8');
  
  console.log(`✅ Successfully cleaned file: ${Math.round(cleanedData.length / 1024)}KB`);
  console.log(`💾 Saved ${Math.round((data.length - cleanedData.length) / 1024)}KB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
