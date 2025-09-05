'use client'

import { AllPlansTab } from '@/components/plan-details/AllPlansTab'
import testQuotes from '@/lib/test-quotes.json'

export default function TestPlanOptions() {
  const formatCurrency = (amount: number) => {
    console.log('formatCurrency called with:', amount)
    return `$${amount.toFixed(2)}`
  }

  const calculateDiscountedRate = (rate: number, discounts: any[]) => {
    let discountedRate = rate
    discounts?.forEach(discount => {
      if (discount.type === 'percent') {
        discountedRate = discountedRate * (1 - discount.value)
      }
    })
    return discountedRate
  }

  // Create a mock quoteData for testing
  const mockQuoteData = {
    company_base: { name: 'Test Insurance Company' },
    plan: 'G'
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Updated AllPlansTab Test</h1>
        <p className="text-gray-600 mb-6">
          Testing the updated AllPlansTab with proper rate calculations.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Test Data Info:</h3>
          <p className="text-sm text-gray-600">
            Raw rates: {testQuotes.map(q => q.rate.month).join(', ')} (cents)<br/>
            Should display as: {testQuotes.map(q => `$${(q.rate.month / 100).toFixed(2)}`).join(', ')}
          </p>
        </div>
      </div>
      
      <AllPlansTab 
        quoteData={mockQuoteData as any}
        carrierQuotes={testQuotes as any}
        formatCurrency={formatCurrency}
        calculateDiscountedRate={calculateDiscountedRate}
      />
    </div>
  )
}
