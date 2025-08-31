import { Suspense } from "react";
import MedicareResourcesContent from "@/components/MedicareResourcesContent";

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function MedicareResourcesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicareResourcesContent />
    </Suspense>
  );
}
