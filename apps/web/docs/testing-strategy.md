# Testing Strategy for Holiday Program Aggregator

## Overview
This document outlines the testing strategy and best practices for the Holiday Program Aggregator application, based on lessons learned from fixing CI test failures.

## Test Environment Setup

### Database Mocking
Tests should not connect to a real database. We use a mock Prisma client located at `src/__tests__/__mocks__/db.js` that provides:

- In-memory data storage for tests
- All necessary Prisma client methods (create, findMany, update, delete, etc.)
- Enum exports (SubscriptionStatus, UserRole, VettingStatus, ProgramStatus)
- Filtering capabilities for findMany operations

### Key Configuration Files

1. **jest.setup.ts**: Configures global test environment
   - Mocks database connection
   - Sets up environment variables
   - Configures Next.js router mock
   - Handles console error suppression for expected errors

2. **CI Configuration** (`.github/workflows/ci.yml`):
   - Uses PostgreSQL connection string format
   - Runs tests with proper database mocking

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad Practice:**
```typescript
// Testing implementation details
expect(mockCreateProvider).toHaveBeenCalledWith(specificArgs);
```

✅ **Good Practice:**
```typescript
// Testing user-visible behavior
expect(screen.getByText('Provider created successfully')).toBeInTheDocument();
expect(mockRouter.push).toHaveBeenCalledWith('/expected-route');
```

### 2. Mock at the Right Level

- Mock external dependencies (database, API calls, router)
- Don't mock internal component state or methods
- Use the centralized mock database client for all database operations

### 3. Handle Async Operations Properly

When testing async operations (like form submissions):
```typescript
await waitFor(() => {
  expect(someAsyncResult).toBeTruthy();
}, { timeout: 2000 });
```

### 4. Form Testing Challenges

Form submission tests with tRPC mutations can be challenging due to:
- React's event handling
- HTML5 validation
- Async mutation behavior

**Recommendation**: For complex form flows, consider:
- Integration tests that test the full flow
- Separating validation tests from submission tests
- Using React Testing Library's userEvent for better interaction simulation

### 5. Skip Problematic Tests Pragmatically

When tests are flaky or testing implementation details:
```typescript
it.skip('problematic test description', async () => {
  // Test that relies on implementation details
});
```

Document why the test is skipped and what alternative testing approach should be used.

## Common Issues and Solutions

### Issue 1: Database Connection Errors in Tests
**Symptom**: `PrismaClientInitializationError`

**Solution**: Ensure tests use the mock database client from `src/__tests__/__mocks__/db.js`

### Issue 2: Missing Enum Exports
**Symptom**: `Cannot read properties of undefined (reading 'ACTIVE')`

**Solution**: Export all necessary enums from the mock database module

### Issue 3: Tests Timing Out
**Symptom**: Tests fail with timeout errors

**Possible Causes**:
- Form validation preventing submission
- Mock not properly configured
- Async operations not handled correctly

**Solution**: 
- Add proper error logging to identify validation issues
- Ensure mocks return expected values
- Use appropriate waitFor timeouts

### Issue 4: Test Pollution
**Symptom**: Tests pass individually but fail when run together

**Solution**: 
- Clear mock data between tests
- Use `beforeEach` to reset mock states
- Ensure mock providers array is cleared properly

## Recommended Test Structure

```typescript
describe('Component/Feature Name', () => {
  // Setup
  let mockDependency: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any stateful mocks
  });

  // Group related tests
  describe('Feature subset', () => {
    it('should handle success case', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Testing Checklist

Before committing tests:
- [ ] Tests don't connect to real database
- [ ] Tests clean up after themselves
- [ ] Tests are isolated and don't depend on execution order
- [ ] Async operations are properly awaited
- [ ] Error cases are tested
- [ ] Loading states are tested
- [ ] Tests focus on behavior, not implementation
- [ ] Mock data is realistic
- [ ] Tests run successfully in CI environment

## Continuous Improvement

1. **Monitor Test Reliability**: Track which tests frequently fail in CI
2. **Refactor Flaky Tests**: Convert flaky unit tests to integration tests
3. **Document Test Decisions**: When skipping tests, document why and what the alternative is
4. **Keep Mocks Updated**: Ensure mock implementations stay in sync with real implementations

## Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.tsx

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage

# Run linting and type checking
pnpm lint && pnpm run type-check
```

## Future Improvements

1. **E2E Testing**: Implement Playwright or Cypress for critical user flows
2. **Visual Regression Testing**: Add screenshot testing for UI components
3. **Performance Testing**: Add tests for performance-critical operations
4. **Contract Testing**: Ensure API contracts between frontend and backend are maintained
5. **Test Data Factories**: Create factories for generating test data consistently