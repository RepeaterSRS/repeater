import { FlatCompat } from '@eslint/eslintrc';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ['src/gen/**/*'],
    },
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    prettier,
    {
        plugins: {
            perfectionist,
            'better-tailwindcss': betterTailwindcss,
        },
        settings: {
            'better-tailwindcss': {
                entryPoint: 'src/app/globals.css',
            },
        },
        rules: {
            'perfectionist/sort-imports': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
];

export default eslintConfig;
