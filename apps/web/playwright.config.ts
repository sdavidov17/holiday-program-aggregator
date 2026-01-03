import { defineConfig, devices } from '@playwright/test';

// Use BASE_URL for deployed environments, fallback to localhost
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isDeployedEnv = !!process.env.BASE_URL;

// Global setup/teardown only run when DATABASE_URL is available
const hasDatabaseUrl = !!process.env.DATABASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  timeout: isDeployedEnv ? 60000 : 30000, // Longer timeout for deployed env
  // Global setup creates dynamic test users, teardown cleans them up
  globalSetup: hasDatabaseUrl ? './e2e/global-setup.ts' : undefined,
  globalTeardown: hasDatabaseUrl ? './e2e/global-teardown.ts' : undefined,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only start local server when not testing against deployed environment
  ...(isDeployedEnv
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          port: 3000,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
