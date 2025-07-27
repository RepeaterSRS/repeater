'use client';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import ThemeChanger from '@/components/theme-changer';
import { cn } from '@/lib/utils';

export default function NavigationBar({
    className,
}: React.ComponentProps<'div'>) {
    const pathname = usePathname();
    const clipPathContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLAnchorElement>(null);
    const [isClient, setIsClient] = useState(false);

    const tabs = [
        { href: '/review', label: 'Review' },
        { href: '/decks', label: 'Decks' },
        { href: '/profile', label: 'Profile' },
    ];

    const clipLeft = useMotionValue(0);
    const clipRight = useMotionValue(0);

    const clipPath = useTransform(
        [clipLeft, clipRight],
        ([left, right]: number[]) =>
            `inset(0 ${100 - right}% 0 ${left}% round 8px)`
    );

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [isActiveHighlightInitialized, setIsActivePillInitialized] =
        useState(false);

    useEffect(() => {
        const clipPathContainer = clipPathContainerRef.current;

        if (clipPathContainer && activeTabRef.current) {
            const activeTabElement = activeTabRef.current;
            const { offsetLeft, offsetWidth } = activeTabElement;

            const containerWidth = clipPathContainer.offsetWidth;
            const targetClipLeft = (offsetLeft / containerWidth) * 100;
            const targetClipRight =
                ((offsetLeft + offsetWidth) / containerWidth) * 100;

            // Don't animate when clip values are in initial positions
            if (!isActiveHighlightInitialized) {
                clipLeft.set(targetClipLeft);
                clipRight.set(targetClipRight);
                setIsActivePillInitialized(true);
            } else {
                animate(clipLeft, targetClipLeft, {
                    duration: 0.3,
                    ease: [0.175, 0.885, 0.32, 1.1],
                });
                animate(clipRight, targetClipRight, {
                    duration: 0.3,
                    ease: [0.175, 0.885, 0.32, 1.1],
                });
            }
        }
    }, [pathname, isClient, clipLeft, clipRight, isActiveHighlightInitialized]);

    if (!isClient) {
        return null;
    }

    return (
        <div
            className={cn(
                'my-2 flex w-full max-w-md items-center gap-2 px-4 md:px-0',
                className
            )}
        >
            <nav
                role="navigation"
                aria-label="Main navigation"
                className="bg-background text-foreground relative flex w-full rounded-lg border py-1 shadow-sm"
            >
                <div className="flex h-10 w-full items-center justify-evenly px-2">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                ref={isActive ? activeTabRef : null}
                                className="hover:bg-accent/50 hover:text-primary flex h-10 w-full max-w-48 items-center justify-center rounded-lg px-4"
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                <motion.div
                    inert
                    ref={clipPathContainerRef}
                    className="bg-accent text-foreground absolute inset-0 flex h-10 w-full items-center justify-evenly px-2"
                    style={{ clipPath, inset: '0.25rem 0' }}
                >
                    {tabs.map((tab) => {
                        return (
                            <Link
                                key={`active-${tab.href}`}
                                href={tab.href}
                                className="flex w-full max-w-48 items-center justify-center px-4"
                                tabIndex={-1}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </motion.div>
            </nav>
            <ThemeChanger className="h-12 w-12 max-md:hidden" />
        </div>
    );
}
