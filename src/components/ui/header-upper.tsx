
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    Menu01Icon, 
    Cancel01Icon, 
    ArrowDown01Icon, 
    ArrowRight01Icon, 
    Rocket01Icon, 
    PiggyBankIcon as BankIcon, 
    HealthIcon as Health01Icon, 
    File01Icon as DocumentTextIcon, 
    GitCompareIcon, 
    UserIcon as User01Icon, 
    BookOpen01Icon, 
    LibrariesIcon as LibraryIcon, 
    Settings02Icon as Setting01Icon, 
    StethoscopeIcon as Stethoscope01Icon 
} from "@hugeicons/core-free-icons";

interface NavItem {
  title: string
  href: string
  description: string
  icon: any 
}

const getInsuranceItems: NavItem[] = [
  {
    title: "Health Quotes (Under 65)",
    href: "/health-quotes",
    description: "Find individual & family health plans.",
    icon: Health01Icon,
  },
  {
    title: "Supplemental Quotes (65+)",
    href: "/quotes",
    description: "Get quotes for Medigap, Dental, and more.",
    icon: DocumentTextIcon,
  },
  {
    title: "Submit Application",
    href: "/apply",
    description: "Complete and submit your insurance application.",
    icon: DocumentTextIcon,
  },
];

const toolsAndResourcesItems: NavItem[] = [
  {
    title: "Medicare",
    href: "/Medicare",
    description: "Side-by-side plan comparisons.",
    icon: GitCompareIcon,
  },
  {
    title: "Retirement Plan",
    href: "/recommendations",
    description: "Get a personalized retirement analysis.",
    icon: BankIcon,
  },
  {
    title: "Provider Lookup",
    href: "/provider-lookup",
    description: "Find Medicare-accepted providers.",
    icon: Stethoscope01Icon,
  },
  {
    title: "Education Center",
    href: "/education",
    description: "Learn about Medicare with our AI assistant.",
    icon: BookOpen01Icon,
  },
  {
    title: "Resource Library",
    href: "/resources",
    description: "Articles, guides, and official documents.",
    icon: LibraryIcon,
  },
];

function MegaMenuLink({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} className="p-3 flex gap-x-4 dark:text-neutral-200">
      <HugeiconsIcon icon={item.icon} className="shrink-0 size-4 mt-1 text-gray-800 dark:text-neutral-200" />
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
                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/Medicare/" aria-current={pathname === '' ? 'page' : undefined}>
                    Medicare
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/business/" aria-current={pathname === '' ? 'page' : undefined}>
                    Business
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/individual/" aria-current={pathname === '' ? 'page' : undefined}>
                    Individual
                  </Link>

          <div className="md:hidden flex items-center gapx-4">
            <button type="button" className="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg border border-gray-200 text-gray-800 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700" id="hs-header-base-collapse"  aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation"  data-hs-collapse="#hs-header-base" >
              <HugeiconsIcon icon={Menu01Icon} className="hs-collapse-open:hidden size-4" />
              <HugeiconsIcon icon={Cancel01Icon} className="hs-collapse-open:block shrink-0 hidden size-4" />
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>

        <div id="hs-header-base" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block "  aria-labelledby="hs-header-base-collapse" >
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
              <div className="grow">
                <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/hawknest/" aria-current={pathname === '' ? 'page' : undefined}>
                    Clients
                  </Link>


                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/hawkins-insurance-group/" aria-current={pathname === '' ? 'page' : undefined}>
                    Hawkins IG
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/about/" aria-current={pathname === '' ? 'page' : undefined}>
                    About
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/contact/" aria-current={pathname === '' ? 'page' : undefined}>
                    Contact
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
