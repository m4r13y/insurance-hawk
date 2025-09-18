import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center px-6 py-8 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
        <p className="text-slate-700 dark:text-slate-300 text-sm">Loading plan details...</p>
      </div>
    </div>
  );
};
