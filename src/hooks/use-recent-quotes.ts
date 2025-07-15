"use client"

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface RecentQuoteResult {
  hasRecentQuote: boolean;
  recentQuote?: {
    id: string;
    type: string;
    timestamp: any;
    resultData: Record<string, unknown>;
  };
  daysOld?: number;
}

interface UseRecentQuotesReturn {
  checkRecentQuote: (productType: string) => Promise<RecentQuoteResult>;
  isLoading: boolean;
  error: string | null;
}

export function useRecentQuotes(): UseRecentQuotesReturn {
  const [user] = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRecentQuote = async (productType: string): Promise<RecentQuoteResult> => {
    if (!user || !functions) {
      return { hasRecentQuote: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      const checkRecentQuotes = httpsCallable<
        { productType: string },
        RecentQuoteResult
      >(functions, 'checkRecentQuotes');

      const result = await checkRecentQuotes({ productType });
      return result.data;
    } catch (err: any) {
      console.error('Error checking recent quotes:', err);
      setError(err.message || 'Failed to check recent quotes');
      return { hasRecentQuote: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkRecentQuote,
    isLoading,
    error,
  };
}
