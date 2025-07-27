'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { ShortcutProvider } from '@/components/shortcut-provider';
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
                <SidebarProvider>
                    <ShortcutProvider>{children}</ShortcutProvider>
                </SidebarProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
