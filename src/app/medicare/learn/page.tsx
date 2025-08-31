import { Suspense } from "react";
import MedicareLearnContent from "@/components/MedicareLearnContent";

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function MedicareLearnPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicareLearnContent />
    </Suspense>
  );
}
