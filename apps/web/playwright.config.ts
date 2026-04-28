import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export const apiBaseURL =
	process.env.E2E_API_BASE_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	'http://localhost:4000/api/beggy';

const isCI = !!process.env.CI;

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.ts',
	fullyParallel: false,
	forbidOnly: isCI,
	expect: { timeout: 10_000 },
	retries: isCI ? 2 : 0,
	workers: isCI ? 2 : undefined,
	reporter: [['html', { open: 'never' }], ['list']],

	use: {
		baseURL,
		// storageState: STORAGE_STATE_PATH,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 10_000, // add
		navigationTimeout: 20_000, // add
	},

	projects: [
		// ── Setup chain ───────────────────────────────────────────────────────
		// 1. auth.setup.ts     — creates seed user, saves storageState
		// 2. packing.setup.ts  — uses that storageState to seed containers/items,
		//                        writes .auth/packing-seed.json for the spec
		{
			name: 'setup',
			testMatch: '**/auth.setup.ts',
			retries: 0,
		},
		{
			name: 'packing-setup',
			testMatch: '**/packing.setup.ts',
			retries: 0,
			dependencies: ['setup'],
		},

		// ── Test projects ─────────────────────────────────────────────────────
		// FIX: Both test projects must depend on 'packing-setup' (not just
		// 'setup') so the packing-seed.json file exists before specs run.
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['packing-setup'],
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 7'] },
			dependencies: ['packing-setup'],
		},
	],

	webServer: [
		{
			// cross-env sets NODE_ENV before pnpm dev — works on Windows, Mac, Linux.
			// cross-env is already in your devDependencies.
			// The env block below also injects NEXT_PUBLIC_API_URL so the Next.js
			// dev server bakes the correct 127.0.0.1 URL into the browser bundle.
			command: 'cross-env NODE_ENV=test pnpm dev',
			url: 'http://127.0.0.1:3000',
			reuseExistingServer: !isCI,
			timeout: 120_000,
			env: {
				NEXT_PUBLIC_API_URL: apiBaseURL,
			},
		},
		// Optional second entry — auto-starts the API if not already running.
		// With reuseExistingServer: true, Playwright skips the command if :4000
		// is already listening (i.e. you started the API manually beforehand).
		// Remove this block if you always start the API yourself.
		{
			command: 'pnpm --filter @beggy/api dev:test',
			url: 'http://127.0.0.1:4000/api/beggy/health',
			reuseExistingServer: true,
			timeout: 60_000,
		},
	],
});
