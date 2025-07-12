'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/lib/api-client';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
