import React from 'react';
import GenericQuoteLoading from './GenericQuoteLoading';
import {
  MedigapPlanTypeControls,
  MedigapEmptyState,
  MedigapResultsHeader
} from "./medicare-shop/medigap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface QuoteResultsSectionProps {
  selectedCategory: string;
  isLoadingQuotes: boolean;
  isCategoryLoading: (category: string) => boolean;
  realQuotes: any[];
  advantageQuotes: any[];
  drugPlanQuotes: any[];
  dentalQuotes: any[];
  hospitalIndemnityQuotes: any[];
  finalExpenseQuotes: any[];
  cancerInsuranceQuotes: any[];
  selectedQuotePlans: string[];
  setSelectedQuotePlans: (plans: string[]) => void;
  hasQuotesForPlan: (planType: string) => boolean;
  handleFetchQuotes: (planType: string) => Promise<void>;
  loadingPlanButton: string | null;
  resetFilters: () => void;
  paginationInfo: any;
  currentPlans: any[];
  searchQuery: string;
  sortBy: string;
  handlePlanButtonClick: (plan: any) => void;
  handleAddToCart: (plan: any) => void;
  handleRemoveFromCart: (planId: string) => void;
  cart: any[];
  carrierLogos: Record<string, string>;
  paymentMode: string;
  applyDiscounts: boolean;
}

const QuoteResultsSection: React.FC<QuoteResultsSectionProps> = ({
  selectedCategory,
  isLoadingQuotes,
  isCategoryLoading,
  realQuotes,
  advantageQuotes,
  drugPlanQuotes,
  dentalQuotes,
  hospitalIndemnityQuotes,
  finalExpenseQuotes,
  cancerInsuranceQuotes,
  selectedQuotePlans,
  setSelectedQuotePlans,
  hasQuotesForPlan,
  handleFetchQuotes,
  loadingPlanButton,
  resetFilters,
  paginationInfo,
  currentPlans,
  searchQuery,
  sortBy,
  handlePlanButtonClick,
  handleAddToCart,
  handleRemoveFromCart,
  cart,
  carrierLogos,
  paymentMode,
  applyDiscounts
}) => {
  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'medigap': return 'Medigap (Supplement)';
      case 'advantage': return 'Medicare Advantage';
      case 'drug-plan': return 'Drug Plans';
      case 'dental': return 'Dental Insurance';
      case 'cancer': return 'Cancer Insurance';
      case 'hospital-indemnity': return 'Hospital Indemnity';
      case 'final-expense': return 'Final Expense Life Insurance';
      default: return 'Medicare Plans';
    }
  };

  const getQuotesForCategory = () => {
    switch (selectedCategory) {
      case 'medigap': return realQuotes;
      case 'advantage': return advantageQuotes;
      case 'drug-plan': return drugPlanQuotes;
      case 'dental': return dentalQuotes;
      case 'hospital-indemnity': return hospitalIndemnityQuotes;
      case 'final-expense': return finalExpenseQuotes;
      case 'cancer': return cancerInsuranceQuotes;
      default: return [];
    }
  };

  const quotes = getQuotesForCategory();
  // Remove isCategoryLoading to prevent loading state on tab switch
  const isLoading = isLoadingQuotes; // Only show loading for actual quote fetching, not tab switching
  const hasNoQuotes = quotes.length === 0 && !isLoading;

  const renderLoadingState = () => {
    const loadingConfig = {
      'medigap': { title: 'Getting Your Medigap Quotes', message: 'Searching for Medicare Supplement plans in your area...' },
      'drug-plan': { title: 'Getting Your Drug Plan Quotes', message: 'Searching for Drug Plan (PDP) coverage in your area...' },
      'dental': { title: 'Getting Your Dental Quotes', message: 'Searching for dental insurance plans in your area...' },
      'hospital-indemnity': { title: 'Getting Your Hospital Indemnity Quotes', message: 'Searching for hospital indemnity plans in your area...' },
      'final-expense': { title: 'Getting Your Final Expense Quotes', message: 'Searching for final expense life insurance in your area...' },
      'cancer': { title: 'Getting Your Cancer Insurance Quotes', message: 'Searching for cancer insurance plans in your area...' }
    };

    const config = loadingConfig[selectedCategory as keyof typeof loadingConfig] || { 
      title: 'Getting Your Quotes', 
      message: 'Searching for insurance plans in your area...' 
    };

    return (
      <GenericQuoteLoading 
        title={config.title}
        message={config.message}
      />
    );
  };

  const renderEmptyState = () => {
    if (selectedCategory === 'medigap') {
      return <MedigapEmptyState onResetFilters={resetFilters} />;
    }

    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No {getCategoryTitle().toLowerCase()} found for your area.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  };

  const renderPlanCard = (plan: any) => {
    const isInCart = cart.some(item => item.id === plan.id);

    // Generic plan card for all types
    return (
      <Card key={plan.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {carrierLogos[plan.carrier_id] && (
                  <Image
                    src={carrierLogos[plan.carrier_id]}
                    alt={plan.carrier_name || 'Carrier Logo'}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {plan.plan_name || plan.planName || plan.name || 'Plan'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.carrier_name || plan.carrierName || 'Insurance Carrier'}
                  </p>
                </div>
              </div>
              
              {plan.plan && (
                <Badge variant="outline" className="mb-2">
                  Plan {plan.plan}
                </Badge>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${plan.premium || plan.monthly_premium || plan.rate || '0'}
                <span className="text-sm font-normal text-muted-foreground">
                  /{paymentMode === 'monthly' ? 'mo' : paymentMode === 'quarterly' ? 'qtr' : 'yr'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handlePlanButtonClick(plan)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              View Details
            </Button>
            
            {isInCart ? (
              <Button
                onClick={() => handleRemoveFromCart(plan.id)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            ) : (
              <Button
                onClick={() => handleAddToCart(plan)}
                size="sm"
              >
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Results Header with Pagination Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{getCategoryTitle()}</h2>
          <MedigapResultsHeader
            selectedCategory={selectedCategory}
            realQuotes={realQuotes}
            advantageQuotes={advantageQuotes}
            drugPlanQuotes={drugPlanQuotes}
            dentalQuotes={dentalQuotes}
            hospitalIndemnityQuotes={hospitalIndemnityQuotes}
            finalExpenseQuotes={finalExpenseQuotes}
            cancerInsuranceQuotes={cancerInsuranceQuotes}
            paginationInfo={paginationInfo}
          />
        </div>

        {/* Plan Types Controls for Medigap */}
        {selectedCategory === 'medigap' && realQuotes.length > 0 && (
          <MedigapPlanTypeControls
            selectedQuotePlans={selectedQuotePlans}
            setSelectedQuotePlans={setSelectedQuotePlans}
            hasQuotesForPlan={hasQuotesForPlan}
            fetchIndividualPlanQuotes={handleFetchQuotes}
            loadingPlanButton={loadingPlanButton}
          />
        )}
      </div>

      {/* Product Grid - Show loading, empty state, or plans */}
      {isLoading ? (
        renderLoadingState()
      ) : hasNoQuotes ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {currentPlans.map(renderPlanCard)}
        </div>
      )}
    </div>
  );
};

export default React.memo(QuoteResultsSection);
