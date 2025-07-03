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

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

    const deckFormSchema = z.object({
        name: z.string().min(1, 'Deck name required').max(50),
        description: z.string().optional(),
    }) satisfies z.ZodType<DeckCreate>;

    const deckForm = useForm<z.infer<typeof deckFormSchema>>({
        resolver: zodResolver(deckFormSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    async function onDeckCreate(values: z.infer<typeof deckFormSchema>) {
        try {
            await createDeckDecksPost({
                body: {
                    name: values.name,
                    description: values.description,
                },
            });
            fetchDecks();
            deckForm.reset();
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
                                    <p className="text-sm text-neutral-700">
                                        {deck.description}
                                    </p>
                                </Card>
                            ))}
                        <Card className="flex aspect-[3/4] w-34 flex-col items-center justify-center border-2 border-dashed shadow-none">
                            {/* TODO: break out deck creation into separate component  */}
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
                                    <Form {...deckForm}>
                                        <form
                                            className="flex flex-col gap-4"
                                            onSubmit={deckForm.handleSubmit(
                                                onDeckCreate
                                            )}
                                        >
                                            <FormField
                                                control={deckForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">
                                                            Deck name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                placeholder="Deck name"
                                                                className="w-32"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={deckForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">
                                                            Description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Description"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                    >
                                                        Close
                                                    </Button>
                                                </DialogClose>
                                                <Button type="submit">
                                                    Create
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
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
                            <Button variant="outline" disabled>
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
