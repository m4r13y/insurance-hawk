'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeaderUpper() {
  return (
    <header className="bg-blue-50 border-b border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="container mx-auto px-4 py-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}
