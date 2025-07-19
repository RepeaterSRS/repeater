'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import CardCreationDialog from '@/components/CardCreationDialog';
import DeckCreationDialog from '@/components/DeckCreationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getDecksDecksGet, getCardsCardsGet } from '@/gen';

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
        queryFn: () => getCardsCardsGet(),
    });

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
                            ></DeckCreationDialog>
                        </Card>
                        {decks?.data &&
                            decks.data.length > 0 &&
                            decks.data.map((deck) => (
                                <Card
                                    key={deck.id}
                                    className="flex aspect-[3/4] flex-col gap-2 p-4"
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
                                decks={decks?.data || []}
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
                            ></CardCreationDialog>
                        </Card>
                        {cards?.data &&
                            cards.data.length > 0 &&
                            cards.data.map((card) => (
                                <Card
                                    key={card.id}
                                    className="flex aspect-[3/4] flex-col gap-1 p-4"
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
        </div>
    );
}
