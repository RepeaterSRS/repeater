import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type HeatmapData = {
    [key: string]: {
        date: string;
        numberOfReviews: number;
    };
};

interface Props {
    className?: string;
    heatmapData: HeatmapData;
}

export function ActivityHeatmap({ className, heatmapData }: Props) {
    const weeks = [];
    const endDate = new Date();
    const startDate = new Date();
    const startMonth = startDate.getMonth();
    startDate.setDate(endDate.getDate() - 363);

    for (let i = 0; i < 52; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (i * 7 + j));

            const dateKey = currentDate.toISOString().split('T')[0];
            const activityData = heatmapData[dateKey];

            week.push(
                activityData || {
                    date: dateKey,
                    numberOfReviews: 0,
                }
            );
        }
        weeks.push(week);
    }

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    // Rotating the months array to make the current month the first in the array
    function rotateArray(array: string[], n: number) {
        n = n % array.length;
        return array.slice(n, array.length).concat(array.slice(0, n));
    }

    function getIntensity(numberOfReviews: number) {
        return numberOfReviews === 0
            ? 0
            : Math.min(Math.floor(numberOfReviews / 10) + 1, 4);
    }

    function getHeatmapColor(intensity: number) {
        const colorClasses = [
            'bg-heatmap-0',
            'bg-heatmap-1',
            'bg-heatmap-2',
            'bg-heatmap-3',
            'bg-heatmap-4',
        ];
        return colorClasses[intensity];
    }

    function formatDateForDisplay(dateString: string): string {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Activity</CardTitle>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <span>Less</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`border-border h-3 w-3 rounded-sm border ${getHeatmapColor(level)}`}
                                />
                            ))}
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        <div className="flex max-lg:gap-1 lg:justify-evenly">
                            {weeks.map((week, weekIndex) => (
                                // TODO: fix the alignment between month labels and actual dates
                                <div
                                    key={weekIndex}
                                    className="flex flex-col gap-1"
                                >
                                    {week.map((day, dayIndex) => (
                                        <Tooltip
                                            key={`${weekIndex}-${dayIndex}`}
                                        >
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`hover:border-foreground relative h-3 w-3 rounded-sm border transition-colors before:absolute before:-inset-1 before:content-[''] ${
                                                        day
                                                            ? getHeatmapColor(
                                                                  getIntensity(
                                                                      day.numberOfReviews
                                                                  )
                                                              )
                                                            : 'bg-heatmap-0'
                                                    }`}
                                                    title={
                                                        day
                                                            ? `${formatDateForDisplay(day.date)}: ${day.numberOfReviews} reviews`
                                                            : ''
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {`${day.numberOfReviews || 'No'} reviews on ${formatDateForDisplay(day.date)}`}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            {rotateArray(months, startMonth).map(
                                (month, monthIndex) => (
                                    <div
                                        key={`${month}-${monthIndex}`}
                                        className="text-muted-foreground text-sm"
                                    >
                                        {month}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
