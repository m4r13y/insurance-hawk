'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { loadFromStorage, DRUG_PLAN_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { DrugPlanQuote } from '@/types/drug-plan';
import { 
  formatCurrency, 
  getMonthlyPremium, 
  getAnnualDeductible,
  hasGapCoverage,
  hasSpecialtyDrugCoverage,
  hasMailOrder,
  getTier1Copay,
  getTier3Copay
} from '@/utils/drug-plan-data';
import { DrugPlanSelector } from '@/components/medicare-shop/drug-plan/drug-plan-selector';
import DrugPlanTiersChart from '@/components/medicare-shop/drug-plan/drug-plan-tiers-chart';

export default function PDPFieldMappingPage() {
  const [plans, setPlans] = useState<DrugPlanQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<DrugPlanQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DrugPlanQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5; // Show 5 plans at a time
  const [loading, setLoading] = useState(true);
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Filter states - simplified for drug plans
  const [filters, setFilters] = useState({
    starRating: '',
    maxPremium: '',
    hasGapCoverage: false,
    hasSpecialtyDrugs: false,
    hasMailOrder: false,
    carrier: '',
    maxDeductible: ''
  });

  useEffect(() => {
    // Load plans from Firestore
    const loadPlans = async () => {
      try {
        console.log('📥 Loading Drug Plan quotes from Firestore...');
        const savedPlans = await loadFromStorage<DrugPlanQuote[]>(DRUG_PLAN_QUOTES_KEY, []);
        
        if (savedPlans && savedPlans.length > 0) {
          console.log('📋 Total drug plans loaded from Firestore:', savedPlans.length);
          console.log('🔍 First plan benefit count:', savedPlans[0].benefits?.length || 0);
          console.log('🔍 First plan benefits:', savedPlans[0].benefits?.map((b: any) => b.benefit_type) || []);
          
          // Sort plans by monthly premium (lowest first)
          const sortedPlans = [...savedPlans].sort((a, b) => a.month_rate - b.month_rate);
          
          setPlans(sortedPlans);
          setFilteredPlans(sortedPlans);
          setSelectedPlan(sortedPlans[0]);
        } else {
          console.log('📭 No drug plans found in Firestore');
        }
      } catch (error) {
        console.error('Error loading drug plans from Firestore:', error);
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

    // Filter by maximum deductible
    if (filters.maxDeductible) {
      const maxDeductible = parseFloat(filters.maxDeductible) * 100; // Convert to cents
      filtered = filtered.filter(plan => plan.annual_drug_deductible <= maxDeductible);
    }

    // Filter by gap coverage
    if (filters.hasGapCoverage) {
      filtered = filtered.filter(plan => hasGapCoverage(plan));
    }

    // Filter by specialty drug coverage
    if (filters.hasSpecialtyDrugs) {
      filtered = filtered.filter(plan => hasSpecialtyDrugCoverage(plan));
    }

    // Filter by mail order availability
    if (filters.hasMailOrder) {
      filtered = filtered.filter(plan => hasMailOrder(plan));
    }

    // Filter by carrier
    if (filters.carrier) {
      filtered = filtered.filter(plan => 
        plan.organization_name.toLowerCase().includes(filters.carrier.toLowerCase())
      );
    }

    // Sort filtered plans by monthly premium (lowest first)
    filtered = filtered.sort((a, b) => a.month_rate - b.month_rate);

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
      hasGapCoverage: false,
      hasSpecialtyDrugs: false,
      hasMailOrder: false,
      carrier: '',
      maxDeductible: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-6 lg:px-8 py-8">
          <div className="text-center">Loading drug plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl lg:px-0 py-0 space-y-6">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No Drug Plans (PDP) found.</p>
                <p className="text-sm mt-2">Please generate quotes first by visiting the Medicare shop. Data is now stored in Firestore, not localStorage.</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredPlans.length === 0 ? (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="space-y-3">
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
                      <option value="">Any Premium</option>
                      <option value="0">Free</option>
                      <option value="25">Under $25</option>
                      <option value="50">Under $50</option>
                      <option value="100">Under $100</option>
                    </select>

                    {/* Max Deductible */}
                    <select
                      value={filters.maxDeductible}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDeductible: e.target.value }))}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Any Deductible</option>
                      <option value="0">No Deductible</option>
                      <option value="200">Under $200</option>
                      <option value="500">Under $500</option>
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

                    {/* Features Checkboxes */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasGapCoverage}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasGapCoverage: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Gap Coverage
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasSpecialtyDrugs}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasSpecialtyDrugs: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Specialty Drugs
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasMailOrder}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasMailOrder: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Mail Order
                      </label>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button - moved to bottom */}
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm px-3 py-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <p>No drug plans match your current filters.</p>
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
            {selectedPlan && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Drug Plan Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Monthly Premium:</span> {getMonthlyPremium(selectedPlan)}
                  </div>
                  <div>
                    <span className="font-medium">Annual Deductible:</span> {getAnnualDeductible(selectedPlan)}
                  </div>
                  <div>
                    <span className="font-medium">Star Rating:</span> {selectedPlan.overall_star_rating}/5
                  </div>
                  <div>
                    <span className="font-medium">Gap Coverage:</span> {hasGapCoverage(selectedPlan) ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Tier 1 Copay:</span> {getTier1Copay(selectedPlan)}
                  </div>
                  <div>
                    <span className="font-medium">Tier 3 Copay:</span> {getTier3Copay(selectedPlan)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <React.Fragment>
            {/* Filter Controls */}
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="space-y-3">
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
                      <option value="">Any Premium</option>
                      <option value="0">Free</option>
                      <option value="25">Under $25</option>
                      <option value="50">Under $50</option>
                      <option value="100">Under $100</option>
                    </select>

                    {/* Max Deductible */}
                    <select
                      value={filters.maxDeductible}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDeductible: e.target.value }))}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Any Deductible</option>
                      <option value="0">No Deductible</option>
                      <option value="200">Under $200</option>
                      <option value="500">Under $500</option>
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

                    {/* Features Checkboxes */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasGapCoverage}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasGapCoverage: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Gap Coverage
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasSpecialtyDrugs}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasSpecialtyDrugs: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Specialty Drugs
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.hasMailOrder}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasMailOrder: e.target.checked }))}
                          className="mr-1 w-3 h-3"
                        />
                        Mail Order
                      </label>
                    </div>
                  </div>
                </div>

                {/* Results count and Clear Filters Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredPlans.length} of {plans.length} plans
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm px-3 py-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout: Plan selector and details side by side */}
            <div className="hidden xl:block">
              <div className="grid grid-cols-2 gap-6">
                <DrugPlanSelector
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

                {/* Plan Details */}
                <div className="space-y-4">
                  {selectedPlan ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">{selectedPlan.plan_name}</h3>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>{selectedPlan.organization_name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => 
                                i < selectedPlan.overall_star_rating ? (
                                  <StarFilled 
                                    key={i} 
                                    className="w-4 h-4 text-yellow-500" 
                                  />
                                ) : (
                                  <Star 
                                    key={i} 
                                    className="w-4 h-4 text-gray-300" 
                                  />
                                )
                              )}
                              <span className="ml-1 text-sm font-medium">{selectedPlan.overall_star_rating}/5</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Monthly Premium</span>
                            <div className="text-lg font-semibold text-green-600">{getMonthlyPremium(selectedPlan)}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Annual Deductible</span>
                            <div className="text-lg font-semibold">{getAnnualDeductible(selectedPlan)}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Gap Coverage</span>
                            <div className="text-lg font-semibold">{hasGapCoverage(selectedPlan) ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Plan ID</span>
                            <div className="text-sm font-mono text-gray-600">{selectedPlan.contract_id}-{selectedPlan.plan_id}</div>
                          </div>
                        </div>
                        
                        {/* Prescription Drug Tiers Chart */}
                        <DrugPlanTiersChart plan={selectedPlan} />
                        
                        <button
                          onClick={() => setShowDetailsView(true)}
                          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View Full Details
                        </button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                          <p>Select a drug plan to see details</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Layout: Plan selector with inline details */}
            <div className="xl:hidden">
              <DrugPlanSelector
                plans={filteredPlans}
                selectedPlan={selectedPlan}
                onSelectPlan={(plan) => {
                  setSelectedPlan(plan);
                  setShowDetailsView(false); // Reset details view when selecting a new plan
                }}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                plansPerPage={plansPerPage}
                detailsCard={selectedPlan ? (
                  <Card className="mt-4">
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{selectedPlan.plan_name}</h3>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{selectedPlan.organization_name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => 
                              i < selectedPlan.overall_star_rating ? (
                                <StarFilled 
                                  key={i} 
                                  className="w-4 h-4 text-yellow-500" 
                                />
                              ) : (
                                <Star 
                                  key={i} 
                                  className="w-4 h-4 text-gray-300" 
                                />
                              )
                            )}
                            <span className="ml-1 text-sm font-medium">{selectedPlan.overall_star_rating}/5</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Monthly Premium</span>
                          <div className="text-lg font-semibold text-green-600">{getMonthlyPremium(selectedPlan)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Annual Deductible</span>
                          <div className="text-lg font-semibold">{getAnnualDeductible(selectedPlan)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Gap Coverage</span>
                          <div className="text-lg font-semibold">{hasGapCoverage(selectedPlan) ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Plan ID</span>
                          <div className="text-sm font-mono text-gray-600">{selectedPlan.contract_id}-{selectedPlan.plan_id}</div>
                        </div>
                      </div>
                      
                      {/* Prescription Drug Tiers Chart */}
                      <DrugPlanTiersChart plan={selectedPlan} />
                      
                      <button
                        onClick={() => setShowDetailsView(true)}
                        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Full Details
                      </button>
                    </CardContent>
                  </Card>
                ) : null}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
