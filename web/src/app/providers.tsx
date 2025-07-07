'use client';

import { refreshTokenAuthRefreshPost } from '@/gen';
import { client } from '@/gen/client.gen';
import { deleteCookie } from 'cookies-next/client';

let isRefreshing = false;

client.instance.interceptors.response.use(
    (response: any) => {
        return response;
    },
    async (error: any) => {
        if (error.response?.status === 401 && !isRefreshing) {
            isRefreshing = true;

            try {
                await refreshTokenAuthRefreshPost();
                const originalRequest = error.config;
                return client.instance(originalRequest);
            } catch (refreshError) {
                deleteCookie('access_token');
                deleteCookie('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export function AppProviders({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
