export default {
    setupFilesAfterEnv: ["./src/tests/setup.test.js"],
    testTimeout: 3000,
    testMatch: [
        // "**/src/tests/setup.test.js", 
        "**/src/tests/**/bag.test.js", 
        // "**/src/tests/**/auth.test.js", 
        // "**/src/tests/**/*.test.js", 
    ], // Ensure Jest looks inside `src/tests`
    testPathIgnorePatterns: ["/node_modules/"],
    forceExit: true,
    clearMocks: true,
    restoreMocks: true,
    testEnvironment: 'node',
    transform: {},
    maxWorkers: 4,
    verbose: true,
}