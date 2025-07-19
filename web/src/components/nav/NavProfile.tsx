import { useQuery } from '@tanstack/react-query';
import { UserPlus, UserRoundX, User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { ThemeChangerItems } from '@/components/ThemeChangerItems';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from '@/components/ui/sidebar';
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

    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {userPending && !userError && (
                    <SidebarMenuButton size="lg">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="grid flex-1 text-left leading-tight">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="mt-1 h-3 w-24" />
                        </div>
                    </SidebarMenuButton>
                )}
                {!userPending && userError && (
                    <SidebarMenuButton size="lg">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                <UserRoundX className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight">
                            <span className="truncate font-medium">Error</span>
                            <span className="truncate text-xs">
                                Failed to load user
                            </span>
                        </div>
                    </SidebarMenuButton>
                )}
                {!userPending && !userError && user.data && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar>
                                    <AvatarFallback>
                                        {user.data.email
                                            ?.substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid leading-tight">
                                    <span className="truncate font-medium">
                                        {user.data.email?.split('@')[0] ||
                                            'Guest'}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user.data.email || '-'}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                        >
                            {user.data.role === 'guest' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href="/login">
                                            <LogIn />
                                            Login
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/register">
                                            <UserPlus />
                                            Register
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {user.data.role !== 'guest' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            try {
                                                await logoutAuthLogoutPost();
                                                window.location.href = '/login';
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
                            <DropdownMenuSeparator />
                            <ThemeChangerItems />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
