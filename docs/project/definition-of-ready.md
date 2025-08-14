# Definition of Ready (DoR)

## Overview
The Definition of Ready ensures that user stories are properly prepared before development begins. This document establishes clear criteria that must be met for a story to be considered ready for sprint planning and development.

## Core Criteria

A user story is **READY** when ALL of the following criteria are met:

### 1. Story Clarity ✅
- [ ] **User Story Format**: Written in "As a... I want... So that..." format
- [ ] **Business Value**: Clear business value or user benefit is articulated
- [ ] **Epic Linkage**: Story is linked to appropriate Epic and Milestone
- [ ] **Priority**: Story priority is set (Critical/High/Medium/Low)
- [ ] **Story Points**: Estimated by the development team (1-13 points)

### 2. Acceptance Criteria with BDD Scenarios ✅
- [ ] **Acceptance Criteria**: At least 3-5 clear, testable acceptance criteria defined
- [ ] **BDD Scenarios**: Each acceptance criterion has corresponding Given/When/Then scenarios
- [ ] **Collaboration**: BDD scenarios reviewed and approved by QA + Dev + PM/BA team
- [ ] **Edge Cases**: Negative scenarios and edge cases are documented
- [ ] **Data Requirements**: Test data needs are specified

#### BDD Scenario Format
```gherkin
Feature: [Feature Name]
  As a [role]
  I want [feature]
  So that [benefit]

  Scenario: [Scenario name]
    Given [initial context/state]
    When [action/event occurs]
    Then [expected outcome]
    And [additional outcomes]

  Scenario: [Error scenario]
    Given [initial context]
    When [invalid action]
    Then [error handling]
```

### 3. Test Strategy Definition ✅
- [ ] **Test Levels Identified**:
  - [ ] Unit Tests: Specific functions/methods to test
  - [ ] Integration Tests: API endpoints and data flows
  - [ ] E2E Tests: Critical user journeys
- [ ] **Test Coverage Target**: Minimum coverage percentage defined (usually 80%)
- [ ] **Performance Criteria**: Response time and load requirements specified
- [ ] **Security Requirements**: Security test scenarios identified

### 4. Technical Clarity ✅
- [ ] **Technical Approach**: High-level implementation approach discussed and documented
- [ ] **Architecture Review**: Solution architect has reviewed for architectural alignment
- [ ] **Dependencies Identified**: External dependencies, APIs, or services documented
- [ ] **Database Changes**: Schema changes or migrations identified
- [ ] **API Contract**: API endpoints and contracts defined (if applicable)

### 5. Design & UX ✅
- [ ] **UI/UX Designs**: Mockups or wireframes completed (for UI stories)
- [ ] **Responsive Design**: Mobile/tablet/desktop requirements specified
- [ ] **Accessibility**: WCAG 2.1 AA requirements identified
- [ ] **UX Review**: UX expert has reviewed and approved designs
- [ ] **Component Reuse**: Existing components identified for reuse

### 6. Non-Functional Requirements ✅
- [ ] **Performance**: Load time, response time targets defined
- [ ] **Security**: Authentication, authorization, data protection needs specified
- [ ] **Observability**: Logging, monitoring, and alerting requirements defined
- [ ] **Compliance**: Regulatory or compliance requirements identified
- [ ] **Browser Support**: Target browsers and versions specified

### 7. Collaboration Checkpoints ✅
- [ ] **Three Amigos Session**: PM/BA + QA + Dev have collaborated on scenarios
- [ ] **UX Review**: UX Designer has reviewed user flows
- [ ] **Architecture Review**: Solution Architect has approved technical approach
- [ ] **SM Facilitation**: Scrum Master has facilitated reviews and sign-offs
- [ ] **Stakeholder Approval**: Product Owner has signed off on acceptance criteria

## DoR Checklist by Story Type

### Frontend Story
- [ ] Mockups/designs available
- [ ] Component specifications defined
- [ ] Responsive requirements clear
- [ ] Accessibility standards defined
- [ ] Browser compatibility specified

### Backend/API Story
- [ ] API specification documented
- [ ] Request/response examples provided
- [ ] Error scenarios defined
- [ ] Performance benchmarks set
- [ ] Database schema changes identified

### Infrastructure Story
- [ ] Architecture diagram updated
- [ ] Security requirements defined
- [ ] Monitoring/alerting specified
- [ ] Rollback strategy documented
- [ ] Cost impact analyzed

### Bug Fix Story
- [ ] Root cause identified
- [ ] Reproduction steps documented
- [ ] Test to prevent regression defined
- [ ] Impact analysis completed
- [ ] Rollback plan if needed

## BDD Scenario Examples

### Example 1: User Authentication
```gherkin
Feature: User Authentication
  As a parent
  I want to securely log into the platform
  So that I can access my subscription and saved preferences

  Scenario: Successful login with email
    Given I am on the login page
    And I have a registered account with email "parent@example.com"
    When I enter valid credentials
    And I click the "Sign In" button
    Then I should be redirected to the dashboard
    And I should see my username in the header
    And my session should be active for 24 hours

  Scenario: Failed login with incorrect password
    Given I am on the login page
    When I enter email "parent@example.com"
    And I enter incorrect password "wrongpass"
    And I click the "Sign In" button
    Then I should see error message "Invalid email or password"
    And I should remain on the login page
    And the failed attempt should be logged for security
```

### Example 2: Provider Search
```gherkin
Feature: Provider Search
  As a subscribed parent
  I want to search for holiday programs near me
  So that I can find suitable activities for my children

  Scenario: Search by location with filters
    Given I am logged in as a subscribed user
    And I am on the search page
    When I enter "Sydney NSW" in the location field
    And I select "Sports" from activity type filter
    And I set age range to "8-12 years"
    And I click "Search"
    Then I should see a list of providers
    And each provider should offer sports activities
    And each provider should accept children aged 8-12
    And results should be within 10km of Sydney NSW

  Scenario: No results found
    Given I am logged in as a subscribed user
    And I am on the search page
    When I search for providers in "Remote Location, NT"
    Then I should see "No providers found" message
    And I should see suggestion to "expand search radius"
    And I should see nearby alternatives if available
```

## Roles & Responsibilities

### Product Manager/Business Analyst
- Write initial user stories and acceptance criteria
- Collaborate on BDD scenarios
- Ensure business value is clear
- Approve final acceptance criteria

### QA Engineer
- Lead BDD scenario definition
- Identify test levels and coverage
- Define test data requirements
- Review edge cases and error scenarios

### Developer
- Provide technical feasibility input
- Estimate story points
- Identify technical dependencies
- Collaborate on BDD scenarios

### UX Designer
- Provide designs and mockups
- Review user flows
- Ensure accessibility requirements
- Validate UI acceptance criteria

### Scrum Master
- Facilitate Three Amigos sessions
- Ensure all checkpoints are completed
- Track DoR compliance metrics
- Remove impediments to readiness

### Solution Architect
- Review technical approach
- Validate architecture alignment
- Identify cross-cutting concerns
- Approve infrastructure changes

## DoR Compliance Metrics

Track and report on:
- % of stories meeting DoR before sprint planning
- Average time from story creation to ready
- Number of stories returned due to incomplete DoR
- Three Amigos session attendance rate

## Exceptions

Exceptions to DoR require:
1. Documentation of missing criteria
2. Risk assessment
3. Mitigation plan
4. Product Owner approval
5. Team consensus

## Related Documents
- [Definition of Done](./definition-of-done.md)
- [Story Template](./story-template.md)
- [Testing Strategy](../guides/testing-strategy.md)
- [Team Guidelines](./team-guidelines.md)
- [BMAD Orchestration](../guides/bmad-claude-code-orchestration.md)