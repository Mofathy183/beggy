/// <reference types="vitest" />

import { mergeConfig } from 'vitest/config';
import vitestBaseConfig from '../../vitest.base.config';

export default mergeConfig(vitestBaseConfig, {
	test: {
		name: 'unit',
		environment: 'jsdom',
		setupFiles: './tests/vitest.setup.ts',

		include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],

		fileParallelism: false,

		exclude: [
			// Default Vitest excludes (explicit is better than implicit)
			'**/node_modules/**',
			'**/.git/**',

			// Build outputs
			'**/dist/**',
			'**/build/**',
			'**/.next/**',
			'**/out/**',

			// Storybook
			'**/*.stories.{ts,tsx,js,jsx}',
			'**/.storybook/**',
			'**/storybook-static/**',

			// Tests you don’t want here
			'**/*.storybook.{ts,tsx}',
			'**/*.spec.{e2e,cy}.{ts,tsx}',
		],

		coverage: {
			reportsDirectory: 'coverage/vitest/web',
			include: ['src/**/*.{ts,tsx}'],
		},
	},
});
