import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateForDisplay } from '@/lib/utils';

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
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);

    const currentDate = new Date(startDate);
    let currentWeek = [];

    while (currentDate <= today) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const activityData = heatmapData[dateKey];

        currentWeek.push(
            activityData || {
                date: dateKey,
                numberOfReviews: 0,
            }
        );

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
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

    const monthLabels = [];
    let prevMonth = -1;
    for (let i = 0; i < weeks.length; i++) {
        for (let j = 0; j < weeks[i].length; j++) {
            const date = new Date(weeks[i][j].date);
            const month = date.getMonth();
            if (month !== prevMonth) {
                prevMonth = month;
                monthLabels.push({
                    month: months[date.getMonth()],
                    offset: i * weeks[i].length + j,
                });
            }
        }
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
                                    className={`h-3 w-3 rounded-sm ${getHeatmapColor(level)}`}
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
                        {/* Heatmap grid */}
                        <div className="flex max-lg:gap-1 lg:justify-evenly">
                            {weeks.map((week, weekIndex) => (
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
                                                    className={`hover:border-foreground relative h-3 w-3 rounded-sm border border-transparent transition-colors before:absolute before:-inset-1 before:content-[''] ${
                                                        day
                                                            ? getHeatmapColor(
                                                                  getIntensity(
                                                                      day.numberOfReviews
                                                                  )
                                                              )
                                                            : 'bg-heatmap-0'
                                                    }`}
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

                        {/* Month labels */}
                        <div className="relative mb-4 h-4">
                            {monthLabels.map((label, index) => (
                                <div
                                    key={`${label.month}-${index}`}
                                    className="text-muted-foreground absolute text-sm"
                                    style={{ left: `${label.offset / 3.65}%` }}
                                >
                                    {label.month}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
