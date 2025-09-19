'use client';

import React, { useState, useEffect } from 'react';
import { SimplifiedHospitalIndemnityPlanBuilder } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder';
import { OptimizedHospitalIndemnityQuote, optimizeHospitalIndemnityQuotes } from '@/lib/hospital-indemnity-quote-optimizer';
import { loadFromStorage, HOSPITAL_INDEMNITY_QUOTES_KEY } from '@/components/medicare-shop/shared/storage';

export default function HospitalIndemnityPlanBuilderPage() {
  const [quotes, setQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load quotes from Firestore
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        console.log('🏥 Loading hospital indemnity quotes from Firestore...');
        const savedQuotesRaw = await loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []);
        let savedQuotes = savedQuotesRaw as OptimizedHospitalIndemnityQuote[];
        // Detect raw (unoptimized) quotes by presence of snake_case keys and absence of monthlyPremium
        if (Array.isArray(savedQuotesRaw) && savedQuotesRaw.length && !('monthlyPremium' in (savedQuotesRaw[0] || {})) && ('base_plans' in (savedQuotesRaw[0] || {}))) {
          try {
            console.log('🧮 Detected raw hospital quotes, running optimizer...');
            savedQuotes = optimizeHospitalIndemnityQuotes(savedQuotesRaw as any) as any;
          } catch (optErr) {
            console.warn('⚠️ Failed to optimize raw hospital quotes:', optErr);
          }
        }
        
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
  
  const handlePlanBuilt = (config: any) => {
    console.log('✅ Plan built successfully:', config);
    
    // Here you would typically:
    // 1. Save the configuration to the user's profile
    // 2. Navigate to a checkout or enrollment page
    // 3. Show a confirmation modal
    
    alert(`Plan built successfully!\n\nCompany: ${config.quote.companyName}\nPlan: ${config.quote.planName}\nTotal Premium: $${config.totalPremium?.toFixed(2) || '0.00'}/month`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center m-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600">Loading hospital indemnity quotes...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || quotes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Hospital Indemnity Quotes Available</h2>
              <p className="text-gray-600 mb-6">
                {error || 'No hospital indemnity quotes found. Please generate quotes first in the Medicare shop.'}
              </p>
              <a 
                href="/medicare/shop" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Quotes
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen items-center m-auto">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-6">
            <SimplifiedHospitalIndemnityPlanBuilder 
              quotes={quotes}
              onPlanBuilt={handlePlanBuilt}
            />
        </div>
      </div>
    </div>
  );
}