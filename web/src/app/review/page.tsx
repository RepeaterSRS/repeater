'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

import { useQuery } from '@tanstack/react-query';

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { Button } from '@/components/ui/button';

import { getCardsCardsGet } from '@/gen';
import { useState } from 'react';

export default function Review() {
    const {
        isPending,
        isError,
        data: dueCards,
    } = useQuery({
        queryKey: ['cards', 'due'],
        queryFn: () => getCardsCardsGet({ query: { only_due: true } }),
    });

    const [activeCardIndex, setActiveCardIndex] = useState(0);

    const activeCard = dueCards?.data?.[activeCardIndex];

    const nextCard = () => {
        if (dueCards?.data && activeCardIndex < dueCards.data.length - 1) {
            setActiveCardIndex((prev) => prev + 1);
        }
    };

    const prevCard = () => {
        if (activeCardIndex > 0) {
            setActiveCardIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="flex h-[calc(100dvh-4rem)] w-full flex-col items-center justify-between gap-4 py-4">
            {isPending && !isError && <p>loading</p>}
            {!isPending && isError && <p>error!</p>}
            {activeCard && (
                <Card className="aspect-[3/4] w-4/6 max-w-sm">
                    <CardHeader className="flex flex-row items-center justify-between text-xs">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/decks">
                                        Deck
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/decks?deckid=french-deck-ID">
                                        {activeCard.deck_id.substring(0, 2)}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevCard}
                                disabled={activeCardIndex === 0}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextCard}
                                disabled={
                                    !dueCards?.data ||
                                    activeCardIndex >= dueCards.data.length - 1
                                }
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="text-3xl">
                        {activeCard.content}
                    </CardContent>
                </Card>
            )}
            <div className="flex w-full flex-row justify-center gap-4">
                <Button variant="secondary" className="h-12 w-30">
                    Forgor
                </Button>
                <Button className="h-12 w-30">I got it :)</Button>
            </div>
        </div>
    );
}
