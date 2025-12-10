import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
	preset: 'ts-jest',
	testEnvironment: 'node',

	setupFilesAfterEnv: ['./src/tests/setup.test.ts'],

	testTimeout: 4000,

	testMatch: [
		'**/src/tests/**/admin.test.ts',
		'**/src/tests/**/auth.delete.test.ts',
		'**/src/tests/**/auth.get.test.ts',
		'**/src/tests/**/auth.patch.test.ts',
		'**/src/tests/**/auth.post.test.ts',
		'**/src/tests/**/bag.test.ts',
		'**/src/tests/**/bagItems.test.ts',
		'**/src/tests/**/item.test.ts',
		'**/src/tests/**/private.bags.test.ts',
		'**/src/tests/**/private.items.test.ts',
		'**/src/tests/**/private.suitcases.test.ts',
		'**/src/tests/**/public.test.ts',
		'**/src/tests/**/suitcase.test.ts',
		'**/src/tests/**/suitcaseItems.test.ts',
	],

	testPathIgnorePatterns: ['/node_modules/'],

	forceExit: true,
	clearMocks: true,
	restoreMocks: true,

	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', { useESM: true }],
	},

	maxWorkers: 4,
	verbose: true,
};

export default config;
