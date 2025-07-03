'use client';

import { useState, useEffect } from 'react';
import { getUserInfoMeGet, UserOut } from '@/gen';

export default function Profile() {
    const [userState, setUserState] = useState({
        data: null as UserOut | null,
        loading: true,
        error: null as string | null,
    });

    useEffect(() => {
        fetchUser();
    }, []);

    async function fetchUser() {
        try {
            setUserState((prev) => ({ ...prev, error: null }));
            const res = await getUserInfoMeGet();
            setUserState((prev) => ({
                ...prev,
                data: res.data || null,
                loading: false,
            }));
        } catch (err: any) {
            setUserState({
                data: null,
                loading: false,
                error:
                    err.detail ?? 'There was an error while fetching profile',
            });
        }
    }

    return (
        <div className="max-w-sm rounded-xl bg-white p-4 shadow">
            {userState.loading && <p>Loading profile...</p>}
            {userState.error && (
                <p className="text-red-500">{userState.error}</p>
            )}
            {!userState.loading && !userState.error && userState.data && (
                <div>
                    <h2 className="mb-2 text-xl font-semibold">User Profile</h2>
                    <p className="text-gray-700">
                        Email: {userState.data.email}
                    </p>
                    <p className="text-gray-700">
                        User since:{' '}
                        {new Date(userState.data.created_at)
                            .toISOString()
                            .slice(0, 10)}
                    </p>
                </div>
            )}
        </div>
    );
}
