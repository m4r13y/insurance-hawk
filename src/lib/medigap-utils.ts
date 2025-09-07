// Shared utilities for Medigap quote processing
// Extracted from working MedigapCarrierGroup component

export const processOptionsForDisplay = (plan: any, applyDiscounts: boolean) => {
  console.log('processOptionsForDisplay - plan:', plan.plan, 'applyDiscounts:', applyDiscounts);
  
  // Log all options to debug
  console.log('All options analysis:');
  plan.options.forEach((opt: any, index: number) => {
    console.log(`  Option ${index}:`, {
      rating_class: opt.rating_class,
      view_type: opt.view_type,
      rate: opt.rate?.month,
      has_discounts: opt.discounts?.length > 0
    });
  });
  
  // Classify options by their data pattern
  const preCalculatedOptions = plan.options.filter((opt: any) => 
    opt.view_type?.some((vt: string) => vt.includes('hhd'))
  );
  
  const calculatedOptions = plan.options.filter((opt: any) => 
    opt.discounts && opt.discounts.length > 0 && 
    !opt.view_type?.some((vt: string) => vt.includes('hhd'))
  );
  
  const standardOptions = plan.options.filter((opt: any) => 
    (!opt.view_type || opt.view_type.length === 0 || !opt.view_type.some((vt: string) => vt.includes('hhd'))) &&
    (!opt.discounts || opt.discounts.length === 0)
  );

  console.log('Classification results:', {
    preCalculated: preCalculatedOptions.length,
    calculated: calculatedOptions.length, 
    standard: standardOptions.length
  });

  // Pattern 1: Pre-calculated discounts (API provides both with/without discount rates)
  if (preCalculatedOptions.length > 0) {
    console.log('✅ Using pre-calculated discount pattern');
    
    if (applyDiscounts) {
      // Show options with discounts already applied
      const discountedOptions = preCalculatedOptions.filter((opt: any) => 
        opt.view_type?.includes('with_hhd')
      );
      console.log('Showing pre-calculated discounted options:', discountedOptions.length);
      return discountedOptions;
    } else {
      // Show options without discounts  
      const standardOptions = preCalculatedOptions.filter((opt: any) => 
        opt.view_type?.includes('sans_hhd')
      );
      console.log('Showing pre-calculated standard options:', standardOptions.length);
      return standardOptions;
    }
  }
  
  // Pattern 2: Calculated discounts (API provides base rate + discount details)
  if (calculatedOptions.length > 0) {
    console.log('✅ Using calculated discount pattern');
    
    if (applyDiscounts) {
      // Calculate discounted rates from base rates
      const processedOptions = calculatedOptions.map((opt: any) => {
        let discountedRate = opt.rate.month;
        
        opt.discounts.forEach((discount: any) => {
          if (discount.type === 'percent') {
            // Handle both decimal (0.15) and percentage (15) formats
            const discountValue = discount.value > 1 ? discount.value / 100 : discount.value;
            discountedRate = discountedRate * (1 - discountValue);
          } else {
            // Fixed amount discount
            discountedRate = Math.max(0, discountedRate - discount.value);
          }
        });
        
        console.log(`Applied calculated discount to ${opt.rating_class || 'option'}: ${opt.rate.month} -> ${discountedRate}`);
        
        return {
          ...opt,
          rate: {
            ...opt.rate,
            month: discountedRate,
            annual: discountedRate * 12,
            quarter: discountedRate * 3,
            semi_annual: discountedRate * 6
          },
          isCalculatedDiscount: true,
          originalRate: opt.rate.month
        };
      });
      
      console.log('Showing calculated discounted options:', processedOptions.length);
      return processedOptions;
    } else {
      // Show base rates without applying discounts
      console.log('Showing calculated base options:', calculatedOptions.length);
      return calculatedOptions;
    }
  }
  
  // Pattern 3: No discounts available (standard options only)
  console.log('✅ Using standard pattern (no discounts available)');
  console.log('Showing standard options:', standardOptions.length);
  return standardOptions;
};

export const getBaseRate = (quote: any, applyDiscounts: boolean = false) => {
  if (!quote) return 0;

  // Pattern 1: Pre-calculated discounts (view_type indicates if discount already applied)
  const hasViewTypeDiscount = quote.view_type?.some((vt: string) => vt.includes('hhd'));
  if (hasViewTypeDiscount) {
    // Rate is already in the correct state based on view_type
    // with_hhd = discounted rate, sans_hhd = full rate
    return quote.rate?.month || 0;
  }

  // Pattern 2: Calculated discounts (base rate + discount details)
  let rate = quote.rate?.month || 0;
  
  if (applyDiscounts && quote.discounts && quote.discounts.length > 0) {
    quote.discounts.forEach((discount: any) => {
      if (discount.type === 'percent') {
        // Handle both decimal (0.15) and percentage (15) formats  
        const discountValue = discount.value > 1 ? discount.value / 100 : discount.value;
        rate = rate * (1 - discountValue);
      } else {
        // Fixed amount discount
        rate = Math.max(0, rate - discount.value);
      }
    });
  }
  
  return rate;
};

export const calculateRatingClassRange = (quotes: any[], applyDiscounts: boolean) => {
  if (!quotes.length) return { min: 0, max: 0 };
  
  const rates = quotes.map(quote => getBaseRate(quote, applyDiscounts));
  return {
    min: Math.min(...rates),
    max: Math.max(...rates)
  };
};

export const calculateDiscountedRange = (quotes: any[]) => {
  if (!quotes.length) return { min: 0, max: 0 };
  
  const rates = quotes.map(quote => getBaseRate(quote, true));
  return {
    min: Math.min(...rates),
    max: Math.max(...rates)
  };
};

export const getRatingClassInfo = (quotes: any[]) => {
  const uniqueClasses = [...new Set(quotes.map((q: any) => q.rating_class).filter(Boolean))];
  return {
    count: uniqueClasses.length,
    classes: uniqueClasses
  };
};

export const formatRate = (rate: any) => {
  if (typeof rate === 'number') {
    return `$${rate.toFixed(2)}`;
  }
  return rate || '$0.00';
};
