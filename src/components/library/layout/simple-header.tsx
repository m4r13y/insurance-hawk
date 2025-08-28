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
    title: 'Shop Plans',
    href: '/medicare/',
    description: 'Compare and shop Medicare supplement plans'
  },
  {
    title: 'Learn Medicare',
    href: '/medicare/learn',
    description: 'Understanding Medicare fundamentals and enrollment'
  },
  {
    title: 'Medicare Resources',
    href: '/medicare/resources',
    description: 'Tools, calculators, and helpful resources'
  },
  {
    title: 'Enrollment Periods',
    href: '/medicare/enrollment-periods',
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
        className="flex items-center px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
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
        <>
          {/* Invisible bridge to prevent gap hover issues */}
          <div
            className="absolute top-full left-0 w-full h-2 z-[59]"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 pt-2 w-[500px] bg-background/95 border border-border rounded-xl shadow-xl z-[60] backdrop-blur-sm"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="p-6">
              <div className="grid grid-cols-[0.75fr_1fr] gap-3 ">
                {hubPage && (
                  <div className="row-span-3">
                    <Link
                      href={hubPage.href}
                      className="flex h-full w-full select-none flex-col justify-start rounded-xl bg-secondary/80 border border-border/30 p-6 no-underline outline-none focus:shadow-md hover:bg-secondary/90 transition-all duration-300"
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
                      className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent/50 focus:text-accent-foreground"
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
        </>
      )}
    </div>
  );
}

export function SimpleHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-7xl">
      <nav className="relative backdrop-blur-md bg-card dark:card border border-border/60 dark:border-gray-700/60 rounded-2xl shadow-lg">
        <div className="relative z-10 px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <Logo className="h-10 w-auto" />
              </Link>
              
              <div className="hidden lg:flex items-center space-x-8">
                <DropdownMenu
                  title="Medicare"
                  pages={medicarePages}
                  hubPage={{
                    title: "Medicare Hub",
                    href: "/medicare/",
                    description: "Shop Medicare plans, learn about coverage options, and access helpful tools and resources."
                  }}
                />
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
                  title="Resources"
                  pages={resources}
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/ecosystem" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Ecosystem
              </Link>
              <Link href="/get-started">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted/50"
                  >
                    <HamburgerMenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass w-[300px] pr-0">
                  <Link
                    href="/"
                    className="flex items-center mb-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Logo />
                  </Link>
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-3">
                      <h4 className="font-medium text-foreground">Medicare</h4>
                      {medicarePages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors",
                            pathname === page.href && "text-foreground"
                          )}
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-col space-y-3">
                      <h4 className="font-medium text-foreground">Business</h4>
                      {businessPages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors",
                            pathname === page.href && "text-foreground"
                          )}
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-col space-y-3">
                      <h4 className="font-medium text-foreground">Individual</h4>
                      {individualPages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors",
                            pathname === page.href && "text-foreground"
                          )}
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-col space-y-3">
                      <h4 className="font-medium text-foreground">Resources</h4>
                      {resources.map((resource) => (
                        <Link
                          key={resource.href}
                          href={resource.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors",
                            pathname === resource.href && "text-foreground"
                          )}
                        >
                          {resource.title}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-border space-y-3">
                      <Link href="/about" onClick={() => setIsOpen(false)} className="block text-muted-foreground hover:text-foreground">
                        About
                      </Link>
                      <Link href="/ecosystem" onClick={() => setIsOpen(false)} className="block text-muted-foreground hover:text-foreground">
                        Ecosystem
                      </Link>
                      <Link href="/get-started" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
