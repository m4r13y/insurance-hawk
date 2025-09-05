const fs = require('fs');

// Read the JSON file directly
console.log('Reading JSON file...');
const jsonData = JSON.parse(fs.readFileSync('sample-quotes.json', 'utf8'));
const quotes = jsonData;

console.log(`Total quotes: ${quotes.length}`);

// Group by carrier to see patterns
const carrierGroups = {};
quotes.forEach(quote => {
  const carrierName = quote.company_base?.name || 'Unknown';
  if (!carrierGroups[carrierName]) {
    carrierGroups[carrierName] = [];
  }
  carrierGroups[carrierName].push(quote);
});

console.log(`\nCarriers found: ${Object.keys(carrierGroups).length}`);

// Analyze each carrier's quote variations
Object.entries(carrierGroups).forEach(([carrierName, carrierQuotes]) => {
  console.log(`\n============================================`);
  console.log(`CARRIER: ${carrierName} (${carrierQuotes.length} quotes)`);
  console.log(`============================================`);
  
  carrierQuotes.forEach((quote, index) => {
    console.log(`\n--- Quote ${index + 1} ---`);
    console.log(`Plan: ${quote.plan}`);
    console.log(`Monthly Rate: $${(quote.rate?.month / 100).toFixed(2)}`);
    console.log(`Rating Class: "${quote.rating_class || 'EMPTY'}"`);
    console.log(`Discount Category: "${quote.discount_category || 'EMPTY'}"`);
    console.log(`View Type: ${JSON.stringify(quote.view_type || [])}`);
    console.log(`Discounts: ${quote.discounts?.length || 0} items`);
    if (quote.discounts?.length > 0) {
      quote.discounts.forEach(d => {
        console.log(`  - ${d.name}: ${d.type} ${d.value}`);
      });
    }
    console.log(`Fees: ${quote.fees?.length || 0} items`);
    if (quote.fees?.length > 0) {
      quote.fees.forEach(f => {
        console.log(`  - ${f.name}: ${f.type} ${f.value}`);
      });
    }
    console.log(`Rate Type: ${quote.rate_type}`);
    console.log(`Tobacco: ${quote.tobacco}`);
    console.log(`Key: ${quote.key}`);
  });
});

// Analyze unique patterns across all quotes
console.log(`\n\n============================================`);
console.log(`PATTERN ANALYSIS ACROSS ALL QUOTES`);
console.log(`============================================`);

const ratingClasses = new Set();
const discountCategories = new Set();
const viewTypes = new Set();
const discountNames = new Set();

quotes.forEach(quote => {
  if (quote.rating_class) ratingClasses.add(quote.rating_class);
  if (quote.discount_category) discountCategories.add(quote.discount_category);
  if (quote.view_type) quote.view_type.forEach(vt => viewTypes.add(vt));
  if (quote.discounts) quote.discounts.forEach(d => discountNames.add(d.name));
});

console.log(`\nUnique Rating Classes (${ratingClasses.size}):`);
[...ratingClasses].sort().forEach(rc => console.log(`  "${rc}"`));

console.log(`\nUnique Discount Categories (${discountCategories.size}):`);
[...discountCategories].sort().forEach(dc => console.log(`  "${dc}"`));

console.log(`\nUnique View Types (${viewTypes.size}):`);
[...viewTypes].sort().forEach(vt => console.log(`  "${vt}"`));

console.log(`\nUnique Discount Names (${discountNames.size}):`);
[...discountNames].sort().forEach(dn => console.log(`  "${dn}"`));

// Look for carriers with multiple quote variations
console.log(`\n\n============================================`);
console.log(`CARRIERS WITH MULTIPLE VARIATIONS`);
console.log(`============================================`);

Object.entries(carrierGroups).forEach(([carrierName, carrierQuotes]) => {
  if (carrierQuotes.length > 1) {
    console.log(`\n${carrierName}: ${carrierQuotes.length} variations`);
    
    // Group by plan letter within carrier
    const planGroups = {};
    carrierQuotes.forEach(quote => {
      const plan = quote.plan || 'Unknown';
      if (!planGroups[plan]) planGroups[plan] = [];
      planGroups[plan].push(quote);
    });
    
    Object.entries(planGroups).forEach(([plan, planQuotes]) => {
      if (planQuotes.length > 1) {
        console.log(`  Plan ${plan}: ${planQuotes.length} variations`);
        planQuotes.forEach((quote, idx) => {
          const rate = (quote.rate?.month / 100).toFixed(2);
          const ratingClass = quote.rating_class || 'NONE';
          const viewType = quote.view_type?.join(',') || 'NONE';
          const discountCat = quote.discount_category || 'NONE';
          const discounts = quote.discounts?.map(d => `${d.name}(${d.value})`).join(',') || 'NONE';
          
          console.log(`    ${idx + 1}. $${rate}/mo | RC:"${ratingClass}" | VT:"${viewType}" | DC:"${discountCat}" | D:"${discounts}"`);
        });
      }
    });
  }
});
