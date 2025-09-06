// Shared utilities for Medigap quote processing
// Extracted from working MedigapCarrierGroup component

export const processOptionsForDisplay = (plan: any, applyDiscounts: boolean) => {
  console.log('processOptionsForDisplay - plan:', plan.plan, 'applyDiscounts:', applyDiscounts);
  
  const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
  const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
  const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

  if (hasPreCalculatedDiscounts) {
    if (applyDiscounts) {
      const filtered = plan.options.filter((opt: any) => opt.view_type?.includes('with_hhd'));
      console.log('✅ Pre-calculated: Showing with_hhd options:', filtered.length);
      return filtered;
    } else {
      const filtered = plan.options.filter((opt: any) => opt.view_type?.includes('sans_hhd'));
      console.log('✅ Pre-calculated: Showing sans_hhd options:', filtered.length);
      return filtered;
    }
  } else {
    if (applyDiscounts) {
      const optionsWithDiscounts = plan.options?.filter((opt: any) => 
        opt.discounts && opt.discounts.length > 0
      ).map((opt: any) => {
        let discountedRate = opt.rate.month;
        opt.discounts.forEach((discount: any) => {
          const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
          discountedRate = discountedRate * (1 - discountPercent / 100);
        });
        console.log(`Applied calculated discount to ${opt.rating_class || 'option'}: ${opt.rate.month} -> ${discountedRate}`);
        return { ...opt, rate: { ...opt.rate, month: discountedRate }, isCalculatedDiscount: true };
      }) || [];
      
      console.log('✅ Calculated: Showing options with discounts applied:', optionsWithDiscounts.length);
      return optionsWithDiscounts;
    } else {
      const optionsWithoutDiscounts = plan.options?.filter((opt: any) => 
        !opt.discounts || opt.discounts.length === 0
      ) || [];
      
      if (optionsWithoutDiscounts.length === 0) {
        console.log('✅ Calculated: No options without discounts found, showing all options with base rates:', plan.options?.length || 0);
        return plan.options || [];
      }
      
      console.log('✅ Calculated: Showing only options without discounts:', optionsWithoutDiscounts.length);
      return optionsWithoutDiscounts;
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
