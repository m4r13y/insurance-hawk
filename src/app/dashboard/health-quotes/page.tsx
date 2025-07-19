
"use client";

import { useState } from "react";
import { HealthInsuranceQuoter, type FormSchemaType } from "@/components/health-insurance-quoter";
import { HealthPlanResultsTable } from "@/components/health-plan-results-table";
import { HealthPlan } from "@/types";

export default function HealthQuotesPage() {
  const [results, setResults] = useState<{ plans: HealthPlan[]; total: number } | null>(null);
  const [formValues, setFormValues] = useState<FormSchemaType | null>(null);

  const handleShowResults = (plansResult: { plans: HealthPlan[]; total: number }, values: FormSchemaType) => {
    setResults(plansResult);
    setFormValues(values);
  };

  const handleStartOver = () => {
    setResults(null);
    setFormValues(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">Health Insurance Quotes</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Find affordable health coverage for individuals and families under 65. Compare plans from top insurers and get instant quotes tailored to your needs.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {results && formValues ? (
          <HealthPlanResultsTable
            initialResults={results}
            searchParams={formValues}
            onBack={handleStartOver}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <HealthInsuranceQuoter onResults={handleShowResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
