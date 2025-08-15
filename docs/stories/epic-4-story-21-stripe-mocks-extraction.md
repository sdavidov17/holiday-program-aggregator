# EPIC 4: Technical Excellence / Observability

## STORY 4.21: Extract Stripe Mocks to Dedicated Module

### Story Description
As a developer working with payment functionality, I need a centralized and reusable Stripe mock module to ensure consistent testing across all payment-related features and reduce code duplication.

### Milestone
**Phase 3: User Experience** - Due: September 30, 2025

### Acceptance Criteria
- [ ] Stripe mocks extracted to dedicated module
- [ ] All payment tests use centralized mocks
- [ ] Mock data matches Stripe API structure
- [ ] Common scenarios pre-configured
- [ ] TypeScript types fully supported
- [ ] Documentation includes usage examples
- [ ] Existing tests migrated to new mocks

### Current State Analysis

#### Existing Stripe Mocks
Currently scattered across test files:
- `__tests__/api/stripe/webhook.test.ts` - webhook mocks
- `__tests__/services/subscription.service.test.ts` - service mocks
- Various inline mocks in integration tests

#### Issues with Current Approach
1. Duplicate mock definitions
2. Inconsistent mock data structure
3. Difficult to maintain when Stripe API changes
4. No centralized test scenarios
5. Type safety not guaranteed

### Proposed Architecture

#### Module Structure
```
/apps/web/src/__tests__/mocks/stripe/
├── index.ts                 # Main export file
├── stripe-mock.ts           # Core Stripe mock object
├── fixtures/
│   ├── customers.ts         # Customer fixtures
│   ├── subscriptions.ts     # Subscription fixtures
│   ├── products.ts          # Product/Price fixtures
│   ├── checkout.ts          # Checkout session fixtures
│   ├── invoices.ts          # Invoice fixtures
│   └── webhooks.ts          # Webhook event fixtures
├── builders/
│   ├── customer-builder.ts  # Fluent builders
│   ├── subscription-builder.ts
│   └── webhook-builder.ts
└── scenarios/
    ├── successful-subscription.ts
    ├── failed-payment.ts
    ├── subscription-cancellation.ts
    └── trial-conversion.ts
```

#### Core Mock Implementation
```typescript
// stripe-mock.ts
import { Stripe } from 'stripe';
import { MockProxy, mock } from 'jest-mock-extended';

export class StripeMock {
  public stripe: MockProxy<Stripe>;
  
  constructor() {
    this.stripe = mock<Stripe>();
    this.setupDefaultBehavior();
  }

  private setupDefaultBehavior(): void {
    // Default successful responses
    this.stripe.customers.create.mockResolvedValue(
      createCustomerFixture()
    );
    
    this.stripe.subscriptions.create.mockResolvedValue(
      createSubscriptionFixture()
    );
    
    // Add more defaults...
  }

  // Scenario helpers
  mockSuccessfulSubscription(): void {
    this.stripe.checkout.sessions.create.mockResolvedValue(
      createCheckoutSessionFixture({ status: 'complete' })
    );
  }

  mockFailedPayment(): void {
    this.stripe.paymentIntents.retrieve.mockResolvedValue(
      createPaymentIntentFixture({ status: 'failed' })
    );
  }

  // Reset all mocks
  reset(): void {
    jest.clearAllMocks();
    this.setupDefaultBehavior();
  }
}
```

#### Fixture Builders
```typescript
// builders/subscription-builder.ts
export class SubscriptionBuilder {
  private subscription: Partial<Stripe.Subscription>;

  constructor() {
    this.subscription = {
      id: 'sub_test_123',
      status: 'active',
      created: Date.now() / 1000,
      // ... default values
    };
  }

  withStatus(status: Stripe.Subscription.Status): this {
    this.subscription.status = status;
    return this;
  }

  withTrialEnd(date: Date): this {
    this.subscription.trial_end = Math.floor(date.getTime() / 1000);
    return this;
  }

  withItems(items: Stripe.SubscriptionItem[]): this {
    this.subscription.items = { data: items } as any;
    return this;
  }

  build(): Stripe.Subscription {
    return this.subscription as Stripe.Subscription;
  }
}
```

### BDD Scenarios

#### Scenario 1: Mock Successful Subscription
```gherkin
Given I need to test successful subscription flow
When I use the Stripe mock module
Then I should be able to mock checkout session creation
And I should be able to mock webhook confirmation
And the mock data should match Stripe's structure
```

#### Scenario 2: Mock Payment Failure
```gherkin
Given I need to test payment failure handling
When I configure the mock for failed payment
Then subsequent payment attempts should fail
And appropriate error objects should be returned
And retry logic can be tested
```

#### Scenario 3: Mock Webhook Events
```gherkin
Given I need to test webhook handling
When I create a mock webhook event
Then the event should have valid signature
And the event data should match Stripe format
And event types should be type-safe
```

### Implementation Tasks
1. [ ] Create mock module structure
2. [ ] Implement core StripeMock class
3. [ ] Create fixture files for all Stripe objects
4. [ ] Implement fluent builders
5. [ ] Define common test scenarios
6. [ ] Add TypeScript type definitions
7. [ ] Migrate existing tests to use new mocks
8. [ ] Create comprehensive documentation
9. [ ] Add mock validation utilities
10. [ ] Create test helpers for common assertions

### Usage Examples

#### Basic Usage
```typescript
import { StripeMock } from '~/__tests__/mocks/stripe';

describe('Subscription Service', () => {
  let stripeMock: StripeMock;

  beforeEach(() => {
    stripeMock = new StripeMock();
  });

  afterEach(() => {
    stripeMock.reset();
  });

  it('should create subscription', async () => {
    stripeMock.mockSuccessfulSubscription();
    
    const result = await subscriptionService.create({
      userId: 'user_123',
      priceId: 'price_123',
    });
    
    expect(result.status).toBe('active');
  });
});
```

#### Advanced Scenarios
```typescript
import { SubscriptionBuilder, WebhookBuilder } from '~/__tests__/mocks/stripe';

it('should handle trial ending', async () => {
  const subscription = new SubscriptionBuilder()
    .withStatus('trialing')
    .withTrialEnd(new Date('2025-08-31'))
    .build();
    
  const webhook = new WebhookBuilder()
    .withType('customer.subscription.trial_will_end')
    .withData(subscription)
    .build();
    
  await handleWebhook(webhook);
  
  expect(emailService.sendTrialEndingEmail).toHaveBeenCalled();
});
```

### Dependencies
- jest-mock-extended for type-safe mocks
- Stripe SDK types
- Existing test infrastructure

### Estimated Effort
- **Size**: S (Small)
- **Points**: 3
- **Duration**: 2 days

### Definition of Ready
- [x] Existing mocks analyzed
- [x] Module structure defined
- [x] Common scenarios identified
- [x] Type requirements clear

### Definition of Done
- [ ] Mock module fully implemented
- [ ] All Stripe objects have fixtures
- [ ] Builders provide fluent interface
- [ ] Scenarios cover common use cases
- [ ] TypeScript types complete
- [ ] All tests migrated
- [ ] Documentation with examples
- [ ] Team trained on usage

### Notes
- Consider publishing as internal package if useful across projects
- Keep mocks updated with Stripe API changes
- Use Stripe's test mode data as reference
- Consider generating mocks from OpenAPI spec
- Add mock request/response logging for debugging

### Related Issues
- GitHub Issue: TBD
- Related to: PR #148, PR #149, Story 4.18
- Part of: Epic 4 - Technical Excellence
- Milestone: Phase 2 - Core Admin (Aug 31, 2025)