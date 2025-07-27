'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import CardCreationDialog from '@/components/CardCreationDialog';
import CardInspectDialog from '@/components/CardInspectDialog';
import DeckCreationDialog from '@/components/DeckCreationDialog';
import DeckInspectDialog from '@/components/DeckInspectDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
    getDecksDecksGet,
    getCardsCardsGet,
    getReviewHistoryReviewsCardIdGet,
    getUserDeckStatisticsStatsDeckIdGet,
} from '@/gen';

export default function Decks() {
    const queryClient = useQueryClient();

    const {
        data: decks,
        isLoading: isDecksLoading,
        isError: isDecksError,
        error: decksError,
    } = useQuery({
        queryKey: ['decks'],
        queryFn: () => getDecksDecksGet(),
    });

    const {
        data: cards,
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
    } = useQuery({
        queryKey: ['cards'],
        queryFn: () => getCardsCardsGet({ query: { exclude_archived: true } }),
    });

    function prefetchCardHistory(cardId: string) {
        queryClient.prefetchQuery({
            queryKey: ['reviews', cardId],
            queryFn: () =>
                getReviewHistoryReviewsCardIdGet({ path: { card_id: cardId } }),
            staleTime: 5 * 60 * 1000,
        });
    }

    function prefetchDeckStatistics(deckId: string) {
        queryClient.prefetchQuery({
            queryKey: ['stats', deckId],
            queryFn: () =>
                getUserDeckStatisticsStatsDeckIdGet({
                    path: { deck_id: deckId },
                }),
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

    const [deckInspectDialogOpen, setDeckInspectDialogOpen] = useState(false);
    const [activeDeckIndex, setActiveDeckIndex] = useState(-1);
    const activeDeck = decks?.data?.[activeDeckIndex];

    function nextDeck() {
        if (decks?.data && activeDeckIndex < decks.data.length - 1) {
            setActiveDeckIndex((prev) => prev + 1);
        }
    }

    function prevDeck() {
        if (activeDeckIndex > 0) {
            setActiveDeckIndex((prev) => prev - 1);
        }
    }

    return (
        <div className="container mx-auto space-y-8 px-6 py-6">
            <div>
                <h1 className="mb-6 text-2xl font-medium">Decks</h1>

                {isDecksLoading && <p>Loading decks...</p>}
                {isDecksError && <p>{decksError.message}</p>}
                {!isDecksLoading && !isDecksError && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
                        <Card className="flex aspect-[3/4] flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <DeckCreationDialog
                                onSuccess={() =>
                                    queryClient.invalidateQueries({
                                        queryKey: ['decks'],
                                    })
                                }
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <Plus /> New
                                    </Button>
                                }
                            />
                        </Card>
                        {decks?.data &&
                            decks.data.length > 0 &&
                            decks.data.map((deck, deckIndex) => (
                                <Card
                                    key={deck.id}
                                    className="flex aspect-[3/4] cursor-pointer flex-col gap-2 p-4"
                                    onMouseEnter={() =>
                                        prefetchDeckStatistics(deck.id)
                                    }
                                    onClick={() => {
                                        setActiveDeckIndex(deckIndex);
                                        setDeckInspectDialogOpen(true);
                                    }}
                                >
                                    <CardHeader className="p-0">
                                        <h3 className="text-lg font-bold">
                                            {deck.name}
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <p className="text-sm text-neutral-600">
                                            {deck.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            <div>
                <h1 className="mb-6 text-2xl font-medium">Cards</h1>

                {isCardsLoading && <p>Loading cards...</p>}
                {isCardsError && <p>{cardsError.message}</p>}
                {!isCardsLoading && !isCardsError && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
                        <Card className="flex aspect-[3/4] flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <CardCreationDialog
                                onSuccess={() =>
                                    queryClient.invalidateQueries({
                                        queryKey: ['cards'],
                                    })
                                }
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <Plus /> New
                                    </Button>
                                }
                            />
                        </Card>
                        {cards?.data &&
                            cards.data.length > 0 &&
                            cards.data.map((card, cardIndex) => (
                                <Card
                                    key={card.id}
                                    className="flex aspect-[3/4] cursor-pointer flex-col gap-1 p-4"
                                    onMouseEnter={() =>
                                        prefetchCardHistory(card.id)
                                    }
                                    onClick={() => {
                                        setActiveCardIndex(cardIndex);
                                        setCardInspectDialogOpen(true);
                                    }}
                                >
                                    <CardHeader className="p-0">
                                        <p className="text-xs text-neutral-600">
                                            {decks?.data?.find(
                                                (deck) =>
                                                    deck.id === card.deck_id
                                            )?.name || '-'}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {card.content}
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
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
            {activeDeck && (
                <DeckInspectDialog
                    deck={activeDeck}
                    open={deckInspectDialogOpen}
                    onOpenChange={setDeckInspectDialogOpen}
                    onUpdateSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['decks'],
                        });
                    }}
                    onDeleteSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['decks'],
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['cards'],
                        });
                    }}
                    onNext={nextDeck}
                    onPrev={prevDeck}
                    hasNext={
                        decks.data && activeDeckIndex < decks.data.length - 1
                    }
                    hasPrev={activeDeckIndex !== 0}
                />
            )}
        </div>
    );
}
