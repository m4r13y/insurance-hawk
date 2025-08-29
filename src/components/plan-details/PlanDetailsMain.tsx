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
import { getProperLogoUrl } from "@/lib/naic-carriers";

// Import types and components from relative paths
import type { QuoteData } from './types';
import { PlanDetailsHeader } from './PlanDetailsHeader';
import { PlanBuilderTab } from './PlanBuilderTab';
import { AllPlansTab } from './AllPlansTab';
import { CompanyTab } from './CompanyTab';
import { PlanDetailsTab } from './PlanDetailsTab';
import { UnderwritingTab } from './UnderwritingTab';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface PlanDetailsMainProps {
  // Props will be passed via URL params or state
}

const PlanDetailsMain: React.FC<PlanDetailsMainProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [quoteData, setQuoteData] = React.useState<QuoteData | null>(null);
  const [carrierQuotes, setCarrierQuotes] = React.useState<QuoteData[]>([]);
  const [loading, setLoading] = React.useState(true);

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
      // Fallback to Medicare shop page with results step if quotes exist
      const hasQuotes = localStorage.getItem('medicare_real_quotes');
      const fallbackUrl = hasQuotes ? '/medicare/shop?step=results' : '/medicare/shop';
      router.push(fallbackUrl);
    }
  };

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
    return <LoadingState />;
  }

  if (!quoteData) {
    return <ErrorState onGoBack={handleGoBack} />;
  }

  return (
    <div className="min-h-screen">
      <PlanDetailsHeader 
        quoteData={quoteData}
        onGoBack={handleGoBack}
        calculateDiscountedRate={calculateDiscountedRate}
        formatCurrency={formatCurrency}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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

          <PlanBuilderTab 
            quoteData={quoteData}
            formatCurrency={formatCurrency}
            calculateDiscountedRate={calculateDiscountedRate}
          />

          <AllPlansTab 
            quoteData={quoteData}
            carrierQuotes={carrierQuotes}
            formatCurrency={formatCurrency}
            calculateDiscountedRate={calculateDiscountedRate}
          />

          <CompanyTab 
            quoteData={quoteData}
            getRatingColor={getRatingColor}
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
