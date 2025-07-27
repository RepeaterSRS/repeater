import React from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';

interface Props {
    className?: string;
    title: React.ReactNode;
    description?: string;
    children: React.ReactNode;
}

export default function MetricCard({
    className,
    title,
    description,
    children,
}: Props) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
