"use client"

import { useEffect } from 'react';

export const useScrollbarFix = () => {
  useEffect(() => {
    // Store original body styles
    const originalOverflow = document.body.style.overflow;
    const originalScrollbarGutter = document.body.style.scrollbarGutter;
    
    // Function to maintain scrollbar
    const maintainScrollbar = () => {
      document.body.style.setProperty('overflow-y', 'scroll', 'important');
      document.body.style.setProperty('scrollbar-gutter', 'stable', 'important');
    };

    // Apply our scrollbar maintenance immediately
    maintainScrollbar();

    // Create a MutationObserver to watch for changes to the body element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // Check if data-scroll-locked attribute was added/changed
          if (mutation.attributeName?.startsWith('data-scroll-locked') || 
              mutation.attributeName === 'style') {
            // Reapply our scrollbar styles
            maintainScrollbar();
          }
        }
      });
    });

    // Start observing the body element
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked', 'style', 'aria-hidden']
    });

    // Also override any direct style modifications
    const originalSetProperty = document.body.style.setProperty;
    document.body.style.setProperty = function(property: string, value: string, priority?: string) {
      if (property === 'overflow' || property === 'overflow-y') {
        // Always maintain scroll behavior
        return originalSetProperty.call(this, property, 'scroll', 'important');
      }
      if (property === 'scrollbar-gutter') {
        return originalSetProperty.call(this, property, 'stable', 'important');
      }
      return originalSetProperty.call(this, property, value, priority);
    };

    // Cleanup function
    return () => {
      observer.disconnect();
      // Restore original setProperty function
      document.body.style.setProperty = originalSetProperty;
      // Restore original styles if they existed
      if (originalOverflow) {
        document.body.style.overflow = originalOverflow;
      }
      if (originalScrollbarGutter) {
        document.body.style.scrollbarGutter = originalScrollbarGutter;
      }
    };
  }, []);
};
