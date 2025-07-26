// Utility to convert a Medigap quote object to a query string for the application page
export function medigapQuoteToQuery(quote: any) {
  const params = new URLSearchParams();
  params.set('type', 'medicare-supplement');
  if (quote.plan_name) params.set('planName', quote.plan_name);
  if (quote.carrier?.name) params.set('provider', quote.carrier.name);
  if (quote.monthly_premium) params.set('premium', quote.monthly_premium.toString());
  if (quote.am_best_rating) params.set('rating', quote.am_best_rating);
  // Add more fields as needed
  return params.toString();
}
