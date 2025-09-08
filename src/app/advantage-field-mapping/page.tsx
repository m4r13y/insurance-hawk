'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { loadFromStorage, ADVANTAGE_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { MedicareAdvantageQuote, CarouselPage } from '@/types/medicare-advantage';
import { formatCurrency, hasDrugCoverage } from '@/utils/medicare-advantage-data';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { PlanSelector } from '@/components/plan-selector';
import { PlanCarousel } from '@/components/plan-carousel';
import { BenefitsOverview } from '@/components/medicare-shop/advantage/benefits-overview';

export default function AdvantageFieldMappingPage() {
  const [plans, setPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MedicareAdvantageQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5; // Show 5 plans at a time
  const [loading, setLoading] = useState(true);
  const [currentCarouselPage, setCurrentCarouselPage] = useState(0);
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Filter states
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
    // Load plans from Firestore instead of localStorage
    const loadPlans = async () => {
      try {
        console.log('📥 Loading Medicare Advantage quotes from Firestore...');
        const savedPlans = await loadFromStorage<MedicareAdvantageQuote[]>(ADVANTAGE_QUOTES_KEY, []);
        
        if (savedPlans && savedPlans.length > 0) {
          console.log('📋 Total plans loaded from Firestore:', savedPlans.length);
          console.log('🔍 First plan benefit count:', savedPlans[0].benefits?.length || 0);
          console.log('🔍 First plan benefits:', savedPlans[0].benefits?.map((b: any) => b.benefit_type) || []);
          
          // Check for specific benefits that should exist
          const firstPlan = savedPlans[0];
          const problemBenefits = [
            'Health Plan Deductible', 'Hearing services', 'Inpatient Hospital', 
            'Maximum Oopc', 'Medical Equipment', 'Vision', 'Preventive Care'
          ];
          
          console.log('🔍 Checking for problem benefits:');
          problemBenefits.forEach(benefitName => {
            const found = firstPlan.benefits?.find((b: any) => b.benefit_type === benefitName);
            console.log(`  ${benefitName}: ${found ? '✅ FOUND' : '❌ MISSING'}`);
            if (found) {
              console.log(`    - Full description: ${found.full_description}`);
              console.log(`    - Summary: ${JSON.stringify(found.summary_description)}`);
            }
          });
          
          setPlans(savedPlans);
          setFilteredPlans(savedPlans);
          setSelectedPlan(savedPlans[0]);
        } else {
          console.log('📭 No plans found in Firestore');
        }
      } catch (error) {
        console.error('Error loading plans from Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Filter plans when filters change
  useEffect(() => {
    let filtered = plans;

    // Filter by star rating
    if (filters.starRating) {
      const minRating = parseInt(filters.starRating);
      filtered = filtered.filter(plan => plan.overall_star_rating >= minRating);
    }

    // Filter by maximum premium
    if (filters.maxPremium) {
      const maxPremium = parseFloat(filters.maxPremium) * 100; // Convert to cents
      filtered = filtered.filter(plan => plan.month_rate <= maxPremium);
    }

    // Filter by dental coverage
    if (filters.hasDental) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' ||
        getBenefitStatusDisplay(plan, 'Preventive Dental Service').status === 'covered'
      );
    }

    // Filter by vision coverage
    if (filters.hasVision) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Vision').status === 'covered'
      );
    }

    // Filter by hearing coverage
    if (filters.hasHearing) {
      filtered = filtered.filter(plan => 
        getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered'
      );
    }

    // Filter by prescription coverage
    if (filters.hasPrescriptionCoverage) {
      filtered = filtered.filter(plan => 
        hasDrugCoverage(plan)
      );
    }

    // Filter by carrier
    if (filters.carrier) {
      filtered = filtered.filter(plan => 
        plan.organization_name.toLowerCase().includes(filters.carrier.toLowerCase())
      );
    }

    // Filter by plan type
    if (filters.planType) {
      filtered = filtered.filter(plan => 
        plan.plan_type.toLowerCase().includes(filters.planType.toLowerCase())
      );
    }

    setFilteredPlans(filtered);
    setCurrentPage(0); // Reset to first page when filters change
    
    // Reset selected plan if it's not in filtered results
    if (selectedPlan && !filtered.some(plan => plan.key === selectedPlan.key)) {
      setSelectedPlan(filtered.length > 0 ? filtered[0] : null);
    }
  }, [plans, filters, selectedPlan]);

  // Clear all filters
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="container mt-20 mx-auto p-6 space-y-6">
      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No Medicare Advantage plans found.</p>
              <p className="text-sm mt-2">Please generate quotes first by visiting the Medicare Advantage shop. Data is now stored in Firestore, not localStorage.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <div className="space-y-4">
          {/* Simplified Filter Controls */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                
                {/* Star Rating */}
                <select
                  value={filters.starRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, starRating: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="5">5 ⭐</option>
                </select>

                {/* Max Premium */}
                <select
                  value={filters.maxPremium}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPremium: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Price</option>
                  <option value="0">Free</option>
                  <option value="25">Under $25</option>
                  <option value="50">Under $50</option>
                </select>

                {/* Carrier Filter */}
                <select
                  value={filters.carrier}
                  onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Carrier</option>
                  {Array.from(new Set(plans.map(plan => plan.organization_name))).sort().map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>

                {/* Plan Type Filter */}
                <select
                  value={filters.planType}
                  onChange={(e) => setFilters(prev => ({ ...prev, planType: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Type</option>
                  {Array.from(new Set(plans.map(plan => plan.plan_type))).sort().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Benefits Checkboxes */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasDental}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasDental: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Dental
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasVision}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasVision: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Vision
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasPrescriptionCoverage}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasPrescriptionCoverage: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Rx
                  </label>
                </div>
              </div>

              {/* Results and Clear */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-600">
                  {filteredPlans.length} of {plans.length} plans
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No plans match your current filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Clear All Filters
                </button>
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
          {/* Simplified Filter Controls */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                
                {/* Star Rating */}
                <select
                  value={filters.starRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, starRating: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="5">5 ⭐</option>
                </select>

                {/* Max Premium */}
                <select
                  value={filters.maxPremium}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPremium: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Price</option>
                  <option value="0">Free</option>
                  <option value="25">Under $25</option>
                  <option value="50">Under $50</option>
                </select>

                {/* Carrier Filter */}
                <select
                  value={filters.carrier}
                  onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Carrier</option>
                  {Array.from(new Set(plans.map(plan => plan.organization_name))).sort().map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>

                {/* Plan Type Filter */}
                <select
                  value={filters.planType}
                  onChange={(e) => setFilters(prev => ({ ...prev, planType: e.target.value }))}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any Type</option>
                  {Array.from(new Set(plans.map(plan => plan.plan_type))).sort().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Benefits Checkboxes */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasDental}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasDental: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Dental
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasVision}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasVision: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Vision
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasPrescriptionCoverage}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasPrescriptionCoverage: e.target.checked }))}
                      className="mr-1 w-3 h-3"
                    />
                    Rx
                  </label>
                </div>
              </div>

              {/* Results and Clear */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-600">
                  {filteredPlans.length} of {plans.length} plans
                </span>
                {(filters.starRating || filters.maxPremium || filters.hasDental || filters.hasVision || filters.hasHearing || filters.hasPrescriptionCoverage || filters.carrier || filters.planType) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main View - Show plan selector and carousel */}
          <div className="space-y-6">
          {/* Desktop Layout: Side by side */}
          <div className="hidden xl:grid xl:grid-cols-2 gap-6">
            {/* Plan Selection */}
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
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
