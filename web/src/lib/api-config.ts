import { getCookie } from 'cookies-next/client';

import { CreateClientConfig } from '@/gen/client';

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
    throwOnError: true,
    auth: () => getCookie('access_token'),
});
