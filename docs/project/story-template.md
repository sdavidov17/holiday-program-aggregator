# User Story Template

Use this template when creating new user stories. Copy the entire template and fill in all sections.

---

# Epic X: [Epic Name]
## Story X.Y: [Story Title]

### User Story
**As a** [type of user]  
**I want** [goal/desire]  
**So that** [benefit/value]

### Business Value
[Describe the business value and impact of this story]

### Story Details
- **Epic**: #[Epic Number] - [Epic Name]
- **GitHub Issue**: #[Issue Number]
- **Priority**: [Critical/High/Medium/Low]
- **Story Points**: [1-13]
- **Sprint/Milestone**: [Sprint X / Milestone Name]

## Acceptance Criteria

1. **[Criterion 1 Title]**
   - [ ] Specific measurable outcome
   - [ ] Verification method

2. **[Criterion 2 Title]**
   - [ ] Specific measurable outcome
   - [ ] Verification method

3. **[Criterion 3 Title]**
   - [ ] Specific measurable outcome
   - [ ] Verification method

## BDD Scenarios

### Feature: [Feature Name]
```gherkin
Feature: [Feature Name]
  As a [role]
  I want [feature]
  So that [benefit]

  Background:
    Given [common setup for all scenarios]

  Scenario: [Happy Path - Primary Use Case]
    Given [initial context]
    And [additional context]
    When [user action]
    Then [expected outcome]
    And [additional outcomes]

  Scenario: [Alternative Flow]
    Given [initial context]
    When [different action]
    Then [different outcome]

  Scenario: [Error Handling]
    Given [initial context]
    When [invalid action]
    Then [error message displayed]
    And [system remains stable]

  Scenario Outline: [Multiple Similar Cases]
    Given I am a <user_type>
    When I perform <action>
    Then I should see <result>
    
    Examples:
      | user_type | action | result |
      | parent    | search | results list |
      | admin     | search | admin results |
```

## Test Strategy

### Unit Tests
- [ ] **Components/Functions to test:**
  - `functionName()` - Test business logic
  - `ComponentName` - Test rendering and props
  - `utilityFunction()` - Test edge cases

### Integration Tests
- [ ] **API Endpoints:**
  - `POST /api/endpoint` - Test data creation
  - `GET /api/endpoint` - Test data retrieval
  - Error handling for invalid requests

### E2E Tests
- [ ] **User Journeys:**
  - Complete flow from login to action completion
  - Error recovery scenarios
  - Cross-browser compatibility

### Performance Requirements
- Page load: < [X] seconds
- API response: < [X]ms (p95)
- Concurrent users: [X]

### Security Requirements
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Input validation
- [ ] Data encryption

## Technical Design

### Approach
[High-level technical approach]

### Components/Modules
- **Frontend:**
  - [ ] Component A
  - [ ] Component B
- **Backend:**
  - [ ] API endpoint
  - [ ] Service layer
  - [ ] Data layer

### Database Changes
```sql
-- Example schema changes
ALTER TABLE table_name ADD COLUMN column_name TYPE;
```

### API Specification
```typescript
// Request
POST /api/resource
{
  "field1": "value1",
  "field2": "value2"
}

// Response
{
  "id": "123",
  "status": "success"
}
```

### Dependencies
- External service: [Service Name]
- Library: [Library Name v1.2.3]
- Other stories: [Story X.Y]

## UI/UX Design

### Mockups
- [ ] Desktop view: [Link to design]
- [ ] Mobile view: [Link to design]
- [ ] Tablet view: [Link to design]

### Interaction Flow
1. User clicks [button]
2. System displays [modal/page]
3. User enters [data]
4. System validates and saves

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] WCAG 2.1 AA compliance
- [ ] Color contrast requirements

## Definition of Ready Checklist
- [ ] User story format complete
- [ ] Acceptance criteria defined
- [ ] BDD scenarios reviewed by PM/BA + QA + Dev
- [ ] Test strategy defined
- [ ] Technical approach approved
- [ ] UI/UX designs complete (if applicable)
- [ ] Dependencies identified
- [ ] Story estimated

## Definition of Done Checklist
- [ ] All acceptance criteria met
- [ ] All BDD scenarios pass
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Deployed to staging
- [ ] Product Owner sign-off

## Development Tasks
- [ ] Task 1: [Description]
- [ ] Task 2: [Description]
- [ ] Task 3: [Description]
- [ ] Task 4: [Description]

## Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk description] | Low/Med/High | Low/Med/High | [Mitigation strategy] |

## Notes & Assumptions
- [Any additional context]
- [Assumptions made]
- [Constraints to consider]

## Related Documents
- [Link to Epic](../stories/epic-X.md)
- [Link to PRD section](../reference/prd/section.md)
- [Link to Architecture](../architecture/component.md)
- [API Documentation](../api/endpoint.md)

## Collaboration Sign-offs
- [ ] **PM/BA**: [Name] - [Date]
- [ ] **QA Engineer**: [Name] - [Date]
- [ ] **Developer**: [Name] - [Date]
- [ ] **UX Designer**: [Name] - [Date]
- [ ] **Architect**: [Name] - [Date]
- [ ] **Product Owner**: [Name] - [Date]

---

## Implementation Status

### Progress
- [ ] Development Started
- [ ] Development Complete
- [ ] Code Review Complete
- [ ] Testing Complete
- [ ] Deployed to Staging
- [ ] Deployed to Production

### Actual vs Estimated
- **Estimated Points**: [X]
- **Actual Points**: [Y]
- **Variance Notes**: [Explanation if significant variance]

### Lessons Learned
[Document any learnings for future stories]