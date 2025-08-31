// Test script to verify storage functionality
// Run this in the browser console at http://localhost:3001/medicare/shop

console.log('🔍 Starting storage functionality test...');

// Test 1: Check if storage functions are available
console.log('📦 Testing storage functions availability...');
const storage = window.localStorage;
console.log('localStorage available:', storage !== null);

// Test 2: Test basic storage functionality
console.log('💾 Testing basic storage functionality...');
const testKey = 'test_storage_functionality';
const testData = { test: 'data', timestamp: Date.now() };

try {
  localStorage.setItem(testKey, JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem(testKey));
  console.log('✅ Basic storage test passed:', retrieved);
  localStorage.removeItem(testKey);
} catch (error) {
  console.error('❌ Basic storage test failed:', error);
}

// Test 3: Check if Firestore is initialized
console.log('🔥 Checking Firestore initialization...');
try {
  // Check if Firebase is available
  if (typeof window !== 'undefined' && window.firebase) {
    console.log('✅ Firebase available');
  } else {
    console.log('ℹ️ Firebase not directly accessible from window');
  }
} catch (error) {
  console.error('❌ Firebase check failed:', error);
}

// Test 4: Test visitor ID generation
console.log('👤 Testing visitor ID generation...');
const visitorIdPattern = /^visitor_\d+_[a-zA-Z0-9]+$/;
const sampleVisitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
console.log('Generated visitor ID:', sampleVisitorId);
console.log('Visitor ID format valid:', visitorIdPattern.test(sampleVisitorId));

// Test 5: Check current localStorage usage
console.log('📊 Current localStorage usage...');
let totalSize = 0;
let medicareKeys = [];
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    totalSize += localStorage[key].length + key.length;
    if (key.includes('medicare')) {
      medicareKeys.push({
        key: key,
        size: localStorage[key].length,
        preview: localStorage[key].substring(0, 100) + '...'
      });
    }
  }
}
console.log('Total localStorage size:', Math.round(totalSize / 1024) + 'KB');
console.log('Medicare-related keys:', medicareKeys);

// Test 6: Simulate quote storage
console.log('💰 Testing quote storage simulation...');
const mockQuotes = [
  {
    id: 'test_1',
    planName: 'Test Final Expense Plan',
    carrierName: 'Test Carrier',
    monthlyPremium: 45.99,
    benefitAmount: 10000
  },
  {
    id: 'test_2', 
    planName: 'Test Hospital Plan',
    carrierName: 'Another Carrier',
    monthlyPremium: 29.99,
    dailyBenefit: 200
  }
];

try {
  const testQuoteKey = 'medicare_test_quotes';
  localStorage.setItem(testQuoteKey, JSON.stringify(mockQuotes));
  const retrievedQuotes = JSON.parse(localStorage.getItem(testQuoteKey));
  console.log('✅ Quote storage test passed:', retrievedQuotes.length, 'quotes stored');
  localStorage.removeItem(testQuoteKey);
} catch (error) {
  console.error('❌ Quote storage test failed:', error);
}

console.log('🎉 Storage functionality test completed!');
console.log('📝 Next steps:');
console.log('   1. Run Final Expense quotes in the UI');
console.log('   2. Check if quotes persist between page refreshes');
console.log('   3. Verify Firestore backup is working');
console.log('   4. Test quote data after running multiple categories');
