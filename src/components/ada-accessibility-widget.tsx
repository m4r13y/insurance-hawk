"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GearIcon, EyeOpenIcon, FontSizeIcon, ChevronLeftIcon, SunIcon, MoonIcon } from '@radix-ui/react-icons'

export default function AdaAccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal'
  })

  // Safe font size adjustment - only affects specific elements
  const adjustFontSize = (size: string) => {
    setSettings(prev => ({ ...prev, fontSize: size }))
    
    // Apply font size using CSS custom properties with a specific class
    const root = document.documentElement
    
    // Remove existing font size classes
    root.classList.remove('ada-font-small', 'ada-font-normal', 'ada-font-large', 'ada-font-extra-large')
    
    // Add new font size class
    switch (size) {
      case 'small':
        root.classList.add('ada-font-small')
        break
      case 'large':
        root.classList.add('ada-font-large')
        break
      case 'extra-large':
        root.classList.add('ada-font-extra-large')
        break
      default:
        root.classList.add('ada-font-normal')
    }
    
    // Store preference
    try {
      localStorage.setItem('ada-font-size', size)
    } catch (error) {
      console.warn('Could not save font size preference:', error)
    }
  }

  // Safe contrast adjustment - uses classes instead of global styles
  const adjustContrast = (contrast: string) => {
    setSettings(prev => ({ ...prev, contrast }))
    
    const body = document.body
    
    // Remove existing contrast classes
    body.classList.remove('ada-contrast-high', 'ada-contrast-inverted')
    
    // Add new contrast class
    switch (contrast) {
      case 'high':
        body.classList.add('ada-contrast-high')
        break
      case 'inverted':
        body.classList.add('ada-contrast-inverted')
        break
      default:
        // Normal contrast - no class needed
        break
    }
    
    // Store preference
    try {
      localStorage.setItem('ada-contrast', contrast)
    } catch (error) {
      console.warn('Could not save contrast preference:', error)
    }
  }

  // Reset all settings
  const resetSettings = () => {
    setSettings({
      fontSize: 'normal',
      contrast: 'normal'
    })
    
    // Remove all ADA classes
    const root = document.documentElement
    const body = document.body
    
    root.classList.remove('ada-font-small', 'ada-font-normal', 'ada-font-large', 'ada-font-extra-large')
    body.classList.remove('ada-contrast-high', 'ada-contrast-inverted')
    
    // Clear localStorage
    try {
      localStorage.removeItem('ada-font-size')
      localStorage.removeItem('ada-contrast')
    } catch (error) {
      console.warn('Could not clear preferences:', error)
    }
  }

  // Dark mode toggle function
  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    
    const html = document.documentElement
    
    if (newValue) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // Store preference
    try {
      localStorage.setItem('dark-mode', newValue.toString())
    } catch (error) {
      console.warn('Could not save dark mode preference:', error)
    }
  }

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem('ada-font-size')
      const savedContrast = localStorage.getItem('ada-contrast')
      const savedCollapsed = localStorage.getItem('ada-collapsed')
      const savedDarkMode = localStorage.getItem('dark-mode')

      if (savedFontSize) {
        adjustFontSize(savedFontSize)
      }
      if (savedContrast) {
        adjustContrast(savedContrast)
      }
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true')
      }
      if (savedDarkMode !== null) {
        const isDark = savedDarkMode === 'true'
        setDarkMode(isDark)
        if (isDark) {
          document.documentElement.classList.add('dark')
        }
      } else {
        // Check system preference if no saved preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(prefersDark)
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        }
      }
    } catch (error) {
      console.warn('Could not load saved preferences:', error)
    }
  }, [])

  // Save collapsed state when it changes
  useEffect(() => {
    try {
      localStorage.setItem('ada-collapsed', isCollapsed.toString())
    } catch (error) {
      console.warn('Could not save collapsed state:', error)
    }
  }, [isCollapsed])

  return (
    <>
      {/* ADA Widget Tab */}
      <div className="fixed bottom-4 right-0 z-50">
        {isCollapsed ? (
          // Collapsed state - just a small caret
          <button
            onClick={() => setIsCollapsed(false)}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-l-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Expand accessibility options"
            title="Accessibility & Settings"
          >
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
        ) : (
          // Expanded tab state
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-l-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open accessibility options"
              title="Accessibility & Settings"
            >
              <GearIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                  e.stopPropagation()
                  setIsCollapsed(true)
                  setIsOpen(false)
                }}
                className="absolute -top-1 -left-1 bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
                aria-label="Collapse tab"
              >
                ×
              </button>
          </div>
        )}
      </div>

      {/* ADA Widget Panel */}
      <AnimatePresence>
        {!isCollapsed && isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-4 right-12 z-50 bg-background border border-border rounded-l-xl rounded-tr-xl shadow-2xl w-80 max-w-[calc(100vw-4rem)] h-80 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
                  aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                >
                  {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                  {darkMode ? 'Light' : 'Dark'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close accessibility options"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Font Size Controls */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <FontSizeIcon className="h-4 w-4 mr-2" />
                    Text Size
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['small', 'normal', 'large', 'extra-large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => adjustFontSize(size)}
                        className={`p-2 text-xs rounded border transition-colors ${
                          settings.fontSize === size
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-secondary border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast Controls */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <EyeOpenIcon className="h-4 w-4 mr-2" />
                    Contrast
                  </h4>
                  <div className="space-y-1">
                    {[
                      { value: 'normal', label: 'Normal' },
                      { value: 'high', label: 'High Contrast' },
                      { value: 'inverted', label: 'Inverted' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => adjustContrast(value)}
                        className={`w-full p-2 text-xs rounded border text-left transition-colors ${
                          settings.contrast === value
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-secondary border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full p-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe CSS styles using scoped classes */}
      <style jsx global>{`
        /* Font Size Adjustments - only affects main content areas */
        .ada-font-small {
          font-size: 14px;
        }
        
        .ada-font-normal {
          font-size: 16px;
        }
        
        .ada-font-large {
          font-size: 18px;
        }
        
        .ada-font-extra-large {
          font-size: 20px;
        }

        /* Contrast Adjustments - targeted approach */
        .ada-contrast-high {
          filter: contrast(150%) brightness(110%);
        }
        
        .ada-contrast-high * {
          background-color: transparent !important;
        }
        
        .ada-contrast-inverted {
          filter: invert(100%) hue-rotate(180deg);
        }

        /* Motion Reduction - only affects animations */
        .ada-reduce-motion *,
        .ada-reduce-motion *::before,
        .ada-reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Screen reader support */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </>
  )
}
