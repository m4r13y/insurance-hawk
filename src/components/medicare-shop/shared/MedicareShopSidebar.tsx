"use client";

// New unified sidebar: this file now proxies to SidebarShowcase.
// The original implementation has been moved to `MedicareShopSidebar.legacy.tsx`.
// We keep the prop interface for compatibility but most props are
// currently unused by the new global sidebar.

import React from "react";
import SidebarShowcase from "@/components/new-shop-components/sidebar/SidebarShowcase";
import { SavedPlansProvider } from "@/contexts/SavedPlansContext";
import { type QuoteFormData } from "./types";

export interface MedicareShopSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedCoverageLevel: string;
  setSelectedCoverageLevel: (level: string) => void;
  selectedCategory: string;
  selectedQuotePlans: string[];
  setSelectedQuotePlans: (plans: string[]) => void;
  applyDiscounts: boolean;
  setApplyDiscounts: (apply: boolean) => void;
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  setPaymentMode: (mode: 'monthly' | 'quarterly' | 'annually') => void;
  quoteFormData: QuoteFormData;
  realQuotes: any[];
  onClearFilters: () => void;
  showPreferredOnly: boolean;
  setShowPreferredOnly: (show: boolean) => void;
}

export default function MedicareShopSidebar(props: MedicareShopSidebarProps) {
  const { selectedCategory, applyDiscounts, setApplyDiscounts, showPreferredOnly, setShowPreferredOnly } = props;

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24">
        <SavedPlansProvider>
          <SidebarShowcase
            activeCategory={selectedCategory}
            preferredOnly={showPreferredOnly}
            onTogglePreferred={setShowPreferredOnly}
            applyDiscounts={applyDiscounts}
            onToggleApplyDiscounts={setApplyDiscounts}
          />
        </SavedPlansProvider>
      </div>
    </aside>
  );
}
