// Utility helpers extracted from PlanBuilderTab for clarity & easier testing
import { Timestamp } from 'firebase/firestore';
import { savePlanBuilderData, PlanBuilderData } from '@/lib/services/temporary-storage';
import { getCarrierDisplayName } from '@/lib/carrier-system';

export interface BuildPlanBuilderDataArgs {
  quoteData: any;
  currentRate: number; // already normalized monthly rate in dollars
  chartData: any[];
  selectedDrugPlan?: any;
  selectedDentalPlan?: any;
  selectedCancerPlan?: any;
  selectedPlanOption?: any;
}

export function computeCoverageQuality(chartData: any[]): { coverageQuality: string; coveragePercentage: number } {
  const totalScore = chartData.filter(i => i.selected).reduce((sum, i) => sum + (i.value || 0), 0);
  const coveragePercentage = Math.max(0, Math.min(100, Math.round(totalScore)));
  let coverageQuality = 'Basic';
  if (coveragePercentage >= 90) coverageQuality = 'Excellent';
  else if (coveragePercentage >= 80) coverageQuality = 'Very Good';
  else if (coveragePercentage >= 70) coverageQuality = 'Good';
  else if (coveragePercentage >= 60) coverageQuality = 'Fair';
  return { coverageQuality, coveragePercentage };
}

const SCHEMA_VERSION = 1;

export function buildPlanBuilderData({ quoteData, currentRate, chartData, selectedDrugPlan, selectedDentalPlan, selectedCancerPlan, selectedPlanOption }: BuildPlanBuilderDataArgs): PlanBuilderData & { schemaVersion: number } {
  const { coverageQuality } = computeCoverageQuality(chartData);
  const carrierName = getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || '');
  const drugRate = selectedDrugPlan ? ((selectedDrugPlan.month_rate || selectedDrugPlan.part_d_rate || 0) / 100) : 0;
  const dentalRate = selectedDentalPlan ? selectedDentalPlan.monthlyPremium || 0 : 0;
  const cancerRate = selectedCancerPlan ? (selectedCancerPlan.monthly_premium || 0) : 0;
  const totalMonthlyCost = currentRate + drugRate + dentalRate + cancerRate;
  return {
    medigapPlan: { plan: quoteData.plan, carrier: carrierName, monthlyRate: currentRate, selected: true },
    medicareAB: { selected: chartData.some(i => i.name === 'Medicare A & B' && i.selected), selectedAt: Timestamp.now() },
    selectedPlans: { drugPlan: selectedDrugPlan, dentalPlan: selectedDentalPlan, cancerPlan: selectedCancerPlan, medigapPlanOption: selectedPlanOption },
    chartData,
    totalMonthlyCost,
    coverageQuality,
    lastUpdated: Timestamp.now(),
    schemaVersion: SCHEMA_VERSION
  };
}

export async function persistPlanBuilderState(args: BuildPlanBuilderDataArgs) {
  const data = buildPlanBuilderData(args);
  try { cacheLocally(data); } catch {}
  await savePlanBuilderData(data);
  return data;
}

// Local cache (optimistic hydration)
const LOCAL_CACHE_KEY = 'plan_builder_cache_v1';

export function cacheLocally(data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
}

export function loadFromLocalCache(): (PlanBuilderData & { schemaVersion?: number }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch { return null; }
}

export function clearLocalCache() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(LOCAL_CACHE_KEY); } catch {}
}

// Migration / normalization hook
export function normalizeLoadedData(data: any): PlanBuilderData & { schemaVersion?: number } {
  if (!data) return data;
  // Recompute derived fields if missing or schema bump needed later
  if (typeof data.totalMonthlyCost !== 'number') {
    const md = data.medigapPlan?.monthlyRate || 0;
    const drug = data.selectedPlans?.drugPlan ? ((data.selectedPlans.drugPlan.month_rate || data.selectedPlans.drugPlan.part_d_rate || 0)/100) : 0;
    const dental = data.selectedPlans?.dentalPlan?.monthlyPremium || 0;
    const cancer = data.selectedPlans?.cancerPlan?.monthly_premium || 0;
    data.totalMonthlyCost = md + drug + dental + cancer;
  }
  if (!data.coverageQuality && Array.isArray(data.chartData)) {
    data.coverageQuality = computeCoverageQuality(data.chartData).coverageQuality;
  }
  return data;
}

export { SCHEMA_VERSION };
