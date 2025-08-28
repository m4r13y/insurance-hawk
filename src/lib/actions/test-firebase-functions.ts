"use server"

import { httpsCallable, getFunctions } from 'firebase/functions'
import { app } from '@/lib/firebase'

export async function testFirebaseFunctions(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🧪 Testing Firebase Functions connection...')
    
    // Check if Firebase app is available
    if (!app) {
      return { 
        success: false, 
        message: 'Firebase app not initialized' 
      }
    }
    
    // Initialize Firebase Functions
    const functions = getFunctions(app)
    console.log('✅ Firebase Functions initialized')
    
    // Try to call a simple function (you can create a test function or use an existing one)
    const testFn = httpsCallable(functions, 'getMedigapQuotes')
    console.log('✅ Function callable created')
    
    // Test with minimal data
    const testResult = await testFn({
      zip5: "90210",
      age: 65,
      gender: "M",
      tobacco: 0,
      plan: "A"
    })
    
    console.log('✅ Test function call successful:', testResult)
    
    return { 
      success: true, 
      message: 'Firebase Functions connection successful!' 
    }
    
  } catch (error: unknown) {
    console.error('❌ Firebase Functions test failed:', error)
    
    let errorMessage = 'Unknown error occurred'
    if (error && typeof error === 'object' && 'code' in error) {
      errorMessage = `Firebase Error: ${(error as any).code} - ${(error as any).message}`
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { 
      success: false, 
      message: errorMessage 
    }
  }
}
