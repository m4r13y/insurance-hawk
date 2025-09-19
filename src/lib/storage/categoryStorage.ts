// Generic category quote storage (Firestore-backed via shared storage helpers)
// Medigap is handled separately in planStorage.ts (per-plan segmentation)

import {
  loadFromStorage,
  saveToStorage,
  ADVANTAGE_QUOTES_KEY,
  DRUG_PLAN_QUOTES_KEY,
  DENTAL_QUOTES_KEY,
  HOSPITAL_INDEMNITY_QUOTES_KEY,
  FINAL_EXPENSE_QUOTES_KEY,
  CANCER_INSURANCE_QUOTES_KEY
} from '@/components/medicare-shop/shared';

export type NonMedigapCategory = 'advantage' | 'drug-plan' | 'dental' | 'cancer' | 'hospital-indemnity' | 'final-expense';

export const CATEGORY_KEYS: Record<NonMedigapCategory, string> = {
  advantage: ADVANTAGE_QUOTES_KEY,
  'drug-plan': DRUG_PLAN_QUOTES_KEY,
  dental: DENTAL_QUOTES_KEY,
  cancer: CANCER_INSURANCE_QUOTES_KEY,
  'hospital-indemnity': HOSPITAL_INDEMNITY_QUOTES_KEY,
  'final-expense': FINAL_EXPENSE_QUOTES_KEY
};

export async function loadCategoryQuotes(category: NonMedigapCategory): Promise<any[]> {
  const key = CATEGORY_KEYS[category];
  const data = await loadFromStorage(key, []);
  return Array.isArray(data) ? data : [];
}

export async function saveCategoryQuotes(category: NonMedigapCategory, quotes: any[]): Promise<void> {
  if (!Array.isArray(quotes)) return;
  const key = CATEGORY_KEYS[category];
  await saveToStorage(key, quotes);
}

export async function hasCategoryQuotes(category: NonMedigapCategory): Promise<boolean> {
  const arr = await loadCategoryQuotes(category);
  return arr.length > 0;
}

export const ALL_NON_MEDIGAP_CATEGORIES: NonMedigapCategory[] = [
  'advantage','drug-plan','dental','cancer','hospital-indemnity','final-expense'
];
