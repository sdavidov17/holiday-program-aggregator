# EPIC 4: Technical Excellence / Observability

## STORY 4.20: Optimize Test Performance for CI/CD Pipeline

### Story Description
As a development team, we need to optimize our test suite performance to reduce CI/CD pipeline execution time, enabling faster feedback cycles and more efficient deployments.

### Milestone
**Phase 3: User Experience** - Due: September 30, 2025

### Acceptance Criteria
- [ ] Test suite runs in under 2 minutes (currently ~4 minutes)
- [ ] Parallel test execution implemented
- [ ] Database connection pooling optimized
- [ ] Test data setup minimized
- [ ] Unnecessary test reruns eliminated
- [ ] CI cache strategy implemented
- [ ] Performance metrics tracked

### Current Performance Baseline
- Total test time: ~3.8 seconds locally, ~4 minutes in CI
- Test suites: 22
- Total tests: 212 (178 active, 34 skipped)
- Database setup time: Unknown
- Coverage calculation time: ~1 minute

### Technical Analysis

#### Performance Bottlenecks
1. **Database Operations**:
   - Each test file creates new Prisma client
   - No connection pooling between tests
   - Database reset between test suites

2. **Coverage Collection**:
   - Full instrumentation overhead
   - HTML report generation in CI

3. **Module Resolution**:
   - No module caching
   - Full TypeScript compilation each run

4. **Test Isolation**:
   - Excessive mocking recreation
   - Duplicate test data generation

### Optimization Strategies

#### 1. Parallel Execution
```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%', // Use 50% of available CPU cores
  // or
  maxWorkers: 4, // Fixed number of workers
};
```

#### 2. Shared Test Database
```typescript
// test-db-setup.ts
let prismaClient: PrismaClient;

export function getTestPrisma(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  }
  return prismaClient;
}

// Clean up after all tests
afterAll(async () => {
  await prismaClient?.$disconnect();
});
```

#### 3. CI Caching Strategy
```yaml
# .github/workflows/test.yml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm-store
      **/node_modules
      **/.next/cache
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Cache test results
  uses: actions/cache@v3
  with:
    path: |
      coverage
      .jest-cache
    key: test-cache-${{ github.sha }}
```

#### 4. Selective Testing
```bash
# Run only affected tests
jest --onlyChanged
jest --changedSince=main

# Skip coverage in development
jest --coverage=false
```

### BDD Scenarios

#### Scenario 1: Fast Local Development
```gherkin
Given a developer makes a change to a single file
When they run tests locally
Then only affected tests should run
And results should appear within 10 seconds
And coverage should be optional
```

#### Scenario 2: Efficient CI Pipeline
```gherkin
Given a PR is pushed to GitHub
When CI pipeline runs
Then dependencies should be cached
And tests should run in parallel
And total time should be under 2 minutes
```

#### Scenario 3: Smart Test Selection
```gherkin
Given multiple test files exist
When a utility function is changed
Then only tests importing that utility should run
And unrelated tests should be skipped
And coverage should track only changed files
```

### Implementation Tasks
1. [ ] Profile current test performance
2. [ ] Implement parallel test execution
3. [ ] Set up shared database connection pool
4. [ ] Configure module resolution caching
5. [ ] Optimize mock creation and teardown
6. [ ] Implement CI caching strategy
7. [ ] Add test performance monitoring
8. [ ] Create development vs CI test profiles
9. [ ] Document optimization techniques
10. [ ] Set up performance regression alerts

### Performance Targets

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Local test run | 3.8s | <3s | Without coverage |
| CI test run | 4min | <2min | With coverage |
| Single file test | 500ms | <200ms | Average |
| Coverage report | 1min | <30s | HTML generation |
| Database setup | Unknown | <5s | Per suite |

### Monitoring Plan
```typescript
// test-performance.js
export function trackTestPerformance() {
  const startTime = Date.now();
  
  afterAll(() => {
    const duration = Date.now() - startTime;
    console.log(`Test suite completed in ${duration}ms`);
    
    // Send to monitoring service
    if (process.env.CI) {
      sendMetric('test.duration', duration);
    }
  });
}
```

### Dependencies
- Jest 29+ for improved performance features
- GitHub Actions cache action
- Monitoring service for metrics
- Database connection pooling library

### Estimated Effort
- **Size**: M (Medium)
- **Points**: 5
- **Duration**: 3-4 days

### Definition of Ready
- [x] Performance baseline measured
- [x] Bottlenecks identified
- [x] Target metrics defined
- [x] Optimization strategies researched

### Definition of Done
- [ ] Test suite runs under 2 minutes in CI
- [ ] Parallel execution configured
- [ ] Caching strategy implemented
- [ ] Performance metrics tracked
- [ ] Documentation updated
- [ ] Team trained on new test commands
- [ ] Regression alerts configured

### Notes
- Consider splitting unit and integration tests
- May need to adjust based on CI runner capabilities
- Monitor for flaky tests with parallel execution
- Consider test sharding for very large suites
- Evaluate jest alternatives (Vitest) if needed

### Related Issues
- GitHub Issue: TBD
- Related to: PR #148, PR #149, Story 4.17
- Part of: Epic 4 - Technical Excellence
- Milestone: Phase 2 - Core Admin (Aug 31, 2025)