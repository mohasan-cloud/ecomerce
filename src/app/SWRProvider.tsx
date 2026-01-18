"use client";

import { SWRConfig } from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import { ReactNode } from 'react';

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // Dedupe requests within 60 seconds
        refreshInterval: 0,
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Don't retry on 404
          if (error.status === 404) return;
          // Don't retry more than 3 times
          if (retryCount >= 3) return;
          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

