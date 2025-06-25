'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import Link from 'next/link';

export default function NavigationBar() {
    const pathname = usePathname();
    const containerRef = useRef(null);
    const activeTabRef = useRef(null);
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
        ([left, right]) =>
            `inset(3px calc(${100 - right}% + 3px) 3px calc(${left}% + 3px) round 8px)`
    );

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [isActiveHighlightInitialized, setIsActivePillInitialized] =
        useState(false);

    useEffect(() => {
        const container = containerRef.current;

        if (container && activeTabRef.current) {
            const activeTabElement = activeTabRef.current;
            const { offsetLeft, offsetWidth } = activeTabElement;

            const containerWidth = container.offsetWidth;
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
        <div className="relative my-2 flex h-9 bg-background border-primary text-primary/50 border-2 rounded-lg">
            <div className="flex">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            ref={isActive ? activeTabRef : null}
                            className="hover:text-primary px-3 rounded-xl flex items-center"
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <motion.div
                aria-hidden
                ref={containerRef}
                className="absolute inset-0 bg-primary flex items-center"
                style={{ clipPath }}
            >
                {tabs.map((tab) => {
                    return (
                        <Link
                            key={`active-${tab.href}`}
                            href={tab.href}
                            className="text-background px-3 flex items-center"
                            tabIndex={-1}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
