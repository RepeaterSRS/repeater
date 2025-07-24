import { CreateClientConfig } from '@/gen/client';

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    credentials: 'include',
    throwOnError: true,
});
