'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import CardCreationDialog from '@/components/CardCreationDialog';
import DeckCreationDialog from '@/components/DeckCreationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getDecksDecksGet, DeckOut, getCardsCardsGet, CardOut } from '@/gen';

export default function Decks() {
    const [decksState, setDecksState] = useState({
        data: [] as DeckOut[],
        loading: true,
        error: null as string | null,
    });

    const [cardsState, setCardsState] = useState({
        data: [] as CardOut[],
        loading: true,
        error: null as string | null,
    });

    useEffect(() => {
        fetchDecks();
        fetchCards();
    }, []);

    async function fetchDecks() {
        try {
            setDecksState((prev) => ({ ...prev, error: null }));
            const response = await getDecksDecksGet();
            setDecksState((prev) => ({
                ...prev,
                data: response.data || [],
                loading: false,
            }));
        } catch {
            setDecksState({
                data: [],
                loading: false,
                error: 'There was an error while fetching decks',
            });
        }
    }

    async function fetchCards() {
        try {
            setCardsState((prev) => ({ ...prev, error: null }));
            const response = await getCardsCardsGet();
            setCardsState((prev) => ({
                ...prev,
                data: response.data || [],
                loading: false,
            }));
        } catch {
            setCardsState({
                data: [],
                loading: false,
                error: 'There was an error while fetching cards',
            });
        }
    }

    return (
        <div className="container mx-auto space-y-8 px-6 py-6">
            <div>
                <h1 className="mb-6 text-2xl font-medium">Decks</h1>

                {decksState.loading && <p>Loading decks...</p>}
                {decksState.error && <p>{decksState.error}</p>}
                {!decksState.loading && !decksState.error && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
                        <Card className="flex aspect-[3/4] flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <DeckCreationDialog
                                onSuccess={fetchDecks}
                                trigger={
                                    <Button variant="outline">
                                        <Plus /> New
                                    </Button>
                                }
                            ></DeckCreationDialog>
                        </Card>
                        {decksState.data.length > 0 &&
                            decksState.data.map((deck) => (
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

                {cardsState.loading && <p>Loading cards...</p>}
                {cardsState.error && <p>{cardsState.error}</p>}
                {!cardsState.loading && !cardsState.error && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
                        <Card className="flex aspect-[3/4] flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <CardCreationDialog
                                decks={decksState.data}
                                onSuccess={fetchCards}
                                trigger={
                                    <Button variant="outline">
                                        <Plus /> New
                                    </Button>
                                }
                            ></CardCreationDialog>
                        </Card>
                        {cardsState.data.length > 0 &&
                            cardsState.data.map((card) => (
                                <Card
                                    key={card.id}
                                    className="flex aspect-[3/4] flex-col gap-1 p-4"
                                >
                                    <CardHeader className="p-0">
                                        <p className="text-xs text-neutral-600">
                                            {decksState.data.find(
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
