"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface HospitalIndemnityEmptyStateProps {
  title?: string;
  description?: string;
}

export default function HospitalIndemnityEmptyState({ 
  title = "No Hospital Indemnity Plans Found",
  description = "We couldn't find any hospital indemnity insurance plans for your area. Please try adjusting your search criteria or contact us for assistance."
}: HospitalIndemnityEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
      <div className="mt-6">
        <button className="text-green-600 hover:text-green-500 font-medium">
          Contact Support
        </button>
      </div>
    </div>
  );
}
