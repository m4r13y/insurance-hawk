"use client";
import React from 'react';
import { SavedPlanRecord, loadSavedPlans, toggleSavedPlan } from '@/lib/savedPlans';

interface SavedPlansContextValue {
  savedPlans: SavedPlanRecord[];
  toggle: (record: { carrierId: string; carrierName: string; logo: string; rating?: string; category: string; planType?: string; price?: number; min?: number; max?: number }) => void;
  isSaved: (carrierId: string, planType?: string, category?: string) => boolean;
  removeByCarrier: (carrierId: string, category?: string) => void; // remove all plans for carrier (used by chip X)
}

const SavedPlansContext = React.createContext<SavedPlansContextValue | undefined>(undefined);

export const SavedPlansProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [savedPlans, setSavedPlans] = React.useState<SavedPlanRecord[]>([]);

  React.useEffect(() => {
    setSavedPlans(loadSavedPlans());
  }, []);

  const toggle = React.useCallback((record: { carrierId: string; carrierName: string; logo: string; rating?: string; category: string; planType?: string; price?: number; min?: number; max?: number }) => {
    const key = `${record.carrierId}|${record.planType || 'any'}|${record.category}`;
    setSavedPlans(toggleSavedPlan({ key, ...record }));
  }, []);

  const isSaved = React.useCallback((carrierId: string, planType?: string, category: string = 'medigap') => {
    const key = `${carrierId}|${planType || 'any'}|${category}`;
    return savedPlans.some(p => p.key === key);
  }, [savedPlans]);

  const removeByCarrier = React.useCallback((carrierId: string, category: string = 'medigap') => {
    setSavedPlans(prev => {
      const next = prev.filter(p => !(p.carrierId === carrierId && p.category === category));
      // persist manually since toggleSavedPlan handles persistence for toggles only
      try { if (typeof window !== 'undefined') localStorage.setItem('saved_plans_v1', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ savedPlans, toggle, isSaved, removeByCarrier }), [savedPlans, toggle, isSaved, removeByCarrier]);

  return <SavedPlansContext.Provider value={value}>{children}</SavedPlansContext.Provider>;
};

export function useSavedPlans() {
  const ctx = React.useContext(SavedPlansContext);
  if (!ctx) throw new Error('useSavedPlans must be used within SavedPlansProvider');
  return ctx;
}
