import React from 'react';
import MedicareQuoteLoadingPage from './MedicareQuoteLoadingPage';

interface MedicareLoadingStatesProps {
  isInitializing: boolean;
  showQuoteLoading: boolean;
  loadingItems: string[];
  quoteFormData: {
    zipCode: string;
    age: string | number;
  };
  selectedFlowCategories: string[];
  quotesReady: boolean;
  completedQuoteTypes: string[];
  startedQuoteTypes: string[];
  currentQuoteType: string | null;
  totalExpectedQuotes: number;
  hasQuotes: () => boolean;
  onLoadingComplete: () => void;
}

const MedicareLoadingStates: React.FC<MedicareLoadingStatesProps> = ({
  isInitializing,
  showQuoteLoading,
  loadingItems,
  quoteFormData,
  selectedFlowCategories,
  quotesReady,
  completedQuoteTypes,
  startedQuoteTypes,
  currentQuoteType,
  totalExpectedQuotes,
  hasQuotes,
  onLoadingComplete
}) => {
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your Medicare plans...</p>
        </div>
      </div>
    );
  }

  if (showQuoteLoading) {
    return (
      <MedicareQuoteLoadingPage
        loadingItems={loadingItems}
        zipCode={quoteFormData.zipCode}
        age={quoteFormData.age?.toString()}
        selectedCategories={selectedFlowCategories}
        useExternalProgress={true}
        externalProgress={quotesReady ? 100 : 75}
        completedQuoteTypes={completedQuoteTypes}
        startedQuoteTypes={startedQuoteTypes}
        currentQuoteType={currentQuoteType || undefined}
        totalExpectedQuotes={totalExpectedQuotes}
        onComplete={() => {
          console.log('Loading page onComplete triggered', { quotesReady, hasQuotes: hasQuotes() });
          
          if (quotesReady || hasQuotes()) {
            onLoadingComplete();
          } else {
            // Fallback: hide loading after 2 seconds even if quotes aren't marked as ready
            console.warn('Forcing loading page to close - quotes may not be properly synced');
            setTimeout(() => {
              onLoadingComplete();
            }, 2000);
          }
        }}
      />
    );
  }

  return null;
};

export default React.memo(MedicareLoadingStates);
