import { Check, X, SkipForward } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ReviewOut } from '@/gen';
import { formatDateForDisplay } from '@/lib/utils';

interface Props {
    reviews: ReviewOut[];
}

export default function ReviewHistory({ reviews }: Props) {
    return (
        <ScrollArea className="h-48">
            {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet</p>
            ) : (
                <div className="space-y-1">
                    {reviews
                        .sort(
                            (a, b) =>
                                new Date(b.reviewed_at).getTime() -
                                new Date(a.reviewed_at).getTime()
                        )
                        .map((review) => {
                            const Icon = review.succeeded
                                ? Check
                                : review.failed
                                  ? X
                                  : SkipForward;

                            const iconColor = review.succeeded
                                ? 'text-green-600'
                                : review.failed
                                  ? 'text-red-600'
                                  : 'text-amber-600';

                            return (
                                <div
                                    key={review.id}
                                    className="hover:bg-muted/30 flex items-center gap-3 rounded-sm px-1 py-2 transition-colors"
                                >
                                    <Icon
                                        className={`h-4 w-4 ${iconColor} flex-shrink-0`}
                                    />
                                    <span className="text-muted-foreground flex-1 text-sm">
                                        {formatDateForDisplay(
                                            review.reviewed_at
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            )}
        </ScrollArea>
    );
}
