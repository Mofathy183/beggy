export default {
	setupFilesAfterEnv: ['./src/tests/setup.test.js'],
	testTimeout: 4000,
	testMatch: [
		// '**/src/tests/**/auth.delete.test.js',
		// '**/src/tests/**/auth.get.test.js',
		// '**/src/tests/**/auth.patch.test.js',
		// '**/src/tests/**/auth.post.test.js',
		// '**/src/tests/**/bag.test.js',
		// '**/src/tests/**/bagItems.test.js',
		// // '**/src/tests/**/features.test.js', //* it takes more time to test, it makes many api requests
		// '**/src/tests/**/item.test.js',
		// '**/src/tests/**/private.test.js',
		// '**/src/tests/**/public.test.js',
		// '**/src/tests/**/suitcase.test.js',
		// '**/src/tests/**/suitcaseItems.test.js',
		'**/src/tests/**/user.test.js',
	], // Ensure Jest looks inside `src/tests`
	testPathIgnorePatterns: ['/node_modules/'],
	forceExit: true,
	clearMocks: true,
	restoreMocks: true,
	testEnvironment: 'node',
	transform: {},
	maxWorkers: 4,
	verbose: true,
};
