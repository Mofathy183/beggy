/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		clearMocks: true,
		restoreMocks: true,
		mockReset: true,

		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['src/tests/**', 'src/index.ts', '**/*.d.ts'],
		},
	},
});
