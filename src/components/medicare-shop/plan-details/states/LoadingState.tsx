import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500 mx-auto" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading plan details...</p>
    </div>
  </div>
);
