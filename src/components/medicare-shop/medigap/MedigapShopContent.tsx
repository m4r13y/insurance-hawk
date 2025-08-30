"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MedicareLandingPage from "../shared/MedicareLandingPage";
import MedicareShoppingHeader from "../shared/MedicareShoppingHeader";
import FilterSidebar from "../shared/FilterSidebar";
import PlanResultsContainer from "../shared/PlanResultsContainer";
import MedigapPlanCard from "./MedigapPlanCard";
import MedigapCarrierGroup from "./MedigapCarrierGroup";
import { QuoteFormData, MedigapQuote, FilterState, CarrierGroup, PaginationInfo } from "../shared/types";

interface MedigapShopContentProps {
  quoteData?: QuoteFormData;
  enableGrouping?: boolean;
  enableFiltering?: boolean;
  showLandingPage?: boolean;
  customContent?: {
    title?: string;
    subtitle?: string;
    features?: Array<{ title: string; description: string; icon: string; }>;
    testimonials?: Array<{ name: string; quote: string; rating: number; }>;
  };
}

export default function MedigapShopContent({
  quoteData,
  enableGrouping = true,
  enableFiltering = true,
  showLandingPage = true,
  customContent
}: MedigapShopContentProps) {
  const router = useRouter();
  
  // State management
  const [quotes, setQuotes] = useState<MedigapQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [displayMode, setDisplayMode] = useState<'individual' | 'grouped'>(enableGrouping ? 'grouped' : 'individual');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sortBy: 'price',
    priceRange: [0, 1000],
    selectedCoverageLevel: '',
    applyDiscounts: false,
    paymentMode: 'monthly'
  });

  // Constants
  const ITEMS_PER_PAGE = 10;

  // Load quotes on mount or when quote data changes
  useEffect(() => {
    if (quoteData?.zipCode && quoteData?.age) {
      fetchQuotes();
    }
  }, [quoteData]);

  // Fetch quotes from API
  const fetchQuotes = async () => {
    if (!quoteData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        zipCode: quoteData.zipCode,
        age: quoteData.age.toString(),
        gender: quoteData.gender || '',
        tobaccoUse: quoteData.tobaccoUse?.toString() || 'false',
        effectiveDate: quoteData.effectiveDate || new Date().toISOString().split('T')[0]
      });

      const response = await fetch(`/api/quotes/medigap?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      setQuotes(data.quotes || []);
      
      // Store in localStorage for persistence
      localStorage.setItem('medigap_quotes', JSON.stringify(data.quotes || []));
      localStorage.setItem('quote_form_data', JSON.stringify(quoteData));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching quotes');
      console.error('Error fetching quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(quote => 
        (quote.carrier?.name?.toLowerCase().includes(query)) ||
        (quote.company?.toLowerCase().includes(query)) ||
        (quote.plan_name?.toLowerCase().includes(query)) ||
        (quote.plan?.toLowerCase().includes(query))
      );
    }

    // Apply price range filter
    filtered = filtered.filter(quote => {
      const premium = quote.monthly_premium || quote.rate?.month || 0;
      return premium >= filters.priceRange[0] && premium <= filters.priceRange[1];
    });

    // Apply coverage level filter
    if (filters.selectedCoverageLevel && filters.selectedCoverageLevel !== 'all') {
      filtered = filtered.filter(quote => 
        quote.plan_type?.toLowerCase().includes(filters.selectedCoverageLevel.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aPremium = a.monthly_premium || a.rate?.month || 0;
      const bPremium = b.monthly_premium || b.rate?.month || 0;
      
      switch (filters.sortBy) {
        case 'price':
          return aPremium - bPremium;
        case 'rating':
          const aRating = a.am_best_rating || '';
          const bRating = b.am_best_rating || '';
          return bRating.localeCompare(aRating);
        case 'popularity':
          // Sort by carrier name as proxy for popularity
          const aCarrier = a.carrier?.name || a.company || '';
          const bCarrier = b.carrier?.name || b.company || '';
          return aCarrier.localeCompare(bCarrier);
        default:
          return 0;
      }
    });

    return filtered;
  }, [quotes, filters]);

  // Group quotes by carrier
  const carrierGroups = useMemo(() => {
    const groups: { [key: string]: CarrierGroup } = {};
    
    filteredQuotes.forEach(quote => {
      const carrierName = quote.carrier?.name || quote.company || 'Unknown Carrier';
      
      if (!groups[carrierName]) {
        groups[carrierName] = {
          carrierId: carrierName.toLowerCase().replace(/\s+/g, '-'),
          carrierName,
          quotes: [],
          averagePremium: 0
        };
      }
      
      groups[carrierName].quotes.push(quote);
    });

    // Calculate average premiums
    Object.values(groups).forEach(group => {
      const totalPremium = group.quotes.reduce((sum, quote) => {
        return sum + (quote.monthly_premium || quote.rate?.month || 0);
      }, 0);
      group.averagePremium = totalPremium / group.quotes.length;
    });

    return Object.values(groups);
  }, [filteredQuotes]);

  // Pagination
  const paginationInfo = useMemo(() => {
    const items = displayMode === 'grouped' ? carrierGroups : filteredQuotes;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    return {
      totalItems,
      totalPages,
      currentPage,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      displayType: displayMode
    } as PaginationInfo;
  }, [carrierGroups, filteredQuotes, currentPage, displayMode]);

  // Get current page items
  const currentPageItems = useMemo(() => {
    const items = displayMode === 'grouped' ? carrierGroups : filteredQuotes;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  }, [carrierGroups, filteredQuotes, currentPage, displayMode]);

  // Event handlers
  const handleSelectPlan = (quote: MedigapQuote) => {
    setSelectedPlanId(quote.id || null);
    // Store selected plan
    if (quote.id) {
      localStorage.setItem('selected_medigap_plan', JSON.stringify(quote));
    }
  };

  const handleCarrierClick = (carrierName: string) => {
    setFilters(prev => ({ ...prev, searchQuery: carrierName }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    router.push('/get-started');
  };

  const handleStartShopping = () => {
    // Scroll to results or trigger quote fetch
    if (quotes.length > 0) {
      document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/get-started');
    }
  };

  // Default content
  const defaultContent = {
    title: "Find Your Perfect Medigap Plan",
    subtitle: "Compare Medicare Supplement plans from top-rated carriers and save money on your healthcare costs.",
    features: [
      {
        title: "Comprehensive Coverage",
        description: "Fill the gaps in Original Medicare with plans that cover deductibles, coinsurance, and more.",
        icon: "shield"
      },
      {
        title: "Guaranteed Renewable",
        description: "Your coverage can't be cancelled as long as you pay your premiums on time.",
        icon: "check"
      },
      {
        title: "Nationwide Acceptance",
        description: "Use any doctor or hospital that accepts Medicare, anywhere in the United States.",
        icon: "globe"
      }
    ],
    testimonials: [
      {
        name: "Mary Johnson",
        quote: "Found the perfect Medigap plan in minutes. The comparison tool made it so easy to see the differences.",
        rating: 5
      },
      {
        name: "Robert Chen",
        quote: "Saved over $200 per month by switching to a plan I found here. Excellent service and support.",
        rating: 5
      }
    ]
  };

  const content = { ...defaultContent, ...customContent };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Landing Page Section */}
      {showLandingPage && (
        <MedicareLandingPage
          title={content.title}
          subtitle={content.subtitle}
          onStartGuided={handleGetStarted}
          onStartQuick={handleStartShopping}
          testimonials={content.testimonials}
        />
      )}

      {/* Shopping Interface */}
      {(quoteData || quotes.length > 0) && (
        <div className="container mx-auto px-4 py-8">
          {/* Shopping Header */}
          <MedicareShoppingHeader
            title="Your Medigap Quotes"
            quoteFormData={quoteData || { age: '', zipCode: '', gender: '', tobaccoUse: null }}
            quotesCount={filteredQuotes.length}
            onStartOver={() => router.push('/get-started')}
            onEditInfo={() => router.push('/get-started')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Filter Sidebar */}
            {enableFiltering && (
              <div className="lg:col-span-1">
                <FilterSidebar
                  filterState={filters}
                  onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                  priceRange={[0, Math.max(...quotes.map(q => q.monthly_premium || q.rate?.month || 0))]}
                />
              </div>
            )}

            {/* Results */}
            <div className={enableFiltering ? "lg:col-span-3" : "lg:col-span-4"} id="results-container">
              <PlanResultsContainer
                isLoading={isLoading}
                error={error}
                paginationInfo={paginationInfo}
                onPageChange={handlePageChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                emptyStateMessage="No Medigap plans found matching your criteria. Try adjusting your filters."
                loadingMessage="Finding your personalized Medigap quotes..."
              >
                {displayMode === 'grouped' ? (
                  // Grouped by carrier
                  (currentPageItems as CarrierGroup[]).map((group) => (
                    <MedigapCarrierGroup
                      key={group.carrierId}
                      carrierGroup={group}
                      onSelectPlan={handleSelectPlan}
                      onCarrierClick={handleCarrierClick}
                      selectedPlanId={selectedPlanId || undefined}
                    />
                  ))
                ) : (
                  // Individual plans
                  (currentPageItems as MedigapQuote[]).map((quote, index) => (
                    <MedigapPlanCard
                      key={quote.id || index}
                      quote={quote}
                      onSelectPlan={handleSelectPlan}
                      onCarrierClick={handleCarrierClick}
                      isSelected={selectedPlanId === quote.id}
                    />
                  ))
                )}
              </PlanResultsContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
