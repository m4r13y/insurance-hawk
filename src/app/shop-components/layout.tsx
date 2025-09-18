"use client";
import React from 'react';
import { SavedPlansProvider } from '@/contexts/SavedPlansContext';

export default function ShopComponentsLayout({ children }: { children: React.ReactNode }) {
  return <SavedPlansProvider>{children}</SavedPlansProvider>;
}
