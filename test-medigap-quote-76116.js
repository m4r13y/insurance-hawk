const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase config - using the same project ID as the existing test
const firebaseConfig = {
  projectId: "medicareally",
  // Add other config if needed
};

async function runMedigapQuote() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app, 'us-central1');
    
    console.log('🔥 Getting function reference...');
    const getMedigapQuotesFn = httpsCallable(functions, 'getMedigapQuotes');
    
    // Parameters based on user request:
    // age 65, plan G, zipcode 76116, male, no tobacco
    const testParams = {
      zip5: "76116",
      age: 65,
      gender: "M",
      tobacco: 0,
      plan: "G"
    };
    
    console.log('🔥 Calling getMedigapQuotes function with params:', testParams);
    console.log('🔥 Parameters breakdown:');
    console.log('   - ZIP Code: 76116 (Fort Worth, TX area)');
    console.log('   - Age: 65');
    console.log('   - Gender: Male (M)');
    console.log('   - Tobacco Use: No (0)');
    console.log('   - Plan: G (Medicare Supplement Plan G)');
    console.log('');
    console.log('🔥 Starting function call...');
    
    const startTime = Date.now();
    const result = await getMedigapQuotesFn(testParams);
    const endTime = Date.now();
    
    console.log(`🔥 Function completed in ${endTime - startTime}ms`);
    console.log('');
    
    if (result.data) {
      console.log('🔥 SUCCESS! Quote data received:');
      console.log('=====================================');
      
      // Check different possible response formats
      let quotes = [];
      
      if (Array.isArray(result.data)) {
        quotes = result.data;
      } else if (result.data.quotes && Array.isArray(result.data.quotes)) {
        quotes = result.data.quotes;
      } else if (result.data.results && Array.isArray(result.data.results)) {
        quotes = result.data.results;
      } else {
        quotes = [result.data];
      }
      
      console.log(`📊 Total quotes found: ${quotes.length}`);
      console.log('');
      
      if (quotes.length > 0) {
        console.log('🏆 TOP 5 QUOTES (by premium):');
        console.log('===============================');
        
        // Sort by monthly premium if available
        const sortedQuotes = quotes.sort((a, b) => {
          const premiumA = a.monthly_premium || (a.rate?.month ? a.rate.month / 100 : 0);
          const premiumB = b.monthly_premium || (b.rate?.month ? b.rate.month / 100 : 0);
          return premiumA - premiumB;
        });
        
        sortedQuotes.slice(0, 5).forEach((quote, index) => {
          const premium = quote.monthly_premium || (quote.rate?.month ? quote.rate.month / 100 : 0);
          const carrierName = quote.carrier?.name || quote.company_base?.name || 'Unknown Carrier';
          const naic = quote.naic || 'N/A';
          const planName = quote.plan_name || `Plan ${quote.plan || 'G'}`;
          
          console.log(`${index + 1}. ${carrierName}`);
          console.log(`   Plan: ${planName}`);
          console.log(`   Premium: $${premium.toFixed(2)}/month`);
          console.log(`   NAIC: ${naic}`);
          if (quote.am_best_rating) {
            console.log(`   AM Best Rating: ${quote.am_best_rating}`);
          }
          console.log('');
        });
        
        // Show carrier breakdown
        console.log('📈 CARRIER BREAKDOWN:');
        console.log('=====================');
        const carrierCounts = {};
        quotes.forEach(quote => {
          const carrierName = quote.carrier?.name || quote.company_base?.name || 'Unknown';
          carrierCounts[carrierName] = (carrierCounts[carrierName] || 0) + 1;
        });
        
        Object.entries(carrierCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([carrier, count]) => {
            console.log(`• ${carrier}: ${count} quotes`);
          });
        
        console.log('');
        console.log('💾 COMPLETE RAW RESPONSE (for analysis):');
        console.log('========================================');
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log('⚠️  No quotes found in response');
        console.log('Raw response:', JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log('❌ No data in response');
      console.log('Full result:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error calling function:', error);
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
    if (error.message) {
      console.error('❌ Error message:', error.message);
    }
    if (error.details) {
      console.error('❌ Error details:', error.details);
    }
  }
}

console.log('🏥 MEDICARE SUPPLEMENT (MEDIGAP) QUOTE TEST');
console.log('===========================================');
console.log('Testing getMedigapQuotes function with:');
console.log('• Age: 65');
console.log('• Plan: G');
console.log('• ZIP Code: 76116');
console.log('• Gender: Male');
console.log('• Tobacco Use: No');
console.log('');

runMedigapQuote();
