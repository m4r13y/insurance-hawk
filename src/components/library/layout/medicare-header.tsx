'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { HamburgerMenuIcon, ActivityLogIcon, ReaderIcon, FileTextIcon, BackpackIcon, PersonIcon } from '@radix-ui/react-icons';

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

export function MedicareHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky py-2 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-1 dark:border-gray-6">
      <div className="w-full max-w-none px-12 flex h-14 items-center justify-between">
        {/* Logo - Left Side */}
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className='max-w-30'/>
          </Link>
        </div>
        
        {/* Navigation Menu - Right Side */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">
                  Business
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-start rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md text-foreground"
                          href="/business/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                            Business Hub
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Comprehensive insurance solutions for businesses of all sizes, from startups to corporations.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {businessPages.map((page) => (
                      <li key={page.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={page.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{page.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {page.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">
                  Individual
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-start rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md text-foreground"
                          href="/individual/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                            Individual Hub
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Personal insurance solutions including health, life, and supplemental coverage options.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {individualPages.map((page) => (
                      <li key={page.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={page.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{page.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {page.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">
                  Medicare
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-start rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md text-foreground"
                          href="/Medicare/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                            Medicare Hub
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Your complete guide to understanding Medicare options, enrollment periods, and making informed decisions.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {medicarePages.map((page) => (
                      <li key={page.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={page.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{page.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {page.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[300px]">
                    {resources.map((resource) => (
                      <li key={resource.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={resource.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{resource.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {resource.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
