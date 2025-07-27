import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Kbd from '@/components/Kbd';
import { useShortcutActions } from '@/components/ShortcutProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    DeckOut,
    DeckUpdate,
    deleteDeckDecksDeckIdDelete,
    updateDeckDecksDeckIdPatch,
    getCategoriesCategoriesGet,
    getUserDeckStatisticsStatsDeckIdGet,
} from '@/gen';
import { usePageShortcuts } from '@/hooks/use-shortcuts';
import { createActions, getShortcut } from '@/lib/shortcuts';
import { formatDateForDisplay } from '@/lib/utils';

import DeckStatisticsPanel from './DeckStatisticsPanel';

interface DeckInspectDialogProps {
    deck: DeckOut;
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

export default function DeckInspectDialog({
    deck,
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
}: DeckInspectDialogProps) {
    usePageShortcuts('decks');
    const { registerAction, unregisterAction } = useShortcutActions();

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open ?? internalOpen;
    const setIsOpen = onOpenChange ?? setInternalOpen;

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategoriesCategoriesGet(),
    });

    const {
        data: deckStatistics,
        isLoading: deckStatisticsPending,
        isError: deckStatisticsError,
    } = useQuery({
        queryKey: ['stats', deck.id],
        queryFn: () =>
            getUserDeckStatisticsStatsDeckIdGet({ path: { deck_id: deck.id } }),
        staleTime: 5 * 60 * 1000,
    });

    const deleteDeckMutation = useMutation({
        mutationFn: () =>
            deleteDeckDecksDeckIdDelete({ path: { deck_id: deck.id } }),
        onSuccess: () => {
            deckForm.reset();
            setIsOpen(false);
            onDeleteSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error deleting deck: ${(err as Error)?.message ?? 'no details found'}`;
            onDeleteError?.(errorMessage);
        },
    });

    const updateDeckMutation = useMutation({
        mutationFn: (values: z.infer<typeof deckFormSchema>) =>
            updateDeckDecksDeckIdPatch({
                path: { deck_id: deck.id },
                body: values,
            }),
        onSuccess: () => {
            deckForm.reset({ ...deck });
            setIsOpen(false);
            onUpdateSuccess?.();
            // TODO toast?
        },
        onError: (err: unknown) => {
            const errorMessage = `There was an error updating deck: ${(err as Error)?.message ?? 'no details found'}`;
            onUpdateError?.(errorMessage);
        },
    });

    const deckFormSchema = z.object({
        name: z.string().min(1, 'Card must have a name'),
        description: z.string(),
        category_id: z.string().nullable(),
        is_paused: z.boolean(),
        is_archived: z.boolean(),
    }) satisfies z.ZodType<DeckUpdate>;

    const deckForm = useForm<z.infer<typeof deckFormSchema>>({
        resolver: zodResolver(deckFormSchema),
        defaultValues: { ...deck },
    });

    useEffect(() => {
        deckForm.reset({ ...deck });
    }, [deck, deckForm]);

    const {
        formState: { isDirty },
    } = deckForm;

    useEffect(() => {
        const actions = createActions({
            'deck-prev': () => onPrev?.(),
            'deck-next': () => onNext?.(),
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
                className="flex max-h-[90vh] min-w-2xl flex-col"
                showCloseButton={false}
            >
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Inspect Deck</DialogTitle>
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
                                            getShortcut('deck-prev', 'decks')
                                                .description
                                        }
                                        <Kbd
                                            action="deck-prev"
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
                                            getShortcut('deck-next', 'decks')
                                                .description
                                        }
                                        <Kbd
                                            action="deck-next"
                                            scope="decks"
                                            className="ml-2"
                                        />
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left side - Content */}
                        <div className="lg:col-span-2">
                            <Form {...deckForm}>
                                <form
                                    className="flex h-full flex-col gap-4"
                                    onSubmit={deckForm.handleSubmit((data) =>
                                        updateDeckMutation.mutate(data)
                                    )}
                                >
                                    <FormField
                                        control={deckForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">
                                                    Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter deck name"
                                                        autoFocus={true}
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
                                            <FormItem className="flex-1">
                                                <FormLabel className="font-semibold">
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="h-64 resize-none"
                                                        placeholder="Enter deck description"
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

                        {/* Right side - Metadata and Settings */}
                        <div className="flex flex-col gap-6">
                            {/* Metadata */}
                            <div className="space-y-4">
                                <Form {...deckForm}>
                                    <FormField
                                        control={deckForm.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">
                                                    Category
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={
                                                            field.value ||
                                                            'none'
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value === 'none'
                                                                    ? null
                                                                    : value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Categories
                                                                </SelectLabel>
                                                            </SelectGroup>
                                                            <SelectItem value="none">
                                                                No category
                                                            </SelectItem>
                                                            {categories?.data?.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        value={
                                                                            category.id
                                                                        }
                                                                        key={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
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
                                    <FormField
                                        control={deckForm.control}
                                        name="is_paused"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base font-semibold">
                                                        Paused
                                                    </FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={deckForm.control}
                                        name="is_archived"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base font-semibold">
                                                        Archived
                                                    </FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </Form>

                                <div className="text-muted-foreground space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium">
                                            Created:
                                        </span>{' '}
                                        {formatDateForDisplay(deck.created_at)}
                                    </p>
                                </div>

                                {/* Deck Statistics */}
                                <div className="min-h-0 flex-1">
                                    <h4 className="mb-2 font-semibold">
                                        Statistics
                                    </h4>
                                    {deckStatisticsPending && (
                                        <div>Loading statistics...</div>
                                    )}
                                    {deckStatisticsError && (
                                        <div>Failed to load statistics</div>
                                    )}
                                    {!deckStatisticsPending &&
                                        !deckStatisticsError &&
                                        deckStatistics?.data && (
                                            <DeckStatisticsPanel
                                                deckStats={deckStatistics.data}
                                            />
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        onClick={() => {
                            deleteDeckMutation.mutate();
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
                        onClick={deckForm.handleSubmit((data) =>
                            updateDeckMutation.mutate(data)
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
