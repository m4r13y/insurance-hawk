'use client';

import React, { useState, useEffect } from 'react';
import { loadFromStorage, HOSPITAL_INDEMNITY_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { QuoteSelector } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/QuoteSelector';
import { ComparisonModal } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/ComparisonModal';
import { QuoteOverview } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/QuoteOverview';
import { FieldMappingTable } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/FieldMappingTable';
import { ProductVariationAnalysis } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/ProductVariationAnalysis';
import { DataAnalysis } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/DataAnalysis';
import { RawDataInspector } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/RawDataInspector';
import { ComparisonControls } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/ComparisonControls';
import { ProductVariationParser } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/ProductVariationParser';
import { SmartAnalysisDemo } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SmartAnalysisDemo';
/* import { CompanyPlanHierarchy } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/CompanyPlanHierarchy'; */
import { SimplifiedHospitalIndemnityPlanBuilder } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder';
import { 
  HospitalIndemnityPlanBuilder,
  SmartHospitalIndemnityPlanBuilder
} from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/PlaceholderComponents';

// Utility function for managing comparison state
function toggleQuoteForComparison<T extends { id: string }>(
  quote: T,
  currentSelection: T[],
  maxComparisons: number = 3
): T[] {
  const isAlreadySelected = currentSelection.some(q => q.id === quote.id);
  
  if (isAlreadySelected) {
    return currentSelection.filter(q => q.id !== quote.id);
  }
  
  if (currentSelection.length >= maxComparisons) {
    return currentSelection;
  }
  
  return [...currentSelection, quote];
}

export default function HospitalIndemnityFieldMappingPage() {
  const [quotes, setQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupByPlan, setGroupByPlan] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [rawApiData, setRawApiData] = useState<any>(null);

  // Function to copy API response to clipboard
  const copyApiResponseToClipboard = async () => {
    try {
      // For now, copy the optimized quotes structure
      // TODO: We should store and retrieve the raw API response
      const dataToString = JSON.stringify(quotes, null, 2);
      await navigator.clipboard.writeText(dataToString);
      
      // Show success feedback
      alert('Hospital Indemnity API response copied to clipboard!\n\nNote: This is the optimized quote data. For the raw API response, we need to enhance the storage system.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please check console for details.');
    }
  };

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        console.log('📥 Loading hospital indemnity quotes from storage...');
        const savedQuotes = await loadFromStorage<OptimizedHospitalIndemnityQuote[]>(HOSPITAL_INDEMNITY_QUOTES_KEY, []);
        
        // Also load raw API response
        try {
          const savedRawData = await loadFromStorage('medicare_hospital_indemnity_raw_api_response', null);
          setRawApiData(savedRawData);
          console.log('📥 Loaded raw API data:', savedRawData);
        } catch (rawError) {
          console.warn('⚠️ Could not load raw API data:', rawError);
        }
        
        if (savedQuotes && savedQuotes.length > 0) {
          console.log(`✅ Found ${savedQuotes.length} hospital indemnity quotes`);
          setQuotes(savedQuotes);
          setSelectedQuote(savedQuotes[0]); // Auto-select first quote
        } else {
          console.log('📝 No hospital indemnity quotes found in storage');
        }
      } catch (error) {
        console.error('❌ Error loading hospital indemnity quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  // Comparison functions
  const handleToggleComparison = (quote: OptimizedHospitalIndemnityQuote) => {
    setSelectedForComparison(prev => toggleQuoteForComparison(quote, prev, 3));
  };

  const handleRemoveFromComparison = (quote: OptimizedHospitalIndemnityQuote) => {
    setSelectedForComparison(prev => prev.filter(q => q.id !== quote.id));
  };

  const handleClearComparison = () => {
    setSelectedForComparison([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospital indemnity quotes...</p>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="container mx-auto py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Hospital Indemnity Quotes Found</h1>
          <p className="text-gray-600">
            No hospital indemnity insurance quotes are currently stored. Please run a hospital indemnity quote search first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Indemnity Field Mapping Test</h1>
        <p className="text-gray-600 mb-4">
          Analyze and inspect hospital indemnity insurance quote data structure and field mappings
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={copyApiResponseToClipboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📋 Copy API Response
          </button>
        </div>
        
        {/* Comparison Controls */}
        <ComparisonControls
          selectedForComparison={selectedForComparison}
          onShowComparison={() => setShowComparison(true)}
          onClearSelection={handleClearComparison}
        />
      </div>

      {/* Simple Company/Plan Hierarchy */}
      {/* <CompanyPlanHierarchy quotes={quotes} /> */}

      {/* Simplified Hospital Indemnity Plan Builder */}
      <SimplifiedHospitalIndemnityPlanBuilder
        quotes={quotes}
        onPlanBuilt={(config) => {
          console.log('Plan built:', config);
          alert(`Plan built successfully!\nCompany: ${config.quote?.companyName}\nDaily Benefit: $${config.selectedDailyBenefit}\nTotal Premium: $${config.totalPremium?.toFixed(2)}/month`);
        }}
      />

      {/* Quote Selector */}
      <QuoteSelector
        quotes={quotes}
        selectedQuote={selectedQuote}
        onSelectQuote={setSelectedQuote}
        groupByPlan={groupByPlan}
        onToggleGrouping={setGroupByPlan}
        selectedForComparison={selectedForComparison}
        onToggleComparison={handleToggleComparison}
        maxComparisons={3}
      />

      {/* Product Variation Analysis */}
      <ProductVariationAnalysis quotes={quotes} />

      {/* Parsed Benefit Structure Analysis */}
      {selectedQuote && (
        <ProductVariationParser 
          productKey={selectedQuote.planName}
          quotes={quotes.filter(q => q.planName === selectedQuote.planName)}
        />
      )}

      {/* Smart Analysis Demo */}
      <SmartAnalysisDemo quotes={quotes} />

      {/* Adaptive Plan Builder */}
      <HospitalIndemnityPlanBuilder />

      {/* Selected Quote Details */}
      {selectedQuote && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Overview */}
          <QuoteOverview quote={selectedQuote} />
          
          {/* Data Analysis */}
          <DataAnalysis quote={selectedQuote} />
        </div>
      )}

      {/* Field Mapping Table */}
      {selectedQuote && (
        <FieldMappingTable quote={selectedQuote} />
      )}

      {/* Raw Data Inspection */}
      {selectedQuote && (
        <RawDataInspector quote={selectedQuote} />
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        selectedQuotes={selectedForComparison}
        onRemoveQuote={handleRemoveFromComparison}
        onClearAll={handleClearComparison}
      />
    </div>
  );
}