# Definition of Done (DoD)

## Overview
The Definition of Done ensures that user stories meet quality standards before being considered complete. This document establishes clear criteria that must be met for a story to be marked as "Done" and ready for production deployment.

## Core Criteria

A user story is **DONE** when ALL of the following criteria are met:

### 1. Code Complete ✅
- [ ] **Feature Implementation**: All acceptance criteria are implemented
- [ ] **Code Quality**: Code follows project style guide and best practices
- [ ] **No Debug Code**: All console.logs, debug statements, and test endpoints removed
- [ ] **Error Handling**: Proper error handling and user feedback implemented
- [ ] **Security**: No hardcoded secrets, proper authentication/authorization

### 2. BDD Scenarios & Testing ✅
- [ ] **BDD Scenarios Implemented**: All Given/When/Then scenarios are coded as tests
- [ ] **Test Pass Rate**: 100% of tests are passing
- [ ] **Test Coverage**: Minimum 80% code coverage for new code
- [ ] **Test Levels Completed**:
  - [ ] Unit Tests: All business logic tested
  - [ ] Integration Tests: API endpoints and data flows tested
  - [ ] E2E Tests: Critical user journeys tested
- [ ] **Test Data**: Test data cleaned up, no test pollution
- [ ] **Regression Tests**: Existing tests still passing

#### Test Execution Checklist
```bash
# All these commands must pass:
pnpm test              # Unit and integration tests pass
pnpm test:e2e          # E2E tests pass
pnpm test --coverage   # Coverage meets threshold
pnpm lint             # No linting errors
pnpm typecheck        # No TypeScript errors
```

### 3. Code Review & Quality ✅
- [ ] **Peer Review**: Code reviewed by at least one team member
- [ ] **Review Feedback**: All review comments addressed
- [ ] **Architectural Compliance**: Solution architect approved (if needed)
- [ ] **No Code Smells**: No duplicated code, long methods, or complex conditions
- [ ] **Performance**: No obvious performance issues

### 4. Documentation ✅
- [ ] **Code Documentation**: Complex logic has inline comments
- [ ] **API Documentation**: API endpoints documented with examples
- [ ] **README Updates**: Setup/deployment instructions updated if needed
- [ ] **Architecture Diagrams**: Updated if architecture changed
- [ ] **User Documentation**: Help text or user guides updated

### 5. Security & Compliance ✅
- [ ] **Security Scan**: Passed automated security scanning
- [ ] **Vulnerability Check**: No known vulnerabilities in dependencies
- [ ] **OWASP Compliance**: Follows OWASP guidelines
- [ ] **Data Protection**: PII data properly encrypted/protected
- [ ] **Audit Logging**: Security-relevant actions are logged

### 6. Performance & Monitoring ✅
- [ ] **Performance Benchmarks**: Meets defined performance criteria
  - Page load: < 3 seconds
  - API response: < 200ms (p95)
  - Database queries: < 100ms (p95)
- [ ] **Monitoring**: Appropriate metrics and logs added
- [ ] **Alerts**: Critical failure alerts configured
- [ ] **Error Tracking**: Errors properly logged and tracked

### 7. Deployment & Operations ✅
- [ ] **Build Success**: Code builds without warnings
- [ ] **Migration Scripts**: Database migrations tested and ready
- [ ] **Configuration**: Environment variables documented
- [ ] **Feature Flags**: Behind feature flag if needed
- [ ] **Rollback Plan**: Can be safely rolled back if issues arise

### 8. User Acceptance ✅
- [ ] **Staging Deployment**: Deployed and tested on staging
- [ ] **UAT Complete**: User acceptance testing passed
- [ ] **Product Owner Review**: PO has reviewed and approved
- [ ] **Cross-browser Testing**: Works on all supported browsers
- [ ] **Responsive Design**: Works on mobile, tablet, and desktop

## DoD by Story Type

### Frontend Story
- [ ] Component renders correctly
- [ ] Responsive on all screen sizes
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Cross-browser compatibility verified
- [ ] Loading states implemented
- [ ] Error states handled gracefully

### Backend/API Story
- [ ] API responds with correct status codes
- [ ] Request validation implemented
- [ ] Response format matches specification
- [ ] Rate limiting applied where needed
- [ ] Database transactions handled properly
- [ ] Caching strategy implemented

### Bug Fix Story
- [ ] Bug is fixed and verified
- [ ] Root cause documented
- [ ] Regression test added
- [ ] Related code reviewed for similar issues
- [ ] Fix verified in production-like environment

### Infrastructure Story
- [ ] Infrastructure as Code updated
- [ ] Security groups and permissions correct
- [ ] Monitoring and alerting configured
- [ ] Cost impact analyzed and approved
- [ ] Disaster recovery tested
- [ ] Documentation updated

## Testing Requirements by Level

### Unit Test Requirements
```javascript
describe('Component/Function', () => {
  it('should handle happy path', () => {
    // Test normal operation
  });
  
  it('should handle edge cases', () => {
    // Test boundary conditions
  });
  
  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

### Integration Test Requirements
```javascript
describe('API Endpoint', () => {
  it('should return correct data', async () => {
    // Test data retrieval
  });
  
  it('should validate input', async () => {
    // Test input validation
  });
  
  it('should handle database errors', async () => {
    // Test error handling
  });
});
```

### E2E Test Requirements
```javascript
test('User Journey', async ({ page }) => {
  // Setup
  await page.goto('/');
  
  // Action
  await page.click('[data-testid="action-button"]');
  
  // Assertion
  await expect(page).toHaveURL('/success');
});
```

## Quality Gates

### Automated Checks (CI/CD)
All these must pass in CI/CD pipeline:
- [ ] Build successful
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] Code coverage > 80%
- [ ] Linting passing
- [ ] Type checking passing
- [ ] Security scan passing
- [ ] Performance tests passing

### Manual Verification
- [ ] Feature works as expected
- [ ] No visual regressions
- [ ] Accessibility tested with screen reader
- [ ] Mobile experience validated
- [ ] Error scenarios tested manually

## Metrics & Reporting

### Coverage Metrics
- **Overall Coverage**: Minimum 80%
- **New Code Coverage**: Minimum 90%
- **Critical Path Coverage**: 95%

### Performance Metrics
- **Lighthouse Score**: > 90
- **Core Web Vitals**: All green
- **Bundle Size**: Within budget

### Quality Metrics
- **Defect Escape Rate**: < 5%
- **Test Failure Rate**: < 1%
- **Code Review Turnaround**: < 4 hours

## DoD Compliance Tracking

Track and report:
- % of stories meeting DoD before release
- Average number of DoD criteria failures
- Most common DoD failures
- Time to achieve DoD after development

## Roles & Responsibilities

### Developer
- Implement all acceptance criteria
- Write and pass all tests
- Ensure code quality standards
- Update documentation

### QA Engineer
- Verify all BDD scenarios pass
- Perform exploratory testing
- Validate test coverage
- Sign off on quality

### Code Reviewer
- Review code quality
- Verify standards compliance
- Check for security issues
- Approve or request changes

### Product Owner
- Verify acceptance criteria met
- Approve user experience
- Sign off on story completion

### Scrum Master
- Ensure DoD is followed
- Track compliance metrics
- Facilitate DoD reviews
- Remove impediments

## Exceptions

Exceptions to DoD require:
1. Documentation of unmet criteria
2. Risk assessment and mitigation plan
3. Technical debt ticket created
4. Product Owner approval
5. Team consensus
6. Timeline for addressing gaps

## Continuous Improvement

Review and update DoD:
- Sprint retrospectives
- Quarterly DoD review sessions
- Based on escaped defects
- Team feedback and suggestions

## Related Documents
- [Definition of Ready](./definition-of-ready.md)
- [Story Template](./story-template.md)
- [Testing Strategy](../guides/testing-strategy.md)
- [Team Guidelines](./team-guidelines.md)
- [Code Review Process](./team-guidelines.md#code-review-process)