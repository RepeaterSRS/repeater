import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavigationBar from '@/components/NavigationBar';
import { AppProviders } from './providers';
import '@/lib/api-client';

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
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <header className="flex w-screen flex-row justify-center">
                    <NavigationBar />
                </header>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
