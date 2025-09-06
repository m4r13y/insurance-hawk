// Shared utilities for Medigap quote processing
// Extracted from working MedigapCarrierGroup component

export const processOptionsForDisplay = (plan: any, applyDiscounts: boolean) => {
  console.log('processOptionsForDisplay - plan:', plan.plan, 'applyDiscounts:', applyDiscounts);
  
  // Log all view_types to debug
  console.log('All options view_types:');
  plan.options.forEach((opt: any, index: number) => {
    console.log(`  Option ${index}:`, {
      rating_class: opt.rating_class,
      view_type: opt.view_type,
      rate: opt.rate?.month
    });
  });
  
  // Check if this plan has pre-calculated discounts
  // Check both view_type and rating_class for discount indicators
  const hasWithHHD = plan.options.some((opt: any) => 
    opt.view_type?.includes('with_hhd') || 
    opt.rating_class?.toLowerCase().includes('hhd')
  );
  const hasSansHHD = plan.options.some((opt: any) => 
    opt.view_type?.includes('sans_hhd') || 
    (opt.rating_class && !opt.rating_class.toLowerCase().includes('hhd'))
  );
  const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

  console.log('Detection results:', { hasWithHHD, hasSansHHD, hasPreCalculatedDiscounts });

  if (hasPreCalculatedDiscounts) {
    // For pre-calculated discounts, just filter based on toggle
    if (applyDiscounts) {
      // Show with_hhd options OR options with HHD in rating_class (discounted versions)
      const filtered = plan.options.filter((opt: any) => 
        opt.view_type?.includes('with_hhd') || 
        opt.rating_class?.toLowerCase().includes('hhd')
      );
      console.log('✅ Pre-calculated: Showing discounted options:', filtered.length);
      return filtered;
    } else {
      // Show sans_hhd options OR options without HHD in rating_class (non-discounted versions)
      const filtered = plan.options.filter((opt: any) => 
        opt.view_type?.includes('sans_hhd') || 
        (opt.rating_class !== undefined && !opt.rating_class.toLowerCase().includes('hhd'))
      );
      console.log('✅ Pre-calculated: Showing standard options:', filtered.length);
      return filtered;
    }
  } else {
    // For non-pre-calculated discounts, we need to calculate
    if (applyDiscounts) {
      // Apply discounts to base options
      const result = plan.options.map((opt: any) => {
        // Check if this option has discounts available
        const hasDiscounts = opt.discounts && opt.discounts.length > 0;
        
        if (hasDiscounts) {
          // Calculate discounted price
          let discountedRate = opt.rate.month;
          opt.discounts.forEach((discount: any) => {
            const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
            discountedRate = discountedRate * (1 - discountPercent / 100);
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
            isCalculatedDiscount: true
          };
        }
        
        return opt;
      });
      
      console.log('✅ Calculated: Showing options with discounts applied:', result.length);
      return result;
    } else {
      // Show base options without discounts
      console.log('✅ Calculated: Showing all base options without discount calculations:', plan.options?.length || 0);
      return plan.options;
    }
  }
};

export const getBaseRate = (quote: any, applyDiscounts: boolean = false) => {
  if (!quote) return 0;

  // For pre-calculated discounts, the rate is already correct based on view_type
  const hasWithHHD = quote.view_type?.includes('with_hhd');
  const hasSansHHD = quote.view_type?.includes('sans_hhd');
  
  if (hasWithHHD || hasSansHHD) {
    // The rate is already pre-calculated for the discount state
    return quote.rate?.month || 0;
  }

  // For calculated discounts, only apply if explicitly requested
  let rate = quote.rate?.month || 0;
  
  if (applyDiscounts && quote.discounts) {
    quote.discounts.forEach((discount: any) => {
      if (discount.type === 'percent') {
        rate = rate * (1 - discount.value);
      } else {
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
