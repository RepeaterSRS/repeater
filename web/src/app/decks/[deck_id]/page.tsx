'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import {
    MoreVertical,
    Edit,
    FileDown,
    Pause,
    Archive,
    Trash,
} from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useState } from 'react';

import CardInspectDialog from '@/components/card-inspect-dialog';
import CardsGrid from '@/components/cards-grid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
    getDeckDecksDeckIdGet,
    getCardsCardsGet,
    getCategoryCategoriesCategoryIdGet,
    getUserDeckStatisticsStatsDeckIdGet,
    getReviewHistoryReviewsCardIdGet,
} from '@/gen';
import { formatDateForDisplay } from '@/lib/utils';

export default function DeckPage({
    params,
}: {
    params: Promise<{ deck_id: string }>;
}) {
    const { deck_id } = use(params);
    const queryClient = useQueryClient();

    const {
        data: deck,
        isLoading: isDeckLoading,
        isError: isDeckError,
        error: deckError,
    } = useQuery({
        queryKey: ['decks', deck_id],
        queryFn: () => getDeckDecksDeckIdGet({ path: { deck_id: deck_id } }),
    });

    const {
        data: cards,
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
    } = useQuery({
        queryKey: ['cards', deck_id],
        queryFn: () =>
            getCardsCardsGet({
                query: { deck_id: deck_id, exclude_archived: true },
            }),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['stats', deck_id],
        queryFn: () =>
            getUserDeckStatisticsStatsDeckIdGet({ path: { deck_id: deck_id } }),
    });

    const { data: category, isLoading: isCategoryLoading } = useQuery({
        queryKey: ['categories', deck?.data?.category_id],
        queryFn: () =>
            getCategoryCategoriesCategoryIdGet({
                path: { category_id: deck?.data?.category_id || '' },
            }),
        enabled: !!deck?.data?.category_id,
    });

    function prefetchCardHistory(cardId: string) {
        queryClient.prefetchQuery({
            queryKey: ['reviews', cardId],
            queryFn: () =>
                getReviewHistoryReviewsCardIdGet({ path: { card_id: cardId } }),
            staleTime: 5 * 60 * 1000,
        });
    }

    const [cardInspectDialogOpen, setCardInspectDialogOpen] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(-1);
    const activeCard = cards?.data?.[activeCardIndex];

    function nextCard() {
        if (cards?.data && activeCardIndex < cards.data.length - 1) {
            setActiveCardIndex((prev) => prev + 1);
        }
    }

    function prevCard() {
        if (activeCardIndex > 0) {
            setActiveCardIndex((prev) => prev - 1);
        }
    }

    if (isDeckError) {
        return (
            <div className="container mx-auto px-6 py-6">
                <div className="mb-6">
                    <Link href="/decks">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Decks
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-medium">
                        Error Loading Deck
                    </h1>
                    <p className="text-destructive">{deckError.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-6">
            <div className="mb-6">
                {/* Back button */}
                <div className="mb-4">
                    <Link href="/decks">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Decks
                        </Button>
                    </Link>
                </div>

                {/* Title and dropdown menu */}
                {isDeckLoading ? (
                    <div className="mb-6 space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <div className="mb-6 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">
                                {deck?.data?.name}
                            </h1>

                            {/* Dropdown menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pause
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Export
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {isCategoryLoading ? (
                            <Skeleton className="h-4 w-40" />
                        ) : (
                            category?.data?.name && (
                                <p className="text-muted-foreground text-sm">
                                    Category: {category.data.path.join(' / ')}
                                </p>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left column - Description */}
                <div className="lg:col-span-1">
                    <h2 className="mb-4 text-xl font-semibold">Description</h2>
                    {isDeckLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <div className="prose prose-neutral max-w-none">
                            {deck?.data?.description ? (
                                <p className="text-muted-foreground leading-relaxed">
                                    {deck.data.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No description provided
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right column - Statistics */}
                <div className="lg:col-span-2">
                    <h2 className="mb-4 text-xl font-semibold">Statistics</h2>
                    {isStatsLoading ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="p-4">
                                    <Skeleton className="mb-2 h-4 w-16" />
                                    <Skeleton className="h-8 w-12" />
                                </Card>
                            ))}
                        </div>
                    ) : stats?.data ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card className="p-4">
                                <p className="text-muted-foreground mb-1 text-sm">
                                    Last studied
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.data.last_studied
                                        ? formatDateForDisplay(
                                              stats.data.last_studied
                                          )
                                        : 'No data'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-muted-foreground mb-1 text-sm">
                                    Retention rate
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.data.retention_rate}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-muted-foreground mb-1 text-sm">
                                    Total reviews
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.data.total_reviews}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-muted-foreground mb-1 text-sm">
                                    Difficulty
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.data.difficulty_ranking}
                                </p>
                            </Card>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            No statistics available
                        </p>
                    )}
                </div>
            </div>

            <div>
                <h1 className="mb-6 text-2xl font-medium">Cards</h1>
                <CardsGrid
                    cards={cards?.data}
                    isLoading={isCardsLoading}
                    isError={isCardsError}
                    error={cardsError}
                    onCardClick={(cardIndex) => {
                        setActiveCardIndex(cardIndex);
                        setCardInspectDialogOpen(true);
                    }}
                    onCardMouseEnter={(cardId) => {
                        prefetchCardHistory(cardId);
                    }}
                    onCardCreated={() => {
                        queryClient.invalidateQueries({ queryKey: ['cards'] });
                    }}
                    defaultDeckId={deck_id}
                />
            </div>

            {activeCard && (
                <CardInspectDialog
                    card={activeCard}
                    open={cardInspectDialogOpen}
                    onOpenChange={setCardInspectDialogOpen}
                    onUpdateSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['cards'],
                        });
                    }}
                    onDeleteSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['cards'],
                        });
                    }}
                    onNext={nextCard}
                    onPrev={prevCard}
                    hasNext={
                        cards.data && activeCardIndex < cards.data.length - 1
                    }
                    hasPrev={activeCardIndex !== 0}
                />
            )}
        </div>
    );
}
