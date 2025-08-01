# Epic 3, Story 3.1: User Preference Center

## User Story
**As a** subscribed parent  
**I want** to save my preferences for activities  
**So that** the service can send me relevant suggestions automatically

## Epic
Epic: #4 (Proactive Suggestions & User Preferences)

## Acceptance Criteria
1. A logged-in user can access a "Preferences" page from their account menu
2. The preference center allows users to:
   - Set and save their preferred search radius (km from location)
   - Enter multiple locations (home, work, grandparents)
   - Select preferred activity types with multi-select
   - Enter children's details (name/nickname, age/DOB)
   - Set communication preferences (email frequency)
   - Choose preferred days of the week
   - Set budget preferences (optional)
3. Preferences are validated before saving
4. Success confirmation shown after saving
5. Users can update preferences at any time
6. Changes are reflected immediately in searches
7. Option to enable/disable automated suggestions
8. Clear privacy notice about data usage

## Technical Tasks
- [ ] Design preference center UI/UX
- [ ] Create preferences page component
- [ ] Build form with validation
- [ ] Implement location search/selection with geocoding
- [ ] Create multi-select activity type component
- [ ] Build child profile management section
- [ ] Create API endpoints for preference CRUD operations
- [ ] Update user model with preference schema
- [ ] Add preference data validation
- [ ] Implement auto-save functionality
- [ ] Add success/error notifications
- [ ] Unit test form validation and API
- [ ] E2E test preference management flow

## Definition of Done
- [ ] Code follows project standards and passes linting
- [ ] Unit tests written and passing with >80% coverage
- [ ] Form validation provides clear error messages
- [ ] All preferences properly persisted to database
- [ ] Responsive design tested on all devices
- [ ] Accessibility tested (form navigation, labels)
- [ ] API endpoints documented
- [ ] Privacy compliance verified
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging environment

## Dependencies
- User authentication system (Epic 1) must be complete
- Activity type taxonomy defined
- Privacy policy updated for preference data

## Story Points
8 points

## Priority
Medium

## Sprint/Milestone
Milestone 3: Enhanced Features