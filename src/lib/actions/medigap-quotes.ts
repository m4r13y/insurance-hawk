"use server"

import { httpsCallable, getFunctions } from 'firebase/functions'
import app from '@/lib/firebase'
import { getCarrierByNaicCode } from '@/lib/naic-carriers'

interface MedigapQuoteParams {
  zipCode: string
  age: string
  gender: "M" | "F"
  tobacco: "0" | "1" 
  plans: string[]
  appointedNaicCodes?: string[]
}

interface MedigapQuote {
  id?: string
  monthly_premium: number
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null
  plan_name?: string
  plan?: string
  naic?: string
  company?: string
  company_base?: { name?: string; full_name?: string; logo_url?: string | null }
  effective_date?: string
  discounts?: Array<{ name: string; amount: number }>
  fees?: Array<{ name: string; amount: number }>
  rate?: { month?: number }
  plan_type?: string
  am_best_rating?: string
  rate_type?: string
  naicCarrierInfo?: {
    carrierId: string
    phone: string
    website: string
  }
}

export async function getMedigapQuotes(params: MedigapQuoteParams): Promise<{ quotes?: MedigapQuote[]; error?: string }> {
  try {
    // Check if Firebase app is available
    if (!app) {
      console.error('❌ Firebase app not available')
      return { 
        error: 'Quote service not available. Firebase app is not configured. Please check your Firebase setup.' 
      }
    }
    
    // Note: Authentication is handled by Firebase Functions automatically
    
    // Initialize Firebase Functions with correct region
    const functions = getFunctions(app, 'us-central1') // Specify region explicitly
    if (!functions) {
      console.error('❌ Firebase functions not available')
      return { 
        error: 'Quote service not available. Firebase functions are not configured.' 
      }
    }
    
    // Collect all quotes from all selected plans
    const allQuotes: MedigapQuote[] = []
    
    // Call the Firebase function for each selected plan
    const getMedigapQuotesFn = httpsCallable(functions, 'getMedigapQuotes')
    
    for (const plan of params.plans) {
      try {
        // Convert form parameters to Firebase function format (matching hawknest client portal)
        const functionParams = {
          zip5: params.zipCode,
          age: parseInt(params.age),
          gender: params.gender,
          tobacco: parseInt(params.tobacco),
          plan: plan
        }
        
        const result = await getMedigapQuotesFn(functionParams)
        
        // Handle the response format (matching hawknest client portal exactly)
        // The CSG API returns data in various formats, need to handle all cases
        let rawQuotes: unknown[] = []
        
        if (result.data) {
          // If the response has a quotes array (wrapped response)
          if (typeof result.data === 'object' && 'quotes' in result.data && Array.isArray((result.data as Record<string, unknown>).quotes)) {
            rawQuotes = (result.data as Record<string, unknown>).quotes as unknown[]
          }
          // If the response is an array itself (direct response)
          else if (Array.isArray(result.data)) {
            rawQuotes = result.data
          }
          // If the response has a results array (another CSG format)
          else if (typeof result.data === 'object' && 'results' in result.data && Array.isArray((result.data as Record<string, unknown>).results)) {
            rawQuotes = (result.data as Record<string, unknown>).results as unknown[]
          }
        }
        
        if (rawQuotes.length === 0) {
          console.warn(`No quotes returned for plan ${plan}`)
          continue
        }
        
        // Transform quotes to match hawknest client portal format
        const transformedQuotes = rawQuotes.map((q: unknown, idx: number) => {
          const quoteData = q as Record<string, unknown>
          const companyBase = (quoteData.company_base as Record<string, unknown>) || {}
          
          // Extract monthly premium (handle both rate.month format and direct monthly_premium)
          let monthly_premium = 0
          if (quoteData.monthly_premium && typeof quoteData.monthly_premium === 'number') {
            // If it's already in dollars, use as-is
            monthly_premium = quoteData.monthly_premium
          } else if (quoteData.rate && typeof quoteData.rate === 'object' && quoteData.rate !== null) {
            const rate = quoteData.rate as Record<string, unknown>
            if (rate.month && typeof rate.month === 'number') {
              // Convert from cents to dollars
              monthly_premium = rate.month / 100
            }
          }
          
          // Extract carrier information (prioritize company_base, fall back to carrier)
          const carrier = {
            name: (companyBase.name as string) || ((quoteData.carrier as Record<string, unknown>)?.name as string) || (quoteData.company as string) || 'Unknown Carrier',
            full_name: (companyBase.full_name as string) || (companyBase.name as string) || ((quoteData.carrier as Record<string, unknown>)?.full_name as string),
            logo_url: (companyBase.logo_url as string) || ((quoteData.carrier as Record<string, unknown>)?.logo_url as string) || null
          }
          
          // Generate stable ID - include plan type for uniqueness across multiple plans
          const id = (quoteData.id as string) || `${(quoteData.plan_name as string) || 'plan'}-${carrier.name}-${plan}-${idx}`
          
          // Extract NAIC code from various possible locations
          let naicCode = (companyBase.naic as string) ||
                        quoteData.naic as string || 
                        quoteData.NAIC as string ||
                        (companyBase.NAIC as string) ||
                        ((quoteData.carrier as Record<string, unknown>)?.naic as string) ||
                        ((quoteData.carrier as Record<string, unknown>)?.NAIC as string)
          
          const quote: MedigapQuote = {
            id,
            monthly_premium,
            carrier,
            plan_name: (quoteData.plan_name as string) || `Medicare Supplement Plan ${plan}`,
            plan: (quoteData.plan as string) || plan,
            naic: naicCode,
            company: (quoteData.company as string) || carrier.name,
            company_base: companyBase as { name?: string; full_name?: string; logo_url?: string | null },
            effective_date: quoteData.effective_date as string,
            discounts: quoteData.discounts as Array<{ name: string; amount: number }>,
            fees: quoteData.fees as Array<{ name: string; amount: number }>,
            rate: quoteData.rate as { month?: number },
            plan_type: quoteData.plan_type as string,
            am_best_rating: quoteData.am_best_rating as string,
            rate_type: quoteData.rate_type as string
          }
          
          return quote
        })
        
        allQuotes.push(...transformedQuotes)
        
      } catch (planError) {
        console.error(`Error fetching quotes for plan ${plan}:`, planError)
        // Continue with other plans even if one fails
      }
    }
    
    // First, enhance all quotes with NAIC carrier information (but don't filter yet)
    const enhancedQuotes = allQuotes.map(quote => {
      if (quote.naic) {
        const naicCarrier = getCarrierByNaicCode(quote.naic)
        if (naicCarrier) {
          // Enhance the carrier information with NAIC data
          return {
            ...quote,
            carrier: {
              ...quote.carrier,
              name: quote.carrier?.name || naicCarrier.shortName || naicCarrier.carrierName,
              full_name: quote.carrier?.full_name || naicCarrier.carrierName,
              logo_url: quote.carrier?.logo_url || naicCarrier.logoUrl
            },
            // Add additional NAIC carrier info for reference
            naicCarrierInfo: {
              carrierId: naicCarrier.carrierId,
              phone: naicCarrier.phone,
              website: naicCarrier.website
            }
          }
        }
      }
      return quote
    })
    
    // Sort all quotes by monthly premium (lowest first) like in client portal
    enhancedQuotes.sort((a, b) => a.monthly_premium - b.monthly_premium)
    
    // Apply NAIC filtering AFTER all processing is complete
    let finalQuotes = enhancedQuotes
    
    // Filter by appointed carriers if specified, otherwise filter by valid NAIC codes
    if (params.appointedNaicCodes && params.appointedNaicCodes.length > 0) {
      finalQuotes = enhancedQuotes.filter(quote => {
        if (!quote.naic) return false
        return params.appointedNaicCodes!.includes(quote.naic)
      })
    } else {
      // Default filtering: only show quotes from carriers in our NAIC database
      finalQuotes = enhancedQuotes.filter(quote => {
        if (!quote.naic) return false
        // Normalize NAIC code for comparison (trim whitespace, ensure string)
        const normalizedNaic = String(quote.naic).trim()
        const carrier = getCarrierByNaicCode(normalizedNaic)
        return !!carrier
      })
    }
    
    return { quotes: finalQuotes }
    
  } catch (error: unknown) {
    console.error('Error fetching Medigap quotes:', error)
    
    // Handle Firebase function errors gracefully
    let errorMessage = 'Unable to fetch quotes at this time. Please try again later.'
    
    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as Record<string, unknown>).code === 'functions/unauthenticated') {
        errorMessage = 'Authentication required to fetch quotes.'
      } else if ((error as Record<string, unknown>).code === 'functions/permission-denied') {
        errorMessage = 'Permission denied. Please check your access level.'
      } else if ((error as Record<string, unknown>).code === 'functions/unavailable') {
        errorMessage = 'Quote service temporarily unavailable. Please try again in a few minutes.'
      } else if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
        errorMessage = (error as Record<string, unknown>).message as string
      }
    }
    
    return { error: errorMessage }
  }
}
