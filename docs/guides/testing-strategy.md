# Testing Strategy

This document outlines the testing strategy for the Holiday Program Aggregator. For details on how these tests are integrated into our deployment pipeline, see the [CI/CD Strategy](./ci-cd-strategy.md).

## Overview

This document defines our testing approach for the Holiday Program Aggregator, ensuring high quality and reliability across all components.

## Testing Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /----\  - Critical user journeys
      /      \  - Production-like environment
     /--------\  Integration Tests (30%)
    /          \  - API endpoints
   /            \  - Database operations
  /--------------\  Unit Tests (60%)
 /                \  - Business logic
/                  \  - Utilities & helpers
```

## Test Coverage Requirements

- **Overall**: Minimum 80% coverage
- **Critical Paths**: 95% coverage (auth, payments, search)
- **New Code**: 90% coverage required for PRs

## Testing Stack

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest + Supertest
- **E2E Tests**: Playwright
- **Performance Tests**: k6
- **Security Tests**: OWASP ZAP

## Test Categories

### 1. Unit Tests

**Location**: `__tests__/unit/`

**What to Test**:
- Pure functions
- React components (isolated)
- Utility functions
- Business logic
- Input validation

**Example**:
```typescript
// __tests__/unit/utils/validation.test.ts
describe('Email validation', () => {
  it('should validate correct email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  
  it('should reject invalid email format', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
```

### 2. Integration Tests

**Location**: `__tests__/integration/`

**What to Test**:
- API endpoints
- Database queries
- External service integration
- Authentication flows

**Example**:
```typescript
// __tests__/integration/api/providers.test.ts
describe('Provider API', () => {
  it('should create provider with valid data', async () => {
    const response = await request(app)
      .post('/api/providers')
      .send({ name: 'Test Provider', email: 'provider@test.com' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### 3. E2E Tests

**Location**: `e2e/`

**Critical User Journeys**:
1. User registration and login
2. Provider search and filtering
3. Subscription purchase flow
4. Provider profile management
5. Admin provider approval

**Example**:
```typescript
// e2e/search-journey.spec.ts
test('User can search for providers by location', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="location-input"]', 'Sydney NSW');
  await page.click('[data-testid="search-button"]');
  
  await expect(page.locator('[data-testid="provider-card"]')).toHaveCount(5);
  await expect(page.locator('text=No results found')).not.toBeVisible();
});
```

## Test Data Management

### Development Seeds
```bash
# Seed test data
pnpm db:seed

# Reset database
pnpm db:reset
```

### Test Fixtures
```typescript
// __tests__/fixtures/providers.ts
export const mockProvider = {
  id: 'test-id',
  name: 'Happy Kids Holiday Program',
  location: { lat: -33.8688, lng: 151.2093 },
  verified: true,
};
```

## Testing Patterns

### 1. Component Testing

```typescript
// Isolated component test
describe('ProviderCard', () => {
  it('should display provider information', () => {
    render(<ProviderCard provider={mockProvider} />);
    
    expect(screen.getByText(mockProvider.name)).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge')).toBeVisible();
  });
});
```

### 2. API Testing

```typescript
// tRPC procedure test
describe('provider.search', () => {
  it('should return providers within radius', async () => {
    const caller = appRouter.createCaller({ session: null });
    const result = await caller.provider.search({
      location: { lat: -33.8688, lng: 151.2093 },
      radius: 10,
    });
    
    expect(result.providers).toHaveLength(3);
    expect(result.providers[0].distance).toBeLessThan(10);
  });
});
```

### 3. Database Testing

```typescript
// Prisma query test
describe('Provider Repository', () => {
  beforeEach(async () => {
    await prisma.provider.deleteMany();
  });
  
  it('should find providers by activity type', async () => {
    // Arrange
    await createProviderWithActivity('swimming');
    
    // Act
    const providers = await findProvidersByActivity('swimming');
    
    // Assert
    expect(providers).toHaveLength(1);
  });
});
```

## Mock Strategies

### External Services

```typescript
// __mocks__/stripe.ts
export const stripe = {
  customers: {
    create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({ id: 'sub_test123' }),
  },
};
```

### Environment Variables

```typescript
// jest.setup.js
process.env = {
  ...process.env,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  NEXTAUTH_URL: 'http://localhost:3000',
  STRIPE_SECRET_KEY: 'sk_test_mock',
};
```

## Performance Testing

### Load Test Scenarios

```javascript
// k6/scenarios/search-load.js
export default function() {
  const response = http.post('http://localhost:3000/api/trpc/provider.search', {
    location: { lat: -33.8688, lng: 151.2093 },
    radius: 10,
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### Performance Benchmarks

- Search API: < 200ms p95
- Page Load: < 3s on 3G
- Database Queries: < 100ms p95

## Security Testing

### OWASP Top 10 Coverage

1. **Injection**: Input validation tests
2. **Authentication**: Session management tests
3. **XSS**: Content sanitization tests
4. **Access Control**: Authorization tests

### Security Test Example

```typescript
describe('Security', () => {
  it('should prevent SQL injection in search', async () => {
    const maliciousInput = "'; DROP TABLE providers; --";
    const response = await request(app)
      .get(`/api/search?q=${encodeURIComponent(maliciousInput)}`);
    
    expect(response.status).not.toBe(500);
    // Verify database is intact
    const providers = await prisma.provider.count();
    expect(providers).toBeGreaterThan(0);
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      
      - name: Unit & Integration Tests
        run: |
          pnpm test --coverage
          
      - name: E2E Tests
        run: |
          pnpm playwright install
          pnpm test:e2e
          
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

## Test Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test provider.test.ts

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e --ui

# Performance tests
pnpm test:perf

# Security scan
pnpm test:security
```

## Best Practices

### DO ✅

- Write tests before or with code (TDD/BDD)
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated
- Use data-testid for E2E selectors
- Mock external dependencies
- Test edge cases and error paths

### DON'T ❌

- Test implementation details
- Use hardcoded wait times
- Share state between tests
- Test framework code
- Ignore flaky tests
- Use production credentials

## Test Review Checklist

- [ ] All new code has tests
- [ ] Tests pass locally
- [ ] No console errors/warnings
- [ ] Coverage meets requirements
- [ ] Tests are readable and maintainable
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mocks are appropriate

## Monitoring & Reporting

- **Coverage Reports**: Available in `/coverage/`
- **Test Results**: Posted to PRs automatically
- **Flaky Test Tracking**: Monitored in CI dashboard
- **Performance Trends**: Tracked in Grafana

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Ensure test database exists
   createdb holiday_programs_test
   ```

2. **Port Conflicts**
   ```bash
   # Use different port for tests
   PORT=3001 pnpm test:e2e
   ```

3. **Timeout Errors**
   ```typescript
   // Increase timeout for slow operations
   jest.setTimeout(10000);
   ```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [k6 Performance Testing](https://k6.io/)