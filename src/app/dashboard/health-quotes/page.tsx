
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
    <div className="bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white shadow-xl">
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 lg:mb-3">
              Health Insurance Quotes
            </h1>
            <p className="text-blue-100 text-base lg:text-lg leading-relaxed opacity-90">
              Find affordable health coverage for individuals and families under 65. Compare plans from top insurers and get instant quotes tailored to your needs.
            </p>
          </div>
        </div>

        {/* Main Content */}
        {results && formValues ? (
          <HealthPlanResultsTable
            initialResults={results}
            searchParams={formValues}
            onBack={handleStartOver}
          />
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border-0">
            <div className="p-6 lg:p-8">
              <HealthInsuranceQuoter onResults={handleShowResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
