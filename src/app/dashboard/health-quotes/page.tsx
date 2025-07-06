
"use client";

import { useState } from "react";
import { HealthInsuranceQuoter, type FormSchemaType } from "@/components/health-insurance-quoter";
import { HealthPlanResultsTable } from "@/components/health-plan-results-table";
import { HealthPlan } from "@/types";

export default function HealthQuotesPage() {
  const [results, setResults] = useState<HealthPlan[] | null>(null);
  const [formValues, setFormValues] = useState<FormSchemaType | null>(null);

  const handleShowResults = (plans: HealthPlan[], values: FormSchemaType) => {
    setResults(plans);
    setFormValues(values);
  };

  const handleStartOver = () => {
    setResults(null);
    setFormValues(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Health Insurance Quotes</h1>
        <p className="text-base text-muted-foreground mt-1">
          Find affordable health coverage for individuals and families under 65.
        </p>
      </div>
      {results && formValues ? (
        <HealthPlanResultsTable
          initialPlans={results}
          searchParams={formValues}
          onBack={handleStartOver}
        />
      ) : (
        <HealthInsuranceQuoter onResults={handleShowResults} />
      )}
    </div>
  );
}
