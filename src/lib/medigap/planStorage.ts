// Medigap plan storage utilities extracted for sandbox & shop parity
// Single responsibility: load/save segmented plan quotes (F/G/N) from Firestore-backed storage layer
// No React imports here to keep it framework-agnostic.

import { loadFromStorage, saveToStorage, getMedigapStorageKey } from "@/components/medicare-shop/shared";

export type MedigapPlanLetter = 'F' | 'G' | 'N';

export interface MedigapPlanQuotesMap {
  F: any[];
  G: any[];
  N: any[];
}

export const EMPTY_PLAN_QUOTES: MedigapPlanQuotesMap = { F: [], G: [], N: [] };

/**
 * Loads quotes for a single plan letter from Firestore storage.
 * Returns the quotes array (empty if none) and a boolean indicating if any were found.
 */
export async function loadPlanQuotesFromStorage(plan: MedigapPlanLetter): Promise<{ quotes: any[]; found: boolean }>{
  const key = getMedigapStorageKey(plan);
  const quotes = await loadFromStorage(key, [] as any[]);
  return { quotes, found: Array.isArray(quotes) && quotes.length > 0 };
}

/**
 * Loads all stored Medigap plan quotes (F/G/N) in parallel.
 * Returns a map plus a list of which plan letters were present.
 */
export async function loadAllStoredPlanQuotes(): Promise<{ planQuotes: MedigapPlanQuotesMap; loadedPlans: MedigapPlanLetter[] }>{
  const letters: MedigapPlanLetter[] = ['F','G','N'];
  const entries = await Promise.all(
    letters.map(async l => {
      const { quotes, found } = await loadPlanQuotesFromStorage(l);
      return [l, quotes, found] as const;
    })
  );

  const planQuotes: MedigapPlanQuotesMap = { ...EMPTY_PLAN_QUOTES };
  const loadedPlans: MedigapPlanLetter[] = [];
  for (const [letter, quotes, found] of entries) {
    if (found) {
      planQuotes[letter] = quotes;
      loadedPlans.push(letter);
    }
  }
  return { planQuotes, loadedPlans };
}

/**
 * Merges planQuotes map into a flat array suitable for legacy consumers (realQuotes).
 * Order: F, G, N to maintain a deterministic sort.
 */
export function flattenPlanQuotes(planQuotes: MedigapPlanQuotesMap): any[] {
  return ['F','G','N'].flatMap(l => planQuotes[l as MedigapPlanLetter] || []);
}

/**
 * Persists quotes for a specific plan letter.
 */
export async function savePlanQuotes(plan: MedigapPlanLetter, quotes: any[]): Promise<void> {
  const key = getMedigapStorageKey(plan);
  await saveToStorage(key, quotes || []);
}

/**
 * Bulk save after a combined fetch (grouped by plan already).
 * Accepts map { F: Quote[], G: Quote[], N: Quote[] }
 */
export async function saveAllPlanQuotes(map: Partial<MedigapPlanQuotesMap>): Promise<void> {
  const tasks: Promise<any>[] = [];
  (['F','G','N'] as MedigapPlanLetter[]).forEach(letter => {
    if (map[letter] && map[letter]!.length > 0) {
      tasks.push(savePlanQuotes(letter, map[letter]!));
    }
  });
  await Promise.all(tasks);
}

/**
 * Determines visible plans from a planQuotes map (non-empty arrays) unless an explicit selection list is provided.
 */
export function deriveLoadedPlans(planQuotes: MedigapPlanQuotesMap): MedigapPlanLetter[] {
  return (['F','G','N'] as MedigapPlanLetter[]).filter(l => planQuotes[l].length > 0);
}

/**
 * Safe replace logic for updating one plan without duplicating prior quotes of same plan in a flat list.
 */
export function mergeIntoFlatQuotes(existing: any[], plan: MedigapPlanLetter, newPlanQuotes: any[]): any[] {
  const filtered = (existing || []).filter(q => q?.plan !== plan);
  return [...filtered, ...newPlanQuotes];
}

/**
 * Idempotent consolidation after loading multiple plan letters.
 * Removes accidental duplicates by (carrier_id, plan, rate.month) heuristic if no unique id present.
 */
export function dedupePlanQuotes(quotes: any[]): any[] {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const q of quotes) {
    const key = `${q?.carrier_id || q?.carrier?.id || q?.carrier?.name || 'x'}|${q?.plan}|${q?.rate?.month || q?.premium || 'x'}`;
    if (!seen.has(key)) { seen.add(key); out.push(q); }
  }
  return out;
}
