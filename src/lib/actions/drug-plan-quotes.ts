"use server"

import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface DrugPlanQuoteParams {
  zipCode: string
}

interface DrugPlanQuote {
  organization_name?: string
  plan_name?: string
  plan_id?: string
  contract_id?: string
  month_rate?: number
  part_c_rate?: number
  part_d_rate?: number
  plan_type?: string
  overall_star_rating?: number
  in_network_moop?: string
  in_network_moop_sort?: number
  county?: string
  state?: string
  drug_benefit_type?: string
  drug_benefit_type_detail?: string
  benefits?: Array<{
    benefit_type: string
    full_description: string
    summary_description?: any
  }>
  key?: string
  created_date?: string
  last_modified?: string
}

export async function getDrugPlanQuotes(
  params: DrugPlanQuoteParams
): Promise<{ quotes?: DrugPlanQuote[]; error?: string }> {
  try {
    console.log('�🚀🚀 DRUG PLAN API CALL STARTED')
    console.log('�🔄 Drug Plan quote request:', params)
    
    // Transform our simple params to match CSG API format (like hawknest-admin)
    const requestData = {
      zip5: params.zipCode,
      plan: "pdp", // Prescription Drug Plan
      sort: "price",
      order: "asc"
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
    const quotes = result.data as DrugPlanQuote[]
    
    if (!quotes || !Array.isArray(quotes)) {
      console.log('⚠️ No quotes array in response')
      return { quotes: [] }
    }
    
    console.log('✅ Drug Plan quotes received:', quotes.length, 'quotes')
    return { quotes: quotes }
    
  } catch (error) {
    console.error('❌ Error fetching Drug Plan quotes:', error)
    
    // Return a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return { 
      error: `Unable to fetch quotes: ${errorMessage}`,
      quotes: []
    }
  }
}
