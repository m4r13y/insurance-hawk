"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TargetIcon,
  ReaderIcon,
  FileTextIcon,
  HeartIcon,
  ActivityLogIcon,
  TokensIcon,
  StarFilledIcon
} from '@radix-ui/react-icons';

interface NavigationTab {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  color: string;
}

const navigationTabs: NavigationTab[] = [
  {
    id: "shop",
    name: "Shop",
    description: "Browse and compare Medicare plans",
    icon: TargetIcon,
    href: "/medicare/shop",
    color: "bg-blue-500"
  },
  {
    id: "learn",
    name: "Learn",
    description: "Educational resources and guides",
    icon: ReaderIcon,
    href: "/medicare/learn",
    color: "bg-green-500"
  },
  {
    id: "resources",
    name: "Resources",
    description: "Tools, calculators, and support",
    icon: FileTextIcon,
    href: "/medicare/resources",
    badge: "New",
    color: "bg-purple-500"
  }
];

const quickStats = [
  { label: "Available Plans", value: "500+", icon: TokensIcon },
  { label: "States Covered", value: "50", icon: ActivityLogIcon },
  { label: "Customer Rating", value: "4.9", icon: StarFilledIcon },
  { label: "Years Experience", value: "15+", icon: HeartIcon }
];

interface MedicareLayoutProps {
  children: React.ReactNode;
}

export default function MedicareLayout({ children }: MedicareLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCurrentSection = () => {
    // Check for query parameter first (for main medicare page)
    if (pathname === '/medicare') {
      return searchParams.get('section') || 'shop';
    }
    // Then check route-based paths
    if (pathname.startsWith('/medicare/shop')) return 'shop';
    if (pathname.startsWith('/medicare/learn')) return 'learn';
    if (pathname.startsWith('/medicare/resources')) return 'resources';
    return 'shop'; // default
  };

  const currentSection = getCurrentSection();

  const handleTabClick = (tabId: string) => {
    if (pathname === '/medicare') {
      // Update query parameter for main page
      const url = new URL(window.location.href);
      url.searchParams.set('section', tabId);
      window.history.pushState(null, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      // Navigate to route-based path
      router.push(`/medicare/${tabId}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Show on main medicare page and sub-sections */}
      {(pathname === '/medicare' || pathname.startsWith('/medicare/')) && (
        <section className="relative pt-12 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
            </div>
          </div>
        </section>
      )}

      {/* Sticky Navigation - Navigation moved to individual pages */}
      {!pathname.startsWith('/medicare/shop') && (
        <div className="sticky top-20 z-40 bg-background/98 pb-2 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-end py-3">
              {/* Navigation moved to individual Learn and Resources pages */}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
