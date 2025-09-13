import React, { useState, useEffect } from 'react';
import { AdaptiveHospitalIndemnityPlanBuilder } from './AdaptiveHospitalIndemnityPlanBuilder';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { loadFromStorage, HOSPITAL_INDEMNITY_QUOTES_KEY } from '@/components/medicare-shop/shared/storage';

// Inline implementation of the hospital indemnity demo to avoid module resolution issues
function HospitalIndemnityDemoComponent() {
  const [quotes, setQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load quotes from Firestore
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        console.log('🏥 Loading hospital indemnity quotes from Firestore...');
        const savedQuotes = await loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []) as OptimizedHospitalIndemnityQuote[];
        
        if (savedQuotes && savedQuotes.length > 0) {
          console.log(`✅ Found ${savedQuotes.length} hospital indemnity quotes`);
          console.log('🔍 First quote:', savedQuotes[0]);
          console.log('🎯 Riders in first quote:', savedQuotes[0].riders?.length || 0);
          if (savedQuotes[0].riders && savedQuotes[0].riders.length > 0) {
            console.log('🎯 First rider:', savedQuotes[0].riders[0]);
          }
          setQuotes(savedQuotes);
        } else {
          console.log('📭 No hospital indemnity quotes found in Firestore');
          setError('No hospital indemnity quotes found. Please generate quotes first.');
        }
      } catch (error) {
        console.error('❌ Error loading hospital indemnity quotes:', error);
        setError('Failed to load quotes from storage.');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuotes();
  }, []);
  
  const handlePlanBuilt = (selectedQuote: OptimizedHospitalIndemnityQuote, configuration: any) => {
    console.log('Plan built:', { selectedQuote, configuration });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading hospital indemnity quotes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || quotes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Hospital Indemnity Plan Builder</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              {error || 'No hospital indemnity quotes available. Please generate quotes first in the Medicare shop.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Hospital Indemnity Plan Builder - Real Firestore Data</h2>
        <p className="text-gray-600 mb-6">
          Building plans with {quotes.length} hospital indemnity {quotes.length === 1 ? 'quote' : 'quotes'} from Firestore
        </p>
        
        <AdaptiveHospitalIndemnityPlanBuilder 
          quotes={quotes}
          onPlanBuilt={handlePlanBuilt}
        />
      </div>
    </div>
  );
}

// Main hospital indemnity plan builder component
export const HospitalIndemnityPlanBuilder: React.FC = () => (
  <HospitalIndemnityDemoComponent />
);

// Alias for backwards compatibility
export const SmartHospitalIndemnityPlanBuilder: React.FC = () => (
  <HospitalIndemnityDemoComponent />
);