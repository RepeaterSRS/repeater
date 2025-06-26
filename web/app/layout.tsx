import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuLink,
} from '@radix-ui/react-navigation-menu';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';

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
                <header className="w-screen flex flex-row justify-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/review">Review</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/cards">Cards</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/profile">Profile</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </header>
                {children}
            </body>
        </html>
    );
}
