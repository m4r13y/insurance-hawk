import { Suspense } from "react";
import MedicareShopContent from "@/components/MedicareShopContent";

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function MedicareShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicareShopContent />
    </Suspense>
  );
}
