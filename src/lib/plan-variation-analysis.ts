import { QuoteData } from '@/components/plan-details/types'

export interface PlanVariationAnalysis {
  minRate: number
  maxRate: number
  baseRate: number
  discountedMinRate: number
  discountedMaxRate: number
  discountedBaseRate: number
  hasRatingVariations: boolean
  hasDiscounts: boolean
  availableDiscounts: Array<{
    name: string
    value: number
    type: string
  }>
  ratingClasses: string[]
}

export function analyzePlanVariations(quotes: QuoteData[]): PlanVariationAnalysis {
  if (!quotes || quotes.length === 0) {
    return {
      minRate: 0,
      maxRate: 0,
      baseRate: 0,
      discountedMinRate: 0,
      discountedMaxRate: 0,
      discountedBaseRate: 0,
      hasRatingVariations: false,
      hasDiscounts: false,
      availableDiscounts: [],
      ratingClasses: []
    }
  }

  // Helper function to convert rate from cents to dollars
  const convertRate = (rate: number) => rate > 1000 ? rate / 100 : rate

  // Get all unique rating classes and discounts
  const ratingClasses = new Set<string>()
  const discounts = new Map<string, {name: string, value: number, type: string}>()
  
  quotes.forEach(quote => {
    if (quote.rating_class && quote.rating_class.trim()) {
      ratingClasses.add(quote.rating_class)
    }
    quote.discounts?.forEach(discount => {
      discounts.set(discount.name, discount)
    })
  })

  // Find base quote (no rating class) and get all rates
  const baseQuote = quotes.find(q => !q.rating_class || q.rating_class.trim() === '') || quotes[0]
  const baseRate = convertRate(baseQuote.rate?.month || 0)

  // Get all rates across rating classes
  const allRates = quotes.map(q => convertRate(q.rate?.month || 0)).filter(r => r > 0)
  const minRate = Math.min(...allRates)
  const maxRate = Math.max(...allRates)

  // Calculate discounted rates
  const availableDiscounts = Array.from(discounts.values())
  const totalDiscountRate = availableDiscounts.reduce((total, discount) => {
    if (discount.type === 'percent') {
      return total * (1 - discount.value)
    }
    return total - discount.value
  }, 1)

  const discountedMinRate = minRate * totalDiscountRate
  const discountedMaxRate = maxRate * totalDiscountRate
  const discountedBaseRate = baseRate * totalDiscountRate

  return {
    minRate,
    maxRate,
    baseRate,
    discountedMinRate,
    discountedMaxRate,
    discountedBaseRate,
    hasRatingVariations: ratingClasses.size > 0,
    hasDiscounts: availableDiscounts.length > 0,
    availableDiscounts,
    ratingClasses: Array.from(ratingClasses)
  }
}

export function formatPriceRange(
  minRate: number, 
  maxRate: number, 
  formatCurrency: (amount: number) => string
): string {
  if (minRate === maxRate) {
    return `${formatCurrency(minRate)}/mo`
  }
  return `${formatCurrency(minRate)} - ${formatCurrency(maxRate)}/mo`
}
