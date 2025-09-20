"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { loadFromStorage, DRUG_PLAN_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { DrugPlanQuote } from '@/types/drug-plan';
import { hasGapCoverage, hasSpecialtyDrugCoverage, hasMailOrder } from '@/utils/drug-plan-data';
import { DrugPlanSelector } from '@/components/medicare-shop/drug-plan/drug-plan-selector';
import { PdpDetailsShowcase } from '@/components/medicare-shop/plan-details';

// Local lightweight extraction (mirrors new-shop adapter logic) to surface tier cost sharing
// Parses benefit.full_description HTML-ish fragments for Tier tables so we can pass
// drugTiers (summary) and tierCarousel (detailed rows) to PdpDetailsShowcase.
function extractDrugTiers(benefitHtml?: string) {
  if (!benefitHtml || typeof benefitHtml !== 'string') return undefined;
  const tierBlocks = Array.from(benefitHtml.matchAll(/<p><b>Tier\s+(\d+)\s*\(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/gi));
  if (!tierBlocks.length) return undefined;
  const tiers: Array<{ tier: string; preferred?: string; standard?: string; mailOrder?: string; notes?: string }> = [];
  tierBlocks.forEach(tb => {
    const tierNum = tb[1];
    const tierLabel = tb[2];
    const blockHtml = tb[0];
    const rows = Array.from(blockHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi));
    const summary: { tier: string; preferred?: string; standard?: string; mailOrder?: string; notes?: string } = { tier: `Tier ${tierNum} (${tierLabel})` };
    for (const r of rows) {
      const cells = Array.from(r[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)).map(c => c[1].replace(/<[^>]+>/g,'').trim());
      if (!cells.length) continue;
      const label = cells[0].toLowerCase();
      const valueCells = cells.slice(1).filter(v => v && v !== '&nbsp;');
      const firstVal = valueCells[0];
      if (!firstVal) continue;
      if (label.includes('preferred') && !summary.preferred) summary.preferred = firstVal;
      else if (label.includes('standard') && !summary.standard) summary.standard = firstVal;
      else if (label.includes('mail') && !summary.mailOrder) summary.mailOrder = firstVal;
    }
    tiers.push(summary);
  });
  return tiers.length ? tiers : undefined;
}

function extractFullTierRows(benefitHtml?: string) {
  if (!benefitHtml || typeof benefitHtml !== 'string') return undefined;
  const blocks = Array.from(benefitHtml.matchAll(/<p><b>Tier\s+(\d+)\s*\(([^)]+)\)<\/b><\/p><table>([\s\S]*?)<\/table>/gi));
  if (!blocks.length) return undefined;
  const result: Array<{ tier: string; tierType: string; rows: Array<{ pharmacyType: string; thirty: string; sixty: string; ninety: string }> }> = [];
  blocks.forEach(b => {
    const tierNum = b[1];
    const tierType = b[2];
    const tableHtml = b[3];
    const rows: Array<{ pharmacyType: string; thirty: string; sixty: string; ninety: string }> = [];
    const trMatches = Array.from(tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi));
    trMatches.forEach(tr => {
      const tds = Array.from(tr[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)).map(td => td[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim());
      if (tds.length >= 4 && /:/.test(tds[0])) {
        const label = tds[0].replace(/:/,'').trim();
        rows.push({
          pharmacyType: label,
          thirty: tds[1] || '—',
          sixty: tds[2] || '—',
          ninety: tds[3] || '—'
        });
      }
    });
    if (rows.length) result.push({ tier: `Tier ${tierNum}`, tierType, rows });
  });
  return result.length ? result : undefined;
}

export default function DrugPlanShopContent() {
  const [plans, setPlans] = useState<DrugPlanQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<DrugPlanQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DrugPlanQuote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [showInlineDetails, setShowInlineDetails] = useState(false);

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
    const loadPlans = async () => {
      try {
        const savedPlans = await loadFromStorage<DrugPlanQuote[]>(DRUG_PLAN_QUOTES_KEY, []);
        if (savedPlans && savedPlans.length) {
          const sorted = [...savedPlans].sort((a,b)=>a.month_rate - b.month_rate);
          setPlans(sorted);
          setFilteredPlans(sorted);
        }
      } catch (e) {
        console.error('Drug plans load error', e);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    let filtered = plans;
    if (filters.starRating) filtered = filtered.filter(p => p.overall_star_rating >= parseInt(filters.starRating));
    if (filters.maxPremium) filtered = filtered.filter(p => p.month_rate <= parseFloat(filters.maxPremium)*100);
    if (filters.maxDeductible) filtered = filtered.filter(p => p.annual_drug_deductible <= parseFloat(filters.maxDeductible)*100);
    if (filters.hasGapCoverage) filtered = filtered.filter(p => hasGapCoverage(p));
    if (filters.hasSpecialtyDrugs) filtered = filtered.filter(p => hasSpecialtyDrugCoverage(p));
    if (filters.hasMailOrder) filtered = filtered.filter(p => hasMailOrder(p));
    if (filters.carrier) filtered = filtered.filter(p => p.organization_name.toLowerCase().includes(filters.carrier.toLowerCase()));
    filtered = filtered.sort((a,b)=>a.month_rate - b.month_rate);
    setFilteredPlans(filtered);
    setCurrentPage(0);
    if (selectedPlan && !filtered.some(p=>p.key===selectedPlan.key)) setSelectedPlan(filtered[0] || null);
  }, [plans, filters, selectedPlan]);

  if (loading) {
    return <div className="flex justify-center w-full py-8">Loading drug plans...</div>;
  }

  // If a plan is selected and inline details active, show details IN PLACE of list
  const shouldShowDetails = showInlineDetails && selectedPlan;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl space-y-8">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">No Drug Plans (PDP) found.</CardContent>
          </Card>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">No drug plans match your current filters.</CardContent>
          </Card>
        ) : shouldShowDetails ? (
          <div className="mt-2">
            {(() => {
              const carrierName = selectedPlan!.organization_name;
              const carrierPlans = filteredPlans.filter(p => p.organization_name === carrierName);
              const normalized = carrierPlans.map(p => ({
                id: p.key,
                category: 'drug-plan',
                carrier: { id: p.organization_name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), name: p.organization_name },
                pricing: { monthly: p.month_rate / 100 },
                plan: { key: `${p.contract_id}-${p.plan_id}-${p.segment_id}`, display: p.plan_name },
                metadata: (() => {
                  // Attempt to find outpatient prescription drugs benefit for tier parsing
                  const benefitHtml = p.benefits?.find(b => (b.benefit_type || '').toLowerCase().includes('outpatient prescription drugs'))?.full_description;
                  const drugTiers = extractDrugTiers(benefitHtml);
                  const tierCarousel = extractFullTierRows(benefitHtml);
                  return {
                    deductible: p.annual_drug_deductible / 100,
                    starRating: p.overall_star_rating,
                    effectiveDate: String(p.contract_year),
                    // @ts-ignore rich + summary tier data
                    drugTiers,
                    // @ts-ignore
                    tierCarousel
                  };
                })()
              }));
              return (
                <PdpDetailsShowcase
                  carrierName={carrierName}
                  quotes={normalized as any}
                  onClose={() => { setShowInlineDetails(false); setSelectedPlan(null); }}
                />
              );
            })()}
          </div>
        ) : (
          <DrugPlanSelector
            plans={filteredPlans}
            selectedPlan={selectedPlan}
            onSelectPlan={(plan) => { setSelectedPlan(plan); setShowInlineDetails(!!plan); }}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            plansPerPage={plansPerPage}
          />
        )}
      </div>
    </div>
  );
}
