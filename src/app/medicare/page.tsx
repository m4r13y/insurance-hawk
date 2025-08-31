"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MedicareShopContent from "@/components/MedicareShopContent";
import MedicareLearnContent from "@/components/MedicareLearnContent";
import MedicareResourcesContent from "@/components/MedicareResourcesContent";

function MedicarePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [section, setSection] = useState('shop');

  useEffect(() => {
    // Initialize section from URL
    const urlSection = searchParams.get('section') || 'shop';
    setSection(urlSection);

    // Update URL if no section parameter exists
    if (!searchParams.get('section')) {
      const url = new URL(window.location.href);
      url.searchParams.set('section', 'shop');
      window.history.replaceState(null, '', url.toString());
    }

    // Listen for URL changes
    const handlePopState = () => {
      const newUrl = new URL(window.location.href);
      const newSection = newUrl.searchParams.get('section') || 'shop';
      setSection(newSection);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams]);

  const renderContent = () => {
    switch (section) {
      case 'learn':
        return <MedicareLearnContent />;
      case 'resources':
        return <MedicareResourcesContent />;
      case 'shop':
      default:
        return <MedicareShopContent />;
    }
  };

  return renderContent();
}

function MedicareFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-lg">Loading Medicare information...</div>
    </div>
  );
}

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function MedicarePage() {
  return (
    <Suspense fallback={<MedicareFallback />}>
      <MedicarePageContent />
    </Suspense>
  );
}