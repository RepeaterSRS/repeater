'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ActivityHeatmap, HeatmapData } from '@/components/ActivityHeatmap';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent } from '@/components/ui/card';
import { getUserInfoMeGet, getUserStatisticsStatsGet } from '@/gen';

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

    function formatHeatmapData(reviews_by_date: { [key: string]: number }) {
        const heatmapData: HeatmapData = {};

        for (const date in reviews_by_date) {
            const numberOfReviews = reviews_by_date[date];
            heatmapData[date] = {
                date: date,
                numberOfReviews: numberOfReviews,
            };
        }

        return heatmapData;
    }

    return (
        <div className="container mx-auto px-6 py-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Profile dashboard</h1>
                    <p className="text-accent-foreground">
                        View profile information and statistics
                    </p>
                </div>

                {/* Profile Card */}
                <div className="w-full">
                    {profilePending && !profileError && (
                        <p className="text-muted-foreground">
                            Your profile information will go here
                        </p>
                    )}
                    {!profilePending && profileError && (
                        <Card>
                            <CardContent>
                                <p className="text-destructive">
                                    Error loading profile!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {!profilePending && !profileError && profile?.data && (
                        <p>{profile.data.email}</p>
                    )}
                </div>

                {/* Metrics Grid */}
                <div className="w-full">
                    {statsPending && !statsError && (
                        <Card>
                            <CardContent>
                                <p>Loading stats...</p>
                            </CardContent>
                        </Card>
                    )}
                    {!statsPending && statsError && (
                        <Card>
                            <CardContent>
                                <p className="text-destructive">
                                    Error loading stats!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {!statsPending && !statsError && stats?.data && (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                                <p className="text-foreground text-2xl font-bold">
                                    {stats.data.streak}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Total Reviews"
                                description="Some explanation"
                            >
                                <p className="text-foreground text-2xl font-bold">
                                    {stats.data.total_reviews}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Success Rate"
                                description="Some explanation"
                            >
                                <p className="text-foreground text-2xl font-bold">
                                    {stats.data.success_rate}
                                </p>
                            </MetricCard>
                            <MetricCard
                                title="Retention Rate"
                                description="Some explanation"
                            >
                                <p className="text-foreground text-2xl font-bold">
                                    {stats.data.retention_rate}
                                </p>
                            </MetricCard>
                            {stats.data.deck_statistics.map((deck_stat) => (
                                <MetricCard
                                    title={
                                        <Link
                                            href={`test${deck_stat.deck_id}`}
                                            className="underline"
                                        >
                                            {deck_stat.deck_name}
                                        </Link>
                                    }
                                    description="Some explanation"
                                    key={deck_stat.deck_id}
                                    className="max-md:col-span-2"
                                >
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                Last studied
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {new Date(
                                                    deck_stat.last_studied
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                Retention Rate
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {deck_stat.retention_rate}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                Total Reviews
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {deck_stat.total_reviews}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                Difficulty
                                            </p>
                                            <p className="text-muted-foreground text-sm">
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
