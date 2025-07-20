'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    // This is a client-side only effect that re-initializes Preline on route changes.
    const reinitPreline = async () => {
      // It's possible for this to run before the preline script is loaded.
      // We can wait for it to be available on the window object.
      let attempts = 0;
      const maxAttempts = 10;

      while (typeof window !== 'undefined' && !window.HSStaticMethods && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait 100ms
        attempts++;
      }

      if (typeof window !== 'undefined' && window.HSStaticMethods) {
        try {
          window.HSStaticMethods.autoInit();
        } catch (error) {
          console.warn('Preline autoInit failed:', error);
        }
      }
    };
    
    // We need a small delay to allow the DOM to update after a route change.
    const timer = setTimeout(() => {
      reinitPreline();
    }, 100);

    return () => clearTimeout(timer);
  }, [path]);

  return null;
}
