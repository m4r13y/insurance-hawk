const fs = require('fs');
const path = require('path');

// Since we can't import TS directly, let's manually test the consolidation logic
const quotes = JSON.parse(fs.readFileSync('./src/lib/medigap-quotes-final.json', 'utf8'));

console.log('Testing plan consolidation...');
console.log('Total quotes:', quotes.length);

// Group quotes by base plan manually to test the concept
const basePlans = new Map();

quotes.forEach(quote => {
  const carrierName = quote.carrier?.name || quote.company_base?.name || 'Unknown';
  const plan = quote.plan || 'Unknown';
  const basePlanId = `${carrierName}-${plan}`;
  
  if (!basePlans.has(basePlanId)) {
    basePlans.set(basePlanId, []);
  }
  basePlans.get(basePlanId).push(quote);
});

console.log('Base plans found:', basePlans.size);

// Look at the first few plans with multiple options
let exampleCount = 0;
for (const [planId, planQuotes] of basePlans) {
  if (planQuotes.length > 1 && exampleCount < 3) {
    console.log(`\nPlan: ${planId}`);
    console.log(`Variations: ${planQuotes.length}`);
    
    planQuotes.forEach((quote, i) => {
      const rate = quote.rate?.month || quote.monthly_premium || 0;
      const ratingClass = quote.rating_class || 'Standard';
      const viewType = quote.view_type || [];
      const discounts = quote.discounts || [];
      
      console.log(`  ${i+1}. $${rate}/month - Rating: ${ratingClass} - View: [${viewType.join(', ')}] - Discounts: ${discounts.length}`);
    });
    
    exampleCount++;
  }
}

// Check for plans that should show savings
console.log('\nLooking for plans with rate variations...');
for (const [planId, planQuotes] of basePlans) {
  if (planQuotes.length > 1) {
    const rates = planQuotes.map(q => q.rate?.month || q.monthly_premium || 0);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    
    if (maxRate > minRate) {
      const savings = maxRate - minRate;
      const savingsPercent = (savings / maxRate) * 100;
      console.log(`${planId}: $${minRate} - $${maxRate} (save up to $${savings.toFixed(2)} or ${savingsPercent.toFixed(1)}%)`);
    }
  }
}
