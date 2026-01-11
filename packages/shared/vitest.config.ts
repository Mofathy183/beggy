import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

export default mergeConfig(baseVitestConfig, {
	test: {
		environment: 'node',

		/**
		 * Explicitly include all test files.
		 */
		include: ['tests/**/*.test.ts'],

		/**
		 * Measure coverage only for production source files.
		 */
		coverage: {
			include: ['src/**/*.ts'],
		},
	},
});
