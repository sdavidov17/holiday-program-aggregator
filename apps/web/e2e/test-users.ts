/**
 * E2E Test User Utilities
 * Provides access to dynamically created test user credentials
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface TestUser {
  email: string;
  id: string;
  subscriptionId?: string;
}

export interface TestUserData {
  runId: string;
  password: string;
  users: {
    premium: TestUser;
    basic: TestUser;
    premiumCancel: TestUser;
  };
}

let cachedData: TestUserData | null = null;

/**
 * Get the test user data created by global setup
 */
export function getTestUserData(): TestUserData {
  if (cachedData) {
    return cachedData;
  }

  const dataPath = path.join(__dirname, '.e2e-test-users.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(
      'Test user data file not found. Make sure global-setup.ts ran successfully.\n' +
        'This usually means DATABASE_URL is not set or database connection failed.',
    );
  }

  cachedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return cachedData!;
}

/**
 * Get premium user credentials
 */
export function getPremiumUser(): { email: string; password: string; id: string } {
  const data = getTestUserData();
  return {
    email: data.users.premium.email,
    password: data.password,
    id: data.users.premium.id,
  };
}

/**
 * Get basic user credentials
 */
export function getBasicUser(): { email: string; password: string; id: string } {
  const data = getTestUserData();
  return {
    email: data.users.basic.email,
    password: data.password,
    id: data.users.basic.id,
  };
}

/**
 * Get premium cancel user credentials
 */
export function getPremiumCancelUser(): {
  email: string;
  password: string;
  id: string;
  subscriptionId: string;
} {
  const data = getTestUserData();
  return {
    email: data.users.premiumCancel.email,
    password: data.password,
    id: data.users.premiumCancel.id,
    subscriptionId: data.users.premiumCancel.subscriptionId!,
  };
}

/**
 * Get the current test run ID
 */
export function getTestRunId(): string {
  return getTestUserData().runId;
}
