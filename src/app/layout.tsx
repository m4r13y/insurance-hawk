"use client"

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SimpleHeader } from "@/components/library/layout/simple-header";
import { MedicareHeader } from "@/components/medicare-header";
import AnimatedFooter from "@/components/animated-footer";
import AdaAccessibilityWidget from "@/components/ada-accessibility-widget";
import CookieConsentBanner from "@/components/cookie-consent-banner";

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
  const isMedicarePage = pathname.startsWith('/medicare');

  // Immediate scroll to top on route change - runs before render
  useEffect(() => {
    // Use requestAnimationFrame to ensure it runs after DOM update but before paint
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Run immediately
    scrollToTop();
    
    // Also run on next frame to catch any late updates
    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>The Insurance Hawk</title>
        <meta name="description" content="Save your money, keep your freedom" />
        <link rel="icon" href="/favicon.svg" />
        {/* Prevent scroll restoration flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediately scroll to top before any rendering
              if (typeof window !== 'undefined') {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                if (document.body) document.body.scrollTop = 0;
              }
              // Disable browser scroll restoration
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
      </head>
      <body className={cn("font-sans antialiased gradient-bg text-foreground min-h-screen flex flex-col", inter.variable)}>
        {/* Main Header - Temporarily hidden */}
        {/* <SimpleHeader /> */}
        
        {/* Medicare-specific Header - Temporarily visible */}
        <MedicareHeader />
        
        {/* Add padding top to account for fixed header */}
        <main className={cn(
          "flex-1",
          isHomePage ? "pt-0" : 
          isMedicarePage ? "pt-0" : 
          "pt-44 p-4 sm:p-6 md:p-8"
        )}>
          {children}
        </main>
        
        <AnimatedFooter />
        
        {/* Compliance Components */}
        <AdaAccessibilityWidget />
        <CookieConsentBanner />
        
        <Toaster />
      </body>
    </html>
  );
}
