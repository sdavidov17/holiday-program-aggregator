# Test Coverage Improvement Plan

**Status**: Ready for Development
**Current Coverage**: 23%
**Target Coverage**: 80%
**Priority**: HIGH

## Executive Summary

This plan outlines the prioritized approach to increase test coverage from 23% to 80%, focusing on business-critical paths first.

---

## Phase 1: Critical Business Logic (Week 1-2)

### Priority 1: Payment & Subscription (Revenue Critical)

| File | Current | Target | Effort |
|------|---------|--------|--------|
| `src/services/subscription-lifecycle.ts` | 0% | 100% | 3-4 days |
| `src/server/api/routers/subscription.ts` | 0% | 90% | 2-3 days |
| `src/utils/stripe.ts` | 0% | 90% | 2-3 days |

**Test Cases Needed:**
- Subscription creation flow
- Subscription cancellation
- Payment webhook processing
- Grace period handling
- Renewal processing
- Failed payment handling

### Priority 2: Authentication & Security

| File | Current | Target | Effort |
|------|---------|--------|--------|
| `src/server/auth.ts` | 0% | 90% | 3-4 days |
| `src/lib/rate-limiter.ts` | Partial | 90% | 1-2 days |
| `src/utils/encryption.ts` | 0% | 100% | 1-2 days |

**Test Cases Needed:**
- Login/logout flows
- Session management
- Password hashing
- Rate limit enforcement
- PII encryption/decryption

### Priority 3: Data Access Layer

| File | Current | Target | Effort |
|------|---------|--------|--------|
| `src/repositories/base.repository.ts` | 0% | 80% | 3-4 days |
| `src/repositories/provider.repository.ts` | Partial | 80% | 2-3 days |

**Test Cases Needed:**
- CRUD operations
- Transaction handling
- Error handling
- Geospatial search (new)
- Audit logging

---

## Phase 2: API Layer (Week 3-4)

### tRPC Routers

| File | Current | Target | Effort |
|------|---------|--------|--------|
| `src/server/api/routers/admin.ts` | 0% | 80% | 2-3 days |
| `src/server/api/routers/user.ts` | 0% | 80% | 1-2 days |
| `src/server/api/trpc.ts` | 0% | 70% | 2-3 days |

**Test Cases Needed:**
- Admin operations (user management, role changes)
- User profile operations
- Middleware chain testing
- Authorization enforcement

---

## Phase 3: Components & Hooks (Week 5)

### Critical Components

| Component | Current | Target | Effort |
|-----------|---------|--------|--------|
| `SubscriptionCard.tsx` | 0% | 80% | 1-2 days |
| `AdminGuard.tsx` | 0% | 90% | 1 day |
| `PremiumFeatureGuard.tsx` | 100% | 100% | Done |

### Hooks

| Hook | Current | Target | Effort |
|------|---------|--------|--------|
| `useSubscriptionStatus.ts` | 100% | 100% | Done |

---

## Phase 4: E2E & Integration (Week 6-8)

### Critical User Journeys

1. **Parent Subscription Journey**
   - Search for programs
   - View provider details
   - Subscribe to premium
   - Access premium features

2. **Provider Onboarding Journey**
   - Provider registration
   - Program creation
   - Vetting process
   - Publishing

3. **Admin Management Journey**
   - User management
   - Provider vetting
   - Subscription monitoring

---

## Test Infrastructure Available

### Existing Setup
- Jest 30.0.5 with ts-jest
- React Testing Library 16.3.0
- Playwright 1.55.1 for E2E
- Test factories in `/src/__tests__/factories/`
- Mock database setup in `/src/__tests__/setup/`

### Commands
```bash
pnpm test              # Run unit tests
pnpm test:coverage     # Generate coverage report
pnpm test:ci           # CI mode with reporters
pnpm test:e2e          # Playwright E2E tests
```

---

## Coverage Thresholds

### Current (Progressive)
```javascript
coverageThreshold: {
  global: {
    branches: 23,
    functions: 22,
    lines: 30,
    statements: 30,
  }
}
```

### Target (End State)
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  'src/services/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  'src/repositories/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  }
}
```

---

## Success Metrics

| Milestone | Coverage | Timeline |
|-----------|----------|----------|
| Phase 1 Complete | 50% | Week 2 |
| Phase 2 Complete | 65% | Week 4 |
| Phase 3 Complete | 75% | Week 5 |
| Phase 4 Complete | 80%+ | Week 8 |

---

## Resources Required

- 1-2 developers focused on test writing
- QA engineer for test design review
- 6-8 weeks for full implementation

---

## Definition of Done

- [ ] All critical paths have 90%+ coverage
- [ ] Overall coverage reaches 80%
- [ ] All tests pass in CI
- [ ] No flaky tests
- [ ] Test documentation updated
