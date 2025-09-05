/**
 * Example Integration of PreferredCarriersFilter
 * 
 * This shows how to integrate the PreferredCarriersFilter component
 * into your existing filter sidebar and use it with quote data.
 * Uses static preferred carriers configuration.
 */

import React, { useState, useMemo, useEffect } from 'react';
import PreferredCarriersFilter from '@/components/filters/PreferredCarriersFilter';
import { getPreferredCarriers, filterPreferredCarriers, type PreferredCarrier } from '@/lib/carrier-system';

// Example usage in a quotes component
export function QuotesWithPreferredCarrierFilter({ 
  quotes, 
  category = 'medicare-supplement'
}: { 
  quotes: any[]; 
  category?: 'medicare-supplement' | 'medicare-advantage' | 'dental' | 'final-expense' | 'hospital-indemnity' | 'cancer' | 'drug-plan';
}) {
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  const [preferredCarriers, setPreferredCarriers] = useState<PreferredCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load preferred carriers for the specified category
  useEffect(() => {
    try {
      setLoading(true);
      const carriers = getPreferredCarriers(category);
      setPreferredCarriers(carriers);
    } catch (error) {
      console.error('Failed to load preferred carriers:', error);
      setPreferredCarriers([]);
    } finally {
      setLoading(false);
    }
  }, [category]);
  
  // Filter quotes based on preferred carrier setting
  const filteredQuotes = useMemo(() => {
    if (!showPreferredOnly || loading) {
      return quotes;
    }
    
    return filterPreferredCarriers(quotes, category);
  }, [quotes, showPreferredOnly, loading, category]);
  
  // Count preferred vs total quotes
  const preferredQuotes = useMemo(() => {
    if (loading) return [];
    
    return filterPreferredCarriers(quotes, category);
  }, [quotes, loading, category]);
  
  const preferredCount = preferredQuotes.length;
  const totalCount = quotes.length;
  
  return (
    <div className="flex">
      {/* Sidebar with filters */}
      <div className="w-64 p-4 bg-white border-r">
        <h3 className="font-semibold mb-4">Filters</h3>
        
        {/* Preferred Carriers Filter */}
        <PreferredCarriersFilter
          isEnabled={showPreferredOnly}
          onToggle={setShowPreferredOnly}
          preferredCount={preferredCount}
          totalCount={totalCount}
          category={category as "medicare-supplement" | "medicare-advantage" | "dental" | "final-expense" | "hospital-indemnity"}
        />
        
        {/* Other filters would go here */}
        
      </div>
      
      {/* Quote results */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {showPreferredOnly ? 'Preferred ' : ''}Medicare Supplement Quotes
          </h2>
          <p className="text-gray-600">
            Showing {filteredQuotes.length} of {totalCount} quotes
          </p>
        </div>
        
        {/* Quote cards */}
        <div className="space-y-4">
          {filteredQuotes.map((quote, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium">{quote.carrier_name}</h3>
              <p className="text-lg font-semibold">${quote.monthly_premium}</p>
              <p className="text-sm text-gray-600">Plan {quote.plan_letter}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example of how to integrate into existing sidebar component
export function ExistingFilterSidebar({ quotes }: { quotes: any[] }) {
  const [filters, setFilters] = useState({
    preferredCarriersOnly: false,
    planType: 'all',
    maxPremium: 500,
    // ... other filter states
  });
  
  const preferredQuotes = filterPreferredCarriers(quotes, 'medicare-supplement');
  
  return (
    <div className="w-64 space-y-4">
      {/* Add at the top of existing filters */}
      <PreferredCarriersFilter
        isEnabled={filters.preferredCarriersOnly}
        onToggle={(enabled: boolean) => setFilters(prev => ({ 
          ...prev, 
          preferredCarriersOnly: enabled 
        }))}
        preferredCount={preferredQuotes.length}
        totalCount={quotes.length}
        category="medicare-supplement"
      />
      
      {/* Existing filter components */}
      
    </div>
  );
}
