# Test User Management Guide

## Overview

This guide describes the automated test user management system that ensures test users are properly cleaned up before and after each test run, maintaining test isolation and preventing data pollution.

## Key Features

✅ **Automatic Cleanup**: Test users are automatically deleted before and after each test
✅ **Test Isolation**: Each test starts with a clean slate
✅ **Consistent Test Data**: Predefined test users with known credentials
✅ **Helper Functions**: Easy-to-use utilities for creating and managing test users
✅ **Singleton Pattern**: Prevents database connection issues in tests

## Test User Definitions

The system defines three standard test users:

```typescript
TEST_USERS = {
  admin: {
    email: "test-admin@test.com",
    password: "TestAdmin123!",
    role: "ADMIN"
  },
  user: {
    email: "test-user@test.com", 
    password: "TestUser123!",
    role: "USER"
  },
  provider: {
    email: "test-provider@test.com",
    password: "TestProvider123!",
    role: "USER"
  }
}
```

## Helper Functions

### Core Functions

#### `cleanupTestUsers()`
Removes all test users from the database, including related records (sessions, accounts, subscriptions).

#### `createTestUser(type: 'admin' | 'user' | 'provider')`
Creates a single test user of the specified type, automatically cleaning up any existing user with the same email.

#### `setupTestDatabase()`
Sets up the test database with all test users. Call in `beforeAll()` or `beforeEach()`.

#### `cleanupTestDatabase()`
Cleans up all test users and disconnects from the database. Call in `afterAll()` or `afterEach()`.

#### `getTestCredentials(type)`
Returns the email and password for a test user type.

## Usage in Tests

### Basic Test Setup

```typescript
import { 
  setupTestDatabase, 
  cleanupTestDatabase,
  createTestUser,
  cleanupTestUsers,
  getTestCredentials 
} from '../helpers/test-users';

describe('Your Test Suite', () => {
  // Setup before all tests
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await cleanupTestDatabase();
  });

  // Clean before each test for isolation
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  // Clean after each test
  afterEach(async () => {
    await cleanupTestUsers();
  });

  it('should test with admin user', async () => {
    const admin = await createTestUser('admin');
    const credentials = getTestCredentials('admin');
    
    // Your test logic here
  });
});
```

### Integration Test Example

```typescript
describe('Authentication Tests', () => {
  beforeEach(async () => {
    // Start fresh for each test
    await cleanupTestUsers();
    await createTestUser('admin');
  });

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestUsers();
  });

  it('should authenticate admin user', async () => {
    const { email, password } = getTestCredentials('admin');
    
    // Test authentication logic
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });
    
    expect(result.error).toBeUndefined();
  });
});
```

## Test Scripts

### Running Tests with Automatic Cleanup

```bash
# Run all tests with cleanup
pnpm test:clean

# Run tests in watch mode with cleanup
pnpm test:clean:watch

# Run integration tests with cleanup
pnpm test:clean:integration

# Run tests with coverage
pnpm test:clean:coverage
```

### Manual Cleanup Script

If needed, you can manually clean up test users:

```bash
npx tsx -e "
import { cleanupTestUsers } from './src/__tests__/helpers/test-users';
cleanupTestUsers().then(() => console.log('Cleanup complete'));
"
```

## Global Test Setup

The Jest setup file (`jest.setup.ts`) includes automatic cleanup:

```typescript
// Global setup - runs once before all test suites
beforeAll(async () => {
  if (process.env.TEST_DATABASE_URL?.includes('postgresql')) {
    await cleanupTestUsers();
  }
});

// Global teardown - runs once after all test suites
afterAll(async () => {
  if (process.env.TEST_DATABASE_URL?.includes('postgresql')) {
    await cleanupTestUsers();
  }
});
```

## Best Practices

### 1. Always Use Test Users
Never use production or real user emails in tests. Always use the predefined test users.

### 2. Clean Before and After
Always clean up both before and after tests to ensure isolation and prevent test pollution.

### 3. Use Helper Functions
Use the provided helper functions instead of directly manipulating the database.

### 4. Handle Async Properly
All cleanup and setup functions are async - always await them:

```typescript
// ✅ Good
await cleanupTestUsers();

// ❌ Bad
cleanupTestUsers(); // Missing await
```

### 5. Test Isolation
Each test should be independent and not rely on state from previous tests:

```typescript
it('test 1', async () => {
  await createTestUser('admin');
  // Test logic
});

it('test 2', async () => {
  // Should NOT assume admin exists from test 1
  await createTestUser('admin'); 
  // Test logic
});
```

## Troubleshooting

### Database Connection Issues

If you see errors about too many database connections:
- The helper uses a singleton pattern to prevent multiple connections
- Ensure you're calling `cleanupTestDatabase()` in `afterAll()`

### Test Users Not Cleaned Up

If test users persist between runs:
1. Run manual cleanup: `npx tsx scripts/create-admin.ts cleanup`
2. Check that tests are properly awaiting cleanup functions
3. Verify database connection is working

### Tests Failing Due to Missing Users

Ensure you're creating test users in `beforeEach()` or at the start of each test:

```typescript
beforeEach(async () => {
  await createTestUser('admin');
});
```

## Environment Configuration

For tests to work properly with PostgreSQL:

```bash
# .env.test or test environment
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db"
NODE_ENV="test"
```

## CI/CD Integration

For CI environments, ensure:
1. PostgreSQL service is running
2. Test database is created
3. Environment variables are set
4. Cleanup runs even if tests fail

Example GitHub Actions:

```yaml
- name: Run tests with cleanup
  run: |
    pnpm test:clean
  env:
    TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Summary

The test user management system ensures:
- **Clean test environment** - No leftover data between tests
- **Predictable test data** - Same users with known credentials
- **Test isolation** - Each test is independent
- **Easy cleanup** - Automatic cleanup prevents data pollution
- **Better debugging** - Consistent test data makes debugging easier

Always remember: **Clean before, test, clean after!**