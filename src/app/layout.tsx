"use client"

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SimpleHeader } from "@/components/library/layout/simple-header";
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>The Insurance Hawk</title>
        <meta name="description" content="Save your money, keep your freedom" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={cn("font-sans antialiased gradient-bg text-foreground min-h-screen flex flex-col", inter.variable)}>
        {/* Main Header */}
        <SimpleHeader />
        
        {/* Add padding top to account for fixed header */}
        <main className={cn(
          "flex-1",
          isHomePage ? "pt-0" : "pt-24 p-4 sm:p-6 md:p-8"
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
