export default {
    testEnvironment: 'node',
    transform: {},
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'services/**/*.js',
        'server.js',
        '!services/**/*.test.js',
        '!**/node_modules/**'
    ],
    testMatch: [
        '**/__tests__/**/*.(test|spec).(js|mjs)',
        '**/?(*.)+(spec|test).(js|mjs)'
    ],
    verbose: true,
    testTimeout: 10000
};
