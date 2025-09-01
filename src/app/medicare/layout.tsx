"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import MedicareLayout with no SSR to prevent useSearchParams issues
const MedicareLayout = dynamic(() => import("@/components/MedicareLayout"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse p-8">Loading Medicare layout...</div>
    </div>
  )
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-8">Loading Medicare layout...</div>
      </div>
    }>
      <MedicareLayout>{children}</MedicareLayout>
    </Suspense>
  );
}
