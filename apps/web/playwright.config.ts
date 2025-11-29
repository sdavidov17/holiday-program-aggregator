import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/test_db?schema=public',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-secret-for-ci',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      ENCRYPTION_KEY:
        process.env.ENCRYPTION_KEY || 'test-encryption-key-1234567890123456789012345678',
      SKIP_ENV_VALIDATION: 'true',
    },
  },
});
