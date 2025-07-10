'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserInfoMeGet, getUserStatisticsStatsGet } from '@/gen';
import MetricCard from '@/components/MetricCard';
import { ActivityHeatmap, HeatmapData } from '@/components/ActivityHeatmap';

export default function Profile() {
    const {
        data: profile,
        isLoading: profilePending,
        isError: profileError,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: () => getUserInfoMeGet(),
    });

    const {
        data: stats,
        isLoading: statsPending,
        isError: statsError,
    } = useQuery({
        queryKey: ['stats'],
        queryFn: () => getUserStatisticsStatsGet(),
    });

    const queryClient = useQueryClient();

    function formatHeatmapData(reviews_by_date: { [key: string]: number }) {
        const heatmapData: HeatmapData = {};

        for (let date in reviews_by_date) {
            const nrReviews = reviews_by_date[date];
            heatmapData[date] = {
                date: date,
                nrReviews: nrReviews,
                intensity:
                    nrReviews === 0
                        ? 0
                        : Math.min(Math.floor(nrReviews / 10) + 1, 4),
            };
        }

        return heatmapData;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Profile Card */}
                <div className="w-full">
                    {profilePending && !profileError && (
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <p>Loading profile...</p>
                        </div>
                    )}
                    {!profilePending && profileError && (
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <p className="text-red-500">
                                Error loading profile!
                            </p>
                        </div>
                    )}
                    {profile?.data && (
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h1 className="mb-4 text-2xl font-bold">Profile</h1>
                            <div className="space-y-2">
                                <p className="text-lg">Welcome back!</p>
                                <p className="text-gray-600">
                                    Your profile information will go here
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metrics Grid */}
                <div className="w-full">
                    {statsPending && !statsError && (
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <p>Loading stats...</p>
                        </div>
                    )}
                    {!statsPending && statsError && (
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <p className="text-red-500">Error loading stats!</p>
                        </div>
                    )}
                    {stats?.data && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <ActivityHeatmap
                                className="col-span-2"
                                heatmapData={formatHeatmapData(
                                    stats.data.daily_reviews
                                )}
                            />
                            <MetricCard
                                title="Streak"
                                description="Some explanation"
                            >
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.data.streak}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Total Reviews"
                                description="Some explanation"
                            >
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.data.total_reviews}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Success Rate"
                                description="Some explanation"
                            >
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.data.success_rate}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Retention Rate"
                                description="Some explanation"
                            >
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.data.retention_rate}
                                </p>
                            </MetricCard>
                            {stats.data.deck_statistics.map((deck_stat) => (
                                <MetricCard
                                    title={`Decks / ${deck_stat.deck_name}`}
                                    key={deck_stat.deck_id}
                                >
                                    {/* TODO use breadcrumbs that point to deck in title */}
                                    <div className="grid grid-cols-2 place-items-center gap-6">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Last studied
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(
                                                    deck_stat.last_studied
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Retention Rate
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {deck_stat.retention_rate}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Total Reviews
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {deck_stat.total_reviews}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Difficulty
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {deck_stat.difficulty_ranking}
                                            </p>
                                        </div>
                                    </div>
                                </MetricCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
