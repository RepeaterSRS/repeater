import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import NavigationBar from '@/components/NavigationBar';
import { AppProviders } from './providers';
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Repeater',
    description: 'The modern spaced repetition app',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AppProviders
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppSidebar />
                    <SidebarInset>
                        <header className="md:p-4">
                            <NavigationBar className="md:hidden" />
                            <SidebarTrigger className="max-md:hidden" />
                        </header>
                        {children}
                    </SidebarInset>
                </AppProviders>
            </body>
        </html>
    );
}
