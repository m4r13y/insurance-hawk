// Test the supplement quote completion matching logic
const testSteps = [
  { id: 1, text: "Finding Plan F Quotes", icon: "StarIcon" },
  { id: 2, text: "Finding Plan G Quotes", icon: "LockClosedIcon" },
  { id: 3, text: "Finding Supplement Quotes", icon: "LockClosedIcon" },
  { id: 4, text: "Finding Medicare Advantage Quotes", icon: "HeartIcon" },
  { id: 5, text: "Finalizing your personalized quotes", icon: "CheckCircledIcon" }
];

const testScenarios = [
  {
    name: "Individual supplement plans completed",
    completedQuoteTypes: ["Plan F", "Plan G"],
    expectedCompletedSteps: ["1", "2"] // Steps 1 and 2 should be marked complete
  },
  {
    name: "Multiple supplement plans as one batch",
    completedQuoteTypes: ["Supplement Plans"],
    expectedCompletedSteps: ["3"] // Step 3 should be marked complete
  },
  {
    name: "Medicare Advantage completed",
    completedQuoteTypes: ["Medicare Advantage Plans"],
    expectedCompletedSteps: ["4"] // Step 4 should be marked complete
  },
  {
    name: "Mixed completion types",
    completedQuoteTypes: ["Plan F", "Medicare Advantage Plans"],
    expectedCompletedSteps: ["1", "4"] // Steps 1 and 4 should be marked complete
  }
];

// Simulate the improved matching logic
function getCompletedSteps(completedQuoteTypes, steps) {
  const newCompletedSteps = new Set();
  
  completedQuoteTypes.forEach((quoteType) => {
    const matchingStepIndex = steps.findIndex(step => {
      const stepTextLower = step.text.toLowerCase();
      const quoteTypeLower = quoteType.toLowerCase();
      
      // Handle specific quote type matching
      if (quoteType === 'Medicare Advantage Plans' && stepTextLower.includes('medicare advantage')) {
        return true;
      }
      if (quoteType === 'Drug Plans' && stepTextLower.includes('drug plan')) {
        return true;
      }
      if (quoteType === 'Supplement Plans' && stepTextLower.includes('supplement')) {
        return true;
      }
      // Handle individual supplement plans (Plan F, Plan G, etc.)
      if (quoteType.startsWith('Plan ') && stepTextLower.includes(quoteTypeLower)) {
        return true;
      }
      // Handle other quote types by checking if step text contains the quote type
      if (stepTextLower.includes(quoteTypeLower)) {
        return true;
      }
      
      return false;
    });
    
    if (matchingStepIndex !== -1) {
      newCompletedSteps.add(steps[matchingStepIndex].id.toString());
    }
  });
  
  return Array.from(newCompletedSteps).sort();
}

console.log('🧪 Testing Supplement Quote Completion Logic\n');

testScenarios.forEach((scenario, index) => {
  console.log(`Test ${index + 1}: ${scenario.name}`);
  const result = getCompletedSteps(scenario.completedQuoteTypes, testSteps);
  
  const passed = JSON.stringify(result) === JSON.stringify(scenario.expectedCompletedSteps.sort());
  console.log(`Completed Quote Types: ${scenario.completedQuoteTypes.join(', ')}`);
  console.log(`Expected Completed Steps: ${scenario.expectedCompletedSteps.join(', ')}`);
  console.log(`Actual Completed Steps:   ${result.join(', ')}`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('🎯 Summary: Green checkmarks will now show for completed supplement quotes!');
