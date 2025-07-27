import { DeckStatistics } from '@/gen';
import { formatDateForDisplay } from '@/lib/utils';

interface Props {
    deckStats: DeckStatistics;
}

export default function DeckStatisticsPanel({ deckStats }: Props) {
    return (
        <div className="grid grid-cols-2 gap-y-4">
            <div>
                <p className="text-foreground text-sm font-medium">
                    Last studied
                </p>
                <p className="text-muted-foreground text-sm">
                    {deckStats.last_studied
                        ? formatDateForDisplay(deckStats.last_studied)
                        : 'No data'}
                </p>
            </div>
            <div>
                <p className="text-foreground text-sm font-medium">
                    Retention Rate
                </p>
                <p className="text-muted-foreground text-sm">
                    {deckStats.retention_rate}
                </p>
            </div>
            <div>
                <p className="text-foreground text-sm font-medium">
                    Total Reviews
                </p>
                <p className="text-muted-foreground text-sm">
                    {deckStats.total_reviews}
                </p>
            </div>
            <div>
                <p className="text-foreground text-sm font-medium">
                    Difficulty
                </p>
                <p className="text-muted-foreground text-sm">
                    {deckStats.difficulty_ranking}
                </p>
            </div>
        </div>
    );
}
