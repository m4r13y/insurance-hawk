
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, ChevronDown, Rocket, PiggyBank, Heart, FileDigit, Scale, FileText, User, BookOpen, Library, Settings, Stethoscope } from "lucide-react"

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

const myAccountItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Your main account overview.",
    icon: Rocket,
  },
  {
    title: "My Account",
    href: "/dashboard/documents",
    description: "Manage policies, documents, and profile.",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    description: "Update your account and notification settings.",
    icon: Settings,
  },
]

const allNavItems = [...getInsuranceItems, ...toolsAndResourcesItems, ...myAccountItems];


function NavigationMenu() {
  const pathname = usePathname();
  
  const createMenu = (title: string, items: NavItem[]) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-base">
          {title}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className={cn(
                    "font-medium",
                    pathname === item.href ? "text-primary" : "text-foreground"
                  )}>
                    {item.title}
                  </span>
                </div>
                <p className="ml-6 text-xs text-muted-foreground">{item.description}</p>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="flex items-center gap-2 text-sm">
      {createMenu("Get Insurance", getInsuranceItems)}
      {createMenu("Tools & Resources", toolsAndResourcesItems)}
      {createMenu("My Account", myAccountItems)}
    </nav>
  );
}


export function Header() {
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <NavigationMenu />
        </div>

        {/* Mobile Nav */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/dashboard"
              className="flex items-center"
              onClick={() => setIsSheetOpen(false)}
            >
              <Logo />
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {allNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      "transition-colors hover:text-foreground",
                       pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add search here if needed */}
          </div>
          <nav className="flex items-center">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
