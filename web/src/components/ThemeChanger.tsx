import { LaptopMinimal, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ThemeChanger({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn('cursor-pointer', className)}
                >
                    {theme === 'light' && <Sun />}
                    {theme === 'system' && <LaptopMinimal />}
                    {theme === 'dark' && <Moon />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <LaptopMinimal /> System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon /> Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
