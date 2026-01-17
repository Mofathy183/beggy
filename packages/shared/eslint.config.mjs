import base from '../../eslint.config.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
	...base,
	{
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.eslint.json'],
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		files: ['**/*.types.ts', '**/constants/*.ts'],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
];
