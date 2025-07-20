
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserNav } from "@/components/user-nav"
import { Menu, X, ChevronDown, Rocket, PiggyBank, Heart, FileDigit, Scale, FileText, User, BookOpen, Library, Settings, Stethoscope } from "lucide-react"

interface NavItem {
  title: string
  href: string
  description: string
  icon: React.ElementType
}

const getInsuranceItems: NavItem[] = [
  {
    title: "Health Quotes (Under 65)",
    href: "/dashboard/health-quotes",
    description: "Find individual & family health plans.",
    icon: Heart,
  },
  {
    title: "Supplemental Quotes (65+)",
    href: "/dashboard/quotes",
    description: "Get quotes for Medigap, Dental, and more.",
    icon: FileDigit,
  },
  {
    title: "Submit Application",
    href: "/dashboard/apply",
    description: "Complete and submit your insurance application.",
    icon: FileText,
  },
];

const toolsAndResourcesItems: NavItem[] = [
  {
    title: "Compare Plans",
    href: "/dashboard/compare-plans",
    description: "Side-by-side plan comparisons.",
    icon: Scale,
  },
  {
    title: "Retirement Plan",
    href: "/dashboard/recommendations",
    description: "Get a personalized retirement analysis.",
    icon: PiggyBank,
  },
  {
    title: "Provider Lookup",
    href: "/dashboard/provider-lookup",
    description: "Find Medicare-accepted providers.",
    icon: Stethoscope,
  },
  {
    title: "Education Center",
    href: "/dashboard/education",
    description: "Learn about Medicare with our AI assistant.",
    icon: BookOpen,
  },
  {
    title: "Resource Library",
    href: "/dashboard/resources",
    description: "Articles, guides, and official documents.",
    icon: Library,
  },
];

function MegaMenuLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="p-3 flex gap-x-4 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 rounded-lg dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
      <Icon className="shrink-0 size-4 mt-1 text-gray-800 dark:text-neutral-200" />
      <div className="grow">
        <p className="font-medium text-sm text-gray-800 dark:text-neutral-200">{item.title}</p>
        <p className="text-sm text-gray-500 dark:text-neutral-500">{item.description}</p>
      </div>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap  md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
      <nav className="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-x-1">
          <Link href="/dashboard" className="flex-none" aria-label="Brand">
            <Logo />
          </Link>

          <div className="md:hidden flex items-center gap-2">
            <UserNav />
            <button type="button" className="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" id="hs-header-base-collapse"  aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation"  data-hs-collapse="#hs-header-base" >
              <Menu className="hs-collapse-open:hidden size-4" />
              <X className="hs-collapse-open:block shrink-0 hidden size-4" />
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>

        <div id="hs-header-base" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block "  aria-labelledby="hs-header-base-collapse" >
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
              <div className="grow">
                <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                  <Link className="p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined}>
                    <Rocket className="shrink-0 size-4 me-3 md:me-2" />
                    Dashboard
                  </Link>

                  <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] [--is-collapse:true] md:[--is-collapse:false] ">
                    <button id="hs-header-base-mega-menu-fullwidth" type="button" className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" aria-haspopup="menu" aria-expanded="false" aria-label="Mega Menu">
                      <Library className="shrink-0 size-4 me-3 md:me-2" />
                      Tools & Resources
                      <ChevronDown className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
                    </button>

                    <div className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 relative w-full min-w-60 hidden z-10 top-full start-0 before:absolute before:-top-5 before:start-0 before:w-full before:h-5" role="menu" aria-orientation="vertical" aria-labelledby="hs-header-base-mega-menu-fullwidth">
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
                                        <ChevronRight className="shrink-0 size-4" />
                                    </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] [--is-collapse:true] md:[--is-collapse:false]">
                    <button type="button" className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                      <Heart className="shrink-0 size-4 me-3 md:me-2" />
                      Get Insurance
                      <ChevronDown className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
                    </button>
                    <div className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full hidden z-10 top-full start-0 min-w-60 md:bg-white md:shadow-md md:rounded-lg p-2 dark:md:bg-neutral-800 md:dark:border dark:md:border-neutral-700">
                        {getInsuranceItems.map(item => <MegaMenuLink key={item.href} item={item} />)}
                    </div>
                  </div>

                  <Link href="/dashboard/documents" className="p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                    <User className="shrink-0 size-4 me-3 md:me-2" />
                    My Account
                  </Link>

                </div>
              </div>

              <div className="my-2 md:my-0 md:mx-2">
                <div className="w-full h-px md:w-px md:h-4 bg-gray-100 md:bg-gray-300 dark:bg-neutral-700"></div>
              </div>
              
              <div className="hidden md:flex flex-wrap items-center gap-x-1.5">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
