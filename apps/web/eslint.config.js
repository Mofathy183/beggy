import base from '../../eslint.config.mjs';

// import reactHooks from 'eslint-plugin-react-hooks';
// import tseslint from 'typescript-eslint';
// React-specific plugins
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	...base,
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},
	// Add React config ONLY for the web app
	{
		files: ['**/*.{jsx,tsx}'],
		plugins: {
			react,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			// React
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',

			// Hooks
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// Accessibility
			'jsx-a11y/anchor-is-valid': 'warn',
		},
	},
]);
