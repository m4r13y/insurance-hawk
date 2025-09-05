'use client'

import { AllPlansTabImproved } from '@/components/plan-details/AllPlansTabImproved'
import medigapQuotes from '@/lib/medigap-quotes-final.json'

export default function TestRealData() {
  // Take first 10 quotes to demonstrate
  const sampleQuotes = medigapQuotes.slice(0, 10)

  const handlePlanSelect = (quote: any, finalRate: number) => {
    console.log('Selected plan:', quote)
    console.log('Final rate:', finalRate)
    alert(`Selected plan with final rate: $${finalRate.toFixed(2)}/mo`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Real Medigap Data - Improved Interface</h1>
        <p className="text-gray-600 mb-6">
          Testing with real medigap quotes data to see how rating classes and discounts are handled.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Showing first 10 quotes from the dataset. Each plan should have separate sections for rating classes and discounts.
        </p>
      </div>
      
      <AllPlansTabImproved 
        quotes={sampleQuotes}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  )
}
