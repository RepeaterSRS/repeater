'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import {
    MoreVertical,
    Pencil,
    PencilOff,
    FileDown,
    Pause,
    Play,
    Archive,
    ArchiveRestore,
    Trash,
} from 'lucide-react';
import { env } from 'next-runtime-env';
import Link from 'next/link';
import { use } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import CardInspectDialog from '@/components/card-inspect-dialog';
import CardsGrid from '@/components/cards-grid';
import SaveFooter from '@/components/save-footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
    DeckOut,
    DeckUpdate,
    getDeckDecksDeckIdGet,
    getCardsCardsGet,
    getCategoryCategoriesCategoryIdGet,
    getUserDeckStatisticsStatsDeckIdGet,
    getReviewHistoryReviewsCardIdGet,
    getCategoriesCategoriesGet,
    updateDeckDecksDeckIdPatch,
    deleteDeckDecksDeckIdDelete,
} from '@/gen';
import { formatDateForDisplay } from '@/lib/utils';

export default function DeckPage({
    params,
}: {
    params: Promise<{ deck_id: string }>;
}) {
    const { deck_id } = use(params);
    const queryClient = useQueryClient();
    const apiUrl = env('NEXT_PUBLIC_API_URL');
    const [isEditing, setIsEditing] = useState(false);

    const {
        data: deck,
        isLoading: isDeckLoading,
        isError: isDeckError,
        error: deckError,
    } = useQuery({
        queryKey: ['decks', deck_id],
        queryFn: () => getDeckDecksDeckIdGet({ path: { deck_id: deck_id } }),
    });

    const {
        data: cards,
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
    } = useQuery({
        queryKey: ['cards', deck_id],
        queryFn: () =>
            getCardsCardsGet({
                query: { deck_id: deck_id },
            }),
    });

    const { data: category, isLoading: isCategoryLoading } = useQuery({
        queryKey: ['categories', deck?.data?.category_id],
        queryFn: () =>
            getCategoryCategoriesCategoryIdGet({
                path: { category_id: deck?.data?.category_id || '' },
            }),
        enabled: !!deck?.data?.category_id,
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['stats', deck_id],
        queryFn: () =>
            getUserDeckStatisticsStatsDeckIdGet({ path: { deck_id: deck_id } }),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategoriesCategoriesGet(),
    });

    function prefetchCardHistory(cardId: string) {
        queryClient.prefetchQuery({
            queryKey: ['reviews', cardId],
            queryFn: () =>
                getReviewHistoryReviewsCardIdGet({ path: { card_id: cardId } }),
            staleTime: 5 * 60 * 1000,
        });
    }

    const [cardInspectDialogOpen, setCardInspectDialogOpen] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(-1);
    const activeCard = cards?.data?.[activeCardIndex];

    function nextCard() {
        if (cards?.data && activeCardIndex < cards.data.length - 1) {
            setActiveCardIndex((prev) => prev + 1);
        }
    }

    function prevCard() {
        if (activeCardIndex > 0) {
            setActiveCardIndex((prev) => prev - 1);
        }
    }

    const updateDeckMutation = useMutation({
        mutationFn: (values: z.infer<typeof deckUpdateSchema>) =>
            updateDeckDecksDeckIdPatch({
                path: { deck_id: deck_id },
                body: values,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks', deck_id] });
            setIsEditing(false);
            // TODO: Add toast notification
        },
        onError: (error) => {
            // TODO: Add error handling/toast
            console.error('Failed to update deck:', error);
        },
    });

    const togglePauseDeckMutation = useMutation({
        mutationFn: (deck: DeckOut) =>
            updateDeckDecksDeckIdPatch({
                path: { deck_id: deck.id },
                body: { is_paused: !deck.is_paused },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks', deck_id] });
        },
    });

    const exportDeckMutation = useMutation({
        mutationFn: async (deck: DeckOut) => {
            // Use fetch client directly due to issue with hey-api
            // https://github.com/hey-api/openapi-ts/issues/804
            const response = await fetch(`${apiUrl}/decks/${deck.id}/export`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }

            const disposition = response.headers.get('Content-Disposition');
            const filenameMatch = disposition?.match(/filename="(.+)"/);
            const filename = filenameMatch?.[1] ?? 'deck.json';

            const blob = await response.blob();
            return { blob, filename };
        },
        onSuccess: ({ blob, filename }) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
    });

    const toggleArchiveDeckMutation = useMutation({
        mutationFn: (deck: DeckOut) =>
            updateDeckDecksDeckIdPatch({
                path: { deck_id: deck.id },
                body: { is_archived: !deck.is_archived },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks', deck_id] });
        },
    });

    const deleteDeckMutation = useMutation({
        mutationFn: (deck: DeckOut) =>
            deleteDeckDecksDeckIdDelete({ path: { deck_id: deck.id } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            window.location.href = '/decks';
        },
    });

    const deckUpdateSchema = z.object({
        name: z.string().min(1, 'Deck must have a name'),
        description: z.string().optional(),
        category_id: z.string().optional(),
    }) satisfies z.ZodType<DeckUpdate>;

    const deckForm = useForm<z.infer<typeof deckUpdateSchema>>({
        resolver: zodResolver(deckUpdateSchema),
        defaultValues: {
            name: deck?.data?.name || '',
            description: deck?.data?.description || '',
            category_id: deck?.data?.category_id || '',
        },
    });

    useEffect(() => {
        if (deck?.data) {
            deckForm.reset({
                name: deck.data.name,
                description: deck.data.description || '',
                category_id: deck.data.category_id || '',
            });
        }
    }, [deck?.data, deckForm]);

    function handleSave() {
        deckForm.handleSubmit((data) => {
            updateDeckMutation.mutate(data);
        })();
    }

    function handleCancel() {
        deckForm.reset();
        setIsEditing(false);
    }

    const {
        formState: { isDirty },
    } = deckForm;

    if (isDeckError) {
        return (
            <div className="container mx-auto px-6 py-6">
                <div className="mb-6">
                    <Link href="/decks">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Decks
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-medium">
                        Error Loading Deck
                    </h1>
                    <p className="text-destructive">{deckError.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-6">
            <Form {...deckForm}>
                <div className="mb-6">
                    {/* Back button */}
                    <div className="mb-4">
                        <Link href="/decks">
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Decks
                            </Button>
                        </Link>
                    </div>

                    {/* Title and dropdown menu */}
                    {isDeckLoading ? (
                        <div className="mb-6 space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ) : (
                        deck?.data && (
                            <div className="mb-6 space-y-2">
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <FormField
                                            control={deckForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="max-w-xs flex-1">
                                                    <FormControl>
                                                        <Input
                                                            autoFocus={true}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-bold">
                                            {deck.data.name}
                                        </h1>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Open menu
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side="right"
                                            align="start"
                                            className="w-48"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setIsEditing(!isEditing)
                                                }
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <PencilOff className="mr-2 h-4 w-4" />
                                                        Stop editing
                                                    </>
                                                ) : (
                                                    <>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    togglePauseDeckMutation.mutate(
                                                        deck.data
                                                    )
                                                }
                                            >
                                                {deck.data.is_paused ? (
                                                    <>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Resume
                                                    </>
                                                ) : (
                                                    <>
                                                        <Pause className="mr-2 h-4 w-4" />
                                                        Pause
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    exportDeckMutation.mutate(
                                                        deck.data
                                                    )
                                                }
                                            >
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Export
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    toggleArchiveDeckMutation.mutate(
                                                        deck.data
                                                    )
                                                }
                                            >
                                                {deck.data.is_archived ? (
                                                    <>
                                                        <ArchiveRestore className="mr-2 h-4 w-4" />
                                                        Unarchive
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        Archive
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    deleteDeckMutation.mutate(
                                                        deck.data
                                                    )
                                                }
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {isCategoryLoading ? (
                                    <Skeleton className="h-4 w-40" />
                                ) : isEditing ? (
                                    <FormField
                                        control={deckForm.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem className="max-w-xs flex-1">
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Category
                                                                </SelectLabel>
                                                            </SelectGroup>
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
                                                                        {category.path.join(
                                                                            ' / '
                                                                        )}
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
                                ) : (
                                    category?.data?.name && (
                                        <p className="text-muted-foreground text-sm">
                                            Category:{' '}
                                            {category.data.path.join(' / ')}
                                        </p>
                                    )
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left column - Description */}
                    <div className="lg:col-span-1">
                        <h2 className="mb-4 text-xl font-semibold">
                            Description
                        </h2>
                        {isDeckLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : isEditing ? (
                            <FormField
                                control={deckForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Enter deck description..."
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="prose prose-neutral max-w-none">
                                {deck?.data?.description ? (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {deck.data.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        No description provided
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right column - Statistics */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-4 text-xl font-semibold">
                            Statistics
                        </h2>
                        {isStatsLoading ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="p-4">
                                        <Skeleton className="mb-2 h-4 w-16" />
                                        <Skeleton className="h-8 w-12" />
                                    </Card>
                                ))}
                            </div>
                        ) : stats?.data ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <Card className="p-4">
                                    <p className="text-muted-foreground mb-1 text-sm">
                                        Last studied
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.data.last_studied
                                            ? formatDateForDisplay(
                                                  stats.data.last_studied
                                              )
                                            : 'No data'}
                                    </p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-muted-foreground mb-1 text-sm">
                                        Retention rate
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.data.retention_rate}
                                    </p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-muted-foreground mb-1 text-sm">
                                        Total reviews
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.data.total_reviews}
                                    </p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-muted-foreground mb-1 text-sm">
                                        Difficulty
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.data.difficulty_ranking}
                                    </p>
                                </Card>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No statistics available
                            </p>
                        )}
                    </div>
                </div>

                {/* Save Footer */}
                {isEditing && (
                    <SaveFooter
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={updateDeckMutation.isPending}
                        isDirty={isDirty}
                    />
                )}
            </Form>
            <div>
                <h1 className="mb-6 text-2xl font-medium">Cards</h1>
                <CardsGrid
                    cards={cards?.data}
                    isLoading={isCardsLoading}
                    isError={isCardsError}
                    error={cardsError}
                    onCardClick={(cardIndex) => {
                        setActiveCardIndex(cardIndex);
                        setCardInspectDialogOpen(true);
                    }}
                    onCardMouseEnter={(cardId) => {
                        prefetchCardHistory(cardId);
                    }}
                    onCardCreated={() => {
                        queryClient.invalidateQueries({ queryKey: ['cards'] });
                    }}
                    defaultDeckId={deck_id}
                />
            </div>

            {activeCard && (
                <CardInspectDialog
                    card={activeCard}
                    open={cardInspectDialogOpen}
                    onOpenChange={setCardInspectDialogOpen}
                    onUpdateSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['cards'],
                        });
                    }}
                    onDeleteSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['cards'],
                        });
                    }}
                    onNext={nextCard}
                    onPrev={prevCard}
                    hasNext={
                        cards.data && activeCardIndex < cards.data.length - 1
                    }
                    hasPrev={activeCardIndex !== 0}
                />
            )}
        </div>
    );
}
