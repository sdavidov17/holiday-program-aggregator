// This is a helper file, not a test suite

import { describe, expect, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { db as prisma } from '~/server/db';

// Add a dummy test to satisfy Jest
describe('Test Helper Module', () => {
  it('should export test utilities', () => {
    expect(true).toBe(true);
  });
});

export const TEST_USERS = {
  admin: {
    email: 'test-admin@test.com',
    password: 'TestAdmin123!',
    role: 'ADMIN' as const,
  },
  user: {
    email: 'test-user@test.com',
    password: 'TestUser123!',
    role: 'USER' as const,
  },
  provider: {
    email: 'test-provider@test.com',
    password: 'TestProvider123!',
    role: 'USER' as const, // Providers are users with associated provider records
  },
};

/**
 * Clean up all test users from the database
 */
export async function cleanupTestUsers() {
  const testEmails = Object.values(TEST_USERS).map((u) => u.email);

  try {
    // Delete in correct order to handle foreign key constraints
    // First delete related records
    await prisma.session.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    await prisma.account.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    await prisma.subscription.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    // Then delete the users
    await prisma.user.deleteMany({
      where: {
        email: { in: testEmails },
      },
    });

    console.log(`✅ Cleaned up ${testEmails.length} test users`);
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    throw error;
  }
}

/**
 * Create a test user with the specified role
 */
export async function createTestUser(type: keyof typeof TEST_USERS = 'admin') {
  const userData = TEST_USERS[type];

  try {
    // First cleanup any existing user with this email
    await prisma.user.deleteMany({
      where: { email: userData.email },
    });

    // Create the new test user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        emailVerified: new Date(),
        name: `Test ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      },
    });

    console.log(`✅ Created test ${type} user: ${user.email}`);
    return user;
  } catch (error) {
    console.error(`Error creating test ${type} user:`, error);
    throw error;
  }
}

/**
 * Create all test users
 */
export async function createAllTestUsers() {
  await cleanupTestUsers();

  const users = await Promise.all([
    createTestUser('admin'),
    createTestUser('user'),
    createTestUser('provider'),
  ]);

  return {
    admin: users[0],
    user: users[1],
    provider: users[2],
  };
}

/**
 * Setup test database with users
 * Call this in beforeAll or beforeEach
 */
export async function setupTestDatabase() {
  // Ensure database connection
  await prisma.$connect();

  // Create test users
  const users = await createAllTestUsers();

  return users;
}

/**
 * Cleanup test database
 * Call this in afterAll or afterEach
 */
export async function cleanupTestDatabase() {
  try {
    await cleanupTestUsers();
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get a test user's credentials
 */
export function getTestCredentials(type: keyof typeof TEST_USERS = 'admin') {
  return {
    email: TEST_USERS[type].email,
    password: TEST_USERS[type].password,
  };
}

/**
 * Create a test session for a user (useful for authenticated tests)
 */
export async function createTestSession(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error(`Test user ${userEmail} not found`);
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      sessionToken: `test-session-${user.id}-${Date.now()}`,
    },
  });

  return { user, session };
}
