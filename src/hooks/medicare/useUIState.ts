import { useState } from 'react';

export interface UIState {
  showMedicareFlow: boolean;
  medicareFlowMode: 'guided' | 'quick';
  showPlanDifferencesModal: boolean;
  quotesError: string | null;
}

export interface UIActions {
  setShowMedicareFlow: React.Dispatch<React.SetStateAction<boolean>>;
  setMedicareFlowMode: React.Dispatch<React.SetStateAction<'guided' | 'quick'>>;
  setShowPlanDifferencesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setQuotesError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useUIState = () => {
  // UI State
  const [showMedicareFlow, setShowMedicareFlow] = useState(false);
  const [medicareFlowMode, setMedicareFlowMode] = useState<'guided' | 'quick'>('guided');
  const [showPlanDifferencesModal, setShowPlanDifferencesModal] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  const uiState: UIState = {
    showMedicareFlow,
    medicareFlowMode,
    showPlanDifferencesModal,
    quotesError,
  };

  const uiActions: UIActions = {
    setShowMedicareFlow,
    setMedicareFlowMode,
    setShowPlanDifferencesModal,
    setQuotesError,
  };

  return {
    ...uiState,
    ...uiActions,
  };
};
