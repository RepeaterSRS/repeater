import { useState } from 'react';
import { createDeckDecksPost, DeckCreate } from '@/gen';

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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface DeckCreationDialogProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function DeckCreationDialog({
    trigger,
    onSuccess,
    onError,
}: DeckCreationDialogProps) {
    const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);

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
            deckForm.reset();
            setIsDeckDialogOpen(false);

            onSuccess?.();
        } catch (err: any) {
            const errorMessage = `There was an error creating deck: ${err.detail ?? 'no details found'}`;
            onError?.(errorMessage);
        }
    }
    return (
        <Dialog open={isDeckDialogOpen} onOpenChange={setIsDeckDialogOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create deck</DialogTitle>
                </DialogHeader>
                <Form {...deckForm}>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={deckForm.handleSubmit(onDeckCreate)}
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
