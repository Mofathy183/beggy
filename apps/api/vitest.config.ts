import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

export default mergeConfig(baseVitestConfig, {
	test: {
		pool: 'forks',
		sequence: {
			concurrent: false, // no parallel tests within a file
		},

		environment: 'node',
		setupFiles: ['./tests/vitest.setup.ts'],

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
