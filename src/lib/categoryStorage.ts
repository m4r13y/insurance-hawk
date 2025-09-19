// Generic (non-Medigap) category quote storage helpers
// Firestore-backed via shared storage abstraction. Medigap uses plan-level storage in planStorage.ts.

import { loadFromStorage, saveToStorage, ADVANTAGE_QUOTES_KEY, DRUG_PLAN_QUOTES_KEY, DENTAL_QUOTES_KEY, HOSPITAL_INDEMNITY_QUOTES_KEY, FINAL_EXPENSE_QUOTES_KEY, CANCER_INSURANCE_QUOTES_KEY } from '@/components/medicare-shop/shared';

export const CATEGORY_KEYS: Record<string, string> = {
  'advantage': ADVANTAGE_QUOTES_KEY,
  'drug-plan': DRUG_PLAN_QUOTES_KEY,
  'dental': DENTAL_QUOTES_KEY,
  'cancer': CANCER_INSURANCE_QUOTES_KEY,
  'hospital-indemnity': HOSPITAL_INDEMNITY_QUOTES_KEY,
  'final-expense': FINAL_EXPENSE_QUOTES_KEY,
};

export function isStorageCategory(category: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATEGORY_KEYS, category);
}

export async function loadCategoryQuotes<T = any>(category: string): Promise<T[]> {
  if (!isStorageCategory(category)) return [];
  return await loadFromStorage(CATEGORY_KEYS[category], []);
}

export async function saveCategoryQuotes(category: string, quotes: any[]): Promise<void> {
  if (!isStorageCategory(category) || !Array.isArray(quotes)) return;
  await saveToStorage(CATEGORY_KEYS[category], quotes);
}
