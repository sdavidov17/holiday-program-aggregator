// Jest setup file with TypeScript
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextDecoder, TextEncoder } from 'node:util';

// Import types
/// <reference types="@testing-library/jest-dom" />

// Polyfill TextEncoder/TextDecoder for jose library used by next-auth
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill setImmediate for Prisma
global.setImmediate =
  global.setImmediate || ((fn: any, ...args: any[]) => global.setTimeout(fn, 0, ...args));

// Mock database
jest.mock('~/server/db', () => {
  const {
    mockPrismaClient,
    SubscriptionStatus,
    UserRole,
    VettingStatus,
    ProgramStatus,
  } = require('./src/__tests__/__mocks__/db.js');
  return {
    db: mockPrismaClient,
    prisma: mockPrismaClient,
    SubscriptionStatus,
    UserRole,
    VettingStatus,
    ProgramStatus,
  };
});

// Mock env.mjs module
jest.mock(
  '~/env.mjs',
  () => ({
    env: {
      NODE_ENV: 'test',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'test-secret',
      DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:./test.db',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      APPLE_ID: 'test-apple-id',
      APPLE_SECRET: 'test-apple-secret',
      DISCORD_CLIENT_ID: 'test-discord-client-id',
      DISCORD_CLIENT_SECRET: 'test-discord-client-secret',
      ENCRYPTION_KEY: 'test-32-character-encryption-key',
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      STRIPE_ANNUAL_PRICE_ID: 'price_test_123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    },
  }),
  { virtual: true },
);

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    reload: jest.fn(),
  })),
}));

// Import test helpers
import { cleanupTestUsers } from './src/test-helpers/test-users';

// Global test setup
beforeAll(async () => {
  // Test environment is already set by Jest
  process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';

  // Clean up any existing test users before all tests
  if (process.env.TEST_DATABASE_URL?.includes('postgresql')) {
    try {
      await cleanupTestUsers();
      console.log('✅ Initial test user cleanup completed');
    } catch (error) {
      console.warn('⚠️ Could not perform initial cleanup (database might not be ready):', error);
    }
  }
});

// Global test teardown
afterAll(async () => {
  // Final cleanup after all tests
  if (process.env.TEST_DATABASE_URL?.includes('postgresql')) {
    try {
      await cleanupTestUsers();
      console.log('✅ Final test user cleanup completed');
    } catch (error) {
      console.warn('⚠️ Could not perform final cleanup:', error);
    }
  }
});

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Only show errors that aren't expected in tests
    if (
      !args[0]?.includes?.('Not authenticated') &&
      !args[0]?.includes?.('NEXT_REDIRECT') &&
      !args[0]?.includes?.('Invalid token')
    ) {
      originalError(...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
});
