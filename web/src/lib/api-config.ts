import { CreateClientConfig } from '@/gen/client';
import { getCookie } from 'cookies-next/client';

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    throwOnError: true,
    auth: () => getCookie('access_token'),
});
