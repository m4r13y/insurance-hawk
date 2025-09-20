"use server"

import { httpsCallable, getFunctions } from 'firebase/functions'
import app from '@/lib/firebase'
import { getEnhancedCarrierInfo } from '@/lib/carrier-system'

interface MedigapQuoteParams {
  zipCode: string
  age: string
  gender: "M" | "F"
  tobacco: "0" | "1" 
  plans: string[]
}

interface MedigapQuote {
  id?: string
  monthly_premium: number
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null
  plan_name?: string
  plan?: string
  company?: string
  company_base?: { name?: string; full_name?: string; logo_url?: string | null }
  effective_date?: string
  discounts?: Array<{ name: string; amount: number }>
  fees?: Array<{ name: string; amount: number }>
  rate?: { month?: number }
  plan_type?: string
  am_best_rating?: string
  rate_type?: string
  // Add missing fields from real API data
  options?: Array<{
    id?: string
    name?: string
    view_type?: string[]
    monthly_premium?: number
    originalQuote?: {
      id?: string
      monthly_premium?: number
      discounts?: Array<{ type: string; value: number }>
      [key: string]: any
    }
    [key: string]: any
  }>
  ratingOptions?: Array<any>
  // Allow any additional fields from the API to be preserved
  [key: string]: any
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
        
        console.log(`🔍 Fetching quotes for plan ${plan}...`)
        
        // Add timeout and retry logic for memory/performance issues
        const result = await Promise.race([
          getMedigapQuotesFn(functionParams),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 45 seconds')), 45000)
          )
        ]) as any
        
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
          
          const quote: MedigapQuote = {
            // Core transformed fields
            id,
            monthly_premium,
            carrier,
            plan_name: (quoteData.plan_name as string) || `Medicare Supplement Plan ${plan}`,
            plan: (quoteData.plan as string) || plan,
            company: (quoteData.company as string) || carrier.name,
            company_base: companyBase as { name?: string; full_name?: string; logo_url?: string | null },
            effective_date: quoteData.effective_date as string,
            discounts: quoteData.discounts as Array<{ name: string; amount: number }>,
            fees: quoteData.fees as Array<{ name: string; amount: number }>,
            rate: quoteData.rate as { month?: number },
            plan_type: quoteData.plan_type as string,
            am_best_rating: quoteData.am_best_rating as string,
            rate_type: quoteData.rate_type as string,
            // Preserve ALL original data from API to avoid losing options, ratingOptions, etc.
            ...quoteData
          }
          
          return quote
        })
        
        allQuotes.push(...transformedQuotes)
        
      } catch (planError) {
        console.error(`Error fetching quotes for plan ${plan}:`, planError)
        
        // Handle specific Firebase function errors
        if (planError && typeof planError === 'object' && 'code' in planError) {
          const errorCode = (planError as Record<string, unknown>).code as string
          const errorMessage = (planError as Record<string, unknown>).message as string
          
          if (errorCode === 'functions/deadline-exceeded' || errorMessage?.includes('deadline-exceeded')) {
            console.warn(`⏱️ Plan ${plan} request timed out - Firebase function memory limit exceeded`)
          } else if (errorMessage?.includes('Memory limit') || errorMessage?.includes('memory')) {
            console.warn(`🧠 Plan ${plan} request failed - Firebase function memory limit exceeded`)
          } else if (errorCode === 'functions/internal') {
            console.warn(`⚠️ Plan ${plan} request failed - Firebase function internal error`)
          }
        } else if (planError instanceof Error && planError.message.includes('timeout')) {
          console.warn(`⏱️ Plan ${plan} request timed out after 45 seconds`)
        }
        
        // Continue with other plans even if one fails
      }
    }
    
    // Enhance all quotes with carrier information using STRICT matching only.
    // We preserve the original API-provided carrier fields so later strict logic can still operate on raw values.
    // Diagnostic: Log a sample of raw carrier fields BEFORE enhancement
    try {
      const sampleForLogging = allQuotes.slice(0, 30).map((q, idx) => {
        const rawCarrier = typeof q.carrier === 'object' ? q.carrier : { name: q.carrier } as any
        return {
          idx,
          plan: q.plan,
            raw: {
              name: rawCarrier?.name,
              full_name: rawCarrier?.full_name,
              company: q.company,
              company_base: {
                name: q.company_base?.name,
                full_name: q.company_base?.full_name
              }
            }
        }
      })
      console.log('🧪 MEDIGAP_ENHANCE_PRE_SAMPLE', sampleForLogging)
    } catch {}

    const enhancedQuotes = allQuotes.map(quote => {
      const enhancedCarrierInfo = getEnhancedCarrierInfo(quote, 'medicare-supplement')

      // Keep a copy of the original raw carrier name for debugging / future strict passes
      const originalName = typeof quote.carrier === 'string' ? quote.carrier : quote.carrier?.name
      const originalFullName = typeof quote.carrier === 'object' ? quote.carrier?.full_name : undefined

      // Only override display name & logo when we have a strict match (strictMatch === true)
      if (enhancedCarrierInfo.strictMatch) {
        console.log('🏷️ MEDIGAP_ENHANCE_APPLY', {
          reason: 'strict-match',
          originalName,
          originalFullName,
          appliedDisplay: enhancedCarrierInfo.displayName,
          logo: enhancedCarrierInfo.logoUrl,
          preferred: enhancedCarrierInfo.isPreferred
        })
        return {
          ...quote,
          carrier: {
            ...quote.carrier,
            name: enhancedCarrierInfo.displayName || originalName,
            full_name: originalFullName || quote.company || enhancedCarrierInfo.displayName || originalName,
            logo_url: enhancedCarrierInfo.logoUrl,
            // Attach marker fields for downstream components (non-breaking if they ignore them)
            _enhanced: true,
            _preferred: enhancedCarrierInfo.isPreferred,
            _strict: true,
            _original_name: originalName,
            _original_full_name: originalFullName
          }
        }
      }

      // No strict match: DO NOT assign another carrier's branding. Provide placeholder logo only if we have none.
      // Flag anomaly: rawName seems generic (e.g., 'Aetna') but full_name belongs to a different carrier
      if (originalName && originalFullName && !originalFullName.toLowerCase().includes(originalName.toLowerCase())) {
        console.warn('⚠️ MEDIGAP_CARRIER_NAME_MISMATCH', {
          originalName,
          originalFullName,
          plan: quote.plan,
          id: quote.id
        })
      }

      return {
        ...quote,
        carrier: {
          ...quote.carrier,
          name: originalName || enhancedCarrierInfo.displayName, // fallback to whatever raw we had
          full_name: originalFullName || quote.company || originalName || enhancedCarrierInfo.displayName,
          logo_url: quote.carrier?.logo_url || '/images/carrier-placeholder.svg',
          _enhanced: false,
          _preferred: false,
          _strict: false,
          _original_name: originalName,
          _original_full_name: originalFullName
        }
      }
    })
    
    // Sort all quotes by monthly premium (lowest first) like in client portal
    enhancedQuotes.sort((a, b) => a.monthly_premium - b.monthly_premium)
    
    // Return all enhanced quotes (no NAIC filtering)
    const finalQuotes = enhancedQuotes
    
    return { quotes: finalQuotes }
    
  } catch (error: unknown) {
    console.error('Error fetching Medigap quotes:', error)
    
    // Handle Firebase function errors gracefully
    let errorMessage = 'Unable to fetch quotes at this time. Please try again later.'
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as Record<string, unknown>).code as string
      const errorMsg = (error as Record<string, unknown>).message as string
      
      if (errorCode === 'functions/unauthenticated') {
        errorMessage = 'Authentication required to fetch quotes.'
      } else if (errorCode === 'functions/permission-denied') {
        errorMessage = 'Permission denied. Please check your access level.'
      } else if (errorCode === 'functions/unavailable') {
        errorMessage = 'Quote service temporarily unavailable. Please try again in a few minutes.'
      } else if (errorCode === 'functions/deadline-exceeded' || errorMsg?.includes('deadline-exceeded')) {
        errorMessage = 'Quote request timed out due to high server load. Please try again in a few minutes or select fewer plans at once.'
      } else if (errorCode === 'functions/internal' || errorMsg?.includes('Memory limit')) {
        errorMessage = 'Quote service is experiencing high load. Please try again in a few minutes or select fewer plans at once.'
      } else if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
        errorMessage = (error as Record<string, unknown>).message as string
      }
    } else if (error instanceof Error && error.message.includes('timeout')) {
      errorMessage = 'Quote request timed out. Please try again in a few minutes or select fewer plans at once.'
    }
    
    return { error: errorMessage }
  }
}
