
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    HamburgerMenuIcon, 
    Cross1Icon, 
    ChevronDownIcon, 
    ChevronRightIcon, 
    RocketIcon, 
    HeartIcon, 
    FileTextIcon, 
    GitHubLogoIcon, 
    PersonIcon, 
    ReaderIcon, 
    ArchiveIcon, 
    GearIcon, 
    ComponentInstanceIcon 
} from "@radix-ui/react-icons";

interface NavItem {
  title: string
  href: string
  description: string
  icon: any 
}

const businessHubItems: NavItem[] = [
  {
    title: "Family Business",
    href: "/business/family",
    description: "Insurance solutions for family-owned businesses.",
    icon: HeartIcon,
  },
  {
    title: "Small Company",
    href: "/business/small",
    description: "Coverage for small businesses and startups.",
    icon: ComponentInstanceIcon,
  },
  {
    title: "Mid-Size Company",
    href: "/business/midsize",
    description: "Enterprise solutions for growing companies.",
    icon: GitHubLogoIcon,
  },
  {
    title: "Corporate",
    href: "/business/corporate",
    description: "Comprehensive corporate insurance programs.",
    icon: ArchiveIcon,
  },
];

const individualHubItems: NavItem[] = [
  {
    title: "Health Insurance",
    href: "/individual/health",
    description: "Individual & family health insurance plans.",
    icon: HeartIcon,
  },
  {
    title: "Life Insurance",
    href: "/individual/life",
    description: "Term and permanent life insurance options.",
    icon: PersonIcon,
  },
  {
    title: "Dental, Vision & Hearing",
    href: "/individual/dvh",
    description: "Supplemental dental, vision, and hearing coverage.",
    icon: ComponentInstanceIcon,
  },
  {
    title: "Cancer Insurance",
    href: "/individual/cancer",
    description: "Specialized cancer insurance protection.",
    icon: Cross1Icon,
  },
];

const getInsuranceItems: NavItem[] = [
  {
    title: "Health Quotes (Under 65)",
    href: "/health-quotes",
    description: "Find individual & family health plans.",
    icon: HeartIcon,
  },
  {
    title: "Supplemental Quotes (65+)",
    href: "/quotes",
    description: "Get quotes for Medigap, Dental, and more.",
    icon: FileTextIcon,
  },
  {
    title: "Submit Application",
    href: "/apply",
    description: "Complete and submit your insurance application.",
    icon: FileTextIcon,
  },
];

const toolsAndResourcesItems: NavItem[] = [
  {
    title: "Medicare Tools",
    href: "/Medicare",
    description: "Side-by-side plan comparisons and tools.",
    icon: GitHubLogoIcon,
  },
  {
    title: "Resource Library",
    href: "/resources",
    description: "Articles, guides, videos, and educational content.",
    icon: ArchiveIcon,
  },
  {
    title: "Provider Lookup",
    href: "/provider-lookup",
    description: "Find Medicare-accepted providers.",
    icon: ComponentInstanceIcon,
  },
  {
    title: "Education Center",
    href: "/education",
    description: "Learn about insurance with our guides.",
    icon: ReaderIcon,
  },
];

function MegaMenuLink({ item }: { item: NavItem }) {
  const IconComponent = item.icon;
  return (
    <Link href={item.href} className="p-3 flex gap-x-4 dark:text-neutral-200">
      <IconComponent className="shrink-0 size-4 mt-1 text-gray-800 dark:text-neutral-200" />
      <div className="grow">
        <p className="font-medium text-sm text-gray-800 dark:text-neutral-200">{item.title}</p>
        <p className="text-sm text-gray-500 dark:text-neutral-500">{item.description}</p>
      </div>
    </Link>
  );
}

export function HeaderUpper() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
      <nav className="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-6 px-4 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center gap-x-1">
                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/" aria-current={pathname === '/' ? 'page' : undefined}>
                    Home
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/business" aria-current={pathname?.startsWith('/business') ? 'page' : undefined}>
                    Business Hub
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/individual" aria-current={pathname?.startsWith('/individual') ? 'page' : undefined}>
                    Individual Hub
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/resources" aria-current={pathname?.startsWith('/resources') ? 'page' : undefined}>
                    Resources Library
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/about" aria-current={pathname?.startsWith('/about') ? 'page' : undefined}>
                    About
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/ecosystem" aria-current={pathname?.startsWith('/ecosystem') ? 'page' : undefined}>
                    Ecosystem
                  </Link>

          <div className="md:hidden flex items-center gapx-4">
            <button type="button" className="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg border border-gray-200 text-gray-800 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700" id="hs-header-base-collapse"  aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation"  data-hs-collapse="#hs-header-base" >
              <HamburgerMenuIcon className="hs-collapse-open:hidden size-4" />
              <Cross1Icon className="hs-collapse-open:block shrink-0 hidden size-4" />
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>

        <div id="hs-header-base" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block "  aria-labelledby="hs-header-base-collapse" >
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
              <div className="grow">
                <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/Medicare" aria-current={pathname === '/Medicare' ? 'page' : undefined}>
                    Medicare Tools
                  </Link>

                </div>
              </div>
              
              {/* <div className="hidden md:flex flex-wrap items-center gap-x-1.5">
                <UserNav />
              </div> */}
            </div>
          </div>
        </div>
      </nav>
      
    </header>
    
  )
}
