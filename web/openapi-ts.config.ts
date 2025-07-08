import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './docs/openapi.yaml',
    output: './src/gen',
    plugins: [
        {
            name: '@hey-api/client-fetch',
            runtimeConfigPath: './src/lib/api-config.ts',
        },
    ],
});
