"use server"

import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface MedicareAdvantageQuoteParams {
  zipCode: string
}

interface MedicareAdvantageQuote {
  organization_name: string
  plan_name: string
  plan_id: string
  contract_id: string
  month_rate: number
  part_c_rate: number
  part_d_rate: number
  plan_type: string
  overall_star_rating: number
  in_network_moop: string
  in_network_moop_sort: number
  annual_drug_deductible: number
  county: string
  state: string
  drug_benefit_type?: string
  drug_benefit_type_detail?: string
  benefits: Array<{
    benefit_type: string
    full_description: string
    summary_description?: {
      in_network?: string
      out_network?: string
    }
    pd_view_display: boolean
  }>
  part_d_subsides?: {
    "25": number
    "50": number
    "75": number
    "100": number
  }
  contextual_data?: {
    has_eapp: boolean
    carrier_resources: {
      "Formulary Website"?: string
      "Pharmacy Website"?: string
      "Physician Lookup"?: string
    }
  }
  company_base?: {
    name: string
    name_full: string
    naic?: string
  }
  zero_premium_with_full_low_income_subsidy?: boolean
  additional_coverage_offered_in_the_gap?: boolean
  additional_drug_coverage_offered_in_the_gap?: boolean
  contract_year: string
  effective_date: string
  key: string
  created_date?: string
  last_modified?: string
}

export async function getMedicareAdvantageQuotes(
  params: MedicareAdvantageQuoteParams
): Promise<{ quotes?: MedicareAdvantageQuote[]; error?: string }> {
  try {
    console.log('🔄 Medicare Advantage quote request:', params)
    
    // Transform our simple params to match CSG API format (like hawknest-admin)
    const requestData = {
      zip5: params.zipCode,
      plan: "original", // Default to original Medicare Advantage
      sort: "price",
      order: "asc",
      effective_date: "2025-01-01T00:00:00.000" // Only fetch 2025 plan year (correct datetime format)
    }
    
    console.log('📤 Sending to Firebase function:', requestData)
    
    // Call Firebase function directly (matching hawknest-admin pattern)
    if (!functions) {
      throw new Error('Firebase functions not initialized')
    }
    
    const getMedicareAdvantageQuotesFunction = httpsCallable(functions, 'getMedicareAdvantageQuotes')
    const result = await getMedicareAdvantageQuotesFunction(requestData)
    
    console.log('🔍 RAW API RESPONSE:', JSON.stringify(result, null, 2))
    console.log('🔍 Response data type:', typeof result.data)
    console.log('🔍 Response data is array?:', Array.isArray(result.data))
    
    if (result.data && typeof result.data === 'object') {
      console.log('🔍 Response data keys:', Object.keys(result.data))
    }
    
    // Handle response - should be array of quotes directly (based on hawknest-admin)
    const quotes = result.data as MedicareAdvantageQuote[]
    
    if (!quotes || !Array.isArray(quotes)) {
      console.log('⚠️ No quotes array in response')
      return { quotes: [] }
    }

    // Filter to only include 2025 plan year quotes
    const filteredQuotes = quotes.filter(quote => {
      const contractYear = quote.contract_year
      const isValidYear = contractYear === "2025"
      if (!isValidYear) {
        console.log(`🔧 Filtering out quote with contract_year: ${contractYear}`)
      }
      return isValidYear
    })
    
    console.log('✅ Medicare Advantage quotes received:', quotes.length, 'total quotes')
    console.log('🎯 Filtered to 2025 plan year:', filteredQuotes.length, 'quotes')
    return { quotes: filteredQuotes }
    
  } catch (error) {
    console.error('❌ Error fetching Medicare Advantage quotes:', error)
    
    // Return a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return { 
      error: `Unable to fetch quotes: ${errorMessage}`,
      quotes: []
    }
  }
}
