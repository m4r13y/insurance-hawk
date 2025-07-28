
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
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
    <Link href={item.href} className="p-3 flex gap-x-4 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 rounded-lg dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
      <HugeiconsIcon icon={item.icon} className="shrink-0 size-4 mt-1 text-gray-800 dark:text-neutral-200" />
      <div className="grow">
        <p className="font-medium text-sm text-gray-800 dark:text-neutral-200">{item.title}</p>
        <p className="text-sm text-gray-500 dark:text-neutral-500">{item.description}</p>
      </div>
    </Link>
  );
}

export function HeaderLower() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap  md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
      <nav className="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-x-1">
          <Link href="" className="flex-none px-4" aria-label="Brand">
            <Logo />
          </Link>

          <div className="md:hidden flex items-center gap-2">
            <button type="button" className="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" id="hs-header-base-collapse"  aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation"  data-hs-collapse="#hs-header-base" >
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
                   <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/Medicare/" aria-current={pathname === '' ? 'page' : undefined}>
                    Medicare
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/business/" aria-current={pathname === '' ? 'page' : undefined}>
                    Business
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-300 dark:text-neutral-200" href="/individual/" aria-current={pathname === '' ? 'page' : undefined}>
                    Individual
                  </Link>
                  
                  <Link className="p-2 mr-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="" aria-current={pathname === '' ? 'page' : undefined}>
                    Home
                  </Link>

                  <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] [--is-collapse:true] md:[--is-collapse:false] " data-hs-dropdown>
                    <button
                      id="hs-header-base-mega-menu-fullwidth"
                      type="button"
                      className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-label="Mega Menu"
                      data-hs-dropdown-toggle
                    >
                      Tools & Resources
                      <HugeiconsIcon icon={ArrowDown01Icon} className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
                    </button>

                    <div
                      className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 relative w-full min-w-60 hidden z-10 top-full start-0 before:absolute before:-top-5 before:start-0 before:w-full before:h-5"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="hs-header-base-mega-menu-fullwidth"
                      data-hs-dropdown-menu
                    >
                      <div className="md:mx-6 lg:mx-8 md:bg-white md:rounded-lg md:shadow-md dark:md:bg-neutral-800">
                        <div className="py-1 md:p-2 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {toolsAndResourcesItems.map(item => (
                                <div key={item.href} className="flex flex-col">
                                    <MegaMenuLink item={item} />
                                </div>
                            ))}
                            <div className="mt-2 md:mt-0 flex flex-col md:col-span-2 lg:col-span-1">
                                <a className="p-3 flex gap-x-5 items-center rounded-xl hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">
                                    <img className="size-32 rounded-lg" src="https://images.unsplash.com/photo-1648737967328-690548aec14f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=320&q=80" data-ai-hint="planning guide" alt="A person looking at a document" />
                                    <div className="grow">
                                    <p className="text-sm text-gray-800 dark:text-neutral-400">
                                        Our expert advisors can provide personalized guidance for your unique situation.
                                    </p>
                                    <p className="mt-3 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline group-focus:underline font-medium dark:text-blue-400">
                                        Contact an Advisor
                                        <HugeiconsIcon icon={ArrowRight01Icon} className="shrink-0 size-4" />
                                    </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] [--is-collapse:true] md:[--is-collapse:false]" data-hs-dropdown>
                    <button
                      type="button"
                      className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                      data-hs-dropdown-toggle
                      aria-haspopup="menu"
                      aria-expanded="false"
                    >
                      Get Insurance
                      <HugeiconsIcon icon={ArrowDown01Icon} className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
                    </button>
                    <div
                      className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full hidden z-10 top-full start-0 min-w-60 md:bg-white md:shadow-md md:rounded-lg p-2 dark:md:bg-neutral-800 md:dark:border dark:md:border-neutral-700"
                      data-hs-dropdown-menu
                    >
                        {getInsuranceItems.map(item => <MegaMenuLink key={item.href} item={item} />)}
                    </div>
                  </div>

                  <Link href="/documents" className="p-2 ml-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                    My Account
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
