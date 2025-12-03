import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
	// Base recommended configs
	js.configs.recommended,

	// Global ignores
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.turbo/**',
			'**/coverage/**',
			'**/.next/**',
			'**/out/**',
			'*.config.js',
			'*.config.mjs',
			'*.config.ts',
		],
	},

	// Base configuration for all TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: true,
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				require: 'readonly',
				exports: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			import: importPlugin,
			'unused-imports': unusedImports,
			'simple-import-sort': simpleImportSort,
			prettier: prettier,
		},
		rules: {
			...typescript.configs.recommended.rules,
			...prettierConfig.rules,

			// TypeScript rules
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-floating-promises': 'error',

			// Import rules
			'import/no-unresolved': 'off', // TypeScript handles this
			'import/named': 'off',
			'import/namespace': 'off',
			'import/default': 'off',
			'import/no-named-as-default-member': 'off',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',

			// Unused imports
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],

			// Simple import sort
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						// Node.js builtins
						['^node:'],
						// Packages (react, next, etc.)
						['^@?\\w'],
						// Internal packages
						['^@beggy/'],
						// Parent imports
						['^\\.\\.'],
						// Sibling imports
						['^\\.'],
						// Style imports
						['^.+\\.s?css$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',

			// Prettier
			'prettier/prettier': 'warn',

			// General rules
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},

	// JavaScript files configuration
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				require: 'readonly',
				exports: 'readonly',
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
];
