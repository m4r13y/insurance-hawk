const fs = require('fs');

// Read the JSON file
const filePath = './src/lib/medigap-quotes-final.json';
let content = fs.readFileSync(filePath, 'utf8');

// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// Remove any leading/trailing whitespace
content = content.trim();

console.log('Original file size:', content.length, 'characters');
console.log('First 100 characters:', JSON.stringify(content.substring(0, 100)));

try {
  const data = JSON.parse(content);
  console.log('Number of quotes:', data.length);
  
  let zip5Count = 0;
  
  // Function to recursively remove zip5 arrays from any object
  function removeZip5Arrays(obj) {
    if (Array.isArray(obj)) {
      return obj.map(removeZip5Arrays);
    } else if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'zip5') {
          zip5Count++;
          // Skip zip5 arrays entirely
          continue;
        } else {
          cleaned[key] = removeZip5Arrays(value);
        }
      }
      return cleaned;
    }
    return obj;
  }
  
  // Clean the data
  const cleanedData = removeZip5Arrays(data);
  
  // Write back to file
  const cleanedContent = JSON.stringify(cleanedData, null, 2);
  fs.writeFileSync(filePath, cleanedContent, 'utf8');
  
  console.log('Cleaned file size:', cleanedContent.length, 'characters');
  console.log('Reduction:', content.length - cleanedContent.length, 'characters');
  console.log('Removed', zip5Count, 'zip5 arrays');
  console.log('Successfully removed all zip5 arrays!');
  
} catch (error) {
  console.error('Error processing file:', error.message);
  console.error('Error details:', error);
}
