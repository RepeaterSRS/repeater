'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import Link from 'next/link';

export default function NavigationBar() {
    const pathname = usePathname();
    const clipPathContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLAnchorElement>(null);
    const [isClient, setIsClient] = useState(false);

    const tabs = [
        { href: '/review', label: 'Review' },
        { href: '/cards', label: 'Cards' },
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
        <nav
            role="navigation"
            aria-label="Main navigation"
            className="relative my-2 py-1 flex bg-foreground/20 text-primary/90 rounded-lg"
        >
            <div className="flex gap-2 h-9 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            ref={isActive ? activeTabRef : null}
                            className="hover:bg-primary/20 hover:text-primary px-4 rounded-lg flex items-center"
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <motion.div
                aria-hidden
                ref={clipPathContainerRef}
                className="absolute inset-0 bg-foreground flex items-center gap-2 px-2 h-9"
                style={{ clipPath, inset: '0.25rem 0' }}
            >
                {tabs.map((tab) => {
                    return (
                        <Link
                            key={`active-${tab.href}`}
                            href={tab.href}
                            className="text-background px-4 flex items-center"
                            tabIndex={-1}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </motion.div>
        </nav>
    );
}

