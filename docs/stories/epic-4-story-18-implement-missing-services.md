# EPIC 4: Technical Excellence / Observability

## STORY 4.18: Implement Missing Service Methods

### Story Description
As a developer, I need to implement the missing service methods that were discovered during testing, ensuring all service layer functionality is complete and properly tested.

### Milestone
**Phase 2: Core Admin** - Due: August 31, 2025

### Acceptance Criteria
- [ ] All service methods have implementations
- [ ] Each service method has corresponding unit tests
- [ ] Service methods follow repository pattern
- [ ] Error handling implemented consistently
- [ ] All service tests passing
- [ ] Documentation updated for new methods

### Technical Details

#### Missing Service Methods Identified
1. **SubscriptionService** (currently skipped):
   - `createCheckoutSession()`
   - `cancelSubscription()`
   - `updateSubscription()`
   - `getSubscriptionStatus()`
   - `handleWebhookEvent()`
   - `syncWithStripe()`

2. **EmailService** (partial implementation):
   - `sendWelcomeEmail()`
   - `sendSubscriptionConfirmation()`
   - `sendSubscriptionCancellation()`
   - `sendPasswordReset()`
   - `sendProviderNotification()`

3. **ProviderService** (to be created):
   - `bulkImport()`
   - `validateProvider()`
   - `publishProvider()`
   - `unpublishProvider()`
   - `updateVettingStatus()`

4. **NotificationService** (to be created):
   - `sendNotification()`
   - `queueNotification()`
   - `processNotificationQueue()`
   - `trackNotificationStatus()`

### BDD Scenarios

#### Scenario 1: Subscription Service Methods
```gherkin
Given a user wants to subscribe
When createCheckoutSession is called with valid plan
Then a Stripe checkout session should be created
And the session URL should be returned
And the session should be tracked in database
```

#### Scenario 2: Email Service Integration
```gherkin
Given a new user signs up
When sendWelcomeEmail is called
Then an email should be queued
And the email should contain user's name
And the email should include next steps
And delivery status should be tracked
```

#### Scenario 3: Provider Bulk Operations
```gherkin
Given an admin has a CSV of providers
When bulkImport is called with the file
Then providers should be validated
And valid providers should be imported
And invalid entries should be reported
And import summary should be returned
```

### Implementation Tasks
1. [ ] Implement SubscriptionService methods
2. [ ] Complete EmailService implementation
3. [ ] Create ProviderService with business logic
4. [ ] Create NotificationService
5. [ ] Add error handling and logging
6. [ ] Write comprehensive unit tests
7. [ ] Add integration tests with mocks
8. [ ] Update service documentation

### Service Architecture

```typescript
// Example service structure
export class SubscriptionService {
  constructor(
    private prisma: PrismaClient,
    private stripe: Stripe,
    private emailService: EmailService
  ) {}

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    // Implementation
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Implementation
  }

  // ... other methods
}
```

### Dependencies
- Stripe SDK for payment processing
- Email service provider (configured)
- Database models defined
- Repository layer implemented

### Estimated Effort
- **Size**: L (Large)
- **Points**: 8
- **Duration**: 1 sprint

### Definition of Ready
- [x] Service interfaces defined
- [x] Dependencies identified
- [x] Test strategy defined
- [x] Acceptance criteria clear

### Definition of Done
- [ ] All service methods implemented
- [ ] Unit test coverage >= 80%
- [ ] Integration tests passing
- [ ] Error handling comprehensive
- [ ] Logging implemented
- [ ] Documentation complete
- [ ] Code reviewed and approved

### Notes
- Services should follow single responsibility principle
- Use dependency injection for testability
- Implement proper error types for each service
- Consider using factory pattern for complex object creation
- Ensure services are stateless

### Related Issues
- GitHub Issue: TBD
- Related to: PR #148, PR #149
- Blocks: Full feature implementation
- Epic: Technical Excellence / Observability