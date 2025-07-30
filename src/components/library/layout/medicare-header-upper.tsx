'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

export function HeaderUpper() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Apply dark mode to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <header className="bg-blue-50 border-b border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="w-full max-w-[1440px] mx-auto px-12 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Medicare Education & Guidance
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <Link 
              href="/resources/" 
              className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              Education Hub
            </Link>
            <Link 
              href="/Medicare/" 
              className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              Medicare Basics
            </Link>
            <Button 
              asChild 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/Medicare/enrollment-periods">
                Check Enrollment
              </Link>
            </Button>
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-8 w-8 p-0"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 text-yellow-500" />
              ) : (
                <MoonIcon className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
