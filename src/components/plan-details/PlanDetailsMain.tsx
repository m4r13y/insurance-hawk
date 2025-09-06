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
  ExclamationTriangleIcon
} from '@radix-ui/react-icons';
import Image from 'next/image';
import { getProperLogoUrl } from "@/lib/carrier-system";
import { loadTemporaryData } from "@/lib/services/temporary-storage";
import { REAL_QUOTES_KEY } from "@/components/medicare-shop/shared/storage";
import { getBaseRate } from "@/lib/medigap-utils";
import { useDiscountState } from "@/lib/services/discount-state";

// Import types and components from relative paths
import type { QuoteData } from './types';
import { PlanDetailsHeader } from './PlanDetailsHeader';
import { PlanBuilderTab } from './PlanBuilderTab';
import { PlanDetailsTab } from './PlanDetailsTab';
import { UnderwritingTab } from './UnderwritingTab';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface PlanDetailsMainProps {
  // Props will be passed via URL params or state
}

interface PlanConfiguration {
  ratingClass: string;
  discounts: string[];
}

const PlanDetailsMain: React.FC<PlanDetailsMainProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [quoteData, setQuoteData] = React.useState<QuoteData | null>(null);
  const [carrierQuotes, setCarrierQuotes] = React.useState<QuoteData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showGenerateQuote, setShowGenerateQuote] = React.useState(false);
  
  // Use unified discount state
  const [applyDiscounts] = useDiscountState();
  
  // Current selection state for header rate calculation
  const [currentSelection, setCurrentSelection] = React.useState<PlanConfiguration>({
    ratingClass: '', // Empty means no selection made yet
    discounts: []
  });
  
  // Track if user has made any selection
  const [hasUserSelection, setHasUserSelection] = React.useState(false);

  // Load existing medigap quotes from Firestore/localStorage
  const loadExistingQuotes = async (): Promise<QuoteData[]> => {
    try {
      console.log('Plan Details - Loading existing medigap quotes...');
      const quotes = await loadTemporaryData(REAL_QUOTES_KEY, []);
      if (quotes && Array.isArray(quotes) && quotes.length > 0) {
        console.log('Plan Details - Found existing quotes:', quotes.length);
        return quotes;
      }
    } catch (error) {
      console.error('Error loading existing quotes:', error);
    }
    return [];
  };

  // Load existing medigap quotes the same way as main Medicare shop page
  const loadExistingMedigapQuotes = async (): Promise<QuoteData[]> => {
    try {
      console.log('Plan Details - Loading existing medigap quotes from storage...');
      
      // Use the same storage system as the main Medicare shop page
      const savedQuotes = await loadTemporaryData(REAL_QUOTES_KEY, []);
      
      console.log('Plan Details - Raw storage data:', {
        type: typeof savedQuotes,
        isArray: Array.isArray(savedQuotes),
        length: savedQuotes?.length,
        firstItem: savedQuotes?.[0]
      });
      
      if (savedQuotes && Array.isArray(savedQuotes) && savedQuotes.length > 0) {
        console.log('Plan Details - Found existing quotes:', savedQuotes.length);
        return savedQuotes as QuoteData[];
      }
      
      console.log('Plan Details - No existing quotes found');
      return [];
    } catch (error) {
      console.error('Plan Details - Error loading existing quotes:', error);
      return [];
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    const returnUrl = localStorage.getItem('planDetailsReturnUrl');
    if (returnUrl) {
      // Clear the stored return URL
      localStorage.removeItem('planDetailsReturnUrl');
      
      // Ensure the return URL includes step=results to show quotes
      let finalReturnUrl = returnUrl;
      if (!returnUrl.includes('step=results')) {
        const separator = returnUrl.includes('?') ? '&' : '?';
        finalReturnUrl = `${returnUrl}${separator}step=results`;
      }
      
      router.push(finalReturnUrl);
    } else {
      // Fallback to Medicare shop page with results step - check Firestore for quotes
      router.push('/medicare/shop?step=results');
    }
  };

  React.useEffect(() => {
    const initializeComponent = async () => {
      // First, try to get data from localStorage (plan details data)
      const planDetailsDataStr = localStorage.getItem('planDetailsData');
      
      console.log('Plan Details - localStorage data:', planDetailsDataStr);
      
      if (planDetailsDataStr) {
        try {
          const planDetailsData = JSON.parse(planDetailsDataStr);
          console.log('Plan Details - parsed data:', planDetailsData);
          
          const { carrierGroup } = planDetailsData;
          console.log('Plan Details - using unified discount state');
          
          setCurrentSelection({
            ratingClass: '', // Will be set based on available quotes
            discounts: [] // Managed by unified discount state
          });
          
          if (carrierGroup && carrierGroup.quotes && carrierGroup.quotes.length > 0) {
            console.log('Plan Details - carrierGroup found with quotes:', carrierGroup.quotes.length);
            console.log('Plan Details - selectedPlanType:', carrierGroup.selectedPlanType);
            
            // Use the selected plan type if available, otherwise use the first quote
            const firstQuote = carrierGroup.quotes[0];
            const selectedPlanType = carrierGroup.selectedPlanType || firstQuote.plan || 'G';
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
            plan: selectedPlanType, // Use the selected plan type instead of defaulting to 'G'
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

          console.log('Plan Details - converted quote data:', convertedQuote);
          setQuoteData(convertedQuote);
          setCarrierQuotes(allQuotes);
          setLoading(false);
          return;
        } else {
          console.error('Plan Details - No quotes found in carrier group:', carrierGroup);
        }
      } catch (error) {
        console.error('Plan Details - Error parsing plan details data:', error);
      }
    }
    
    // If no plan details data, check for existing medigap quotes
    console.log('Plan Details - No plan details data, checking for existing quotes...');
    const existingQuotes = await loadExistingQuotes();
    
    if (existingQuotes.length > 0) {
      console.log('Plan Details - Found existing quotes, using first quote:', existingQuotes[0]);
      setQuoteData(existingQuotes[0]);
      setCarrierQuotes(existingQuotes);
    } else {
      console.log('Plan Details - No existing quotes found, will show generate quote option');
      setShowGenerateQuote(true);
    }
    
    setLoading(false);
  };

  initializeComponent();
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

  // Calculate current rate based on user selections using shared utilities
  const getCurrentSelectionRate = () => {
    console.log('PlanDetailsMain - getCurrentSelectionRate called');
    console.log('hasUserSelection:', hasUserSelection);
    console.log('currentSelection:', currentSelection);
    console.log('carrierQuotes length:', carrierQuotes?.length || 0);
    console.log('quoteData:', quoteData?.rate?.month);
    
    // If no user selection has been made, return null to show placeholder
    if (!hasUserSelection || !currentSelection.ratingClass) {
      console.log('No user selection made yet, returning null');
      return null;
    }
    
    if (!carrierQuotes || carrierQuotes.length === 0 || !quoteData) {
      console.log('No carrier quotes or quote data available');
      return null;
    }

    // Find quote matching current selection
    const matchingQuote = carrierQuotes.find(quote => {
      const ratingMatch = (quote.rating_class || '') === currentSelection.ratingClass;
      return ratingMatch && quote.plan === quoteData.plan;
    });

    console.log('Matching quote found:', !!matchingQuote);

    if (matchingQuote) {
      // Use the unified discount state for rate calculation
      const rate = getBaseRate(matchingQuote, applyDiscounts);
      console.log('Rate from shared getBaseRate function:', rate, 'applyDiscounts:', applyDiscounts);
      return Math.round(rate);
    }

    console.log('No matching quote found for user selection');
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Assuming amounts are in cents
  };

  // Custom selection change handler that tracks user interaction
  const handleSelectionChange = (selection: PlanConfiguration) => {
    console.log('User made selection:', selection);
    setCurrentSelection(selection);
    
    // Mark that user has made a selection if rating class is provided
    if (selection.ratingClass && selection.ratingClass !== '') {
      setHasUserSelection(true);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (showGenerateQuote || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              No Quote Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              No quote data is available. Please generate a new quote to view plan details.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={handleGoBack}>
                Generate Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PlanDetailsHeader 
        quoteData={quoteData}
        onGoBack={handleGoBack}
        calculateDiscountedRate={calculateDiscountedRate}
        getCurrentRate={getCurrentSelectionRate}
        formatCurrency={formatCurrency}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        <Tabs defaultValue="builder" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[300px] sm:min-w-0">
              <TabsTrigger value="builder" className="text-xs sm:text-sm">Plan Builder</TabsTrigger>
              <TabsTrigger value="plan" className="text-xs sm:text-sm">Plan Details</TabsTrigger>
              <TabsTrigger value="underwriting" className="text-xs sm:text-sm">Underwriting</TabsTrigger>
            </TabsList>
          </div>

          <PlanBuilderTab 
            quoteData={quoteData}
            carrierQuotes={carrierQuotes}
            formatCurrency={formatCurrency}
            calculateDiscountedRate={calculateDiscountedRate}
            currentSelection={currentSelection}
            getCurrentRate={getCurrentSelectionRate}
            hasUserSelection={hasUserSelection}
          />

          <PlanDetailsTab 
            quoteData={quoteData}
          />

          <UnderwritingTab 
            quoteData={quoteData}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default PlanDetailsMain;
