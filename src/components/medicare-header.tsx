'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

export function MedicareHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-[5%]">
      <header className="w-full max-w-7xl">
        <nav className="relative backdrop-blur-md bg-card/60 dark:card/60 border border-border/20 dark:border-gray-700/60 rounded-2xl shadow-lg">
        <div className="relative z-10 px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <Logo className="h-10 w-auto" />
              </Link>
              
              <div className="hidden lg:flex items-center space-x-1">
                <Link 
                  href="/medicare/" 
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
                >
                  Shop
                </Link>
                <Link 
                  href="/medicare/learn" 
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
                >
                  Learn
                </Link>
                <Link 
                  href="/medicare/resources" 
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
                >
                  Resources
                </Link>
                <Link 
                  href="/about" 
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
                >
                  About
                </Link>
               {/* <Link 
                  href="https://the-hawk-nest.printify.me/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-xl transition-all duration-300"
                >
                  Merch
                </Link> */}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
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
                      <Link 
                        href="/medicare/" 
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors",
                          pathname === '/medicare/' && "text-foreground"
                        )}
                      >
                        Shop Medicare
                      </Link>
                      <Link 
                        href="/medicare/learn" 
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors",
                          pathname === '/medicare/learn' && "text-foreground"
                        )}
                      >
                        Learn Medicare
                      </Link>
                      <Link 
                        href="/medicare/resources" 
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors",
                          pathname === '/medicare/resources' && "text-foreground"
                        )}
                      >
                        Medicare Resources
                      </Link>
                      <Link 
                        href="/about" 
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors",
                          pathname === '/about' && "text-foreground"
                        )}
                      >
                        About
                      </Link>
                    </div>
                    
                    <div className="pt-6 border-t border-border">
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
    </div>
  );
}
