import React, { useState, useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getCarrierLogoUrl, getCarrierDisplayName } from "@/lib/carrier-system";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { consolidateQuoteVariations } from "@/lib/plan-consolidation";
import { QuoteData } from './types';
import { loadFromStorage, QUOTE_FORM_DATA_KEY } from "@/components/medicare-shop/shared/storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlanBuilderTabProps {
  quoteData: QuoteData;
  formatCurrency: (amount: number) => string;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
}

// Helper function for rating colors
const getRatingColor = (rating: string) => {
  switch (rating.toLowerCase()) {
    case 'a++':
    case 'a+':
      return 'text-green-600';
    case 'a':
    case 'a-':
      return 'text-green-500';
    case 'b++':
    case 'b+':
    case 'b':
      return 'text-yellow-600';
    case 'b-':
    case 'c++':
    case 'c+':
      return 'text-orange-600';
    default:
      return 'text-gray-500';
  }
};

export const PlanBuilderTab: React.FC<PlanBuilderTabProps> = ({
  quoteData,
  formatCurrency,
  calculateDiscountedRate
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  const [applyDiscounts, setApplyDiscounts] = useState<boolean>(false);
  const [alternativePlans, setAlternativePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [realQuotes, setRealQuotes] = useState<QuoteData[]>([]);
  const [generatingQuote, setGeneratingQuote] = useState<string | null>(null);
  
  // New state for additional coverage quote generation
  const [loadingCoverageTypes, setLoadingCoverageTypes] = useState<string[]>([]);
  const [completedCoverageTypes, setCompletedCoverageTypes] = useState<string[]>([]);
  
  // Chart data for the pie chart
  const [chartData, setChartData] = useState([
    { name: 'Medigap', value: 100, color: '#3b82f6', selected: true },
    { name: 'Part D', value: 0, color: '#10b981', selected: false },
    { name: 'Dental/Vision', value: 0, color: '#f59e0b', selected: false },
    { name: 'Hospital', value: 0, color: '#ef4444', selected: false },
  ]);

  // Helper functions from test-multi-plan
  const formatRate = (rate: any) => {
    if (typeof rate === 'number') {
      return `$${rate.toFixed(2)}`;
    }
    return 'N/A';
  };

  // Load existing quotes from localStorage
  const loadExistingQuotes = () => {
    try {
      const storedQuotes = localStorage.getItem('medigapQuotes');
      if (storedQuotes) {
        const quotes = JSON.parse(storedQuotes);
        console.log('Plan Builder - loaded existing quotes:', quotes.length);
        setRealQuotes(quotes);
        return quotes;
      }
    } catch (error) {
      console.error('Error loading existing quotes:', error);
    }
    return [];
  };

  // Check if we have quotes for a specific plan
  const hasQuotesForPlan = (planType: string): boolean => {
    return realQuotes.some(quote => quote.plan === planType);
  };

  // Get quotes for a specific plan
  const getQuotesForPlan = (planType: string): QuoteData[] => {
    return realQuotes.filter(quote => quote.plan === planType);
  };

  // Convert MedigapQuote to QuoteData format
  const convertMedigapQuoteToQuoteData = (medigapQuote: any, formData: any): QuoteData => {
    return {
      key: medigapQuote.id || `quote-${medigapQuote.plan}-${Date.now()}`,
      age: parseInt(formData.age) || 65,
      age_increases: [],
      company: medigapQuote.company || medigapQuote.carrier?.name || '',
      company_base: {
        key: medigapQuote.company || medigapQuote.carrier?.name || '',
        name: medigapQuote.carrier?.name || medigapQuote.company || '',
        name_full: medigapQuote.carrier?.full_name || medigapQuote.company || '',
        naic: '',
        ambest_rating: medigapQuote.am_best_rating || 'n/a',
        ambest_outlook: 'n/a',
        sp_rating: 'n/a',
        type: 'STOCK',
        established_year: 2000,
        customer_complaint_ratio: null,
        customer_satisfaction_ratio: -1,
        med_supp_market_data: [],
        parent_company_base: undefined
      },
      discount_category: 'Standard',
      discounts: (medigapQuote.discounts || []).map((d: any) => ({
        name: d.name || 'Discount',
        type: 'fixed' as const,
        value: d.amount || 0
      })),
      e_app_link: '',
      effective_date: medigapQuote.effective_date || new Date().toISOString(),
      expires_date: '2099-12-31T00:00:00',
      fees: (medigapQuote.fees || []).map((f: any) => ({
        name: f.name || 'Fee',
        type: 'fixed' as const,
        value: f.amount || 0
      })),
      gender: formData.gender === 'male' ? 'M' : 'F',
      has_brochure: false,
      has_pdf_app: false,
      plan: medigapQuote.plan || medigapQuote.plan_name || '',
      rate: {
        annual: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 12,
        month: medigapQuote.monthly_premium || medigapQuote.rate?.month || 0,
        quarter: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 3,
        semi_annual: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 6
      },
      rate_increases: [],
      rate_type: medigapQuote.rate_type || 'attained age',
      rating_class: 'Standard',
      riders: [],
      tobacco: formData.tobaccoUse || false,
      location_base: {
        state: 'TX',
        zip5: [],
        county: []
      }
    };
  };

  // Generate quotes for a specific plan
  const generateQuoteForPlan = async (planType: string) => {
    setGeneratingQuote(planType);
    
    try {
      // Use the same form data fallback strategy as the main medigap page
      const formData = await loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      console.log('Plan Builder - generating quote for plan:', planType, 'with form data:', formData);
      
      if (!formData) {
        console.error('❌ No form data found for quote generation');
        alert('Please complete the quote form first by visiting the Medicare Shop page.');
        return;
      }

      // Convert form data to API format
      const quoteParams = {
        zipCode: formData.zipCode,
        age: formData.age.toString(),
        gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
        tobacco: formData.tobaccoUse ? "1" as const : "0" as const,
        plans: [planType], // Just this single plan
      };

      console.log('Plan Builder - calling getMedigapQuotes with params:', quoteParams);
      const response = await getMedigapQuotes(quoteParams);
      
      if (response?.quotes && response.quotes.length > 0) {
        console.log(`Plan Builder - got ${response.quotes.length} quotes for plan ${planType}`);
        
        // Filter quotes for this specific plan and convert to QuoteData format
        const planQuotes = response.quotes
          .filter(quote => quote?.plan === planType)
          .map(quote => convertMedigapQuoteToQuoteData(quote, formData));
        
        // Update existing quotes by removing old quotes for this plan and adding new ones
        const otherQuotes = realQuotes.filter(quote => quote?.plan !== planType);
        const updatedQuotes = [...otherQuotes, ...planQuotes];
        
        setRealQuotes(updatedQuotes);
        
        // Also save to localStorage
        localStorage.setItem('medigapQuotes', JSON.stringify(updatedQuotes));
        
        console.log(`Plan Builder - successfully generated and stored quotes for plan ${planType}`);
      } else {
        console.error(`Plan Builder - no quotes returned for plan ${planType}`);
      }
    } catch (error) {
      console.error(`Error generating quote for plan ${planType}:`, error);
    } finally {
      setGeneratingQuote(null);
    }
  };

  // Generate quotes for additional coverage types (dental, vision, etc.)
  const generateQuotesForCoverage = async (coverageType: string) => {
    setLoadingCoverageTypes(prev => [...prev, coverageType]);
    
    try {
      // Use the same form data fallback strategy as the main medigap page
      const formData = await loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      console.log('Plan Builder - generating quotes for coverage:', coverageType, 'with form data:', formData);
      
      if (!formData) {
        console.error('❌ No form data found for coverage quote generation');
        alert('Please complete the quote form first by visiting the Medicare Shop page.');
        return;
      }

      // For now, we'll simulate quote generation since we don't have the actual APIs
      // In a real implementation, you would call the appropriate API for each coverage type
      setTimeout(() => {
        setCompletedCoverageTypes(prev => [...prev, coverageType]);
        setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
        // Auto-select the coverage type in the chart when quotes are generated
        toggleCoverageType(coverageType);
        console.log(`Successfully generated quotes for ${coverageType}`);
      }, 2000);
      
    } catch (error) {
      console.error(`Error generating quotes for ${coverageType}:`, error);
      setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
    }
  };

  // Toggle coverage type selection and update chart
  const toggleCoverageType = (coverageType: string) => {
    setChartData(prevData => 
      prevData.map(item => {
        if (item.name.toLowerCase().includes(coverageType.toLowerCase()) || 
            (coverageType === 'partd' && item.name === 'Part D') ||
            (coverageType === 'hospital-indemnity' && item.name === 'Hospital') ||
            ((coverageType === 'dental-vision-hearing' || coverageType === 'dental' || coverageType === 'vision') && item.name === 'Dental/Vision')) {
          const newSelected = !item.selected;
          return {
            ...item,
            selected: newSelected,
            value: newSelected ? 33 : 0  // Adjusted for 3 total categories instead of 5
          };
        }
        return item;
      })
    );
  };

  const processOptionsForDisplay = (plan: any) => {
    // Check if this plan has pre-calculated discounts
    const hasWithHHD = plan.options?.some((opt: any) => opt.view_type?.includes('with_hhd'));
    const hasSansHHD = plan.options?.some((opt: any) => opt.view_type?.includes('sans_hhd'));
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
      // For plans without pre-calculated discounts, show all options
      // and apply calculated discounts if enabled
      return plan.options.map((option: any) => {
        if (applyDiscounts && option.discounts && option.discounts.length > 0) {
          // Calculate the discounted rate
          let discountedRate = option.rate?.month || 0;
          option.discounts.forEach((discount: any) => {
            if (discount.type === 'percent') {
              discountedRate *= (1 - discount.value);
            } else {
              discountedRate -= discount.value;
            }
          });
          
          return {
            ...option,
            rate: {
              ...option.rate,
              month: discountedRate
            },
            savings: (option.rate?.month || 0) - discountedRate,
            isCalculatedDiscount: true
          };
        }
        return option;
      });
    }
  };

  const handleViewPlanOptions = async (plan: any) => {
    if (!plan) return;
    
    setLoading(true);
    setSelectedPlanData(null);
    setShowOptionsModal(true);

    try {
      // Create a mock carrier group structure for the modal
      const carrierGroup = {
        carrierName: getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || ''),
        originalCarrierName: quoteData.company_base?.name || quoteData.company || '',
        minPrice: plan.options ? Math.min(...plan.options.map((opt: any) => opt.rate?.month || 0)) : quoteData.rate.month,
        maxPrice: plan.options ? Math.max(...plan.options.map((opt: any) => opt.rate?.month || 0)) : quoteData.rate.month,
        quotes: plan.options || []
      };

      const consolidatedPlans = [{
        plan: plan.plan || quoteData.plan,
        options: plan.options || []
      }];

      setSelectedPlanData({
        carrierGroup,
        consolidatedPlans,
        quotes: plan.options || []
      });
    } catch (error) {
      console.error('Error preparing plan options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load existing quotes when component mounts
    loadExistingQuotes();
    
    // Load alternative plans
    const loadAlternativePlans = async () => {
      try {
        // Create alternative plans for common plan types
        const allPlanTypes = ['F', 'G', 'N'];
        const alternatives = allPlanTypes
          .filter(p => p !== quoteData.plan)
          .map(planType => ({
            plan: planType,
            options: [] // Will be populated with real quotes if available
          }));

        setAlternativePlans(alternatives);
      } catch (error) {
        console.error('Error loading alternative plans:', error);
      }
    };

    loadAlternativePlans();
  }, [quoteData.plan]);

  // Reload quotes when the component mounts or when we need to refresh
  useEffect(() => {
    loadExistingQuotes();
  }, []);

  return (
    <TabsContent value="builder" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Plan Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Your Medicare Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan Details */}
              <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      {(() => {
                        const logoUrl = getCarrierLogoUrl(quoteData.company_base?.name || quoteData.company || '');
                        if (logoUrl) {
                          return (
                            <img 
                              src={logoUrl} 
                              alt={`${quoteData.company_base?.name || quoteData.company} logo`}
                              className="w-10 h-10 object-contain"
                            />
                          );
                        }
                        return (
                          <div className="text-sm font-semibold text-gray-600">
                            {(quoteData.company_base?.name || quoteData.company || 'UC')
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
                      <h5 className="font-medium">Medicare Supplement Plan {quoteData.plan}</h5>
                      <p className="text-sm text-muted-foreground">
                        {getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || '')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(quoteData.rate.month)}/mo
                    </div>
                    <Badge variant="outline">Current Selection</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewPlanOptions({
                      plan: quoteData.plan,
                      options: [{
                        name: 'Current Plan',
                        rate: quoteData.rate,
                        view_type: ['standard'],
                        rating_class: 'Standard'
                      }]
                    })}
                  >
                    View Plan Options
                  </Button>
                </div>
              </div>

              {/* Coverage Builder Section */}
              <div>
                <h4 className="font-medium mb-4">Build Your Complete Coverage</h4>
                
                {/* Split Layout: Categories on Left, Chart on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Side: Coverage Categories */}
                  <div className="space-y-3">
                    {/* Current Medigap Plan */}
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-blue-900">Plan {quoteData.plan}</h5>
                          <p className="text-sm text-blue-700">Your selected Medigap plan</p>
                        </div>
                        <div className="text-blue-900 font-medium">
                          {formatCurrency(quoteData.rate.month)}/mo
                        </div>
                      </div>
                    </div>

                    {/* Alternative Medigap Plans */}
                    {alternativePlans.map((plan, index) => {
                      const planQuotes = getQuotesForPlan(plan.plan);
                      const hasRealQuotes = planQuotes.length > 0;
                      const isGenerating = generatingQuote === plan.plan;
                      
                      let priceDisplay = 'Get Quote';
                      if (hasRealQuotes) {
                        const rates = planQuotes.map(quote => quote.rate.month);
                        const minRate = Math.min(...rates);
                        const maxRate = Math.max(...rates);
                        priceDisplay = minRate === maxRate ? 
                          `${formatCurrency(minRate)}/mo` : 
                          `${formatCurrency(minRate)} - ${formatCurrency(maxRate)}/mo`;
                      } else if (isGenerating) {
                        priceDisplay = 'Generating...';
                      }

                      const isCurrentPlan = plan.plan === quoteData.plan;
                      if (isCurrentPlan) return null; // Don't show current plan twice

                      return (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Plan {plan.plan}</h5>
                              <p className="text-sm text-muted-foreground">Alternative Medigap plan</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{priceDisplay}</span>
                              {hasRealQuotes ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewPlanOptions({
                                    plan: plan.plan,
                                    options: planQuotes.map(quote => ({
                                      name: 'Real Quote',
                                      rate: quote.rate,
                                      view_type: ['standard'],
                                      rating_class: quote.rating_class
                                    }))
                                  })}
                                >
                                  View
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => generateQuoteForPlan(plan.plan)}
                                  disabled={isGenerating}
                                >
                                  {isGenerating ? '...' : '+'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Medicare Part D */}
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Medicare Part D</h5>
                          <p className="text-sm text-muted-foreground">Prescription drug coverage</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {completedCoverageTypes.includes('partd') ? 'View Quotes' : '$7+/mo'}
                          </span>
                          {loadingCoverageTypes.includes('partd') ? (
                            <Button variant="ghost" size="sm" disabled>...</Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (completedCoverageTypes.includes('partd')) {
                                  // Navigate to quotes view
                                } else {
                                  generateQuotesForCoverage('partd');
                                }
                              }}
                            >
                              +
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dental, Vision & Hearing Coverage */}
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Dental, Vision & Hearing</h5>
                          <p className="text-sm text-muted-foreground">Comprehensive oral, eye, and hearing care</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {completedCoverageTypes.includes('dental-vision-hearing') ? 'View Quotes' : '$15+/mo'}
                          </span>
                          {loadingCoverageTypes.includes('dental-vision-hearing') ? (
                            <Button variant="ghost" size="sm" disabled>...</Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (completedCoverageTypes.includes('dental-vision-hearing')) {
                                  // Navigate to quotes view
                                } else {
                                  generateQuotesForCoverage('dental-vision-hearing');
                                }
                              }}
                            >
                              +
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hospital Indemnity */}
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Hospital Indemnity</h5>
                          <p className="text-sm text-muted-foreground">Cash benefits for hospital stays</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {completedCoverageTypes.includes('hospital-indemnity') ? 'View Quotes' : '$25+/mo'}
                          </span>
                          {loadingCoverageTypes.includes('hospital-indemnity') ? (
                            <Button variant="ghost" size="sm" disabled>...</Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (completedCoverageTypes.includes('hospital-indemnity')) {
                                  // Navigate to quotes view
                                } else {
                                  generateQuotesForCoverage('hospital-indemnity');
                                }
                              }}
                            >
                              +
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Dynamic Pie Chart */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full max-w-sm">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value}%`, name]}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Chart Legend */}
                    <div className="mt-4 space-y-2 w-full max-w-sm">
                      {chartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.selected ? item.color : '#e5e7eb' }}
                            />
                            <span className={item.selected ? 'font-medium' : 'text-muted-foreground'}>
                              {item.name}
                            </span>
                          </div>
                          <span className={item.selected ? 'font-medium' : 'text-muted-foreground'}>
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Toggle */}
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox 
                  id="apply-discounts"
                  checked={applyDiscounts}
                  onCheckedChange={(checked) => setApplyDiscounts(checked as boolean)}
                />
                <label htmlFor="apply-discounts" className="text-sm font-medium">
                  Apply available discounts
                </label>
                <Badge variant={applyDiscounts ? "default" : "secondary"}>
                  {applyDiscounts ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Summary Sidebar */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Premium</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.month)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Premium</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.annual || quoteData.rate.month * 12)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Plan Type</span>
                  <span className="font-medium">Plan {quoteData.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Carrier</span>
                  <span className="font-medium">{getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || '')}</span>
                </div>
                {quoteData.company_base?.ambest_rating && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Rating</span>
                    <span className={`font-medium ${getRatingColor(quoteData.company_base.ambest_rating)}`}>
                      {quoteData.company_base.ambest_rating}
                    </span>
                  </div>
                )}
              </div>
              
              <Button className="w-full">
                Proceed to Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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
                  const rates = displayOptions.map((opt: any) => (opt.rate?.month || 0) / 100);
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
                          {/* Removed pre-calculated discounts badge for cleaner UI */}
                        </div>
                      </div>

                      {/* Options Table */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-sm">
                          {(() => {
                            const hasWithHHD = plan.options?.some((opt: any) => opt.view_type?.includes('with_hhd'));
                            const hasSansHHD = plan.options?.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                            
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
                                        Including Household Discount
                                      </Badge>
                                    )}
                                    {hasSansHHD && (
                                      <Badge variant="outline" className="text-xs">
                                        Household Discount Available
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
                                  <div className="font-medium">${((option.rate?.month || 0) / 100).toFixed(2)}/mo</div>
                                  {option.rate?.annual && (
                                    <div className="text-xs text-muted-foreground">
                                      ${Math.round((option.rate.annual || 0) / 100)}/year
                                    </div>
                                  )}
                                  {option.savings && (
                                    <div className="text-xs text-green-600">
                                      Save ${((option.savings || 0) / 100).toFixed(2)}/mo
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
    </TabsContent>
  );
};
