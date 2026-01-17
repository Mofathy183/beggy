import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

export default mergeConfig(baseVitestConfig, {
	test: {
		environment: 'node',
		setupFiles: ['./vitest.setup.ts'],

		/**
		 * Explicitly include all test files.
		 */
		include: ['**/__tests__/*.test.ts'],

		/**
		 * Measure coverage only for production source files.
		 */
		coverage: {
			include: ['src/**/*.ts'],
		},
	},
});
