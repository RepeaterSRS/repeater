'use client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import {
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeChangerItems() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
                <span className="text-muted-foreground">
                    {theme === 'light' && <Sun className="h-4 w-4" />}
                    {theme === 'system' && <Monitor className="h-4 w-4" />}
                    {theme === 'dark' && <Moon className="h-4 w-4" />}
                </span>
                <span>
                    {(theme?.charAt(0)?.toUpperCase() ?? '') + theme?.slice(1)}
                </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                        <Monitor className="h-4 w-4 mr-2" />
                        System
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
