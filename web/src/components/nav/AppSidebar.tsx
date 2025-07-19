'use client';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import CardCreationDialog from '@/components/CardCreationDialog';
import DeckCreationDialog from '@/components/DeckCreationDialog';
import { NavProfile } from '@/components/nav/NavProfile';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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

const pages = [
    { href: '/review', label: 'Review' },
    { href: '/decks', label: 'Decks' },
];

export function AppSidebar() {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const [cardDialogOpen, setCardDialogOpen] = useState(false);
    const [deckDialogOpen, setDeckDialogOpen] = useState(false);

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="w-full">Create</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                <DropdownMenuItem
                                    onClick={() => setCardDialogOpen(true)}
                                >
                                    Create card
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeckDialogOpen(true)}
                                >
                                    Create deck
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <CardCreationDialog
                            open={cardDialogOpen}
                            onOpenChange={setCardDialogOpen}
                            onSuccess={() => {
                                queryClient.invalidateQueries({
                                    queryKey: ['cards'],
                                });
                                setCardDialogOpen(false);
                            }}
                        />
                        <DeckCreationDialog
                            open={deckDialogOpen}
                            onOpenChange={setDeckDialogOpen}
                            onSuccess={() => {
                                queryClient.invalidateQueries({
                                    queryKey: ['decks'],
                                });
                                setDeckDialogOpen(false);
                            }}
                        />
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
                <NavProfile />
            </SidebarFooter>
        </Sidebar>
    );
}
