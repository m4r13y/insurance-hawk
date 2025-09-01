const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase config (you may need to adjust this)
const firebaseConfig = {
  projectId: "medicareally",
  // Add other config if needed
};

async function testMedigapQuotes() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app, 'us-central1');
    
    console.log('Getting function reference...');
    const getMedigapQuotesFn = httpsCallable(functions, 'getMedigapQuotes');
    
    const testParams = {
      zip5: "75001",
      age: 65,
      gender: "M",
      tobacco: 0,
      plan: "G"
    };
    
    console.log('Calling function with params:', testParams);
    console.log('Starting function call...');
    
    const startTime = Date.now();
    const result = await getMedigapQuotesFn(testParams);
    const endTime = Date.now();
    
    console.log(`Function completed in ${endTime - startTime}ms`);
    console.log('Result:', JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('Error calling function:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

testMedigapQuotes();
