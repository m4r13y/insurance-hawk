import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvailableNaicCarriers } from '@/lib/carriers';
import { getMedigapQuotes } from '@/lib/actions/medigap-quotes';

interface MedigapQuote {
  id?: string;
  monthly_premium: number;
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null;
  plan_name?: string;
  plan?: string;
  naic?: string;
  naicCarrierInfo?: {
    carrierId: string;
    phone: string;
    website: string;
  };
}

export default function CarrierFilterDemo() {
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<MedigapQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCarriers = getAvailableNaicCarriers();

  const handleCarrierToggle = (naicCode: string) => {
    setSelectedCarriers(prev => 
      prev.includes(naicCode) 
        ? prev.filter(code => code !== naicCode)
        : [...prev, naicCode]
    );
  };

  const fetchFilteredQuotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMedigapQuotes({
        zipCode: '75001', // Dallas, TX for demo
        age: '65',
        gender: 'M',
        tobacco: '0',
        plans: ['G'], // Just Plan G for demo
        appointedNaicCodes: selectedCarriers.length > 0 ? selectedCarriers : undefined
      });

      if (response.error) {
        setError(response.error);
      } else {
        setQuotes(response.quotes || []);
      }
    } catch (err) {
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>NAIC Carrier Filtering Demo</CardTitle>
          <CardDescription>
            Select specific insurance carriers to filter quote results. Only quotes from carriers with valid NAIC codes will be shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Available Carriers ({availableCarriers.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableCarriers.map((carrier) => (
                <div
                  key={carrier.naicCode}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedCarriers.includes(carrier.naicCode)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCarrierToggle(carrier.naicCode)}
                >
                  <div className="text-sm font-medium">{carrier.name}</div>
                  <div className="text-xs text-gray-500">NAIC: {carrier.naicCode}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchFilteredQuotes} disabled={loading}>
              {loading ? 'Fetching Quotes...' : 'Get Filtered Quotes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCarriers([])}
              disabled={selectedCarriers.length === 0}
            >
              Clear Selection ({selectedCarriers.length})
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Results</CardTitle>
            <CardDescription>
              {quotes.length} quotes found {selectedCarriers.length > 0 && `(filtered by ${selectedCarriers.length} selected carriers)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotes.map((quote, index) => (
                <div key={quote.id || index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {quote.carrier?.logo_url && (
                        <img 
                          src={quote.carrier.logo_url} 
                          alt={quote.carrier.name || 'Carrier logo'}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <div className="font-semibold">{quote.carrier?.name || 'Unknown Carrier'}</div>
                        <div className="text-sm text-gray-600">{quote.plan_name}</div>
                        {quote.naic && (
                          <Badge variant="outline" className="text-xs">
                            NAIC: {quote.naic}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${quote.monthly_premium.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                  
                  {quote.naicCarrierInfo && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                      <div>Phone: {quote.naicCarrierInfo.phone}</div>
                      <div>Website: {quote.naicCarrierInfo.website}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {quotes.length === 0 && !loading && !error && selectedCarriers.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              No quotes found for the selected carriers. Try selecting different carriers or removing filters.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
