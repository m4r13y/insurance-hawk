// Adapter Registry
// -----------------
// Central place to register and retrieve category adapters.
// Allows feature-flagged incremental rollout and late binding for tree-shaking if needed.

import { AdapterRegistry, CategoryAdapter } from './types';
import { medigapAdapter } from './medigapAdapter';
import { drugPlanAdapter } from './drugPlanAdapter';
import { advantagePlanAdapter } from './advantagePlanAdapter';
import { dentalPlanAdapter } from './dentalPlanAdapter';
import { cancerPlanAdapter } from './cancerPlanAdapter';
import { hospitalIndemnityPlanAdapter } from './hospitalIndemnityPlanAdapter';
import { finalExpensePlanAdapter } from './finalExpensePlanAdapter';

// Internal mutable registry — not exported directly to preserve invariants.
const registry: AdapterRegistry = Object.create(null);

export function registerAdapter(adapter: CategoryAdapter<any, any>) {
  if (!adapter?.category) throw new Error('Adapter missing category');
  registry[adapter.category] = adapter;
}

export function getAdapter<T extends CategoryAdapter<any, any>>(category: string): T | undefined {
  return registry[category] as T | undefined;
}

export function listAdapters(): string[] {
  return Object.keys(registry);
}

// Bulk registration helper (idempotent last-write-wins per category)
export function registerAdapters(adapters: CategoryAdapter<any, any>[]) {
  adapters.forEach(registerAdapter);
}

// Adapters are now always enabled in this sandbox/backup page context.
export function isAdaptersEnabled(): boolean { return true; }

// Pre-register adapters
registerAdapter(medigapAdapter);
registerAdapter(drugPlanAdapter);
registerAdapter(advantagePlanAdapter);
registerAdapter(dentalPlanAdapter);
registerAdapter(cancerPlanAdapter);
registerAdapter(hospitalIndemnityPlanAdapter);
registerAdapter(finalExpensePlanAdapter);

export type { CategoryAdapter };
