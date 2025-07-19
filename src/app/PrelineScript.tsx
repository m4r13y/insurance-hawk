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
        await loadPreline();
      } catch (error) {
        console.warn('Some optional libraries failed to load:', error);
      }
    };

    initLibraries();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (
        window.HSStaticMethods &&
        typeof window.HSStaticMethods.autoInit === 'function'
      ) {
        window.HSStaticMethods.autoInit();
      }
    }, 100);
  }, [path]);

  return null;
}