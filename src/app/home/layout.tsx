import React, { ReactNode } from "react";


type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </>
  );
}
