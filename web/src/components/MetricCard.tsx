import React from 'react';

interface Props {
    className?: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function MetricCard(props: Props) {
    return (
        <div
            className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${props.className}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">
                        {props.title}
                    </h3>
                    <p className="text-sm text-gray-500">{props.description}</p>
                    {props.children}
                </div>
            </div>
        </div>
    );
}
