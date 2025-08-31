// Test auto-detection logic for categories based on existing quotes
const testScenarios = [
  {
    name: 'No saved categories but has quotes',
    savedCategories: [],
    savedQuotes: {
      medigap: [{ plan: 'F' }],
      dental: [{ id: 1 }],
      hospital: [{ planName: 'Test' }]
    },
    expected: ['medigap', 'dental', 'hospital-indemnity']
  },
  {
    name: 'Has saved categories',
    savedCategories: ['medigap', 'advantage'],
    savedQuotes: {
      medigap: [{ plan: 'F' }],
      dental: [{ id: 1 }]
    },
    expected: ['medigap', 'advantage'] // Should use saved, not auto-detect
  },
  {
    name: 'All quote types present',
    savedCategories: [],
    savedQuotes: {
      medigap: [{ plan: 'F' }],
      advantage: [{ id: 1 }],
      drugPlan: [{ id: 1 }],
      dental: [{ id: 1 }],
      hospital: [{ planName: 'Test' }],
      finalExpense: [{ id: 1 }],
      cancer: [{ id: 1 }]
    },
    expected: ['medigap', 'advantage', 'drug-plan', 'dental', 'hospital-indemnity', 'final-expense', 'cancer']
  }
];

function autoDetectCategories(savedCategories, savedQuotes) {
  // Auto-detect categories if not properly saved but quotes exist
  if (!savedCategories || savedCategories.length === 0) {
    const detectedCategories = [];
    if (savedQuotes.medigap && savedQuotes.medigap.length > 0) detectedCategories.push('medigap');
    if (savedQuotes.advantage && savedQuotes.advantage.length > 0) detectedCategories.push('advantage');
    if (savedQuotes.drugPlan && savedQuotes.drugPlan.length > 0) detectedCategories.push('drug-plan');
    if (savedQuotes.dental && savedQuotes.dental.length > 0) detectedCategories.push('dental');
    if (savedQuotes.hospital && savedQuotes.hospital.length > 0) detectedCategories.push('hospital-indemnity');
    if (savedQuotes.finalExpense && savedQuotes.finalExpense.length > 0) detectedCategories.push('final-expense');
    if (savedQuotes.cancer && savedQuotes.cancer.length > 0) detectedCategories.push('cancer');
    
    return detectedCategories;
  }
  
  return savedCategories;
}

console.log('🧪 Testing Auto-Detection Logic\n');

testScenarios.forEach((scenario, index) => {
  console.log(`Test ${index + 1}: ${scenario.name}`);
  const result = autoDetectCategories(scenario.savedCategories, scenario.savedQuotes);
  
  const passed = JSON.stringify(result.sort()) === JSON.stringify(scenario.expected.sort());
  console.log(`Expected: ${scenario.expected.join(', ')}`);
  console.log(`Result:   ${result.join(', ')}`);
  console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('🎯 Summary: Auto-detection will ensure tabs show for all existing quotes!');
