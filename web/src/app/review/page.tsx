'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { getCardsCardsGet, createReviewReviewsPost } from '@/gen';

export default function Review() {
    const {
        isPending,
        isError,
        data: dueCards,
    } = useQuery({
        queryKey: ['cards', 'due'],
        queryFn: () => getCardsCardsGet({ query: { only_due: true } }),
    });

    const queryClient = useQueryClient();

    const reviewCard = useMutation({
        mutationFn: (feedback: 'ok' | 'skipped' | 'forgot') =>
            createReviewReviewsPost({
                body: {
                    card_id: activeCard!.id,
                    feedback: feedback,
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
        },
        // TODO: implement error handling
    });

    const [activeCardIndex, setActiveCardIndex] = useState(0);

    const activeCard = dueCards?.data?.[activeCardIndex];
    const isActiveCardOverdue =
        activeCard?.next_review_date &&
        (() => {
            const reviewDate = new Date(activeCard.next_review_date);
            const today = new Date();
            reviewDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            return reviewDate < today;
        })();

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
        <div className="flex h-[calc(100dvh-4rem)] w-full flex-col items-center gap-4 py-4">
            {isPending && !isError && <p>loading</p>}
            {!isPending && isError && <p>error!</p>}
            {activeCard && (
                <Card className="flex aspect-[3/4] w-4/6 max-w-sm flex-col">
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
                                        {/* TODO: change to deck name */}
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
                    <CardContent className="flex-1">
                        {isActiveCardOverdue && (
                            <p className="text-sm text-red-500">
                                Overdue. Review date:{' '}
                                {new Date(
                                    activeCard.next_review_date
                                ).toLocaleDateString()}
                            </p>
                        )}
                        <p className="mt-2 text-xl">{activeCard.content}</p>
                    </CardContent>
                    <CardFooter className="flex flex-row justify-center gap-4">
                        <Button
                            variant="secondary"
                            className="h-12 w-30"
                            onClick={() => reviewCard.mutate('forgot')}
                        >
                            Forgor
                        </Button>
                        <Button
                            className="h-12 w-30"
                            onClick={() => reviewCard.mutate('ok')}
                        >
                            I got it :)
                        </Button>
                    </CardFooter>
                </Card>
            )}
            <div className="flex w-full flex-row gap-4"></div>
        </div>
    );
}
