
import { HealthInsuranceQuoter } from "@/components/health-insurance-quoter";

export default function HealthQuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Health Insurance Quotes</h1>
        <p className="text-muted-foreground">
          Find affordable health coverage for individuals and families under 65.
        </p>
      </div>
      <HealthInsuranceQuoter />
    </div>
  );
}
