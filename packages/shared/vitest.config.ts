import { mergeConfig } from 'vitest/config';
import baseVitestConfig from '../../vitest.base.config';

export default mergeConfig(baseVitestConfig, {
	test: {
		environment: 'node',
		include: ['src/tests/**/*.test.ts'],
		coverage: {
			include: ['src/**/*.ts'],
		},
	},
});
