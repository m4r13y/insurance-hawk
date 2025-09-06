"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { consolidateQuoteVariations } from "@/lib/plan-consolidation";
import { getCarrierDisplayName, getCarrierLogoUrl, filterPreferredCarriers } from "@/lib/carrier-system";
import { MedigapCarrierGroup } from "@/components/medicare-shop/medigap";

interface PlanQuotes {
  F: any[];
  G: any[];
  N: any[];
}

interface PlanStates {
  F: { loading: boolean; loaded: boolean; visible: boolean; };
  G: { loading: boolean; loaded: boolean; visible: boolean; };
  N: { loading: boolean; loaded: boolean; visible: boolean; };
}

export default function TestMultiPlanPage() {
  const [planQuotes, setPlanQuotes] = useState<PlanQuotes>({
    F: [],
    G: [],
    N: []
  });

  const [planStates, setPlanStates] = useState<PlanStates>({
    F: { loading: false, loaded: false, visible: true },
    G: { loading: false, loaded: false, visible: true },
    N: { loading: false, loaded: false, visible: true }
  });

  const [consolidatedPlans, setConsolidatedPlans] = useState<any[]>([]);
  const [carrierGroups, setCarrierGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);

  // Handler functions for MedigapCarrierGroupEnhanced
  const handleSelectPlan = (carrierGroup: any, plan: any) => {
    console.log('Plan selected:', plan, 'from carrier:', carrierGroup.carrierName);
    
    // Create plan data structure for the modal
    const planData = {
      carrierGroup,
      plan,
      // Get all quotes for this carrier and plan type
      quotes: carrierGroup.quotes || [],
      // For consolidated view, we'll consolidate this carrier's quotes
      consolidatedPlans: consolidateQuoteVariations(carrierGroup.quotes || [])
    };
    
    setSelectedPlanData(planData);
    setShowOptionsModal(true);
  };

  const handleShowPlanDifferences = () => {
    console.log('Show plan differences clicked');
    // Here you would typically open a modal or navigate to comparison
  };
  const [applyDiscounts, setApplyDiscounts] = useState<boolean>(false);
  const [showPreferredOnly, setShowPreferredOnly] = useState<boolean>(false);

  // Default quote parameters
  const defaultParams = {
    age: 65,
    gender: 'M' as const,
    zipCode: '76116',
    tobacco: false
  };

  const fetchPlanQuotes = async (planType: 'F' | 'G' | 'N') => {
    setPlanStates(prev => ({
      ...prev,
      [planType]: { ...prev[planType], loading: true }
    }));
    setError(null);

    try {
      const result = await getMedigapQuotes({
        zipCode: defaultParams.zipCode,
        age: defaultParams.age.toString(),
        gender: defaultParams.gender,
        tobacco: defaultParams.tobacco ? "1" : "0",
        plans: [planType]
      });

      if (result.error) {
        setError(`Error fetching Plan ${planType}: ${result.error}`);
        return;
      }

      if (result.quotes && result.quotes.length > 0) {
        setPlanQuotes(prev => ({
          ...prev,
          [planType]: result.quotes || []
        }));

        setPlanStates(prev => ({
          ...prev,
          [planType]: { ...prev[planType], loaded: true, loading: false }
        }));

        console.log(`Plan ${planType} quotes loaded:`, result.quotes.length);
      } else {
        setError(`No quotes returned for Plan ${planType}`);
      }
    } catch (err) {
      console.error(`Error fetching Plan ${planType}:`, err);
      setError(`Failed to fetch Plan ${planType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPlanStates(prev => ({
        ...prev,
        [planType]: { ...prev[planType], loading: false }
      }));
    }
  };

  const resetAllQuotes = () => {
    setPlanQuotes({ F: [], G: [], N: [] });
    setPlanStates({
      F: { loading: false, loaded: false, visible: true },
      G: { loading: false, loaded: false, visible: true },
      N: { loading: false, loaded: false, visible: true }
    });
    setConsolidatedPlans([]);
    setError(null);
  };

  const togglePlanVisibility = (planType: 'F' | 'G' | 'N', visible: boolean) => {
    setPlanStates(prev => ({
      ...prev,
      [planType]: { ...prev[planType], visible }
    }));
  };

  // Consolidate quotes when they change
  React.useEffect(() => {
    const allQuotes = [
      ...planQuotes.F,
      ...planQuotes.G,
      ...planQuotes.N
    ];

    if (allQuotes.length > 0) {
      console.log('Consolidating quotes:', allQuotes.length);
      
      // Create consolidated plans
      const consolidated = consolidateQuoteVariations(allQuotes);
      setConsolidatedPlans(consolidated);
      
      // Also create carrier groups (like production system)
      const groupedByCarrier = allQuotes.reduce((groups: Record<string, any>, quote: any) => {
        const carrierName = quote.carrier?.name || quote.company_base?.name || quote.company || 'Unknown Carrier';
        const displayName = getCarrierDisplayName(carrierName);
        const carrierKey = carrierName;
        
        if (!groups[carrierKey]) {
          groups[carrierKey] = {
            carrierId: carrierKey,
            carrierName: displayName,
            originalCarrierName: carrierName,
            quotes: []
          };
        }
        groups[carrierKey].quotes.push(quote);
        return groups;
      }, {});
      
      setCarrierGroups(Object.values(groupedByCarrier));
      console.log('Consolidated plans:', consolidated.length, 'Carrier groups:', Object.keys(groupedByCarrier).length);
    } else {
      setConsolidatedPlans([]);
      setCarrierGroups([]);
    }
  }, [planQuotes]);

  // Get visible quotes based on checkbox states
  const getVisibleQuotes = () => {
    let visibleQuotes: any[] = [];
    
    if (planStates.F.visible && planStates.F.loaded) {
      visibleQuotes.push(...planQuotes.F);
    }
    if (planStates.G.visible && planStates.G.loaded) {
      visibleQuotes.push(...planQuotes.G);
    }
    if (planStates.N.visible && planStates.N.loaded) {
      visibleQuotes.push(...planQuotes.N);
    }

    // Apply preferred carriers filter if enabled
    if (showPreferredOnly && visibleQuotes.length > 0) {
      visibleQuotes = filterPreferredCarriers(visibleQuotes, 'medicare-supplement');
    }

    return visibleQuotes;
  };

  // Get selected plan types for the enhanced component
  const getSelectedPlanTypes = () => {
    const selectedPlans: string[] = [];
    if (planStates.F.visible && planStates.F.loaded) selectedPlans.push('F');
    if (planStates.G.visible && planStates.G.loaded) selectedPlans.push('G');
    if (planStates.N.visible && planStates.N.loaded) selectedPlans.push('N');
    return selectedPlans;
  };

  // Get visible carrier groups - EXACTLY like production
  const getVisibleCarrierGroups = () => {
    const visibleQuotes = getVisibleQuotes();
    if (visibleQuotes.length === 0) return [];
    
    // Get selected plan types
    const selectedPlanTypes = getSelectedPlanTypes();
    
    // Filter quotes by selected plan types (like production does)
    const filteredQuotes = visibleQuotes.filter(quote => {
      const planType = quote?.plan || '';
      return selectedPlanTypes.includes(planType);
    });
    
    // Group by carrier (like production)
    const groupedByCarrier = filteredQuotes.reduce((groups: Record<string, any>, quote: any) => {
      const carrierName = quote.carrier?.name || quote.company_base?.name || quote.company || 'Unknown Carrier';
      const displayName = getCarrierDisplayName(carrierName);
      const carrierKey = carrierName;
      
      if (!groups[carrierKey]) {
        groups[carrierKey] = {
          carrierId: carrierKey,
          carrierName: displayName,
          originalCarrierName: carrierName,
          quotes: []
        };
      }
      
      groups[carrierKey].quotes.push(quote);
      return groups;
    }, {});
    
    return Object.values(groupedByCarrier);
  };

  // Get visible consolidated plans
  const getVisibleConsolidatedPlans = () => {
    const visibleQuotes = getVisibleQuotes();
    if (visibleQuotes.length === 0) return [];
    
    return consolidateQuoteVariations(visibleQuotes);
  };

  const formatRate = (rate: any) => {
    if (typeof rate === 'number') {
      return rate >= 100 ? `$${(rate / 100).toFixed(2)}` : `$${rate.toFixed(2)}`;
    }
    return 'N/A';
  };

  const getRateFromQuote = (quote: any) => {
    if (quote.rate?.month) return quote.rate.month;
    if (quote.rate?.semi_annual) return quote.rate.semi_annual / 6;
    return quote.monthly_premium || quote.premium || 0;
  };

  // Function to process options based on discount toggle
  const processOptionsForDisplay = (plan: any) => {
    // Check if this plan has pre-calculated discounts
    const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
    const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
    const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

    if (hasPreCalculatedDiscounts) {
      // For pre-calculated discounts, just filter based on toggle
      if (applyDiscounts) {
        // Show with_hhd options (discounted versions)
        return plan.options.filter((opt: any) => opt.view_type?.includes('with_hhd'));
      } else {
        // Show sans_hhd options (non-discounted versions)
        return plan.options.filter((opt: any) => opt.view_type?.includes('sans_hhd'));
      }
    } else {
      // For non-pre-calculated discounts, we need to calculate
      if (applyDiscounts) {
        // Apply discounts to base options
        return plan.options.map((opt: any) => {
          // Check if this option has discounts available
          const hasDiscounts = opt.discounts && opt.discounts.length > 0;
          
          if (hasDiscounts) {
            // Calculate discounted price
            let discountedRate = opt.rate.month;
            opt.discounts.forEach((discount: any) => {
              const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
              discountedRate = discountedRate * (1 - discountPercent / 100);
            });
            
            return {
              ...opt,
              rate: {
                ...opt.rate,
                month: discountedRate,
                annual: discountedRate * 12,
                quarter: discountedRate * 3,
                semi_annual: discountedRate * 6
              },
              name: `${opt.name} (Calculated Discount)`,
              isCalculatedDiscount: true
            };
          }
          
          return opt;
        });
      } else {
        // Show base options without discounts
        return plan.options;
      }
    }
  };

  const visibleConsolidatedPlans = getVisibleConsolidatedPlans();
  const visibleCarrierGroups = getVisibleCarrierGroups();
  const selectedPlanTypes = getSelectedPlanTypes();

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">Multi-Plan Consolidation Test</h1>
      
      {/* DEBUG: API Response Capture */}
      <Card className="mb-6 bg-gray-50 border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg">🔍 Debug: Raw API Response</CardTitle>
          <p className="text-sm text-muted-foreground">
            Copy this JSON to analyze the data structure from the real API
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>F Quotes:</strong> {planQuotes.F?.length || 0}</div>
              <div><strong>G Quotes:</strong> {planQuotes.G?.length || 0}</div>
              <div><strong>N Quotes:</strong> {planQuotes.N?.length || 0}</div>
            </div>
            
            <div className="space-y-6">
              {/* Plan F Complete Data */}
              {planQuotes.F && planQuotes.F.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Plan F - Complete API Response (All Quotes):</h4>
                  <textarea
                    className="w-full h-96 p-3 text-xs font-mono bg-white border rounded resize-y"
                    value={JSON.stringify(planQuotes.F, null, 2)}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Click to select all data for copying..."
                  />
                </div>
              )}
              
              {/* Plan G Complete Data */}
              {planQuotes.G && planQuotes.G.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Plan G - Complete API Response (All Quotes):</h4>
                  <textarea
                    className="w-full h-96 p-3 text-xs font-mono bg-white border rounded resize-y"
                    value={JSON.stringify(planQuotes.G, null, 2)}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Click to select all data for copying..."
                  />
                </div>
              )}
              
              {/* Plan N Complete Data */}
              {planQuotes.N && planQuotes.N.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-purple-600">Plan N - Complete API Response (All Quotes):</h4>
                  <textarea
                    className="w-full h-96 p-3 text-xs font-mono bg-white border rounded resize-y"
                    value={JSON.stringify(planQuotes.N, null, 2)}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="Click to select all data for copying..."
                  />
                </div>
              )}
              
              {/* Consolidated Sample for reference */}
              {getVisibleConsolidatedPlans().length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-600">Consolidated Plan Sample (First Carrier Group):</h4>
                  <textarea
                    className="w-full h-48 p-3 text-xs font-mono bg-gray-50 border rounded resize-y"
                    value={JSON.stringify(getVisibleConsolidatedPlans()[0], null, 2)}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border">
              💡 <strong>Data Analysis Helper:</strong> Click any textarea to select all data, then copy to analyze the complete API response structure. 
              Each section shows the full array of quotes for that plan type. Use these to understand real API data structure differences from sample data.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Plan Quote Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quote Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {(['F', 'G', 'N'] as const).map(planType => (
              <div key={planType} className="flex items-center gap-2">
                {!planStates[planType].loaded ? (
                  <Button
                    onClick={() => fetchPlanQuotes(planType)}
                    disabled={planStates[planType].loading}
                    variant="outline"
                  >
                    {planStates[planType].loading ? 'Loading...' : `Get Plan ${planType}`}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`plan-${planType}`}
                      checked={planStates[planType].visible}
                      onCheckedChange={(checked) => 
                        togglePlanVisibility(planType, checked as boolean)
                      }
                    />
                    <label htmlFor={`plan-${planType}`} className="text-sm font-medium">
                      Plan {planType} ({planQuotes[planType].length} quotes)
                    </label>
                  </div>
                )}
              </div>
            ))}
            
            <Button 
              onClick={resetAllQuotes}
              variant="destructive"
              className="ml-auto"
            >
              Reset All
            </Button>
          </div>

          {/* Quote Summary */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>Total Quotes: {planQuotes.F.length + planQuotes.G.length + planQuotes.N.length}</div>
            <div>Visible Quotes: {getVisibleQuotes().length}</div>
            <div>Carrier Groups: {visibleCarrierGroups.length}</div>
            <div>Consolidated Plans: {visibleConsolidatedPlans.length}</div>
            <div>Layout: {selectedPlanTypes.length === 1 ? '2 columns (mobile: 1)' : '1 column'}</div>
          </div>

          {/* Filter Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                id="apply-discounts"
                checked={applyDiscounts}
                onCheckedChange={(checked) => setApplyDiscounts(checked as boolean)}
              />
              <label htmlFor="apply-discounts" className="text-sm font-medium">
                Apply Discounts
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="preferred-carriers"
                checked={showPreferredOnly}
                onCheckedChange={(checked) => setShowPreferredOnly(checked as boolean)}
              />
              <label htmlFor="preferred-carriers" className="text-sm font-medium">
                Preferred Carriers Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="text-red-800">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production">Production Display</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Plans</TabsTrigger>
          <TabsTrigger value="raw">Raw Quotes</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Multi-Plan Display ({visibleCarrierGroups.length} carriers)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Using the same MedigapCarrierGroup component as production with multi-plan support
                {selectedPlanTypes.length > 0 && (
                  <span className="ml-2">
                    • Layout: {selectedPlanTypes.length === 1 ? '2 columns' : '1 column'} 
                    • Plans: {selectedPlanTypes.join(', ')}
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              {visibleCarrierGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No carrier groups to display. Click the quote buttons above to load data.
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  selectedPlanTypes.length === 1 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1'
                }`}>
                  {visibleCarrierGroups
                    .sort((a, b) => {
                      // Get consolidated plans for both carriers
                      const aPlans = consolidateQuoteVariations(a.quotes || []);
                      const bPlans = consolidateQuoteVariations(b.quotes || []);
                      
                      // Get minimum rates from all processed options of all plans for each carrier
                      const getCarrierMinRate = (plans: any[]) => {
                        let minRate = Infinity;
                        plans.forEach(plan => {
                          const displayOptions = processOptionsForDisplay(plan);
                          displayOptions.forEach((opt: any) => {
                            const rate = opt.rate?.month || 0;
                            const displayRate = rate >= 100 ? rate / 100 : rate;
                            if (displayRate > 0 && displayRate < minRate) {
                              minRate = displayRate;
                            }
                          });
                        });
                        return minRate === Infinity ? 0 : minRate;
                      };
                      
                      const aMinRate = getCarrierMinRate(aPlans);
                      const bMinRate = getCarrierMinRate(bPlans);
                      
                      // Sort by lowest rate first
                      return aMinRate - bMinRate;
                    })
                    .map((carrierGroup, index) => (
                    <MedigapCarrierGroup
                      key={`${carrierGroup.carrierId}-${selectedPlanTypes.join('-')}`}
                      carrierGroup={carrierGroup}
                      selectedQuotePlans={selectedPlanTypes}
                      paymentMode="monthly"
                      getCachedLogoUrl={(carrierName: string, carrierId: string) => getCarrierLogoUrl(carrierName)}
                      getCarrierDisplayName={(carrierName: string, carrierId: string) => getCarrierDisplayName(carrierName)}
                      calculateDiscountedPrice={(quote: any) => {
                        // Check if this quote has pre-calculated discounts
                        const hasWithHHD = quote.view_type?.includes('with_hhd');
                        const hasSansHHD = quote.view_type?.includes('sans_hhd');
                        
                        // Get the base rate (handle different rate formats)
                        let baseRate = 0;
                        if (quote.rate?.month) {
                          baseRate = quote.rate.month;
                        } else if (quote.rate?.semi_annual) {
                          baseRate = quote.rate.semi_annual / 6; // Convert semi-annual to monthly
                        } else {
                          baseRate = quote.monthly_premium || quote.premium || 0;
                        }
                        
                        // Convert from cents to dollars if needed
                        const rate = baseRate >= 100 ? baseRate / 100 : baseRate;
                        
                        // For pre-calculated discounts, don't apply manual calculations
                        // The discount is already built into the with_hhd/sans_hhd options
                        if (hasWithHHD || hasSansHHD) {
                          return rate;
                        }
                        
                        // Apply discounts if enabled and discounts are available (only for non-pre-calculated)
                        if (applyDiscounts && quote.discounts && quote.discounts.length > 0) {
                          let discountedRate = baseRate;
                          quote.discounts.forEach((discount: any) => {
                            const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
                            discountedRate = discountedRate * (1 - discountPercent / 100);
                          });
                          // Convert from cents to dollars if needed
                          return discountedRate >= 100 ? discountedRate / 100 : discountedRate;
                        }
                        
                        return rate;
                      }}
                      convertPriceByPaymentMode={(price: number) => price}
                      getPaymentLabel={() => '/month'}
                      setShowPlanDifferencesModal={handleShowPlanDifferences}
                      openPlanModal={(carrierGroup: any) => handleSelectPlan(carrierGroup, null)}
                      applyDiscounts={applyDiscounts}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consolidated Plans ({visibleConsolidatedPlans.length})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quotes consolidated by carrier and plan type with options grouped
              </p>
            </CardHeader>
            <CardContent>
              {visibleConsolidatedPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No consolidated plans to display. Click the quote buttons above to load data.
                </div>
              ) : (
                <div className="space-y-6">
                  {visibleConsolidatedPlans.map((plan, index) => {
                    const displayOptions = processOptionsForDisplay(plan);
                    const rates = displayOptions.map((opt: any) => opt.rate?.month || 0);
                    const minRate = Math.min(...rates);
                    const maxRate = Math.max(...rates);
                    const priceRange = minRate === maxRate ? 
                      formatRate(minRate) + '/mo' : 
                      `${formatRate(minRate)} - ${formatRate(maxRate)}/mo`;

                    // Check if this plan group has pre-calculated discounts
                    const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                    const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                    const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

                    return (
                      <Card key={plan.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {/* Carrier Logo */}
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                {(() => {
                                  const logoUrl = getCarrierLogoUrl(plan.carrier.originalName);
                                  if (logoUrl) {
                                    return (
                                      <img
                                        src={logoUrl}
                                        alt={plan.carrier.displayName}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          if (target.nextSibling) {
                                            (target.nextSibling as HTMLElement).style.display = 'flex';
                                          }
                                        }}
                                      />
                                    );
                                  }
                                  return null;
                                })()}
                                {/* Fallback initials */}
                                <div className="text-xs font-semibold text-gray-600" style={{ display: 'none' }}>
                                  {plan.carrier.displayName.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {plan.carrier.displayName} - Plan {plan.plan}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Price Range: {priceRange}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {displayOptions.length} options
                              </Badge>
                              {hasPreCalculatedDiscounts && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  pre-calculated discounts
                                </Badge>
                              )}
                              {applyDiscounts && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  discounts applied
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Plan Options */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Available Options:</div>
                            <div className="grid gap-2">
                              {displayOptions.slice(0, 5).map((option: any, optionIndex: number) => (
                                <div key={optionIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <div className="text-sm">
                                    {option.rating_class || 'Standard'} 
                                    {option.discount_category && option.discount_category !== 'Standard' && 
                                      ` - ${option.discount_category}`
                                    }
                                    {option.has_calculated_discount && (
                                      <span className="text-green-600 ml-1">(discounted)</span>
                                    )}
                                  </div>
                                  <Badge variant="secondary">
                                    {formatRate(
                                      option.has_calculated_discount 
                                        ? option.calculated_discount_rate 
                                        : getRateFromQuote(option)
                                    )}/mo
                                  </Badge>
                                </div>
                              ))}
                              {displayOptions.length > 5 && (
                                <div className="text-sm text-muted-foreground text-center">
                                  ... and {displayOptions.length - 5} more options
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Quotes by Plan Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(['F', 'G', 'N'] as const).map(planType => (
                  <div key={planType}>
                    <h3 className="font-semibold mb-2">
                      Plan {planType} ({planQuotes[planType].length} quotes)
                      {!planStates[planType].visible && <Badge variant="secondary" className="ml-2">Hidden</Badge>}
                    </h3>
                    {planStates[planType].visible && planQuotes[planType].length > 0 ? (
                      <div className="grid gap-2">
                        {planQuotes[planType].slice(0, 10).map((quote, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <div className="text-sm">
                              {quote.company_base?.name || 'Unknown'} - {quote.rating_class || 'Standard'}
                            </div>
                            <Badge variant="outline">
                              {formatRate(getRateFromQuote(quote))}/mo
                            </Badge>
                          </div>
                        ))}
                        {planQuotes[planType].length > 10 && (
                          <div className="text-sm text-muted-foreground text-center">
                            ... and {planQuotes[planType].length - 10} more quotes
                          </div>
                        )}
                      </div>
                    ) : planStates[planType].visible ? (
                      <div className="text-sm text-muted-foreground">No quotes loaded</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Plan hidden</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Plan Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Quote Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Plan F Quotes</div>
                      <div className="text-2xl font-bold">{planQuotes.F.length}</div>
                    </div>
                    <div>
                      <div className="font-medium">Plan G Quotes</div>
                      <div className="text-2xl font-bold">{planQuotes.G.length}</div>
                    </div>
                    <div>
                      <div className="font-medium">Plan N Quotes</div>
                      <div className="text-2xl font-bold">{planQuotes.N.length}</div>
                    </div>
                    <div>
                      <div className="font-medium">Total Quotes</div>
                      <div className="text-2xl font-bold">{planQuotes.F.length + planQuotes.G.length + planQuotes.N.length}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Applied Filters</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Apply Discounts</div>
                      <Badge variant={applyDiscounts ? "default" : "secondary"}>
                        {applyDiscounts ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">Preferred Carriers Only</div>
                      <Badge variant={showPreferredOnly ? "default" : "secondary"}>
                        {showPreferredOnly ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Consolidation Results</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Raw Quotes</div>
                      <div className="text-2xl font-bold">{getVisibleQuotes().length}</div>
                    </div>
                    <div>
                      <div className="font-medium">Consolidated Plans</div>
                      <div className="text-2xl font-bold">{visibleConsolidatedPlans.length}</div>
                    </div>
                  </div>
                </div>

                {visibleConsolidatedPlans.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Plan Type Distribution</h3>
                    <div className="space-y-2">
                      {['F', 'G', 'N'].map(planType => {
                        const planCount = visibleConsolidatedPlans.filter(p => p.plan === planType).length;
                        return (
                          <div key={planType} className="flex justify-between items-center">
                            <span>Plan {planType}</span>
                            <Badge variant="outline">{planCount} carriers</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Options Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlanData && (
                <>
                  {getCarrierDisplayName(selectedPlanData.carrierGroup.originalCarrierName)} - Plan Options
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlanData && (
            <div className="space-y-6">
              {/* Carrier Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {(() => {
                    const logoUrl = getCarrierLogoUrl(selectedPlanData.carrierGroup.originalCarrierName);
                    if (logoUrl) {
                      return (
                        <img 
                          src={logoUrl} 
                          alt={`${selectedPlanData.carrierGroup.carrierName} logo`}
                          className="w-10 h-10 object-contain"
                        />
                      );
                    }
                    return (
                      <div className="text-sm font-semibold text-gray-600">
                        {selectedPlanData.carrierGroup.carrierName
                          .split(' ')
                          .map((word: string) => word[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {getCarrierDisplayName(selectedPlanData.carrierGroup.originalCarrierName)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlanData.quotes.length} quotes available
                  </p>
                </div>
              </div>

              {/* Plans Available */}
              <div className="space-y-4">
                <h4 className="font-semibold">Available Plans:</h4>
                {selectedPlanData.consolidatedPlans.map((plan: any, index: number) => {
                  const displayOptions = processOptionsForDisplay(plan);
                  const rates = displayOptions.map((opt: any) => opt.rate?.month || 0);
                  const minRate = Math.min(...rates);
                  const maxRate = Math.max(...rates);
                  const priceRange = minRate === maxRate ? 
                    `${formatRate(minRate)}/mo` : 
                    `${formatRate(minRate)} - ${formatRate(maxRate)}/mo`;

                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold">Plan {plan.plan}</h5>
                          <p className="text-sm text-muted-foreground">Price Range: {priceRange}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{displayOptions.length} options</Badge>
                          {(() => {
                            const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                            const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                            
                            if (hasWithHHD && hasSansHHD) {
                              return (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  pre-calculated discounts
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Options Table */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-sm">
                          {(() => {
                            const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                            const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                            
                            if (hasWithHHD && hasSansHHD) {
                              return applyDiscounts ? 
                                `Discounted Options (${displayOptions.length}):` : 
                                `Standard Options (${displayOptions.length}):`;
                            } else {
                              return `All Options (${displayOptions.length}):`;
                            }
                          })()}
                        </h6>
                        <div className="space-y-2">
                          {displayOptions.map((option: any, i: number) => {
                            const hasWithHHD = option.view_type?.includes('with_hhd');
                            const hasSansHHD = option.view_type?.includes('sans_hhd');
                            
                            return (
                              <div key={i} className="text-sm p-3 border rounded flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{option.name}</span>
                                    {option.isRecommended && <Badge className="text-xs">Recommended</Badge>}
                                    {option.isCalculatedDiscount && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                        calculated
                                      </Badge>
                                    )}
                                    {hasWithHHD && (
                                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                        with_HHD
                                      </Badge>
                                    )}
                                    {hasSansHHD && (
                                      <Badge variant="outline" className="text-xs">
                                        sans_HHD
                                      </Badge>
                                    )}
                                  </div>
                                  {option.description && (
                                    <div className="text-xs text-muted-foreground mb-1">{option.description}</div>
                                  )}
                                  {option.view_type && option.view_type.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      View types: {option.view_type.join(', ')}
                                    </div>
                                  )}
                                  {option.discounts && option.discounts.length > 0 && (
                                    <div className="text-xs text-green-600">
                                      Discounts: {option.discounts.map((d: any) => d.name || d.type).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{formatRate(option.rate?.month || 0)}/mo</div>
                                  {option.rate?.annual && (
                                    <div className="text-xs text-muted-foreground">
                                      ${Math.round((option.rate.annual || 0) / 100)}/year
                                    </div>
                                  )}
                                  {option.savings && (
                                    <div className="text-xs text-green-600">
                                      Save {formatRate(option.savings)}/mo
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
