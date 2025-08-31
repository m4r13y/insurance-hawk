// Test script to verify selectedFlowCategories includes all quote types
const testData = {
  planCategories: ['medigap', 'advantage'],
  selectedAdditionalOptions: ['dental', 'cancer', 'hospital', 'final-expense']
};

// Simulate the updated logic
function getCombinedCategories(data) {
  const allCategories = [];
  
  // Add main plan categories
  if (data?.planCategories && Array.isArray(data.planCategories)) {
    allCategories.push(...data.planCategories);
  }
  
  // Add additional options with proper category IDs
  if (data?.selectedAdditionalOptions && Array.isArray(data.selectedAdditionalOptions)) {
    if (data.selectedAdditionalOptions.includes('dental')) {
      allCategories.push('dental');
    }
    if (data.selectedAdditionalOptions.includes('cancer')) {
      allCategories.push('cancer');
    }
    if (data.selectedAdditionalOptions.includes('hospital')) {
      allCategories.push('hospital-indemnity');
    }
    if (data.selectedAdditionalOptions.includes('final-expense')) {
      allCategories.push('final-expense');
    }
  }
  
  return allCategories;
}

console.log('📊 Testing Quote Tab Display Logic');
console.log('Input data:', testData);

const result = getCombinedCategories(testData);
console.log('\n✅ Combined categories for tabs:', result);

console.log('\n🎯 Expected tab display:');
result.forEach(category => {
  const displayNames = {
    'medigap': 'Medicare Supplement',
    'advantage': 'Medicare Advantage', 
    'dental': 'Dental',
    'cancer': 'Cancer',
    'hospital-indemnity': 'Hospital',
    'final-expense': 'Final Expense'
  };
  console.log(`- ${displayNames[category] || category}`);
});

console.log('\n📝 Result:', result.length > 2 ? 
  '✅ Multiple tabs will show!' : 
  '❌ Only basic tabs will show');
