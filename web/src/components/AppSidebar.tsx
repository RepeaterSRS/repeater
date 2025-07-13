'use client';
import ThemeChanger from '@/components/ThemeChanger';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

const pages = [
    { href: '/review', label: 'Review' },
    { href: '/decks', label: 'Decks' },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button disabled className="w-full">
                            Create
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {pages.map((page) => (
                            <SidebarMenuItem key={page.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.href === pathname}
                                >
                                    <Link href={page.href}>{page.label}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem className="flex flex-row justify-between">
                            <Button asChild>
                                <Link href="/profile">Profile</Link>
                            </Button>
                            <ThemeChanger />
                        </SidebarMenuItem>
                        <SidebarMenuItem></SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    );
}
