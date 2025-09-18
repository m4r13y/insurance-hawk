"use client";
import React from 'react';
import { SavedPlansProvider } from '@/contexts/SavedPlansContext';

export default function PlanDetailsLayout({ children }: { children: React.ReactNode }) {
  return <SavedPlansProvider>{children}</SavedPlansProvider>;
}
