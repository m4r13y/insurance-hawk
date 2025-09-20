// Actual implementation of plan builder persistence utilities.
// These were previously scattered; consolidating here to avoid circular re-exports.

import { savePlanBuilderData, loadPlanBuilderData, type PlanBuilderData } from '@/lib/services/temporary-storage';
import { Timestamp } from 'firebase/firestore';

// Types kept lightweight to avoid importing the enormous PlanBuilderTab types graph.
// The builder only cares about a snapshot shape that can be serialized.
export interface PlanBuilderPersistArgs {
	quoteData: any; // Normalized current quote (Medigap or other) with at least plan + pricing
	currentRate: number; // Selected rate after discounts
	chartData: any[]; // Allocation chart data (serialized directly)
	selectedDrugPlan?: any;
	selectedDentalPlan?: any;
	selectedCancerPlan?: any;
	selectedPlanOption?: any;
}

export interface PlanBuilderSnapshot {
	version: 1;
	timestamp: number; // epoch ms
	quote: any;
	currentRate: number;
	chartData: any[];
	drugPlan?: any;
	dentalPlan?: any;
	cancerPlan?: any;
	planOption?: any;
}

const LOCAL_KEY = 'planBuilderSnapshot:v1';

export function buildPlanBuilderData(args: PlanBuilderPersistArgs): PlanBuilderSnapshot {
	return {
		version: 1,
		timestamp: Date.now(),
		quote: args.quoteData,
		currentRate: args.currentRate,
		chartData: args.chartData,
		drugPlan: args.selectedDrugPlan,
		dentalPlan: args.selectedDentalPlan,
		cancerPlan: args.selectedCancerPlan,
		planOption: args.selectedPlanOption,
	};
}

export function cacheLocally(snapshot: PlanBuilderSnapshot) {
	try {
		localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
	} catch (e) {
		console.warn('Failed local cache of plan builder snapshot', e);
	}
}

export function loadFromLocalCache(): PlanBuilderSnapshot | null {
	try {
		const raw = localStorage.getItem(LOCAL_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch (e) {
		console.warn('Failed reading local cache', e);
		return null;
	}
}

export function clearLocalCache() {
	try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

// Normalize previously stored data (future shape migrations can happen here)
export function normalizeLoadedData(data: any): PlanBuilderSnapshot | null {
	if (!data) return null;
	if (data.version === 1) return data as PlanBuilderSnapshot;
	// Future versions: transform here.
	return null;
}

export async function persistPlanBuilderState(args: PlanBuilderPersistArgs): Promise<PlanBuilderSnapshot> {
	const snapshot = buildPlanBuilderData(args);
	// Map to PlanBuilderData shape expected by storage service.
	const planBuilderData: PlanBuilderData = {
		schemaVersion: 1,
		medigapPlan: {
			plan: snapshot.quote?.plan || snapshot.quote?.planType || 'UNKNOWN',
			carrier: (typeof snapshot.quote?.carrier === 'string' ? snapshot.quote?.carrier : (snapshot.quote?.carrier?.name || snapshot.quote?.carrierName)) || 'UNKNOWN',
			monthlyRate: snapshot.currentRate,
			selected: true
		},
		medicareAB: {
			selected: true,
			selectedAt: (snapshot.quote?.selectedAt && snapshot.quote.selectedAt instanceof Timestamp) ? snapshot.quote.selectedAt : Timestamp.fromMillis(Date.now())
		},
		selectedPlans: {
			drugPlan: snapshot.drugPlan,
			dentalPlan: snapshot.dentalPlan,
			cancerPlan: snapshot.cancerPlan,
			medigapPlanOption: snapshot.planOption,
		},
		chartData: snapshot.chartData || [],
		totalMonthlyCost: snapshot.currentRate + computeAncillaryMonthly(snapshot),
		coverageQuality: 'n/a',
		lastUpdated: (snapshot.quote?.lastUpdated && snapshot.quote.lastUpdated instanceof Timestamp) ? snapshot.quote.lastUpdated : Timestamp.fromMillis(Date.now()),
	};
	// Firestore disallows undefined nested values. Deeply sanitize selectedPlans (esp. medigapPlanOption.plan.discountType)
	try {
		if (planBuilderData.selectedPlans?.medigapPlanOption) {
			const mpo: any = planBuilderData.selectedPlans.medigapPlanOption;
			if (mpo.plan && typeof mpo.plan === 'object' && mpo.plan.discountType === undefined) {
				// Remove key entirely to avoid undefined serialization
				try { delete mpo.plan.discountType; } catch {}
			}
			// Recursively strip any undefined fields at shallow levels we control
			['rate','plan','carrier','metadata'].forEach(k => {
				const ref: any = mpo[k];
				if (ref && typeof ref === 'object') {
					Object.keys(ref).forEach(sub => { if (ref[sub] === undefined) delete ref[sub]; });
				}
			});
		}
		// Also cleanse chartData items
		if (Array.isArray(planBuilderData.chartData)) {
			planBuilderData.chartData = planBuilderData.chartData.map((c: any) => {
				if (c && typeof c === 'object') {
					Object.keys(c).forEach(k => { if (c[k] === undefined) delete c[k]; });
				}
				return c;
			});
		}
	} catch (e) {
		console.warn('PlanBuilder persistence sanitize step failed (continuing)', e);
	}
	try {
		await savePlanBuilderData(planBuilderData); // remote / indexed layer
	} catch (e) {
		console.warn('Remote persist failed (continuing with local only)', e);
	}
	cacheLocally(snapshot);
	return snapshot;
}

function computeAncillaryMonthly(snapshot: PlanBuilderSnapshot): number {
	const values: number[] = [];
	const pushIf = (v: any) => { if (v && typeof v.monthly === 'number') values.push(v.monthly); if (v && typeof v.monthlyPremium === 'number') values.push(v.monthlyPremium); };
	pushIf(snapshot.drugPlan);
	pushIf(snapshot.dentalPlan);
	pushIf(snapshot.cancerPlan);
	return values.reduce((a,b)=>a+b,0);
}

export async function loadPersistedPlanBuilderState(): Promise<PlanBuilderSnapshot | null> {
	// Prefer remote if available, fall back to local
	try {
		const remote = await loadPlanBuilderData();
		if (remote) return normalizeLoadedData(remote);
	} catch (e) {
		console.warn('Remote load failed, falling back to local', e);
	}
	return normalizeLoadedData(loadFromLocalCache());
}

export function isPlanBuilderSnapshot(obj: any): obj is PlanBuilderSnapshot {
	return obj && obj.version === 1 && typeof obj.currentRate === 'number';
}

// Named exports consumed by existing code paths re-exported here explicitly
// Named exports already declared above; no further export aggregation needed.
