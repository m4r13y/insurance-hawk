"use client"

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
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
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>The Insurance Hawk</title>
        <meta name="description" content="Save your money, keep your freedom" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={cn("font-sans antialiased bg-background text-foreground dark:bg-gray-1 dark:text-gray-12", inter.variable)}>
        <HeaderUpper />
        
        {/* Main Header */}
        <div className="relative">
          <MedicareHeader />
        </div>
        
        <main className={cn(
          "flex-1 bg-gray-50 dark:bg-neutral-900",
          !isHomePage && "p-4 sm:p-6 md:p-8"
        )}>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
