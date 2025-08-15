// Config for Jest testing framework

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    superjson: '<rootDir>/__mocks__/superjson.js',
    '^~/env.mjs$': '<rootDir>/__mocks__/env.js',
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
    '^.+\\.mjs$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js|jsx)', '**/*.(test|spec).(ts|tsx|js|jsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx|js|jsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!src/env.mjs',
  ],
  coverageThreshold: {
    global: {
      // Progressive thresholds - target is 80% as per DoD requirement
      // Current coverage: ~31% lines, ~24% branches, ~22% functions
      // Realistic progression toward 80% target (will increase incrementally)
      branches: 23,
      functions: 22,
      lines: 30,
      statements: 30,
    },
    // Target thresholds for critical paths - these are aspirational goals for new code
    // Currently set as guidance, will be enforced once existing code is refactored
    // Example of per-file thresholds to be enabled later:
    // 'src/services/**/*.ts': { branches: 60, functions: 60, lines: 60, statements: 60 }
    // 'src/repositories/**/*.ts': { branches: 60, functions: 60, lines: 60, statements: 60 }
    // 'src/server/api/routers/**/*.ts': { branches: 50, functions: 50, lines: 50, statements: 50 }
    // 'src/utils/**/*.ts': { branches: 50, functions: 50, lines: 50, statements: 50 }
  },
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'Holiday Program Aggregator Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-ctrf-json-reporter',
      {
        outputDir: './coverage',
        outputFile: 'ctrf-report.json',
        testType: 'unit',
        appName: 'Holiday Heroes Web',
        appVersion: '0.1.0',
        environment: process.env.NODE_ENV || 'test',
        buildName: process.env.GITHUB_RUN_ID || 'local',
        buildNumber: process.env.GITHUB_RUN_NUMBER || '0',
      },
    ],
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  transformIgnorePatterns: ['node_modules/(?!(@t3-oss/env-nextjs)/)'],
};
