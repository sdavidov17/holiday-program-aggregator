# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.2: User Account System (with Google/Apple Login)

### User Story
**As a** parent
**I want** to be able to sign up and log in securely and conveniently
**So that** I can manage my profile and subscription

### Business Value
Secure authentication is foundational to the platform. Parents need convenient login options (social auth) while maintaining security. This enables personalized experiences and subscription management.

### Story Details
- **Epic**: #1 - Foundation, Provider Management & Subscriptions
- **GitHub Issue**: #93
- **Priority**: Critical
- **Story Points**: 8
- **Sprint/Milestone**: Phase 1

---

## Acceptance Criteria

1. **Email/Password Authentication**
   - [x] User can create account with email and password
   - [x] Password is securely hashed with bcrypt
   - [x] Email validation is enforced

2. **Google OAuth Login**
   - [x] User can sign up/login with Google account
   - [x] Google credentials properly configured
   - [x] Account linking handled correctly

3. **Apple OAuth Login**
   - [x] User can sign up/login with Apple account
   - [x] Apple credentials properly configured
   - [x] Privacy requirements met (email relay)

4. **Profile Management**
   - [x] Logged-in user can view profile page
   - [x] User can update their display name
   - [x] Profile page shows account information

5. **Security**
   - [x] All user PII is encrypted
   - [x] Session tokens are secure
   - [x] CSRF protection enabled

---

## BDD Scenarios

### Feature: User Authentication
```gherkin
Feature: User Authentication
  As a parent
  I want to create an account and log in
  So that I can access personalized features and manage my subscription

  Background:
    Given the application is running
    And the authentication system is configured

  Scenario: Successful email/password registration
    Given I am on the sign-up page
    When I enter a valid email "parent@example.com"
    And I enter a password that meets complexity requirements
    And I submit the registration form
    Then my account should be created
    And I should be logged in automatically
    And I should be redirected to my profile page

  Scenario: Successful Google OAuth login
    Given I am on the sign-in page
    When I click the "Continue with Google" button
    And I authorize the application in Google
    Then I should be logged in
    And my profile should show my Google account information
    And I should be redirected to the home page

  Scenario: Successful Apple OAuth login
    Given I am on the sign-in page
    When I click the "Continue with Apple" button
    And I authorize the application in Apple
    Then I should be logged in
    And my email should be properly handled (relay or real)
    And I should be redirected to the home page

  Scenario: Failed login with invalid credentials
    Given I am on the sign-in page
    When I enter email "wrong@example.com"
    And I enter password "incorrectpassword"
    And I submit the login form
    Then I should see an error message "Invalid credentials"
    And I should remain on the sign-in page

  Scenario: Password validation enforcement
    Given I am on the sign-up page
    When I enter a valid email
    And I enter a password "weak"
    And I submit the registration form
    Then I should see an error about password requirements
    And my account should not be created

  Scenario: Duplicate email prevention
    Given a user exists with email "existing@example.com"
    And I am on the sign-up page
    When I enter email "existing@example.com"
    And I complete the registration form
    Then I should see an error "Email already registered"
    And I should be prompted to sign in instead

  Scenario: Profile viewing
    Given I am logged in as "parent@example.com"
    When I navigate to my profile page
    Then I should see my email address
    And I should see my display name
    And I should see when my account was created

  Scenario: Profile name update
    Given I am logged in as "parent@example.com"
    When I navigate to my profile page
    And I update my display name to "Jane Parent"
    And I save my profile
    Then my display name should be updated
    And I should see a success message

  Scenario: Session expiration
    Given I am logged in
    And my session has expired
    When I try to access a protected page
    Then I should be redirected to the sign-in page
    And I should see a message about session expiration

  Scenario Outline: OAuth provider linking
    Given I have an account created with <original_method>
    When I try to sign in with <new_method> using the same email
    Then <expected_result>

    Examples:
      | original_method | new_method | expected_result |
      | email/password  | Google     | accounts should be linked |
      | Google          | Apple      | I should see linking option |
      | Apple           | email      | I should be prompted to set password |
```

---

## Test Strategy

### Unit Tests
- [x] **Auth configuration tests**
  - `NextAuth` options validation
  - Provider configuration verification
  - Session callback tests
- [x] **Password hashing tests**
  - `bcrypt` hash generation
  - Password comparison
  - Salt rounds verification

### Integration Tests
- [x] **API Endpoints**
  - `POST /api/auth/signin` - Credentials login
  - `GET /api/auth/session` - Session retrieval
  - `POST /api/auth/signout` - Logout
  - OAuth callback handling
- [x] **Database**
  - User creation
  - Account linking
  - Session persistence

### E2E Tests
- [x] **User Journeys**
  - Complete sign-up flow
  - Login with all providers
  - Profile update flow
  - Session persistence across pages

### Security Requirements
- [x] Password hashing with bcrypt (12 rounds)
- [x] Secure session cookies (httpOnly, secure, sameSite)
- [x] CSRF token validation
- [x] PII not exposed in API responses

---

## Technical Design

### Approach
NextAuth.js v4 with multiple providers, JWT session strategy, and Prisma adapter for database persistence.

### Components/Modules
- **Frontend:**
  - [x] SignIn page component
  - [x] SignUp form (for credentials)
  - [x] Profile page
  - [x] Auth error page
- **Backend:**
  - [x] NextAuth configuration (`server/auth.ts`)
  - [x] Prisma adapter integration
  - [x] Session callbacks

### Database Changes
```sql
-- NextAuth required tables (via Prisma)
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified TIMESTAMP,
  name TEXT,
  password TEXT,  -- For credentials provider
  role TEXT DEFAULT 'USER',
  image TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);

CREATE TABLE "Account" (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT,
  provider TEXT,
  providerAccountId TEXT,
  -- OAuth tokens...
  UNIQUE(provider, providerAccountId)
);

CREATE TABLE "Session" (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE,
  userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  expires TIMESTAMP
);
```

### Dependencies
- NextAuth.js v4.24.11
- @next-auth/prisma-adapter
- bcryptjs (password hashing)
- Google OAuth credentials
- Apple OAuth credentials

---

## Definition of Ready Checklist
- [x] User story format complete
- [x] Acceptance criteria defined
- [x] BDD scenarios reviewed by PM/BA + QA + Dev
- [x] Test strategy defined
- [x] Technical approach approved
- [x] Dependencies identified
- [x] Story estimated

## Definition of Done Checklist
- [x] All acceptance criteria met
- [x] All BDD scenarios pass
- [x] Unit tests written and passing (>80% coverage)
- [x] Integration tests passing
- [x] E2E tests passing
- [x] Code reviewed and approved
- [x] Documentation updated
- [x] Deployed to staging
- [x] Product Owner sign-off

---

## Development Tasks
- [x] Configure NextAuth.js with Credentials provider
- [x] Configure NextAuth.js with Google provider
- [x] Configure NextAuth.js with Apple provider
- [x] Create Prisma schema for auth models
- [x] Implement PII encryption
- [x] Create sign-up/login UI forms
- [x] Create social login buttons
- [x] Create protected profile page
- [x] Write unit tests for auth
- [x] Write integration tests
- [x] Write E2E tests

---

## Implementation Status

### Progress
- [x] Development Started
- [x] Development Complete
- [x] Code Review Complete
- [x] Testing Complete
- [x] Deployed to Staging
- [x] Deployed to Production

### Actual vs Estimated
- **Estimated Points**: 8
- **Actual Points**: 8
- **Variance Notes**: On target

### Completion Date
2025-08-04

---

## Related Documents
- [Epic 1 Overview](./epic-1-foundation.md)
- [Architecture: Authentication](../architecture/high-level-architecture.md)
- [API Reference: User Router](../api/api-reference.md#user-router)
