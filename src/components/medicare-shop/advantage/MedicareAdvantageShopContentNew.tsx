'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MedicareAdvantageQuote, CarouselPage } from '@/types/medicare-advantage';
import { formatCurrency, hasDrugCoverage } from '@/utils/medicare-advantage-data';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { PlanSelector } from '@/components/plan-selector';
import { PlanCarousel } from '@/components/plan-carousel';
import { BenefitsOverview } from '@/components/medicare-shop/advantage/benefits-overview'; // legacy inline details (being replaced)
import AdvantageDetailsShowcase from '@/components/medicare-shop/plan-details/core/AdvantageDetailsShowcase';

// Local wrapper to augment AdvantageDetailsShowcase with summary banner until core component supports summaryInfo natively
const AdvantageDetailsShowcaseWithSummary: React.FC<{
  carrierName: string;
  quotes: any[];
  onClose: () => void;
  summaryInfo: {
    totalPlans: number;
    startPlan: number;
    endPlan: number;
    currentPage: number;
    totalPages: number;
    location?: string;
  };
}> = ({ carrierName, quotes, onClose, summaryInfo }) => {
  return (
    <div className="space-y-6">
      <div>
        <AdvantageDetailsShowcase carrierName={carrierName} quotes={quotes as any} onClose={onClose} />
      </div>
      <section className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="rounded-md border border-slate-800/60 bg-slate-900/40 p-4 flex flex-wrap gap-x-8 gap-y-3 text-[12px] leading-relaxed text-slate-300">
          {summaryInfo.location && (
            <div><span className="text-slate-500">Location:</span> {summaryInfo.location}</div>
          )}
          <div><span className="text-slate-500">Plans in Market:</span> {summaryInfo.totalPlans}</div>
          <div><span className="text-slate-500">Carrier Variants:</span> {quotes.length}</div>
          <div><span className="text-slate-500">Original Range:</span> {summaryInfo.startPlan}-{summaryInfo.endPlan}</div>
          <div><span className="text-slate-500">Page:</span> {summaryInfo.currentPage}/{summaryInfo.totalPages}</div>
        </div>
      </section>
    </div>
  );
};

interface MedicareAdvantageShopContentProps {
  isExternallyLoading: boolean;
  externalQuotes: any[] | null;
  initialPlanKey?: string; // optional pre-selected plan key when embedding
}

export function MedicareAdvantageShopContent({ 
  isExternallyLoading, 
  externalQuotes,
  initialPlanKey
}: MedicareAdvantageShopContentProps) {
  const [plans, setPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MedicareAdvantageQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5; // Show 5 plans at a time
  const [currentCarouselPage, setCurrentCarouselPage] = useState(0);
  // Inline details pattern: when a plan is selected and inline mode active, replace list with details
  const [showInlineDetails, setShowInlineDetails] = useState(false);

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
      // Try to pre-select provided initial plan key if valid
      let initial = externalQuotes[0];
      if (initialPlanKey) {
        const found = externalQuotes.find(p => p.key === initialPlanKey);
        if (found) initial = found;
      }
      setSelectedPlan(initial);
    }
  }, [externalQuotes, initialPlanKey]);

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
      ) : showInlineDetails && selectedPlan ? (
            (() => {
              const carrierName = selectedPlan.organization_name;
              const source = (filteredPlans.length ? filteredPlans : plans).filter(p => p.organization_name === carrierName);
              const normalized = source.map(p => ({
                id: p.key,
                category: 'advantage',
                carrier: { id: p.organization_name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), name: p.organization_name },
                pricing: { monthly: p.month_rate / 100 },
                plan: { key: p.key, display: p.plan_name },
                metadata: {
                  starRating: p.overall_star_rating,
                  medicalDeductible: undefined,
                  drugDeductible: undefined,
                  primaryCare: undefined,
                  specialist: undefined,
                  otc: undefined,
                  moop: p.in_network_moop,
                  zeroPremiumLIS: p.zero_premium_with_full_low_income_subsidy,
                  partBReduction: undefined,
                  drugBenefitType: p.drug_benefit_type,
                  effectiveDate: p.effective_date || p.contract_year,
                  county: p.county,
                  state: p.state,
                  gapCoverage: p.additional_coverage_offered_in_the_gap,
                  benefits: p.benefits
                }
              }));
              const totalPlans = (filteredPlans.length ? filteredPlans : plans).length;
              const totalPages = Math.ceil(totalPlans / plansPerPage);
              const startPlan = totalPlans > 0 ? currentPage * plansPerPage + 1 : 0;
              const endPlan = Math.min((currentPage + 1) * plansPerPage, totalPlans);
              return (
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => { setShowInlineDetails(false); setSelectedPlan(null); }}
                      className="mb-2 text-xs px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      ← Back to Plans
                    </button>
                  </div>
                  <AdvantageDetailsShowcaseWithSummary
                    carrierName={carrierName}
                    quotes={normalized as any}
                    onClose={() => { setShowInlineDetails(false); setSelectedPlan(null); }}
                    summaryInfo={{
                      totalPlans,
                      startPlan,
                      endPlan,
                      currentPage: currentPage + 1,
                      totalPages,
                      location: `${selectedPlan.county}, ${selectedPlan.state}`
                    }}
                  />
                </div>
              );
            })()
          ) : (
        <div className="space-y-6">
          {/* Single-column selector that triggers details replacement */}
          <PlanSelector
            plans={filteredPlans}
            selectedPlan={selectedPlan}
            onSelectPlan={(plan) => {
              setSelectedPlan(plan);
              // Immediately show inline details on plan selection (remove extra click step)
              setShowInlineDetails(true);
            }}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            plansPerPage={plansPerPage}
            currentCarouselPage={currentCarouselPage}
            setCurrentCarouselPage={setCurrentCarouselPage}
            carouselPages={carouselPages}
            onViewDetails={() => setShowInlineDetails(true)}
            showMobileCarousel={true}
            // NOTE: PlanSelector already handles responsive layout; forcing single column here
          />
          {/* Desktop supplemental carousel: show only when not in inline details */}
          <div className="hidden xl:block">
            <PlanCarousel
              selectedPlan={selectedPlan}
              currentCarouselPage={currentCarouselPage}
              setCurrentCarouselPage={setCurrentCarouselPage}
              carouselPages={carouselPages}
              onViewDetails={() => setShowInlineDetails(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
