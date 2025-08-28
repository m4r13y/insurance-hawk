import React from 'react';
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface ErrorStateProps {
  onGoBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p>Plan details not found</p>
        <Button onClick={onGoBack} className="mt-4">
          Go Back
        </Button>
      </div>
    </div>
  );
};
