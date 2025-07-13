'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar';
import '@/lib/api-client';

const queryClient = new QueryClient();

export function AppProviders({
    children,
    ...props
}: React.ComponentProps<typeof ThemeProvider>) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider {...props}>
                <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
