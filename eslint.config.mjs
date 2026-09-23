import eslint from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

/**
 * Flat ESLint config.
 * Uses @typescript-eslint/parser so `.ts` files parse correctly.
 * The typescript-eslint *plugin* is omitted: it depends on TypeScript < 6 APIs while
 * this repo pins TypeScript 7 for `tsc`. Pair `npm run lint` with `npm run typecheck`.
 */
export default [
  {
    ignores: [
      'node_modules/**',
      'apps/**',
      'allure-*/**',
      'mobilewright-report/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts,js,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
