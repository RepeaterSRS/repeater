'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import CardInspectDialog from '@/components/card-inspect-dialog';
import CardsGrid from '@/components/cards-grid';
import DecksGrid from '@/components/decks-grid';
import {
    getDecksDecksGet,
    getCardsCardsGet,
    getReviewHistoryReviewsCardIdGet,
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

    return (
        <div className="container mx-auto space-y-8 px-6 py-6">
            <h1 className="mb-6 text-2xl font-medium">Decks</h1>
            <div>
                <DecksGrid
                    decks={decks?.data}
                    isLoading={isDecksLoading}
                    isError={isDecksError}
                    error={decksError}
                    onDeckClick={(deckId) => {
                        window.location.href = `/decks/${deckId}`;
                    }}
                    onDeckCreated={() => {
                        queryClient.invalidateQueries({ queryKey: ['decks'] });
                    }}
                    showCreateButton={true}
                />
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
                    showCreateButton={true}
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
