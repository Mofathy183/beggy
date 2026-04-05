import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

/**
 * Integration test configuration.
 *
 * Runs ONLY *.integration.test.ts files against the real test database.
 * Requires .env.test to be loaded before running — use:
 *   pnpm test:integration
 * which calls: dotenv -e .env.test -- vitest run -c vitest.integration.config.ts
 *
 * Key decisions:
 * - fileParallelism: false  → one file at a time, no cross-file DB races
 * - pool: 'forks'           → full process isolation per file (no shared state)
 * - poolOptions.forks.singleFork: true → all files run in one process sequentially,
 *   which is safest for a single shared test DB
 * - sequence.concurrent: false → within a file, tests run in order
 */
export default mergeConfig(baseVitestConfig, {
	test: {
		environment: 'node',
		setupFiles: ['./tests/vitest.setup.ts'],

		include: ['**/__tests__/*.integration.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],

		// ── Concurrency: OFF ──────────────────────────────────────────────────
		// All integration test files run sequentially in a single process.
		// This prevents race conditions where two test files call
		// truncateAllTables at the same time and wipe each other's data.
		fileParallelism: false,

		pool: 'forks',

		// Single shared process — one file completes before the next starts
		singleFork: true,

		sequence: {
			concurrent: false,
		},

		// Generous timeout for DB setup + HTTP round-trips
		testTimeout: 30_000,
		hookTimeout: 30_000,

		coverage: {
			include: ['src/**/*.ts'],
		},
	},
});
