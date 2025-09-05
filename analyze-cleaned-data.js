const fs = require('fs');

console.log('🔍 Analyzing cleaned medigap quotes data...');

try {
  // Read the cleaned file
  const data = fs.readFileSync('d:/github2/insurance-hawk/src/lib/medigap-quotes-final.json', 'utf8');
  const quotes = JSON.parse(data);
  
  console.log(`📊 Total quotes: ${quotes.length}`);
  console.log(`📁 File size: ${Math.round(data.length / 1024)}KB\n`);
  
  // Group by carrier
  const carrierGroups = {};
  quotes.forEach(quote => {
    const carrierName = quote.company_base?.name || 'Unknown';
    if (!carrierGroups[carrierName]) {
      carrierGroups[carrierName] = [];
    }
    carrierGroups[carrierName].push(quote);
  });
  
  console.log('🏢 CARRIERS AND THEIR QUOTE VARIATIONS:');
  console.log('=====================================');
  
  Object.entries(carrierGroups).forEach(([carrierName, carrierQuotes]) => {
    console.log(`\n🏢 ${carrierName} (${carrierQuotes.length} quotes)`);
    
    // Group by plan letter
    const planGroups = {};
    carrierQuotes.forEach(quote => {
      const plan = quote.plan || 'Unknown';
      if (!planGroups[plan]) {
        planGroups[plan] = [];
      }
      planGroups[plan].push(quote);
    });
    
    Object.entries(planGroups).forEach(([planLetter, planQuotes]) => {
      console.log(`   📋 Plan ${planLetter} (${planQuotes.length} variations):`);
      
      planQuotes.forEach((quote, index) => {
        const rate = quote.rate?.month || 0;
        const ratingClass = quote.rating_class || '';
        const viewType = quote.view_type || [];
        const discounts = quote.discounts || [];
        const discountCategory = quote.discount_category || '';
        
        console.log(`      ${index + 1}. $${(rate/100).toFixed(2)}/mo`);
        console.log(`         • Rating Class: "${ratingClass}"`);
        console.log(`         • View Type: [${viewType.map(v => `"${v}"`).join(', ')}]`);
        console.log(`         • Discount Category: "${discountCategory}"`);
        console.log(`         • Discounts: ${discounts.length > 0 ? discounts.map(d => `${d.name} (${d.type === 'percent' ? (d.value * 100).toFixed(0) + '%' : '$' + d.value})`).join(', ') : 'None'}`);
        console.log('');
      });
    });
  });
  
  // Analyze patterns
  console.log('\n🔍 PATTERN ANALYSIS:');
  console.log('==================');
  
  const ratingClasses = new Set();
  const viewTypes = new Set();
  const discountCategories = new Set();
  const discountTypes = new Set();
  
  quotes.forEach(quote => {
    if (quote.rating_class) ratingClasses.add(quote.rating_class);
    if (quote.view_type) quote.view_type.forEach(vt => viewTypes.add(vt));
    if (quote.discount_category) discountCategories.add(quote.discount_category);
    if (quote.discounts) quote.discounts.forEach(d => discountTypes.add(d.name));
  });
  
  console.log(`\n📊 Unique Rating Classes (${ratingClasses.size}):`);
  [...ratingClasses].sort().forEach(rc => console.log(`   • "${rc}"`));
  
  console.log(`\n👁️ Unique View Types (${viewTypes.size}):`);
  [...viewTypes].sort().forEach(vt => console.log(`   • "${vt}"`));
  
  console.log(`\n🏷️ Unique Discount Categories (${discountCategories.size}):`);
  [...discountCategories].sort().forEach(dc => console.log(`   • "${dc}"`));
  
  console.log(`\n💰 Unique Discount Types (${discountTypes.size}):`);
  [...discountTypes].sort().forEach(dt => console.log(`   • "${dt}"`));
  
  // Find consolidation opportunities
  console.log('\n🔗 CONSOLIDATION OPPORTUNITIES:');
  console.log('==============================');
  
  Object.entries(carrierGroups).forEach(([carrierName, carrierQuotes]) => {
    const planGroups = {};
    carrierQuotes.forEach(quote => {
      const plan = quote.plan || 'Unknown';
      if (!planGroups[plan]) {
        planGroups[plan] = [];
      }
      planGroups[plan].push(quote);
    });
    
    Object.entries(planGroups).forEach(([planLetter, planQuotes]) => {
      if (planQuotes.length > 1) {
        console.log(`\n🔗 ${carrierName} Plan ${planLetter} - ${planQuotes.length} variations can be consolidated:`);
        
        // Find base plan (standard with no special features)
        const basePlan = planQuotes.find(q => 
          (!q.rating_class || q.rating_class === '') &&
          (!q.view_type || q.view_type.length === 0) &&
          (!q.discounts || q.discounts.length === 0)
        ) || planQuotes[0];
        
        const baseRate = basePlan.rate?.month || 0;
        
        planQuotes.forEach((quote, index) => {
          const rate = quote.rate?.month || 0;
          const savings = baseRate - rate;
          const savingsPercent = baseRate > 0 ? ((savings / baseRate) * 100) : 0;
          
          let optionName = 'Standard';
          let description = 'Standard plan option';
          
          if (quote.view_type && quote.view_type.includes('with_hhd')) {
            optionName = `Household Discount (${Math.abs(savingsPercent).toFixed(0)}% ${savings > 0 ? 'savings' : 'increase'})`;
            description = 'Household discount when multiple family members enroll';
          } else if (quote.rating_class && quote.rating_class !== '') {
            optionName = quote.rating_class;
            description = `Special rating class: ${quote.rating_class}`;
          } else if (quote.discounts && quote.discounts.length > 0) {
            const discountNames = quote.discounts.map(d => d.name).join(', ');
            optionName = `With Discounts (${discountNames})`;
            description = `Available discounts: ${discountNames}`;
          }
          
          console.log(`      Option ${index + 1}: ${optionName}`);
          console.log(`         • Rate: $${(rate/100).toFixed(2)}/mo`);
          console.log(`         • Description: ${description}`);
          if (savings !== 0) {
            console.log(`         • Savings: ${savings > 0 ? '+' : ''}$${Math.abs(savings/100).toFixed(2)}/mo (${savingsPercent > 0 ? '+' : ''}${savingsPercent.toFixed(1)}%)`);
          }
          console.log('');
        });
      }
    });
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
