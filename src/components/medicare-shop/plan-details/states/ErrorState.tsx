import React from 'react';

export const ErrorState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="p-4 text-center text-sm text-red-500">{message || 'An unexpected error occurred.'}</div>
);
