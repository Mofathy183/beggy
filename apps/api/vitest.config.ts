import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

/**
 * Unit test configuration.
 *
 * Runs ONLY unit and route tests — no integration tests.
 * Integration tests live in *.integration.test.ts files and
 * are excluded here so `pnpm test` never touches the database.
 *
 * Use `pnpm test:integration` for the full HTTP + DB suite.
 */
export default mergeConfig(baseVitestConfig, {
	test: {
		environment: 'node',
		setupFiles: ['./tests/vitest.setup.ts'],

		// Unit tests only — explicitly exclude integration tests
		include: ['**/__tests__/*.test.ts'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/__tests__/*.integration.test.ts',
		],

		sequence: {
			concurrent: false,
		},

		coverage: {
			include: ['src/**/*.ts'],
		},
	},
});
