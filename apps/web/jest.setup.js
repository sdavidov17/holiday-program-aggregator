// Jest setup file
require('@testing-library/jest-dom');
require('whatwg-fetch');

// Polyfill TextEncoder/TextDecoder for jose library used by next-auth
const { TextEncoder, TextDecoder } = require('node:util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock env.mjs module
jest.mock(
  '~/env.mjs',
  () => ({
    env: {
      NODE_ENV: 'test',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'test-secret',
      DATABASE_URL: 'file:./test.db',
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
