import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: '../docs/openapi.yaml',
    output: './app/lib/client',
});
