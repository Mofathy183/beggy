import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import base from '../../eslint.config.mjs';

const eslintConfig = defineConfig([
	// 1. Base rules (shared across all packages)
	...base,

	// 2. Next.js rules — spread BEFORE your custom overrides
	//    so your rules always win when there's a conflict
	...nextVitals,
	...nextTs,

	// 3. Web-specific TypeScript overrides
	//    These come AFTER nextTs so they take priority
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.eslint.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Promise safety — requires tsconfig project above
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: {
						// React event props expect void but async handlers
						// are safe here — the runtime doesn't await them
						attributes: false,
					},
				},
			],
			'@typescript-eslint/no-floating-promises': 'error',

			// React Compiler: downgrade to warn so it doesn't
			// block builds, but still surfaces incompatible libs
			// like react-hook-form's watch()
			'react-hooks/incompatible-library': 'warn',
		},
	},

	// 4. Storybook — scoped strictly to story files only
	//    Prevents storybook rules from leaking into app code
	{
		files: [
			'**/*.stories.ts',
			'**/*.stories.tsx',
			'**/*.story.ts',
			'**/*.story.tsx',
		],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
		},
		...storybook.configs['flat/recommended'][0],
	},

	// 5. Global ignores — always last
	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'.storybook/**',
	]),
]);

export default eslintConfig;
