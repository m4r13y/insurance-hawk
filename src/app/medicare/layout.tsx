"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import MedicareLayout with no SSR to prevent useSearchParams issues
const MedicareLayout = dynamic(() => import("@/components/MedicareLayout"), {
  ssr: false,
  loading: () => null // Remove loading fallback to prevent flash
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <MedicareLayout>{children}</MedicareLayout>
    </Suspense>
  );
}
