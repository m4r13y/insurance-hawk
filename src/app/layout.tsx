"use client"

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MedicareHeader } from "@/components/library/layout/medicare-header";
import { HeaderUpper } from "@/components/library/layout/medicare-header-upper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <html lang="en" suppressHydrationWarning className={isDarkMode ? 'dark' : ''}>
      <head>
        <title>The Insurance Hawk</title>
        <meta name="description" content="Save your money, keep your freedom" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={cn("font-sans antialiased bg-background text-foreground dark:bg-gray-1 dark:text-gray-12", inter.variable)}>
        <HeaderUpper />
        
        {/* Main Header with Dark Mode Toggle */}
        <div className="relative">
          <MedicareHeader />
          
          {/* Dark Mode Toggle Button - Positioned in top right */}
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-9 w-9 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
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
        
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-neutral-900">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
