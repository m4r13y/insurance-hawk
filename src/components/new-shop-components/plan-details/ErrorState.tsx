import React from 'react';
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface ErrorStateProps {
  onGoBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center px-6 py-8 rounded-xl bg-white/80 dark:bg-slate-800/70 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-slate-700 dark:text-slate-300">Plan details not found</p>
        <Button onClick={onGoBack} className="mt-2 btn-brand">
          Go Back
        </Button>
      </div>
    </div>
  );
};
