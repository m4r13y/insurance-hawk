/**
 * Example Integration of PreferredCarriersFilter
 * 
 * This shows how to integrate the PreferredCarriersFilter component
 * into your existing filter sidebar and use it with quote data.
 * Now uses agent-specific preferred carriers from Firestore.
 */

import React, { useState, useMemo, useEffect } from 'react';
import PreferredCarriersFilter from '@/components/filters/PreferredCarriersFilter';
import { getAgentPreferredCarriers, type PreferredCarrier } from '@/lib/carrier-system';

// Example usage in a quotes component
export function QuotesWithPreferredCarrierFilter({ 
  quotes, 
  agentId 
}: { 
  quotes: any[]; 
  agentId: string;
}) {
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  const [preferredCarriers, setPreferredCarriers] = useState<PreferredCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load agent's preferred carriers
  useEffect(() => {
    async function loadPreferredCarriers() {
      try {
        setLoading(true);
        const carriers = await getAgentPreferredCarriers(agentId, 'medicare-supplement');
        setPreferredCarriers(carriers);
      } catch (error) {
        console.error('Failed to load preferred carriers:', error);
        setPreferredCarriers([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (agentId) {
      loadPreferredCarriers();
    }
  }, [agentId]);
  
  // Filter quotes based on preferred carrier setting
  const filteredQuotes = useMemo(() => {
    if (!showPreferredOnly || loading) {
      return quotes;
    }
    
    return quotes.filter(quote => {
      const carrierName = quote.carrier?.name || quote.company_base?.name || '';
      const naicCode = quote.naic || '';
      
      return preferredCarriers.some(carrier => {
        // Check name patterns
        const nameMatch = carrier.namePatterns?.some(pattern => 
          carrierName.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(carrierName.toLowerCase())
        );
        
        // Check NAIC codes
        const naicMatch = naicCode && carrier.naicCodes?.includes(naicCode);
        
        return nameMatch || naicMatch;
      });
    });
  }, [quotes, showPreferredOnly, preferredCarriers, loading]);
  
  // Count preferred vs total quotes
  const preferredQuotes = useMemo(() => {
    if (loading) return [];
    
    return quotes.filter(quote => {
      const carrierName = quote.carrier?.name || quote.company_base?.name || '';
      const naicCode = quote.naic || '';
      
      return preferredCarriers.some(carrier => {
        const nameMatch = carrier.namePatterns?.some(pattern => 
          carrierName.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(carrierName.toLowerCase())
        );
        const naicMatch = naicCode && carrier.naicCodes?.includes(naicCode);
        return nameMatch || naicMatch;
      });
    });
  }, [quotes, preferredCarriers, loading]);
  
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
          category="medicare-supplement"
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
