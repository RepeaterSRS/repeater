'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { DataTable } from '@/components/table/DataTable';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getUsersAdminUsersGet } from '@/gen';

import { columns } from './columns';

export default function AdminDashboard() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [showGuests, setShowGuests] = useState(true);

    const {
        data: usersData,
        isLoading: isUsersLoading,
        isError: isUsersError,
        error: usersError,
    } = useQuery({
        queryKey: [
            'users',
            showGuests,
            pagination.pageIndex,
            pagination.pageSize,
        ],
        queryFn: () =>
            getUsersAdminUsersGet({
                query: {
                    show_guests: showGuests,
                    page: pagination.pageIndex + 1, // API paging starts at 1
                    size: pagination.pageSize,
                },
            }),
    });

    return (
        <div className="container mx-auto space-y-8 px-6 py-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-neutral-600">
                    Manage users and system settings
                </p>
            </div>

            {/* Users table */}
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-medium">Users</h2>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-guests"
                            checked={showGuests}
                            onCheckedChange={setShowGuests}
                        />
                        <Label htmlFor="show-guests">Show guests</Label>
                    </div>
                </div>

                {isUsersLoading && <p>Loading users...</p>}
                {isUsersError && (
                    <p className="text-red-600">{usersError?.message}</p>
                )}

                {!isUsersLoading && !isUsersError && usersData?.data && (
                    <div>
                        <DataTable
                            columns={columns}
                            data={usersData.data.items}
                            pagination={pagination}
                            pages={usersData.data.pages}
                            manualPagination={true}
                            onPaginationChange={setPagination}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
