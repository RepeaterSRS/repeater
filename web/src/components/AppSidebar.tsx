'use client';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, UserRoundX, User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeChanger from '@/components/ThemeChanger';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { Skeleton } from '@/components/ui/skeleton';
import { getUserInfoMeGet } from '@/gen';

const pages = [
    { href: '/review', label: 'Review' },
    { href: '/decks', label: 'Decks' },
];

export function AppSidebar() {
    const pathname = usePathname();

    const {
        data: user,
        isPending: userPending,
        isError: userError,
    } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUserInfoMeGet(),
    });

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
                            {userPending && !userError && (
                                <div className="flex gap-2">
                                    <Skeleton className="size-9 rounded-md" />
                                    <div className="grid gap-0.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            )}
                            {!userPending && userError && (
                                <div className="flex gap-2">
                                    <Avatar>
                                        <AvatarFallback>
                                            <UserRoundX />
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">
                                        Error fetching user
                                    </p>
                                </div>
                            )}
                            {!userPending && !userError && user.data && (
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                            >
                                                <User />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel className="text-muted-foreground">
                                                Account
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <User />
                                                <Link href="/profile">
                                                    Profile
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.data.role === 'guest' && (
                                                <>
                                                    <DropdownMenuItem>
                                                        <LogIn />
                                                        <Link href="/login">
                                                            Login
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <UserPlus />
                                                        <Link href="/register">
                                                            Register
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            {user.data.role !== 'guest' && (
                                                <>
                                                    <DropdownMenuItem>
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <Button
                                                            onClick={() => {
                                                                return;
                                                            }}
                                                            className="text-destructive"
                                                        >
                                                            Logout
                                                        </Button>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className="grid max-w-28 leading-tight">
                                        <span className="truncate text-sm">
                                            {user.data.email || 'Guest'}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {user.data.email ||
                                                'example@domain.com'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <ThemeChanger />
                        </SidebarMenuItem>
                        <SidebarMenuItem></SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    );
}
