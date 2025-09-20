'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MedicareAdvantageQuote, CarouselPage } from '@/types/medicare-advantage';
import { formatCurrency, hasDrugCoverage } from '@/utils/medicare-advantage-data';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { PlanSelector } from '@/components/plan-selector';
import { PlanCarousel } from '@/components/plan-carousel';
import { BenefitsOverview } from '@/components/medicare-shop/advantage/benefits-overview';

interface MedicareAdvantageShopContentProps {
  isExternallyLoading: boolean;
  externalQuotes: any[] | null;
}

export function MedicareAdvantageShopContent({ 
  isExternallyLoading, 
  externalQuotes 
}: MedicareAdvantageShopContentProps) {
  const [plans, setPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MedicareAdvantageQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5; // Show 5 plans at a time
  const [currentCarouselPage, setCurrentCarouselPage] = useState(0);
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Filter states (UI removed; retained for future sidebar integration)
  const [filters, setFilters] = useState({
    starRating: '',
    maxPremium: '',
    hasDental: false,
    hasVision: false,
    hasHearing: false,
    hasPrescriptionCoverage: false,
    carrier: '',
    planType: ''
  });

  // Carousel pages configuration
  const carouselPages: CarouselPage[] = [
    { title: 'Summary', id: 'field-mapping' },
    { title: 'Inpatient/Facility', id: 'inpatient-facility' },
    { title: 'Outpatient Services', id: 'outpatient-services' },
    { title: 'Specialty & Benefits', id: 'specialty-benefits' },
    { title: 'Prescriptions', id: 'prescriptions' }
  ];

  useEffect(() => {
    if (externalQuotes && externalQuotes.length > 0) {
      console.log('📥 Using external Medicare Advantage quotes:', externalQuotes.length);
      setPlans(externalQuotes);
      setFilteredPlans(externalQuotes);
      setSelectedPlan(externalQuotes[0]);
    }
  }, [externalQuotes]);

  // Filter plans when filters change
  useEffect(() => {
    let filtered = plans;

    if (filters.starRating) {
      const minRating = parseInt(filters.starRating);
      filtered = filtered.filter(plan => plan.overall_star_rating >= minRating);
    }

    if (filters.maxPremium) {
      const maxPremium = parseFloat(filters.maxPremium) * 100; // cents
      filtered = filtered.filter(plan => plan.month_rate <= maxPremium);
    }

    if (filters.hasDental) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' ||
        getBenefitStatusDisplay(plan, 'Preventive Dental Service').status === 'covered'
      );
    }

    if (filters.hasVision) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Vision').status === 'covered'
      );
    }

    if (filters.hasHearing) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered'
      );
    }

    if (filters.hasPrescriptionCoverage) {
      filtered = filtered.filter(plan => hasDrugCoverage(plan));
    }

    if (filters.carrier) {
      filtered = filtered.filter(plan => 
        plan.organization_name.toLowerCase().includes(filters.carrier.toLowerCase())
      );
    }

    if (filters.planType) {
      filtered = filtered.filter(plan => 
        plan.plan_type.toLowerCase().includes(filters.planType.toLowerCase())
      );
    }

    setFilteredPlans(filtered);
    setCurrentPage(0);
    if (selectedPlan && !filtered.some(plan => plan.key === selectedPlan.key)) {
      setSelectedPlan(filtered.length > 0 ? filtered[0] : null);
    }
  }, [plans, filters, selectedPlan]);

  // Clear all filters (currently unused after UI removal)
  const clearFilters = () => {
    setFilters({
      starRating: '',
      maxPremium: '',
      hasDental: false,
      hasVision: false,
      hasHearing: false,
      hasPrescriptionCoverage: false,
      carrier: '',
      planType: ''
    });
  };

  if (isExternallyLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading Medicare Advantage plans...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 space-y-6">
      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No Medicare Advantage plans found.</p>
              <p className="text-sm mt-2">Please generate quotes first by using the Medicare quote flow.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <div className="space-y-4">
          {/* Inline filter controls removed - global sidebar now handles filtering (future integration) */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No plans match your current filters.</p>
                <p className="text-sm mt-2">Try adjusting your filters or clearing them to see more plans.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : showDetailsView ? (
        /* Details View - Show only the benefits overview with back button */
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDetailsView(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
            >
              ← Back to Overview
            </button>
            <h2 className="text-xl font-semibold">Plan Details - {selectedPlan?.plan_name}</h2>
          </div>
          {selectedPlan && <BenefitsOverview selectedPlan={selectedPlan} />}
        </div>
      ) : (
        <React.Fragment>
          {/* Inline filter controls removed - global sidebar now handles filtering (future integration) */}

          {/* Desktop Layout: Plan selector and carousel side by side */}
          <div className="hidden xl:block">
            <div className="grid grid-cols-2 gap-6">
              <PlanSelector
                plans={filteredPlans}
                selectedPlan={selectedPlan}
                onSelectPlan={(plan) => {
                  setSelectedPlan(plan);
                  setShowDetailsView(false); // Reset details view when selecting a new plan
                }}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                plansPerPage={plansPerPage}
              />

              {/* Carousel Results */}
              <PlanCarousel
                selectedPlan={selectedPlan}
                currentCarouselPage={currentCarouselPage}
                setCurrentCarouselPage={setCurrentCarouselPage}
                carouselPages={carouselPages}
                onViewDetails={() => setShowDetailsView(true)}
              />
            </div>
          </div>

          {/* Mobile Layout: Plan selector with integrated carousel */}
          <div className="xl:hidden space-y-6">
            <PlanSelector
              plans={filteredPlans}
              selectedPlan={selectedPlan}
              onSelectPlan={(plan) => {
                setSelectedPlan(plan);
                setShowDetailsView(false); // Reset details view when selecting a new plan
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              plansPerPage={plansPerPage}
              currentCarouselPage={currentCarouselPage}
              setCurrentCarouselPage={setCurrentCarouselPage}
              carouselPages={carouselPages}
              onViewDetails={() => setShowDetailsView(true)}
              showMobileCarousel={true}
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
