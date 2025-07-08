'use client';


const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
