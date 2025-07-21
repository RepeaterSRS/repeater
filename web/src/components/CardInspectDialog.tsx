import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Kbd from '@/components/Kbd';
import { useShortcutActions } from '@/components/ShortcutProvider';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getDecksDecksGet,
    getReviewHistoryReviewsCardIdGet,
    CardOut,
    deleteCardCardsCardIdDelete,
    updateCardCardsCardIdPatch,
} from '@/gen';
import { usePageShortcuts } from '@/hooks/use-shortcuts';
import { createActions, getShortcut } from '@/lib/shortcuts';
import { formatDateForDisplay } from '@/lib/utils';

import ReviewHistory from './ReviewHistory';

interface CardInspectDialogProps {
    card: CardOut;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onUpdateError?: (error: string) => void;
    onDeleteError?: (error: string) => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
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
    onNext,
    onPrev,
    hasNext,
    hasPrev,
}: CardInspectDialogProps) {
    usePageShortcuts('decks');
    const { registerAction, unregisterAction } = useShortcutActions();

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
        queryFn: () =>
            getReviewHistoryReviewsCardIdGet({ path: { card_id: card.id } }),
        staleTime: 5 * 60 * 1000,
    });

    const deleteCardMutation = useMutation({
        mutationFn: () =>
            deleteCardCardsCardIdDelete({ path: { card_id: card.id } }),
        onSuccess: () => {
            cardForm.reset();
            setIsOpen(false);
            onDeleteSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error deleting card: ${(err as Error)?.message ?? 'no details found'}`;
            onDeleteError?.(errorMessage);
        },
    });

    const updateCardMutation = useMutation({
        mutationFn: (values: z.infer<typeof cardFormSchema>) =>
            updateCardCardsCardIdPatch({
                path: { card_id: card.id },
                body: values,
            }),
        onSuccess: () => {
            cardForm.reset({
                content: card.content,
                deck_id: card.deck_id,
            });
            setIsOpen(false);
            onUpdateSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error updating card: ${(err as Error)?.message ?? 'no details found'}`;
            onUpdateError?.(errorMessage);
        },
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

    useEffect(() => {
        cardForm.reset({
            content: card.content,
            deck_id: card.deck_id,
        });
    }, [card, cardForm]);

    const {
        formState: { isDirty },
    } = cardForm;

    useEffect(() => {
        const actions = createActions({
            'card-prev': () => onPrev?.(),
            'card-next': () => onNext?.(),
        });

        Object.entries(actions).forEach(([action, handler]) => {
            registerAction(action, handler);
        });

        return () => {
            Object.keys(actions).forEach((action) => {
                unregisterAction(action);
            });
        };
    }, [onNext, onPrev, registerAction, unregisterAction]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className="max-h-[90vh] min-w-2xl"
                showCloseButton={false}
            >
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Inspect Card</DialogTitle>
                        <div className="flex gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onPrev}
                                        disabled={!hasPrev}
                                    >
                                        <ChevronLeft />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>
                                        {
                                            getShortcut('card-prev', 'decks')
                                                .description
                                        }
                                        <Kbd
                                            action="card-prev"
                                            scope="decks"
                                            className="ml-2"
                                        />
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onNext}
                                        disabled={!hasNext}
                                    >
                                        <ChevronRight />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>
                                        {
                                            getShortcut('card-next', 'decks')
                                                .description
                                        }
                                        <Kbd
                                            action="card-next"
                                            scope="decks"
                                            className="ml-2"
                                        />
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
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
                                                    autoFocus={true}
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
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
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
                                    {formatDateForDisplay(
                                        card.next_review_date
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Review History */}
                        <div className="min-h-0 flex-1">
                            <h4 className="mb-2 font-semibold">
                                Review History
                            </h4>
                            {reviewHistoryLoading && (
                                <div>Loading reviews...</div>
                            )}
                            {reviewHistoryError && (
                                <div>Failed to load reviews</div>
                            )}
                            {!reviewHistoryLoading &&
                                !reviewHistoryError &&
                                reviewHistory?.data && (
                                    <ReviewHistory
                                        reviews={reviewHistory.data}
                                    />
                                )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        onClick={() => {
                            deleteCardMutation.mutate();
                        }}
                        type="button"
                        variant="destructive"
                    >
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
                        disabled={!isDirty}
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
