
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
    HamburgerMenuIcon,
    Cross1Icon,
    ChevronDownIcon,
    ChevronRightIcon,
    RocketIcon,
    TokensIcon,
    HeartIcon,
    FileTextIcon,
    GitHubLogoIcon,
    PersonIcon,
    ReaderIcon,
    ArchiveIcon,
    GearIcon,
    ActivityLogIcon,
    SunIcon,
    MoonIcon
} from "@radix-ui/react-icons";

interface NavItem {
  title: string
  href: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

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
    title: "Medicare",
    href: "/Medicare",
    description: "Side-by-side plan comparisons.",
    icon: GitHubLogoIcon,
  },
  {
    title: "Retirement Plan",
    href: "/recommendations",
    description: "Get a personalized retirement analysis.",
    icon: TokensIcon,
  },
  {
    title: "Provider Lookup",
    href: "/provider-lookup",
    description: "Find Medicare-accepted providers.",
    icon: ActivityLogIcon,
  },
  {
    title: "Education Center",
    href: "/education",
    description: "Learn about Medicare with our AI assistant.",
    icon: ReaderIcon,
  },
  {
    title: "Resource Library",
    href: "/resources",
    description: "Articles, guides, and official documents.",
    icon: ArchiveIcon,
  },
];

function MegaMenuLink({ item }: { item: NavItem }) {
  const IconComponent = item.icon;
  return (
    <Link href={item.href} className="p-3 flex gap-x-4 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 rounded-lg dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
      <IconComponent className="shrink-0 size-4 mt-1 text-gray-800 dark:text-neutral-200" />
      <div className="grow">
        <p className="font-medium text-sm text-gray-800 dark:text-neutral-200">{item.title}</p>
        <p className="text-sm text-gray-500 dark:text-neutral-500">{item.description}</p>
      </div>
    </Link>
  );
}

export function HeaderLower() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Apply dark mode to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-300 dark:bg-[--gray-a2] dark:border-neutral-700">
      <nav className="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-x-1">
          <Link href="" className="flex-none px-4" aria-label="Brand">
            <Logo />
          </Link>

          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <HamburgerMenuIcon className="size-4" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/Medicare/" className="text-sm font-medium">
                    Medicare
                  </Link>
                  <Link href="/business/" className="text-sm font-medium">
                    Business
                  </Link>
                  <Link href="/life/" className="text-sm font-medium">
                    Life
                  </Link>
                  <Link href="/critical-illness/" className="text-sm font-medium">
                    Critical Illness
                  </Link>
                  <Link href="/hospital-indemnity/" className="text-sm font-medium">
                    Hospital Indemnity
                  </Link>
                  <Link href="/resources/" className="text-sm font-medium">
                    Resources
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="hidden md:block basis-full grow">
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
              <div className="grow">
                <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                   <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-400 dark:text-neutral-200" href="/Medicare/" aria-current={pathname === '' ? 'page' : undefined}>
                    Medicare
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-400 dark:text-neutral-200" href="/business/" aria-current={pathname === '' ? 'page' : undefined}>
                    Business
                  </Link>

                  <Link className="px-4 h-full flex items-center text-sm text-gray-800 border-r border-gray-400 dark:text-neutral-200" href="/individual/" aria-current={pathname === '' ? 'page' : undefined}>
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
                      <ChevronDownIcon className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
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
                                        <ChevronRightIcon className="shrink-0 size-4" />
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
                      <ChevronDownIcon className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" />
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
                  
                  {/* Dark Mode Toggle Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="h-9 w-9 p-0 ml-2"
                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {isDarkMode ? (
                      <SunIcon className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <MoonIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>
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
