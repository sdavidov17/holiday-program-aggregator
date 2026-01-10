/**
 * Jest setup for integration tests with REAL database
 * No mocking - tests run against actual PostgreSQL
 */

import { TextDecoder, TextEncoder } from 'node:util';

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill setImmediate for Prisma
global.setImmediate =
  global.setImmediate || ((fn: any, ...args: any[]) => global.setTimeout(fn, 0, ...args));

// Mock env.mjs with real test values (but NOT the database)
jest.mock(
  '~/env.mjs',
  () => ({
    env: {
      NODE_ENV: 'test',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-secret-for-integration-tests',
      DATABASE_URL: process.env.DATABASE_URL, // Use real DATABASE_URL from environment
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      ENCRYPTION_KEY:
        process.env.ENCRYPTION_KEY || 'test-encryption-key-1234567890123456789012345678',
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      STRIPE_ANNUAL_PRICE_ID: 'price_test_123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    },
  }),
  { virtual: true },
);

// Import real Prisma client after env mock
import { db } from '~/server/db';

// Global setup - connect to database
beforeAll(async () => {
  console.log('🔌 Connecting to test database...');
  console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);

  try {
    await db.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
});

// Global teardown - disconnect from database
afterAll(async () => {
  console.log('🔌 Disconnecting from test database...');
  await db.$disconnect();
  console.log('✅ Database disconnected');
});

// Clean up test data before each test
beforeEach(async () => {
  // Clean up test providers (those created during tests)
  await db.provider
    .deleteMany({
      where: {
        email: {
          startsWith: 'test-provider',
        },
      },
    })
    .catch(() => {});
});

// Suppress noisy console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (!args[0]?.includes?.('Not authenticated') && !args[0]?.includes?.('NEXT_REDIRECT')) {
      originalError(...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
});
