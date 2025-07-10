function getHeatmapColor(intensity: number) {
    const colors = ['#f3f4f6', '#dcfce7', '#86efac', '#22c55e', '#15803d'];
    return colors[intensity];
}

export type HeatmapData = {
    [key: string]: {
        date: string;
        nrReviews: number;
        intensity: number;
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
    startDate.setDate(endDate.getDate() - 364);

    for (let i = 0; i < 52; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (i * 7 + j));

            const dateKey = currentDate.toISOString().split('T')[0];
            const activityData = heatmapData[dateKey];

            week.push(activityData || null);
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
    const nrDisplayMonths = 12;
    const displayMonths = [];
    let currMonthIndex = startDate.getMonth();

    for (let i = 0; i < nrDisplayMonths; i++) {
        const monthIndex = currMonthIndex % months.length;
        currMonthIndex += Math.floor(months.length / nrDisplayMonths);
        displayMonths.push(months[monthIndex]);
    }

    return (
        <div
            className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    Activity
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className="h-3 w-3 rounded-sm border border-gray-200"
                                style={{
                                    backgroundColor: getHeatmapColor(level),
                                }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-50 p-2">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                            <div
                                key={`${weekIndex}-${dayIndex}`}
                                className="h-3 w-3 cursor-pointer rounded-sm border border-gray-200 transition-colors hover:border-gray-400"
                                style={{
                                    backgroundColor: day
                                        ? getHeatmapColor(day.intensity)
                                        : '#f3f4f6',
                                }}
                                title={
                                    day
                                        ? `${day.date}: ${day.nrReviews} reviews`
                                        : ''
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div
                className={`grid grid-cols-${nrDisplayMonths} gap-4 text-sm text-gray-600`}
            >
                {displayMonths.map((month) => (
                    <div key={month}>{month}</div>
                ))}
            </div>
        </div>
    );
}
