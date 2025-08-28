"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeftIcon,
  StarFilledIcon,
  CheckIcon,
  InfoCircledIcon,
  PersonIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons';
import Image from 'next/image';
import { getProperLogoUrl, getCarrierByNaicCode } from "@/lib/naic-carriers";

interface QuoteData {
  key: string;
  age: number;
  age_increases: number[];
  company: string;
  company_base: {
    key: string;
    name: string;
    name_full: string;
    naic: string;
    ambest_rating: string;
    ambest_outlook: string;
    sp_rating: string;
    type: string;
    established_year: number;
    customer_complaint_ratio: number | null;
    customer_satisfaction_ratio: number;
    med_supp_market_data: any[];
    parent_company_base?: {
      name: string;
      code: string;
      established_year: number;
    };
  };
  discount_category: string;
  discounts: Array<{
    name: string;
    type: 'percent' | 'fixed';
    value: number;
    rule?: string;
  }>;
  e_app_link: string;
  effective_date: string;
  expires_date: string;
  fees: Array<{
    name: string;
    type: 'fixed' | 'percent';
    value: number;
  }>;
  gender: string;
  has_brochure: boolean;
  has_pdf_app: boolean;
  plan: string;
  rate: {
    annual: number;
    month: number;
    quarter: number;
    semi_annual: number;
  };
  rate_increases: any[];
  rate_type: string;
  rating_class: string;
  riders: any[];
  tobacco: boolean;
  location_base: {
    state: string;
    zip5: string[];
    county: string[];
  };
}

interface PlanDetailsPageProps {
  // Props will be passed via URL params or state
}

const PlanDetailsPage: React.FC<PlanDetailsPageProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // In a real implementation, this data would come from props, URL params, or be fetched
  // For now, I'll structure it to show how it would work with the API response format
  const [quoteData, setQuoteData] = React.useState<QuoteData | null>(null);
  const [carrierQuotes, setCarrierQuotes] = React.useState<QuoteData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get data from localStorage
    const planDetailsDataStr = localStorage.getItem('planDetailsData');
    
    if (planDetailsDataStr) {
      try {
        const planDetailsData = JSON.parse(planDetailsDataStr);
        const { carrierGroup } = planDetailsData;
        
        if (carrierGroup && carrierGroup.quotes && carrierGroup.quotes.length > 0) {
          // Convert the first quote to our QuoteData format
          const firstQuote = carrierGroup.quotes[0];
          const convertedQuote: QuoteData = {
            key: firstQuote.key || `quote-${firstQuote.plan}-${carrierGroup.carrierId}`,
            age: firstQuote.age || 65,
            age_increases: firstQuote.age_increases || [],
            company: firstQuote.company || '',
            company_base: {
              key: firstQuote.company_base?.key || '',
              name: carrierGroup.carrierName,
              name_full: firstQuote.company_base?.name_full || carrierGroup.carrierName,
              naic: firstQuote.naic || firstQuote.company_base?.naic || '',
              ambest_rating: firstQuote.company_base?.ambest_rating || 'n/a',
              ambest_outlook: firstQuote.company_base?.ambest_outlook || 'n/a',
              sp_rating: firstQuote.company_base?.sp_rating || 'n/a',
              type: firstQuote.company_base?.type || 'STOCK',
              established_year: firstQuote.company_base?.established_year || 2000,
              customer_complaint_ratio: firstQuote.company_base?.customer_complaint_ratio || null,
              customer_satisfaction_ratio: firstQuote.company_base?.customer_satisfaction_ratio || -1,
              med_supp_market_data: firstQuote.company_base?.med_supp_market_data || [],
              parent_company_base: firstQuote.company_base?.parent_company_base
            },
            discount_category: firstQuote.discount_category || 'Standard',
            discounts: firstQuote.discounts || [],
            e_app_link: firstQuote.e_app_link || '',
            effective_date: firstQuote.effective_date || new Date().toISOString(),
            expires_date: firstQuote.expires_date || '2099-12-31T00:00:00',
            fees: firstQuote.fees || [],
            gender: firstQuote.gender || 'M',
            has_brochure: firstQuote.has_brochure || false,
            has_pdf_app: firstQuote.has_pdf_app || false,
            plan: firstQuote.plan || 'G',
            rate: {
              annual: firstQuote.rate?.annual || (firstQuote.monthly_premium || 12000) * 12,
              month: firstQuote.rate?.month || firstQuote.monthly_premium || 12000,
              quarter: firstQuote.rate?.quarter || (firstQuote.monthly_premium || 12000) * 3,
              semi_annual: firstQuote.rate?.semi_annual || (firstQuote.monthly_premium || 12000) * 6
            },
            rate_increases: firstQuote.rate_increases || [],
            rate_type: firstQuote.rate_type || 'attained age',
            rating_class: firstQuote.rating_class || '',
            riders: firstQuote.riders || [],
            tobacco: firstQuote.tobacco || false,
            location_base: firstQuote.location_base || {
              state: 'TX',
              zip5: [],
              county: []
            }
          };

          // Convert all quotes for comparison
          const allQuotes = carrierGroup.quotes.map((quote: any, index: number) => ({
            ...convertedQuote,
            key: quote.key || `quote-${quote.plan}-${carrierGroup.carrierId}-${index}`,
            plan: quote.plan,
            rate: {
              annual: quote.rate?.annual || (quote.monthly_premium || 12000) * 12,
              month: quote.rate?.month || quote.monthly_premium || 12000,
              quarter: quote.rate?.quarter || (quote.monthly_premium || 12000) * 3,
              semi_annual: quote.rate?.semi_annual || (quote.monthly_premium || 12000) * 6
            },
            discounts: quote.discounts || [],
            discount_category: quote.discount_category || 'Standard',
            rating_class: quote.rating_class || ''
          }));

          setQuoteData(convertedQuote);
          setCarrierQuotes(allQuotes);
        } else {
          console.error('No quotes found in carrier group');
        }
      } catch (error) {
        console.error('Error parsing plan details data:', error);
      }
    } else {
      console.warn('No plan details data found in localStorage');
    }
    
    setLoading(false);
  }, []);

  const calculateDiscountedRate = (rate: number, discounts: any[]) => {
    let discountedRate = rate;
    discounts.forEach(discount => {
      if (discount.type === 'percent') {
        discountedRate = discountedRate * (1 - discount.value);
      } else if (discount.type === 'fixed') {
        discountedRate = discountedRate - discount.value;
      }
    });
    return Math.round(discountedRate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Assuming amounts are in cents
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toUpperCase()) {
      case 'A++':
      case 'A+':
        return 'text-green-600';
      case 'A':
      case 'A-':
        return 'text-green-500';
      case 'B++':
      case 'B+':
        return 'text-yellow-600';
      case 'B':
      case 'B-':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p>Plan details not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const logoUrl = getProperLogoUrl(quoteData.company_base.naic, quoteData.company_base.name);

  return (
    <div className="min-h-screen">
      {/* Simplified Header */}
      <div className="sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-10 flex items-center justify-between h-14">
            {/* Left side - Back button and company info */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 relative flex-shrink-0">
                  <Image
                    src={logoUrl}
                    alt={quoteData.company_base.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="font-medium text-base">{quoteData.company_base.name}</h1>
                </div>
              </div>
            </div>

            {/* Right side - Plan and action */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Plan {quoteData.plan}</div>
                <div className="font-semibold text-primary">
                  {formatCurrency(calculateDiscountedRate(quoteData.rate.month, quoteData.discounts))}/mo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">{/* pt-24 accounts for fixed site nav */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Plan Builder</TabsTrigger>
              <TabsTrigger value="quotes" className="text-xs sm:text-sm">All Plans</TabsTrigger>
              <TabsTrigger value="company" className="text-xs sm:text-sm">Company</TabsTrigger>
              <TabsTrigger value="plan" className="text-xs sm:text-sm">Plan Details</TabsTrigger>
              <TabsTrigger value="underwriting" className="text-xs sm:text-sm">Underwriting</TabsTrigger>
            </TabsList>
          </div>

          {/* Plan Builder Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Builder */}
              <div className="lg:col-span-2 space-y-6">
                {/* Coverage Selection */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span>Customize Your Coverage</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Medicare Supplement Plan {quoteData.plan} - Build your perfect coverage package
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Base Plan Selection */}
                    <div>
                      <h4 className="font-medium mb-3">Base Plan Coverage</h4>
                      <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">Medicare Supplement Plan {quoteData.plan}</h5>
                            <p className="text-sm text-muted-foreground">Standard Medicare supplement coverage</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {formatCurrency(quoteData.rate.month)}/mo
                            </div>
                            <Badge variant="outline">Included</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Available Add-ons */}
                    <div>
                      <h4 className="font-medium mb-3">Optional Add-on Coverage</h4>
                      <div className="space-y-3">
                        {/* Prescription Drug Coverage */}
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                id="prescription-drug"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div>
                                <label htmlFor="prescription-drug" className="font-medium cursor-pointer">
                                  Prescription Drug Coverage
                                </label>
                                <p className="text-sm text-muted-foreground">Enhanced prescription drug benefits</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">+$45/mo</div>
                              <Badge variant="secondary">Popular</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Dental Coverage */}
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                id="dental-coverage"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div>
                                <label htmlFor="dental-coverage" className="font-medium cursor-pointer">
                                  Dental Coverage
                                </label>
                                <p className="text-sm text-muted-foreground">Basic dental care and cleanings</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">+$25/mo</div>
                            </div>
                          </div>
                        </div>

                        {/* Vision Coverage */}
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                id="vision-coverage"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div>
                                <label htmlFor="vision-coverage" className="font-medium cursor-pointer">
                                  Vision Coverage
                                </label>
                                <p className="text-sm text-muted-foreground">Eye exams and eyewear allowance</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">+$18/mo</div>
                            </div>
                          </div>
                        </div>

                        {/* Wellness Benefits */}
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                id="wellness-benefits"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div>
                                <label htmlFor="wellness-benefits" className="font-medium cursor-pointer">
                                  Wellness Benefits
                                </label>
                                <p className="text-sm text-muted-foreground">Gym membership and health programs</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">+$12/mo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Frequency */}
                    <div>
                      <h4 className="font-medium mb-3">Payment Frequency</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors border-primary bg-primary/5">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payment" id="monthly" defaultChecked className="text-primary" />
                            <label htmlFor="monthly" className="cursor-pointer">
                              <div className="font-medium">Monthly</div>
                              <div className="text-sm text-muted-foreground">No discount</div>
                            </label>
                          </div>
                        </div>
                        <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payment" id="annual" className="text-primary" />
                            <label htmlFor="annual" className="cursor-pointer">
                              <div className="font-medium">Annual</div>
                              <div className="text-sm text-green-600">Save 5%</div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cart Summary */}
              <div className="space-y-6">
                {/* Plan Summary */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Plan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Plan {quoteData.plan} Base</span>
                        <span>{formatCurrency(quoteData.rate.month)}</span>
                      </div>
                      
                      {/* This will be updated dynamically as user selects add-ons */}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Add-ons</span>
                        <span>$0</span>
                      </div>
                      
                      {/* Applied Discounts */}
                      {quoteData.discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span className="text-sm">
                            {discount.name.charAt(0).toUpperCase() + discount.name.slice(1)} Discount
                          </span>
                          <span className="text-sm">
                            -{formatCurrency(
                              discount.type === 'percent' 
                                ? quoteData.rate.month * discount.value
                                : discount.value
                            )}
                          </span>
                        </div>
                      ))}
                      
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Monthly</span>
                        <span className="text-primary">
                          {formatCurrency(calculateDiscountedRate(quoteData.rate.month, quoteData.discounts))}
                        </span>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="lg">
                      Add to Cart
                    </Button>
                    
                    <div className="text-center">
                      <Button variant="outline" size="sm" className="text-xs">
                        Save for Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Company Info */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <div className="w-6 h-6 relative">
                        <Image
                          src={getProperLogoUrl(quoteData.company_base.naic, quoteData.company_base.name)}
                          alt={quoteData.company_base.name}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span>{quoteData.company_base.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">A.M. Best Rating</span>
                      <Badge variant="outline" className={getRatingColor(quoteData.company_base.ambest_rating)}>
                        {quoteData.company_base.ambest_rating !== 'n/a' ? quoteData.company_base.ambest_rating : 'Not Rated'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Established</span>
                      <span className="text-sm">{quoteData.company_base.established_year}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      View Company Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* All Plans Tab - This would show comparison when multiple plans exist */}
          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Available Plans from {quoteData.company_base.name}</CardTitle>
                <p className="text-muted-foreground">
                  Compare different options available for your location
                  {carrierQuotes.length > 1 && " - differences highlighted below"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carrierQuotes.map((quote, index) => {
                    const differences = [];
                    
                    // Find differences compared to the first quote
                    if (index > 0) {
                      const baseQuote = carrierQuotes[0];
                      
                      // Rate differences
                      if (quote.rate.month !== baseQuote.rate.month) {
                        const diff = quote.rate.month - baseQuote.rate.month;
                        differences.push({
                          type: 'rate',
                          text: `${diff > 0 ? '+' : ''}${formatCurrency(diff)}/mo vs Plan ${baseQuote.plan}`,
                          positive: diff < 0
                        });
                      }
                      
                      // Discount differences
                      if (quote.discounts.length !== baseQuote.discounts.length) {
                        differences.push({
                          type: 'discount',
                          text: `${quote.discounts.length > baseQuote.discounts.length ? 'More' : 'Fewer'} discounts available`,
                          positive: quote.discounts.length > baseQuote.discounts.length
                        });
                      }
                      
                      // Rating class differences
                      if (quote.rating_class !== baseQuote.rating_class) {
                        differences.push({
                          type: 'underwriting',
                          text: `Different underwriting class: ${quote.rating_class || 'Standard'}`,
                          positive: false
                        });
                      }
                      
                      // Discount category differences
                      if (quote.discount_category !== baseQuote.discount_category) {
                        differences.push({
                          type: 'category',
                          text: `${quote.discount_category} category vs ${baseQuote.discount_category}`,
                          positive: false
                        });
                      }
                    }

                    return (
                      <div key={quote.key} className={`border rounded-lg p-4 transition-colors ${
                        index === 0 ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant={index === 0 ? "default" : "outline"}>
                                Plan {quote.plan}
                              </Badge>
                              {index === 0 && (
                                <Badge variant="secondary">Recommended</Badge>
                              )}
                              {quote.discounts.length > 0 && (
                                <Badge variant="secondary">
                                  {quote.discounts.length} Discount{quote.discounts.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {quote.rate_type} • {quote.discount_category || 'Standard'} Category
                              {quote.rating_class && ` • ${quote.rating_class} Class`}
                            </p>
                            
                            {/* Show discounts */}
                            {quote.discounts.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {quote.discounts.map((discount, dIndex) => (
                                  <div key={dIndex} className="text-xs text-green-600">
                                    • {discount.name}: {discount.type === 'percent' ? `${(discount.value * 100).toFixed(0)}%` : formatCurrency(discount.value)} off
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Show differences for non-primary plans */}
                            {differences.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Key Differences:</p>
                                {differences.map((diff, dIndex) => (
                                  <div key={dIndex} className={`text-xs flex items-center space-x-1 ${
                                    diff.positive ? 'text-green-600' : 'text-amber-600'
                                  }`}>
                                    <span className="w-1 h-1 rounded-full bg-current"></span>
                                    <span>{diff.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatCurrency(calculateDiscountedRate(quote.rate.month, quote.discounts))}/mo
                            </div>
                            {quote.discounts.length > 0 && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(quote.rate.month)}/mo
                              </div>
                            )}
                            <Button 
                              variant={index === 0 ? "default" : "outline"} 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setQuoteData(quote);
                                // Scroll to top to show the updated selection
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              {index === 0 ? "Selected" : "Select This Plan"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Comparison table for multiple plans */}
                {carrierQuotes.length > 1 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-medium mb-4">Side-by-Side Comparison</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Feature</th>
                              {carrierQuotes.map((quote, index) => (
                                <th key={quote.key} className="text-center p-2">
                                  Plan {quote.plan}
                                  {index === 0 && <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Monthly Premium</td>
                              {carrierQuotes.map(quote => (
                                <td key={quote.key} className="text-center p-2">
                                  <div className="font-bold text-primary">
                                    {formatCurrency(calculateDiscountedRate(quote.rate.month, quote.discounts))}
                                  </div>
                                  {quote.discounts.length > 0 && (
                                    <div className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(quote.rate.month)}
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Rate Type</td>
                              {carrierQuotes.map(quote => (
                                <td key={quote.key} className="text-center p-2 capitalize">
                                  {quote.rate_type}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Discount Category</td>
                              {carrierQuotes.map(quote => (
                                <td key={quote.key} className="text-center p-2">
                                  {quote.discount_category || 'Standard'}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Available Discounts</td>
                              {carrierQuotes.map(quote => (
                                <td key={quote.key} className="text-center p-2">
                                  <div className="space-y-1">
                                    {quote.discounts.length > 0 ? (
                                      quote.discounts.map((discount, index) => (
                                        <div key={index} className="text-xs text-green-600">
                                          {discount.name} ({discount.type === 'percent' ? `${(discount.value * 100).toFixed(0)}%` : formatCurrency(discount.value)})
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-muted-foreground">None</span>
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Underwriting Class</td>
                              {carrierQuotes.map(quote => (
                                <td key={quote.key} className="text-center p-2">
                                  {quote.rating_class || 'Standard'}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
                      <p className="font-semibold">{quoteData.company_base.name_full}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">NAIC Code</h4>
                      <p className="font-semibold">{quoteData.company_base.naic}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Company Type</h4>
                      <p className="font-semibold">{quoteData.company_base.type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Established</h4>
                      <p className="font-semibold">{quoteData.company_base.established_year}</p>
                    </div>
                  </div>
                  
                  {quoteData.company_base.parent_company_base && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Parent Company</h4>
                        <p className="text-sm">{quoteData.company_base.parent_company_base.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Est. {quoteData.company_base.parent_company_base.established_year}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Financial Ratings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>A.M. Best Rating</span>
                      <span className={`font-bold ${getRatingColor(quoteData.company_base.ambest_rating)}`}>
                        {quoteData.company_base.ambest_rating !== 'n/a' ? quoteData.company_base.ambest_rating : 'Not Rated'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>A.M. Best Outlook</span>
                      <span className="font-medium">
                        {quoteData.company_base.ambest_outlook !== 'n/a' ? quoteData.company_base.ambest_outlook : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>S&P Rating</span>
                      <span className="font-medium">
                        {quoteData.company_base.sp_rating !== 'n/a' ? quoteData.company_base.sp_rating : 'Not Rated'}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Complaints</span>
                      <span className="text-sm font-medium">
                        {quoteData.company_base.customer_complaint_ratio !== null 
                          ? `${quoteData.company_base.customer_complaint_ratio}%`
                          : 'Not Available'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="text-sm font-medium">
                        {quoteData.company_base.customer_satisfaction_ratio > 0 
                          ? `${quoteData.company_base.customer_satisfaction_ratio}%`
                          : 'Not Available'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Data */}
            {quoteData.company_base.med_supp_market_data.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Medicare Supplement Market Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quoteData.company_base.med_supp_market_data.slice(0, 3).map((data, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Year {data.year}</h4>
                          <Badge variant="outline">
                            {(data.med_supp_national_market_data.market_share * 100).toFixed(4)}% Market Share
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Lives Covered</span>
                            <p className="font-medium">{data.med_supp_national_market_data.lives.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Claims</span>
                            <p className="font-medium">{formatCurrency(data.med_supp_national_market_data.claims)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Premiums</span>
                            <p className="font-medium">{formatCurrency(data.med_supp_national_market_data.premiums)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Plan Details Tab */}
          <TabsContent value="plan" className="space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Medicare Supplement Plan {quoteData.plan} Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Covered Benefits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Medicare Part A Hospital Deductible</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Medicare Part A Hospital Coinsurance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Medicare Part B Medical Coinsurance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">First 3 Pints of Blood</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Hospice Care Coinsurance</span>
                      </div>
                      {quoteData.plan === 'F' || quoteData.plan === 'G' ? (
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">Medicare Part B Deductible</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <InfoCircledIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Medicare Part B Deductible (Not Covered)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Additional Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">Works with any Medicare-accepting doctor</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">No network restrictions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">No referrals needed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">Guaranteed renewable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Information */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Rate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Payment Options</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monthly</span>
                        <span className="font-medium">{formatCurrency(quoteData.rate.month)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarterly</span>
                        <span className="font-medium">{formatCurrency(quoteData.rate.quarter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semi-Annual</span>
                        <span className="font-medium">{formatCurrency(quoteData.rate.semi_annual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual</span>
                        <span className="font-medium">{formatCurrency(quoteData.rate.annual)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Rate Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Rate Type</span>
                        <span className="font-medium capitalize">{quoteData.rate_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Age at Quote</span>
                        <span className="font-medium">{quoteData.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tobacco User</span>
                        <span className="font-medium">{quoteData.tobacco ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gender</span>
                        <span className="font-medium">{quoteData.gender === 'M' ? 'Male' : 'Female'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Underwriting Tab */}
          <TabsContent value="underwriting" className="space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Underwriting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Application Process</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Online Application</span>
                        <Badge variant={quoteData.e_app_link ? "default" : "secondary"}>
                          {quoteData.e_app_link ? "Available" : "Paper Only"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medical Underwriting</span>
                        <Badge variant="default">Required</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rating Class</span>
                        <span className="text-sm font-medium">
                          {quoteData.rating_class || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Coverage Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Effective Date</span>
                        <span className="font-medium">
                          {new Date(quoteData.effective_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Expires</span>
                        <span className="font-medium">
                          {new Date(quoteData.expires_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewable</span>
                        <span className="font-medium">Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {quoteData.age_increases && quoteData.age_increases.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Age-Based Rate Increases</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        Projected annual rate increases based on age progression
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quoteData.age_increases.map((increase, index) => (
                          <div key={index} className="text-center p-2 border rounded">
                            <div className="text-sm text-muted-foreground">Year {index + 1}</div>
                            <div className="font-medium">
                              {increase > 0 ? `+${(increase * 100).toFixed(1)}%` : '0%'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Riders */}
                {quoteData.riders && quoteData.riders.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Available Riders</h4>
                      <div className="space-y-2">
                        {quoteData.riders.map((rider, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{rider.name}</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(rider.premium)}/mo
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <InfoCircledIcon className="w-5 h-5" />
                  <span>Important Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Medicare Supplement insurance requires medical underwriting. Your health status may affect approval and premium rates.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Rates shown are for the age and location specified. Actual rates may vary based on final underwriting.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>This policy does not cover prescription drugs. A separate Medicare Part D plan may be needed.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Coverage begins the first day of the month following approval and payment of first premium.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
