'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance inside the component to ensure it's unique per request in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent refetching on window focus by default - we'll handle this explicitly in auth
            refetchOnWindowFocus: false,
            // Cache auth status for 5 seconds
            staleTime: 5000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't retry auth failures (they're usually intentional)
            retry: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
