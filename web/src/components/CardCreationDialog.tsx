import { useState } from 'react';
import { createCardCardsPost, CardCreate, DeckOut } from '@/gen';

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

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface CardCreationDialogProps {
    decks: DeckOut[];
    trigger: React.ReactNode;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function CardCreationDialog({
    decks,
    trigger,
    onSuccess,
    onError,
}: CardCreationDialogProps) {
    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

    const cardFormSchema = z.object({
        content: z.string().min(1, 'Card must have contents'),
        deck_id: z.string().min(1, 'Card must have a parent deck'),
    }) satisfies z.ZodType<CardCreate>;

    const cardForm = useForm<z.infer<typeof cardFormSchema>>({
        resolver: zodResolver(cardFormSchema),
        defaultValues: {
            content: '',
            deck_id: '',
        },
    });

    async function onCardCreate(values: z.infer<typeof cardFormSchema>) {
        try {
            await createCardCardsPost({
                body: {
                    content: values.content,
                    deck_id: values.deck_id,
                },
            });
            cardForm.reset();
            setIsCardDialogOpen(false);

            onSuccess?.();
        } catch (err: any) {
            const errorMessage = `There was an error creating card: ${err.detail ?? 'no details found'}`;
            onError?.(errorMessage);
        }
    }
    return (
        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create card</DialogTitle>
                </DialogHeader>
                <Form {...cardForm}>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={cardForm.handleSubmit(onCardCreate)}
                    >
                        <FormField
                            control={cardForm.control}
                            name="deck_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Select a Deck
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a deck" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>
                                                        Deck
                                                    </SelectLabel>
                                                </SelectGroup>
                                                {decks.map((deck) => (
                                                    <SelectItem
                                                        value={deck.id}
                                                        key={deck.id}
                                                    >
                                                        {deck.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={cardForm.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Content
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={`How are you?
---
Ça va?`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
