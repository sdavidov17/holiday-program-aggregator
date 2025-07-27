# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.5: Manual Provider Onboarding Tool

*As an admin, I want a simple interface to manually enter, edit, and vet new provider data, so that we have a reliable way to onboard our first providers for launch.*

### Acceptance Criteria
1. A logged-in admin can access a secure admin dashboard.
2. The admin can create a new provider profile using a data entry form.
3. The form includes all necessary fields.
4. The admin can mark the provider as 'Vetted' and 'Published'.

### Development Tasks
- [ ] Add `Provider` and `Program` models to the Prisma schema, including all necessary fields (name, description, location, etc.).
- [ ] Add a `role` field (e.g., 'USER', 'ADMIN') to the `User` model.
- [ ] Create a secure admin dashboard area, accessible only to users with the 'ADMIN' role.
- [ ] Build a data entry form within the admin dashboard for creating a new `Provider`.
- [ ] The form should include fields for all provider details, such as name, description, address, contact info, and photo URLs.
- [ ] Add a boolean `isVetted` and `isPublished` field to the `Provider` model.
- [ ] Implement checkboxes or toggles in the form to allow the admin to set the `isVetted` and `isPublished` status.
- [ ] Create a tRPC procedure (`createProvider`) that validates and saves the form data to the database.
- [ ] Ensure the form provides clear feedback on successful creation or validation errors.