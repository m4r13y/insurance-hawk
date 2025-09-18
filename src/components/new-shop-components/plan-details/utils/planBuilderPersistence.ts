// Actual implementation of plan builder persistence utilities.
// These were previously scattered; consolidating here to avoid circular re-exports.

import { savePlanBuilderData, loadPlanBuilderData, type PlanBuilderData } from '@/lib/services/temporary-storage';

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
			carrier: snapshot.quote?.carrier || snapshot.quote?.carrierName || 'UNKNOWN',
			monthlyRate: snapshot.currentRate,
			selected: true
		},
		medicareAB: {
			selected: true,
			// The storage service expects a Firestore Timestamp; create a dummy compatible object if not available.
			// We avoid importing Timestamp directly to keep this util light; fallback to Date.now style object.
			selectedAt: (snapshot.quote?.selectedAt) || ({ seconds: Math.floor(Date.now()/1000), nanoseconds: 0, toDate: () => new Date() }) as any
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
		lastUpdated: (snapshot.quote?.lastUpdated) || ({ seconds: Math.floor(Date.now()/1000), nanoseconds: 0, toDate: () => new Date() }) as any,
	};
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
