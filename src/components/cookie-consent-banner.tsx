"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SizeIcon as ShieldIcon, GearIcon, ChevronDownIcon, ChevronUpIcon, InfoCircledIcon } from '@radix-ui/react-icons'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const COOKIE_CONSENT_KEY = 'insurance-hawk-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'insurance-hawk-cookie-preferences'

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })

  // Cookie categories with descriptions
  const cookieCategories = [
    {
      key: 'necessary' as keyof CookiePreferences,
      name: 'Necessary Cookies',
      description: 'Essential for website functionality, security, and compliance with insurance regulations.',
      required: true,
      examples: 'Authentication, security, quote data, HIPAA compliance'
    },
    {
      key: 'functional' as keyof CookiePreferences,
      name: 'Functional Cookies',
      description: 'Enable enhanced features like quote comparison, saved plans, and personalized recommendations.',
      required: false,
      examples: 'Quote history, plan preferences, accessibility settings'
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      name: 'Analytics Cookies',
      description: 'Help us understand how you use our insurance tools and improve your experience.',
      required: false,
      examples: 'Google Analytics, usage tracking (anonymized)'
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      name: 'Marketing Cookies',
      description: 'Enable personalized insurance offers and relevant health plan recommendations.',
      required: false,
      examples: 'Targeted ads, carrier partnerships, promotional content'
    }
  ]

  // Check if consent is needed
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setIsVisible(true)
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs))
        } catch (error) {
          console.warn('Could not parse cookie preferences:', error)
        }
      }
    }
  }, [])

  // Handle consent decision
  const handleConsent = (acceptAll: boolean = false) => {
    const finalPreferences = acceptAll
      ? { necessary: true, analytics: true, marketing: true, functional: true }
      : preferences

    // Save consent and preferences
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences))

    // Apply analytics and marketing scripts based on preferences
    if (finalPreferences.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics cookies enabled')
      // Example: loadGoogleAnalytics()
    }

    if (finalPreferences.marketing) {
      // Initialize marketing/advertising cookies
      console.log('Marketing cookies enabled')
      // Example: loadMarketingScripts()
    }

    if (finalPreferences.functional) {
      // Initialize functional cookies
      console.log('Functional cookies enabled')
    }

    setIsVisible(false)
  }

  // Handle preference change
  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return // Necessary cookies can't be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }))
  }

  // Reject all non-necessary cookies
  const handleRejectAll = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    })
    handleConsent(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl"
      >
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Main content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Privacy & Cookie Preferences
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to provide secure insurance quote comparisons, improve your experience, 
                    and comply with healthcare privacy regulations including HIPAA. Your Medicare and health 
                    data privacy is our priority.
                  </p>
                </div>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <a href="/privacy-policy" className="hover:text-foreground underline">
                  Privacy Policy
                </a>
                <a href="/cookie-policy" className="hover:text-foreground underline">
                  Cookie Policy
                </a>
                <a href="/hipaa-notice" className="hover:text-foreground underline">
                  HIPAA Notice
                </a>
                <a href="/terms" className="hover:text-foreground underline">
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[300px]">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                size="sm"
                className="whitespace-nowrap flex items-center gap-2"
              >
                <GearIcon className="h-4 w-4" />
                Customize
                {showDetails ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Necessary Only
              </Button>
              <Button
                onClick={() => handleConsent(true)}
                size="sm"
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>

          {/* Detailed preferences */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {cookieCategories.map((category) => (
                    <div
                      key={category.key}
                      className="p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">
                            {category.name}
                          </h4>
                          {category.required && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[category.key]}
                            onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                            disabled={category.required}
                            className="sr-only"
                          />
                          <div className={`relative w-10 h-6 rounded-full transition-colors ${
                            preferences[category.key] 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          } ${category.required ? 'opacity-50' : ''}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences[category.key] ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </div>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {category.description}
                      </p>
                      <div className="flex items-start gap-1">
                        <InfoCircledIcon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Examples:</strong> {category.examples}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save preferences button */}
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => handleConsent(false)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save My Preferences
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compliance note */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              🏥 <strong>Healthcare Compliance:</strong> This site is HIPAA compliant and follows CMS guidelines for Medicare information. 
              All health data is encrypted and protected according to federal healthcare privacy standards.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
