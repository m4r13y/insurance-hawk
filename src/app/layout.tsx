import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import PrelineScriptWrapper from '../components/PrelineScriptWrapper';
import { HeaderLower } from "@/components/ui/header-lower";
import { HeaderUpper } from "@/components/ui/header-upper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Insurance Hawk",
  description: "Save your money, keep your freedom",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", inter.variable)}>
                <HeaderUpper />
                <HeaderLower />
              <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
              </main>
        {children}
        <Toaster />
        <PrelineScriptWrapper />
      </body>
    </html>
  );
}
