'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Preline UI
async function loadPreline() {
  return import('preline/dist/index.js');
}

export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    const initLibraries = async () => {
      try {
        // Dynamically import optional third-party libraries
        const [
          { default: $ },
          { default: _ },
          { default: noUiSlider },
          DataTables,
          { default: Dropzone },
          VanillaCalendarPro
        ] = await Promise.all([
          import('jquery'),
          import('lodash'),
          import('nouislider'),
          import('datatables.net'),
          import('dropzone'),
          import('vanilla-calendar-pro')
        ]);

        // Safely assign to window
        if (typeof window !== 'undefined') {
          window._ = _;
          window.$ = $;
          window.jQuery = $;
          window.DataTable = $.fn.dataTable;
          window.noUiSlider = noUiSlider;
          window.VanillaCalendarPro = VanillaCalendarPro;
          window.Dropzone = Dropzone;
        }

        // Initialize Preline
        const preline = await loadPreline();
        
        // Wait a bit for DOM to be ready and then initialize
        setTimeout(() => {
          try {
            if (
              typeof window !== 'undefined' &&
              window.HSStaticMethods &&
              typeof window.HSStaticMethods.autoInit === 'function'
            ) {
              window.HSStaticMethods.autoInit();
            }
          } catch (error) {
            console.warn('Preline initialization failed:', error);
          }
        }, 200);
      } catch (error) {
        console.warn('Some optional libraries failed to load:', error);
      }
    };

    initLibraries();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (
          typeof window !== 'undefined' &&
          window.HSStaticMethods &&
          typeof window.HSStaticMethods.autoInit === 'function'
        ) {
          window.HSStaticMethods.autoInit();
        }
      } catch (error) {
        console.warn('Preline autoInit failed:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [path]);

  return null;
}