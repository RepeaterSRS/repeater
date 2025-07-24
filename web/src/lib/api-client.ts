'use client';

import { env } from 'next-runtime-env';

import { refreshTokenAuthRefreshPost } from '@/gen';
import { client } from '@/gen/client.gen';

let isRefreshing = false;

client.setConfig({
    baseUrl: env('NEXT_PUBLIC_API_URL'),
});

client.interceptors.response.use(
    async (response: Response, request: Request) => {
        if (response.status === 401 && !isRefreshing) {
            isRefreshing = true;

            try {
                await refreshTokenAuthRefreshPost();
                return await fetch(request.clone());
            } catch (refreshError) {
                window.location.href = '/login';
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }
        return response;
    }
);
