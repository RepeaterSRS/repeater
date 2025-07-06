import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './docs/openapi.yaml',
    output: './src/gen',
    plugins: [
        {
            name: '@hey-api/client-next',
            runtimeConfigPath: './lib/api-config.ts',
        },
    ],
});
