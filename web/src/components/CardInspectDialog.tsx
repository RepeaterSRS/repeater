import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import ReviewHistory from './ReviewHistory';
import { getDecksDecksGet, getReviewHistoryReviewsCardIdGet, CardOut, deleteCardCardsCardIdDelete, updateCardCardsCardIdPatch } from '@/gen';
import { formatDateForDisplay } from '@/lib/utils';

interface CardInspectDialogProps {
    card: CardOut;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onUpdateError?: (error: string) => void;
    onDeleteError?: (error: string) => void;
}

export default function CardInspectDialog({
    card,
    trigger,
    open,
    onOpenChange,
    onUpdateSuccess,
    onDeleteSuccess,
    onUpdateError,
    onDeleteError,
}: CardInspectDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = open ?? internalOpen;
    const setIsOpen = onOpenChange ?? setInternalOpen;

    const { data: decks } = useQuery({
        queryKey: ['decks'],
        queryFn: () => getDecksDecksGet(),
    });

    const {
        data: reviewHistory,
        isLoading: reviewHistoryLoading,
        isError: reviewHistoryError,
    } = useQuery({
        queryKey: ['reviews', card.id],
        queryFn: () => getReviewHistoryReviewsCardIdGet({path: {card_id: card.id}}),
    });

    const deleteCardMutation = useMutation({
        mutationFn: () =>
            deleteCardCardsCardIdDelete({path: {card_id: card.id}}),
        onSuccess: () => {
            cardForm.reset();
            setIsOpen(false);
            onDeleteSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error deleting card: ${(err as Error)?.message ?? 'no details found'}`;
            onDeleteError?.(errorMessage);
        }
    });


    const updateCardMutation = useMutation({
        mutationFn: (values: z.infer<typeof cardFormSchema>) =>
            updateCardCardsCardIdPatch({
                path: {card_id: card.id},
                body: values,
            }),
        onSuccess: () => {
            cardForm.reset();
            setIsOpen(false);
            onUpdateSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error updating card: ${(err as Error)?.message ?? 'no details found'}`;
            onUpdateError?.(errorMessage);
        }
    });


    const cardFormSchema = z.object({
        content: z.string().min(1, 'Card must have contents'),
        deck_id: z.string().min(1, 'Card must have a parent deck'),
    });

    const cardForm = useForm<z.infer<typeof cardFormSchema>>({
        resolver: zodResolver(cardFormSchema),
        defaultValues: {
            content: card.content,
            deck_id: card.deck_id,
        },
    });

    const {
        formState: { isDirty },
    } = cardForm;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className='min-w-2xl max-h-[90vh]'>
                <DialogHeader>
                    <DialogTitle>Inspect Card</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
                    {/* Left side - Content */}
                    <div className="lg:col-span-2">
                        <Form {...cardForm}>
                            <form
                                className="flex h-full flex-col gap-4"
                                onSubmit={cardForm.handleSubmit((data) => 
                                    updateCardMutation.mutate(data)
                                )}
                            >
                                <FormField
                                    control={cardForm.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Textarea
                                                    className="h-96 resize-none"
                                                    placeholder={`How are you? --- Ça va?`}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>

                    {/* Right side - Metadata and History */}
                    <div className="flex flex-col gap-6">
                        {/* Metadata */}
                        <div className="space-y-4">
                            <Form {...cardForm}>
                                <FormField
                                    control={cardForm.control}
                                    name="deck_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Deck
                                            </FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
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
                                                        {decks?.data?.map(
                                                            (deck) => (
                                                                <SelectItem
                                                                    value={
                                                                        deck.id
                                                                    }
                                                                    key={
                                                                        deck.id
                                                                    }
                                                                >
                                                                    {deck.name}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </Form>

                            <div className="text-muted-foreground space-y-1 text-sm">
                                <p>
                                    <span className="font-medium">
                                        Created:
                                    </span>{' '}
                                    {formatDateForDisplay(card.created_at)}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Next review:
                                    </span>{' '}
                                    {formatDateForDisplay(card.next_review_date)}
                                </p>
                            </div>
                        </div>

                        {/* Review History */}
                        <div className="min-h-0 flex-1">
                            <h4 className="mb-2 font-semibold">
                                Review History
                            </h4>
                            {reviewHistoryLoading && (
                                <div>
                                    Loading reviews...
                                </div>
                            )}
                            {reviewHistoryError && (
                                <div>
                                    Failed to load reviews
                                </div>
                            )}
                            {!reviewHistoryLoading && !reviewHistoryError && reviewHistory?.data && 
                                <ReviewHistory reviews={reviewHistory.data} />}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button onClick={() => {
                            deleteCardMutation.mutate()
                            }}
                            type="button"
                            variant="destructive">
                        Delete
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={cardForm.handleSubmit((data) =>
                            updateCardMutation.mutate(data)
                        )}
                        disabled={!isDirty}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
