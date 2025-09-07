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
import { REAL_QUOTES_KEY, getAllMedigapStorageKeys, getMedigapStorageKey } from "@/components/medicare-shop/shared/storage";
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
      
      // Use the new plan-specific loading method
      const quotes = await loadExistingMedigapQuotes();
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
      console.log('Plan Details - Loading existing medigap quotes from plan-specific storage...');
      
      // Load from all plan-specific collections (F, G, N)
      const planStorageKeys = getAllMedigapStorageKeys();
      const loadPromises = planStorageKeys.map(async (storageKey) => {
        try {
          const planQuotes = await loadTemporaryData(storageKey, []);
          return Array.isArray(planQuotes) ? planQuotes : [];
        } catch (error) {
          console.warn(`Failed to load quotes from ${storageKey}:`, error);
          return [];
        }
      });
      
      const allPlanQuotes = await Promise.all(loadPromises);
      const combinedQuotes = allPlanQuotes.flat();
      
      console.log('Plan Details - Loaded quotes:', {
        planStorageKeys,
        quotesPerPlan: allPlanQuotes.map((quotes, index) => ({ 
          key: planStorageKeys[index], 
          count: quotes.length 
        })),
        totalQuotes: combinedQuotes.length,
        firstItem: combinedQuotes?.[0]
      });
      
      if (combinedQuotes.length > 0) {
        console.log('Plan Details - Found existing quotes:', combinedQuotes.length);
        return combinedQuotes as QuoteData[];
      }
      
      // Fallback: try loading from old single collection for backward compatibility
      console.log('Plan Details - No plan-specific quotes found, trying legacy storage...');
      const legacyQuotes = await loadTemporaryData(REAL_QUOTES_KEY, []);
      if (legacyQuotes && Array.isArray(legacyQuotes) && legacyQuotes.length > 0) {
        console.log('Plan Details - Found legacy quotes:', legacyQuotes.length);
        return legacyQuotes as QuoteData[];
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
      console.log('Plan Details - Initializing component...');
      
      // Get simplified URL parameters 
      const carrier = searchParams.get('carrier'); // The company field from API
      const planType = searchParams.get('plan');
      
      console.log('Plan Details - URL Parameters:', { carrier, planType });
      
      setCurrentSelection({
        ratingClass: '', // Will be set based on available quotes
        discounts: [] // Managed by unified discount state
      });
      
      // Check for existing medigap quotes
      console.log('Plan Details - Checking for existing quotes...');
      const existingQuotes = await loadExistingQuotes();
      
      if (existingQuotes.length > 0) {
        console.log('Plan Details - Found existing quotes, total:', existingQuotes.length);
        
        // Filter quotes based on URL parameters if provided
        let filteredQuotes = existingQuotes;
        
        if (carrier || planType) {
          filteredQuotes = existingQuotes.filter(quote => {
            // Match using the company field from the API (primary identifier)
            const matchesCarrier = !carrier || quote.company === carrier;
            const matchesPlan = !planType || quote.plan === planType;
            
            console.log('Quote filter check:', {
              quoteKey: quote.key,
              quoteCompany: quote.company,
              quotePlan: quote.plan,
              urlCarrier: carrier,
              urlPlanType: planType,
              matchesCarrier,
              matchesPlan,
              overallMatch: matchesCarrier && matchesPlan
            });
            
            return matchesCarrier && matchesPlan;
          });
          
          console.log('Plan Details - Filtered quotes for specific carrier/plan:', {
            original: existingQuotes.length,
            filtered: filteredQuotes.length,
            carrier,
            planType
          });
        }
        
        if (filteredQuotes.length > 0) {
          console.log('Plan Details - Using filtered quotes, first quote:', filteredQuotes[0]);
          setQuoteData(filteredQuotes[0]);
          setCarrierQuotes(filteredQuotes);
        } else {
          console.log('Plan Details - No quotes match URL parameters, showing generate quote option');
          setShowGenerateQuote(true);
        }
      } else {
        console.log('Plan Details - No existing quotes found, will show generate quote option');
        setShowGenerateQuote(true);
      }
      
      setLoading(false);
    };

    initializeComponent();
  }, [searchParams]); // Add searchParams as dependency

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
