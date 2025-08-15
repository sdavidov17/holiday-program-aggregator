/**
 * Test Constants
 * Centralized configuration for test values
 */

// Test Timeouts
export const TEST_TIMEOUT = {
  UNIT: 5000,
  INTEGRATION: 10000,
  E2E: 30000,
  SLOW_OPERATION: 60000,
} as const;

// Security Constants
export const SECURITY = {
  BCRYPT_ROUNDS: 10,
  DEFAULT_PASSWORD: 'Test123!',
  SESSION_TIMEOUT: 3600000, // 1 hour in ms
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCK_DURATION: 900000, // 15 minutes in ms
} as const;

// Database Constants
export const DATABASE = {
  TRANSACTION_TIMEOUT: 5000,
  CONNECTION_TIMEOUT: 10000,
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Mock Data Constants
export const MOCK_DATA = {
  FAKER_SEED: 123,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Coverage Thresholds
export const COVERAGE_THRESHOLDS = {
  BRANCHES: 80,
  FUNCTIONS: 80,
  LINES: 80,
  STATEMENTS: 80,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  AUTH_ATTEMPTS_PER_HOUR: 10,
  WEBHOOK_REQUESTS_PER_SECOND: 10,
} as const;
