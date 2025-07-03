'use client';

import {
    getDecksDecksGet,
    DeckOut,
    getCardsCardsGet,
    CardOut,
    createDeckDecksPost,
    DeckCreate,
} from '@/gen';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

    const [deckCreationState, setDeckCreationState] = useState({
        name: '',
        description: '',
    });

    const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);

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

    async function onDeckCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createDeckDecksPost({
                body: {
                    name: deckCreationState.name,
                    description: deckCreationState.description,
                },
            });
            fetchDecks();
            setDeckCreationState({ name: '', description: '' });
            setIsDeckDialogOpen(false);
        } catch (err: any) {
            console.error(
                'There was an error creating deck: ',
                err.detail ?? 'no details found'
            );
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
                                    <p className="text-neutral-700">
                                        {deck.description}
                                    </p>
                                </Card>
                            ))}
                        <Card className="flex aspect-[3/4] w-34 flex-col items-center justify-center border-2 border-dashed shadow-none">
                            <Dialog
                                open={isDeckDialogOpen}
                                onOpenChange={setIsDeckDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Plus />
                                        Create
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create deck</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={onDeckCreate}>
                                        <Input
                                            type="text"
                                            placeholder="Deck name"
                                            value={deckCreationState.name}
                                            onChange={(e) =>
                                                setDeckCreationState(
                                                    (prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    })
                                                )
                                            }
                                        ></Input>
                                        <Input
                                            type="text"
                                            placeholder="Description"
                                            value={
                                                deckCreationState.description
                                            }
                                            onChange={(e) =>
                                                setDeckCreationState(
                                                    (prev) => ({
                                                        ...prev,
                                                        description:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                        ></Input>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    setIsDeckDialogOpen(false)
                                                }
                                            >
                                                Close
                                            </Button>
                                            <Button type="submit">
                                                Create
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
                            <Button variant="outline">
                                <Plus />
                                Create
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
