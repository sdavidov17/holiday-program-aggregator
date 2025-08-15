import bcrypt from 'bcryptjs';
import { db as prisma } from '~/server/db';
import {
  cleanupTestDatabase,
  cleanupTestUsers,
  createTestUser,
  getTestCredentials,
  setupTestDatabase,
  TEST_USERS,
} from '../../test-helpers/test-users';

describe('Authentication with Test User Cleanup', () => {
  // Setup before all tests in this suite
  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
  });

  // Cleanup after all tests in this suite
  afterAll(async () => {
    // Ensure all test users are cleaned up
    await cleanupTestDatabase();
  });

  // Clean up before each test to ensure fresh state
  beforeEach(async () => {
    // Remove any existing test users
    await cleanupTestUsers();
    console.log('✅ Test users cleaned before test');
  });

  // Also clean up after each test for good measure
  afterEach(async () => {
    // Clean up test users created during the test
    await cleanupTestUsers();
    console.log('✅ Test users cleaned after test');
  });

  describe('Admin User Tests', () => {
    it('should create and authenticate admin user', async () => {
      // Create test admin user
      const admin = await createTestUser('admin');

      // Verify user was created with correct properties
      expect(admin.email).toBe(TEST_USERS.admin.email);
      expect(admin.role).toBe('ADMIN');
      expect(admin.emailVerified).toBeTruthy();

      // Verify password is correctly hashed
      const credentials = getTestCredentials('admin');
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      expect(user).toBeTruthy();
      if (user?.password) {
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        expect(isPasswordValid).toBe(true);
      }
    });

    it('should recreate admin user even if it already exists', async () => {
      // Create admin user first time
      const admin1 = await createTestUser('admin');
      const id1 = admin1.id;

      // Create admin user second time (should delete and recreate)
      const admin2 = await createTestUser('admin');
      const id2 = admin2.id;

      // IDs should be different (new user was created)
      expect(id1).not.toBe(id2);

      // Should only have one user with this email
      const users = await prisma.user.findMany({
        where: { email: TEST_USERS.admin.email },
      });
      expect(users).toHaveLength(1);
      expect(users[0]?.id).toBe(id2);
    });
  });

  describe('Multiple User Types', () => {
    it('should create all test users and clean them up', async () => {
      // Setup all test users
      const users = await setupTestDatabase();

      // Verify all users were created
      expect(users.admin.email).toBe(TEST_USERS.admin.email);
      expect(users.user.email).toBe(TEST_USERS.user.email);
      expect(users.provider.email).toBe(TEST_USERS.provider.email);

      // Verify they exist in database
      const dbUsers = await prisma.user.findMany({
        where: {
          email: {
            in: [TEST_USERS.admin.email, TEST_USERS.user.email, TEST_USERS.provider.email],
          },
        },
      });
      expect(dbUsers).toHaveLength(3);

      // Clean up all test users
      await cleanupTestUsers();

      // Verify they were all deleted
      const remainingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: [TEST_USERS.admin.email, TEST_USERS.user.email, TEST_USERS.provider.email],
          },
        },
      });
      expect(remainingUsers).toHaveLength(0);
    });
  });

  describe('Test Isolation', () => {
    it('test 1: should start with no test users', async () => {
      // Verify no test users exist at start
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: Object.values(TEST_USERS).map((u) => u.email),
          },
        },
      });
      expect(users).toHaveLength(0);

      // Create a test user
      await createTestUser('admin');

      // User should exist now
      const adminUser = await prisma.user.findUnique({
        where: { email: TEST_USERS.admin.email },
      });
      expect(adminUser).toBeTruthy();
    });

    it('test 2: should also start with no test users (isolated from test 1)', async () => {
      // Even though test 1 created a user, it should be cleaned up
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: Object.values(TEST_USERS).map((u) => u.email),
          },
        },
      });
      expect(users).toHaveLength(0);

      // Create a different test user
      await createTestUser('user');

      // Only the new user should exist
      const regularUser = await prisma.user.findUnique({
        where: { email: TEST_USERS.user.email },
      });
      expect(regularUser).toBeTruthy();

      // Admin from test 1 should not exist
      const adminUser = await prisma.user.findUnique({
        where: { email: TEST_USERS.admin.email },
      });
      expect(adminUser).toBeNull();
    });
  });
});
