"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TargetIcon,
  ReaderIcon,
  FileTextIcon
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

interface MedicareNavigationTabsProps {
  className?: string;
  size?: "sm" | "default";
}

export default function MedicareNavigationTabs({ 
  className = "",
  size = "sm"
}: MedicareNavigationTabsProps) {
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
    <nav className={`flex items-center gap-2 ${className}`}>
      {navigationTabs.map((tab) => {
        const isActive = currentSection === tab.id;
        return (
          <Button
            key={tab.id}
            variant={isActive ? "default" : "ghost"}
            size={size}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex items-center gap-2 px-3 py-2 transition-all duration-200 ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-muted/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${tab.color} ${isActive ? 'opacity-100' : 'opacity-60'}`} />
            <span className="font-medium text-sm">{tab.name}</span>
            {tab.badge && isActive && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 ml-1">
                {tab.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}
