"use client"

import { signInAnonymously } from 'firebase/auth'
import { auth } from '@/lib/firebase'

/**
 * Ensures the user is authenticated (anonymously) for Firebase function calls
 * This is required because Firebase callable functions require authentication
 */
export async function ensureAuthenticated(): Promise<boolean> {
  try {
    if (!auth) {
      console.error('Firebase Auth not initialized')
      return false
    }

    // Check if user is already authenticated
    if (auth.currentUser) {
      console.log('User already authenticated:', auth.currentUser.uid)
      return true
    }

    // Sign in anonymously for function calls
    console.log('Signing in anonymously for Firebase function access...')
    const userCredential = await signInAnonymously(auth)
    console.log('Anonymous sign-in successful:', userCredential.user.uid)
    
    return true
  } catch (error) {
    console.error('Authentication failed:', error)
    return false
  }
}
