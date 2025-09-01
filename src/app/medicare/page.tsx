"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";

// Dynamically import components with no SSR to prevent useSearchParams issues during build
const MedicareShopContent = nextDynamic(() => import("@/components/MedicareShopContent"), {
  ssr: false,
  loading: () => <div className="animate-pulse p-8">Loading shop content...</div>
});

const MedicareLearnContent = nextDynamic(() => import("@/components/MedicareLearnContent"), {
  ssr: false,
  loading: () => <div className="animate-pulse p-8">Loading learn content...</div>
});

const MedicareResourcesContent = nextDynamic(() => import("@/components/MedicareResourcesContent"), {
  ssr: false,
  loading: () => <div className="animate-pulse p-8">Loading resources content...</div>
});

// Wrapper components with individual Suspense boundaries
function MedicareShopWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Loading shop content...</div>}>
      <MedicareShopContent />
    </Suspense>
  );
}

function MedicareLearnWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Loading learn content...</div>}>
      <MedicareLearnContent />
    </Suspense>
  );
}

function MedicareResourcesWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Loading resources content...</div>}>
      <MedicareResourcesContent />
    </Suspense>
  );
}

function MedicarePageContent() {
  const router = useRouter();
  const [section, setSection] = useState('shop');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after mount
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    // Get search params safely on client side
    const searchParams = new URLSearchParams(window.location.search);
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
  }, [isClient]);

  // Don't render child components until we're on the client side
  if (!isClient) {
    return <div className="animate-pulse p-8">Loading Medicare information...</div>;
  }

  const renderContent = () => {
    switch (section) {
      case 'learn':
        return <MedicareLearnWrapper />;
      case 'resources':
        return <MedicareResourcesWrapper />;
      case 'shop':
      default:
        return <MedicareShopWrapper />;
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