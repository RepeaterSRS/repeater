import { useQuery } from '@tanstack/react-query';
import { UserPlus, UserRoundX, User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import ThemeChanger from '@/components/ThemeChanger';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserInfoMeGet, logoutAuthLogoutPost } from '@/gen';

export function NavProfile() {
    const {
        data: user,
        isPending: userPending,
        isError: userError,
    } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUserInfoMeGet(),
    });

    return (
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
                        <p className="text-sm">Error fetching user</p>
                    </div>
                )}
                {!userPending && !userError && user.data && (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
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
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.data.role === 'guest' && (
                                    <>
                                        <DropdownMenuItem>
                                            <LogIn />
                                            <Link href="/login">Login</Link>
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
                                        <DropdownMenuItem
                                            onClick={async () => {
                                                try {
                                                    await logoutAuthLogoutPost();
                                                    window.location.href =
                                                        '/login';
                                                } catch {
                                                    toast.error(
                                                        'There was an error when logging out. Try again.'
                                                    );
                                                }
                                            }}
                                        >
                                            <LogOut className="text-destructive" />
                                            <span className="text-destructive">
                                                Logout
                                            </span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="grid max-w-28 leading-tight">
                            <span className="truncate text-sm">
                                {user.data.email?.split('@')[0] || 'Guest'}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                                {user.data.email || '-'}
                            </span>
                        </div>
                    </div>
                )}
                <ThemeChanger />
            </SidebarMenuItem>
            <SidebarMenuItem></SidebarMenuItem>
        </SidebarMenu>
    );
}
