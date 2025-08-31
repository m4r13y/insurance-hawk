"use client";

import React from 'react';
import { PersonIcon } from "@radix-ui/react-icons";

interface DentalEmptyStateProps {
  title?: string;
  description?: string;
}

export default function DentalEmptyState({ 
  title = "No Dental Plans Found",
  description = "We couldn't find any dental insurance plans for your area. Please try adjusting your search criteria or contact us for assistance."
}: DentalEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <PersonIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
      <div className="mt-6">
        <button className="text-blue-600 hover:text-blue-500 font-medium">
          Contact Support
        </button>
      </div>
    </div>
  );
}
