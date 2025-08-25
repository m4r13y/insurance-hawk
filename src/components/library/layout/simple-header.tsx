'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

const medicarePages = [
  {
    title: 'Medicare Basics',
    href: '/Medicare/',
    description: 'Understanding Medicare fundamentals and enrollment'
  },
  {
    title: 'Part B Penalty Calculator', 
    href: '/Medicare/part-b-penalty',
    description: 'Calculate potential late enrollment penalties'
  },
  {
    title: 'Part D Penalty Calculator',
    href: '/Medicare/part-d-penalty', 
    description: 'Estimate prescription drug plan penalties'
  },
  {
    title: 'Enrollment Periods',
    href: '/Medicare/enrollment-periods',
    description: 'When you can enroll or make changes'
  }
];

const businessPages = [
  {
    title: 'Small Business',
    href: '/business/',
    description: 'Insurance solutions for small businesses'
  },
  {
    title: 'Corporate Plans',
    href: '/business/corporate',
    description: 'Enterprise-level insurance coverage'
  },
  {
    title: 'Employee Benefits',
    href: '/business/benefits',
    description: 'Comprehensive employee benefit packages'
  }
];

const individualPages = [
  {
    title: 'Health Insurance',
    href: '/individual/',
    description: 'Individual and family health coverage'
  },
  {
    title: 'Life Insurance',
    href: '/individual/life',
    description: 'Term and permanent life insurance options'
  },
  {
    title: 'Cancer Plans',
    href: '/individual/cancer',
    description: 'Supplemental cancer insurance coverage'
  }
];

const resources = [
  {
    title: 'Blog Articles',
    href: '/library/',
    description: 'Educational content about insurance options'
  },
  {
    title: 'Guides & Tools',
    href: '/library/guides',
    description: 'Helpful insurance planning resources'
  }
];

interface DropdownMenuProps {
  title: string;
  pages: Array<{
    title: string;
    href: string;
    description: string;
  }>;
  hubPage?: {
    title: string;
    href: string;
    description: string;
  };
}

function DropdownMenu({ title, pages, hubPage }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative group">
      <button
        className="flex items-center px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {title}
        <svg
          className="ml-1 h-4 w-4 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-[500px] bg-background border border-border rounded-md shadow-lg z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-6">
            <div className="grid grid-cols-[0.75fr_1fr] gap-3">
              {hubPage && (
                <div className="row-span-3">
                  <Link
                    href={hubPage.href}
                    className="flex h-full w-full select-none flex-col justify-start rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:bg-muted/70 transition-colors"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                      {hubPage.title}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {hubPage.description}
                    </p>
                  </Link>
                </div>
              )}
              {pages.map((page) => (
                <div key={page.href}>
                  <Link
                    href={page.href}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{page.title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {page.description}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SimpleHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky py-2 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[1440px] mx-auto px-12 flex h-14 items-center justify-between">
        {/* Logo - Left Side */}
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="max-w-30" />
          </Link>
        </div>
        
        {/* Navigation Menu - Right Side */}
        <div className="hidden md:flex space-x-1">
          <DropdownMenu
            title="Business"
            pages={businessPages}
            hubPage={{
              title: "Business Hub",
              href: "/business/",
              description: "Comprehensive insurance solutions for businesses of all sizes, from startups to corporations."
            }}
          />
          <DropdownMenu
            title="Individual"
            pages={individualPages}
            hubPage={{
              title: "Individual Hub",
              href: "/individual/",
              description: "Personal insurance solutions including health, life, and supplemental coverage options."
            }}
          />
          <DropdownMenu
            title="Medicare"
            pages={medicarePages}
            hubPage={{
              title: "Medicare Hub",
              href: "/Medicare/",
              description: "Your complete guide to understanding Medicare options, enrollment periods, and making informed decisions."
            }}
          />
          <DropdownMenu
            title="Resources"
            pages={resources}
          />
        </div>
        
        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Logo />
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">Business</h4>
                  {businessPages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        pathname === page.href && "text-foreground"
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">Individual</h4>
                  {individualPages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        pathname === page.href && "text-foreground"
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">Medicare</h4>
                  {medicarePages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        pathname === page.href && "text-foreground"
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">Resources</h4>
                  {resources.map((resource) => (
                    <Link
                      key={resource.href}
                      href={resource.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        pathname === resource.href && "text-foreground"
                      )}
                    >
                      {resource.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="md:hidden">
              <Logo />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
