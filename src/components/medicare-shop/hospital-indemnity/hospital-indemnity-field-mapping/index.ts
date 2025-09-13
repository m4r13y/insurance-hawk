// Simple utility function for managing comparison state
export function toggleQuoteForComparison<T extends { id: string }>(
  quote: T,
  currentSelection: T[],
  maxComparisons: number = 3
): T[] {
  const isAlreadySelected = currentSelection.some(q => q.id === quote.id);
  
  if (isAlreadySelected) {
    return currentSelection.filter(q => q.id !== quote.id);
  }
  
  if (currentSelection.length >= maxComparisons) {
    return currentSelection;
  }
  
  return [...currentSelection, quote];
}