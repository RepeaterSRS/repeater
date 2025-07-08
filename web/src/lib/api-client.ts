'use client';

import { refreshTokenAuthRefreshPost } from '@/gen';
import { client } from '@/gen/client.gen';
import { deleteCookie } from 'cookies-next/client';

let isRefreshing = false;

client.interceptors.response.use(
    async (response: Response, request: Request) => {
        if (response.status === 401 && !isRefreshing) {
            isRefreshing = true;

            try {
                await refreshTokenAuthRefreshPost();
                return await fetch(request.clone());
            } catch (refreshError) {
                deleteCookie('access_token');
                deleteCookie('refresh_token');
                window.location.href = '/login';
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }
        return response;
    }
);