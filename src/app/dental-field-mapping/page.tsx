'use client';

import React, { useState, useEffect } from 'react';
import { loadFromStorage, DENTAL_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import {
  QuoteSelector,
  ComparisonModal,
  QuoteOverview,
  FieldMappingTable,
  ProductVariationAnalysis,
  DataAnalysis,
  RawDataInspector,
  ComparisonControls,
  ProductVariationParser,
  DentalPlanBuilder,
  SmartDentalPlanBuilder,
  SmartAnalysisDemo,
  AdaptiveDentalPlanBuilder,
  toggleQuoteForComparison
} from '@/components/medicare-shop/dental/dental-field-mapping';

export default function DentalFieldMappingPage() {
  const [quotes, setQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<OptimizedDentalQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupByPlan, setGroupByPlan] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<OptimizedDentalQuote[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        console.log('📥 Loading dental quotes from storage...');
        const savedQuotes = await loadFromStorage<OptimizedDentalQuote[]>(DENTAL_QUOTES_KEY, []);
        
        if (savedQuotes && savedQuotes.length > 0) {
          console.log(`✅ Found ${savedQuotes.length} dental quotes`);
          setQuotes(savedQuotes);
          setSelectedQuote(savedQuotes[0]); // Auto-select first quote
        } else {
          console.log('📝 No dental quotes found in storage');
        }
      } catch (error) {
        console.error('❌ Error loading dental quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  // Comparison functions
  const handleToggleComparison = (quote: OptimizedDentalQuote) => {
    setSelectedForComparison(prev => toggleQuoteForComparison(quote, prev, 3));
  };

  const handleRemoveFromComparison = (quote: OptimizedDentalQuote) => {
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
          <p className="mt-4 text-gray-600">Loading dental quotes...</p>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="container mx-auto py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Dental Quotes Found</h1>
          <p className="text-gray-600">
            No dental insurance quotes are currently stored. Please run a dental quote search first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dental Insurance Field Mapping Test</h1>
        <p className="text-gray-600">
          Analyze and inspect dental insurance quote data structure and field mappings
        </p>
        
        {/* Comparison Controls */}
        <ComparisonControls
          selectedForComparison={selectedForComparison}
          onShowComparison={() => setShowComparison(true)}
          onClearSelection={handleClearComparison}
        />
      </div>

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
          productKey={selectedQuote.productKey}
          quotes={quotes.filter(q => q.productKey === selectedQuote.productKey)}
        />
      )}

      {/* Smart Analysis Demo */}
      <SmartAnalysisDemo quotes={quotes} />

      {/* Adaptive Plan Builder */}
      <AdaptiveDentalPlanBuilder 
        quotes={quotes}
        onPlanBuilt={(quote, config) => {
          console.log('Adaptive plan built:', quote, config);
          setSelectedQuote(quote);
        }}
      />

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
        <FieldMappingTable quote={selectedQuote} quotes={quotes} />
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
