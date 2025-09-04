"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";

// Dynamically import components with no SSR to prevent useSearchParams issues during build
const MedicareShopContent = nextDynamic(() => import("@/components/MedicareShopContent"), {
  ssr: false,
  loading: () => null // Remove loading fallback to prevent flash
});

const MedicareLearnContent = nextDynamic(() => import("@/components/MedicareLearnContent"), {
  ssr: false,
  loading: () => null // Remove loading fallback to prevent flash
});

const MedicareResourcesContent = nextDynamic(() => import("@/components/MedicareResourcesContent"), {
  ssr: false,
  loading: () => null // Remove loading fallback to prevent flash
});

// Wrapper components with individual Suspense boundaries
function MedicareShopWrapper() {
  return (
    <Suspense fallback={null}>
      <MedicareShopContent />
    </Suspense>
  );
}

function MedicareLearnWrapper() {
  return (
    <Suspense fallback={null}>
      <MedicareLearnContent />
    </Suspense>
  );
}

function MedicareResourcesWrapper() {
  return (
    <Suspense fallback={null}>
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
    return null; // Minimal loading state to prevent flash
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
  return null; // Minimal fallback to prevent flash
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