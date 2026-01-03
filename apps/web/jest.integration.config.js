// Jest config for integration tests with REAL database (no mocks)

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Use node environment for DB connections
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Only run integration tests
  testMatch: ['**/src/__tests__/integration/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  // Setup file for integration tests (no DB mocks)
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.ts'],
  // Longer timeout for DB operations
  testTimeout: 30000,
  // Run tests serially to avoid DB conflicts
  maxWorkers: 1,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit-integration.xml',
        suiteName: 'Integration Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
};
