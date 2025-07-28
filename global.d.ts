

declare global {
  interface Window {
    // Optional third-party libraries
    _: typeof import("lodash");
    $: typeof import("jquery");
    jQuery: typeof import("jquery");
    DataTable: any;
    Dropzone: any;
    VanillaCalendarPro: any;
    noUiSlider: any;

    // ...existing code...
  }
}

export {};