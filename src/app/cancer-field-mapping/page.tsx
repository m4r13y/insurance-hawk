'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadFromStorage, CANCER_INSURANCE_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { CancerInsuranceQuote } from '@/lib/actions/cancer-insurance-quotes';
import { formatCurrency } from '@/utils/medicare-advantage-data';

export default function CancerFieldMappingPage() {
  const [quotes, setQuotes] = useState<CancerInsuranceQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<CancerInsuranceQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cancer insurance quotes from storage
    const loadQuotes = async () => {
      try {
        console.log('🎗️ Loading Cancer Insurance quotes from storage...');
        const savedQuotes = await loadFromStorage<CancerInsuranceQuote[]>(CANCER_INSURANCE_QUOTES_KEY, []);
        
        if (savedQuotes && savedQuotes.length > 0) {
          console.log('📋 Total cancer quotes loaded:', savedQuotes.length);
          console.log('🔍 First quote:', savedQuotes[0]);
          
          setQuotes(savedQuotes);
          setSelectedQuote(savedQuotes[0]);
        } else {
          console.log('📭 No cancer insurance quotes found in storage');
        }
      } catch (error) {
        console.error('Error loading cancer insurance quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading cancer insurance quotes...</div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Cancer Insurance Field Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No cancer insurance quotes found in storage.</p>
              <p className="text-sm text-muted-foreground">
                Please generate some cancer insurance quotes first to see the field mapping.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cancer Insurance Field Mapping</h1>
        <p className="text-muted-foreground">
          Testing and mapping cancer insurance quote data fields
        </p>
      </div>

      {/* Quote Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Available Quotes ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedQuote === quote
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedQuote(quote)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{quote.carrier}</h3>
                    <p className="text-sm text-muted-foreground">{quote.plan_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(quote.monthly_premium / 100)}/month</p>
                    <p className="text-sm text-muted-foreground">
                      Benefit: {formatCurrency(quote.benefit_amount / 100)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Quote Details */}
      {selectedQuote && (
        <Card>
          <CardHeader>
            <CardTitle>Cancer Insurance Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Carrier:</span>
                      <span>{selectedQuote.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Plan Name:</span>
                      <span>{selectedQuote.plan_name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Monthly Premium:</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedQuote.monthly_premium / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Benefit Amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedQuote.benefit_amount / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Data Inspection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Raw Data Structure</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(selectedQuote, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Field Mapping Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Field Mapping</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Field Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Raw Value</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Data Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Formatted Value</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">carrier</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                          {selectedQuote.carrier}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {typeof selectedQuote.carrier}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedQuote.carrier}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-muted-foreground">
                          Insurance company name
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">plan_name</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                          {selectedQuote.plan_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {typeof selectedQuote.plan_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedQuote.plan_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-muted-foreground">
                          Specific plan product name
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">monthly_premium</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                          {selectedQuote.monthly_premium}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {typeof selectedQuote.monthly_premium}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {formatCurrency(selectedQuote.monthly_premium / 100)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-muted-foreground">
                          Premium amount in cents (divide by 100 for dollars)
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">benefit_amount</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                          {selectedQuote.benefit_amount}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {typeof selectedQuote.benefit_amount}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {formatCurrency(selectedQuote.benefit_amount / 100)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-muted-foreground">
                          Benefit payout amount in cents (divide by 100 for dollars)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Analysis */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Analysis</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Premium Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raw Value:</span>
                        <span className="font-mono">{selectedQuote.monthly_premium}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Formatted:</span>
                        <span>{formatCurrency(selectedQuote.monthly_premium / 100)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Annual Cost:</span>
                        <span>{formatCurrency((selectedQuote.monthly_premium * 12) / 100)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Benefit Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raw Value:</span>
                        <span className="font-mono">{selectedQuote.benefit_amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Formatted:</span>
                        <span>{formatCurrency(selectedQuote.benefit_amount / 100)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Benefit Ratio:</span>
                        <span>
                          {((selectedQuote.benefit_amount / selectedQuote.monthly_premium) / 12).toFixed(1)}x
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
