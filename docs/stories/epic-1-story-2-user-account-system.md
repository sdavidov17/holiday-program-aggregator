# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.2: User Account System (with Google/Apple Login)

*As a parent, I want to be able to sign up and log in securely and conveniently, so that I can manage my profile and subscription.*

### Acceptance Criteria
1. A user can create an account using email/password.
2. A user can create an account using their Google account.
3. A user can create an account using their Apple account.
4. A registered user can log in using any method.
5. A logged-in user can view a basic profile page.
6. All user PII is encrypted.

### Development Tasks
- [x] Configure NextAuth.js with the Email/Password (Credentials) provider.
- [x] Configure NextAuth.js with the Google provider, setting up OAuth credentials in the Google Cloud console.
- [x] Configure NextAuth.js with the Apple provider, setting up OAuth credentials in the Apple Developer portal.
- [x] Create the Prisma schema for the `User`, `Account`, `Session`, and `VerificationToken` models as required by NextAuth.js.
- [x] Ensure the `User` model includes a field for PII, and apply Prisma's field-level encryption.
- [x] Implement a sign-up and login UI form for the Credentials provider.
- [x] Implement UI buttons for the Google and Apple social login options.
- [x] Create a basic, protected profile page that is only accessible to logged-in users.
- [x] Verify that a user can sign up, log in, and view their profile page using all three configured methods.
- [x] Write a unit test to confirm that user PII is not exposed in any API responses.