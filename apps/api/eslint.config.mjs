import base from '../../eslint.config.mjs';
import { defineConfig } from 'eslint/config';
import path from 'node:path';

export default defineConfig([
	...base,

	// ✅ Typed linting ONLY for the API package
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: path.resolve(import.meta.dirname, './tsconfig.json'),
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
		},

		files: ['**/prisma/**/*.ts', '**/*.seed.ts', '**/scripts/**/*.ts'],
		rules: {
			'no-console': 'off',
		},
	},
]);
