'use client';

import { getDecksDecksGet, DeckOut, getCardsCardsGet, CardOut } from '@/gen';
import { useEffect, useState } from 'react';

export default function Cards() {
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
        <div>
            <div>
                <h2>Decks</h2>
                {decksState.loading && <p>Loading decks...</p>}
                {decksState.error && <p>{decksState.error}</p>}
                {!decksState.loading &&
                    !decksState.error &&
                    decksState.data.length === 0 && <p>No decks found</p>}
                {!decksState.loading &&
                    !decksState.error &&
                    decksState.data.length > 0 &&
                    decksState.data.map((deck) => (
                        <p key={deck.id}>{deck.name}</p>
                    ))}
            </div>
            <div>
                <h2>Cards</h2>

                {cardsState.loading && <p>Loading cards...</p>}
                {cardsState.error && <p>{cardsState.error}</p>}
                {!cardsState.loading &&
                    !cardsState.error &&
                    cardsState.data.length === 0 && <p>No cards found</p>}
                {!cardsState.loading &&
                    !cardsState.error &&
                    cardsState.data.length > 0 &&
                    cardsState.data.map((card) => (
                        <p key={card.id}>{card.content}</p>
                    ))}
            </div>
        </div>
    );
}
