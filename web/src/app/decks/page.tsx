'use client';

import { getDecksDecksGet, DeckOut, getCardsCardsGet, CardOut } from '@/gen';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import DeckCreationDialog from '@/components/DeckCreationDialog';
import CardCreationDialog from '@/components/CardCreationDialog';

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
        <div className="flex flex-col gap-4 px-8 py-4">
            <div>
                <h1 className="mb-2 text-2xl">Decks</h1>

                {decksState.loading && <p>Loading decks...</p>}
                {decksState.error && <p>{decksState.error}</p>}
                {!decksState.loading && !decksState.error && (
                    <div className="flex flex-row flex-wrap gap-4">
                        {decksState.data.length > 0 &&
                            decksState.data.map((deck) => (
                                <Card
                                    key={deck.id}
                                    className="flex aspect-[3/4] w-34 flex-col p-4"
                                >
                                    <p className="text-lg font-bold">
                                        {deck.name}
                                    </p>
                                    <p className="text-sm text-neutral-700">
                                        {deck.description}
                                    </p>
                                </Card>
                            ))}
                        <Card className="flex aspect-[3/4] w-34 flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <DeckCreationDialog
                                onSuccess={fetchDecks}
                                trigger={
                                    <Button variant="outline">
                                        <Plus /> New
                                    </Button>
                                }
                            ></DeckCreationDialog>
                        </Card>
                    </div>
                )}
            </div>

            <div>
                <h1 className="mb-2 text-2xl">Cards</h1>

                {cardsState.loading && <p>Loading cards...</p>}
                {cardsState.error && <p>{cardsState.error}</p>}
                {!cardsState.loading && !cardsState.error && (
                    <div className="flex flex-row gap-4">
                        {cardsState.data.length > 0 &&
                            cardsState.data.map((card) => (
                                <Card
                                    key={card.id}
                                    className="flex aspect-[3/4] w-34 flex-col items-center justify-center"
                                ></Card>
                            ))}
                        <Card className="flex aspect-[3/4] w-34 flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <CardCreationDialog
                                decks={decksState.data}
                                onSuccess={fetchCards}
                                trigger={
                                    <Button variant="outline">
                                        <Plus /> Add
                                    </Button>
                                }
                            ></CardCreationDialog>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
