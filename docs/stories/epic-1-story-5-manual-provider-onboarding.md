# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.5: Manual Provider Onboarding Tool

*As an admin, I want a simple interface to manually enter, edit, and vet new provider data, so that we have a reliable way to onboard our first providers for launch.*

### Acceptance Criteria
1. A logged-in admin can access a secure admin dashboard.
2. The admin can create a new provider profile using a data entry form.
3. The form includes all necessary fields.
4. The admin can mark the provider as 'Vetted' and 'Published'.

### Development Tasks
- [x] Add `Provider` and `Program` models to the Prisma schema, including all necessary fields (name, description, location, etc.).
- [x] Add a `role` field (e.g., 'USER', 'ADMIN') to the `User` model.
- [x] Create a secure admin dashboard area, accessible only to users with the 'ADMIN' role.
- [x] Build a data entry form within the admin dashboard for creating a new `Provider`.
- [x] The form should include fields for all provider details, such as name, description, address, contact info, and photo URLs.
- [x] Add a boolean `isVetted` and `isPublished` field to the `Provider` model.
- [x] Implement checkboxes or toggles in the form to allow the admin to set the `isVetted` and `isPublished` status.
- [x] Create a tRPC procedure (`createProvider`) that validates and saves the form data to the database.
- [x] Ensure the form provides clear feedback on successful creation or validation errors.

### Implementation Status: ✅ COMPLETED

#### Completed Features:
1. **Provider & Program Models** (`/apps/web/prisma/schema.prisma`)
   - Full Provider model with all required fields
   - Program model with relationship to Provider
   - Includes isVetted, isPublished, vettingStatus fields
   - Proper indexes for performance

2. **User Role System**
   - User model includes role field (USER/ADMIN)
   - Role-based access control implemented

3. **Admin Dashboard** (`/apps/web/src/pages/admin/`)
   - Secure admin area with AdminGuard component
   - Full CRUD interface for providers
   - Access restricted to ADMIN role users

4. **Provider Management Pages**
   - `/admin/providers/new.tsx` - Create new provider with comprehensive form
   - `/admin/providers/index.tsx` - List all providers with filters
   - `/admin/providers/[id].tsx` - Edit existing provider

5. **tRPC API Endpoints** (`/apps/web/src/server/api/routers/provider.ts`)
   - `create` - Create new provider with validation
   - `update` - Update existing provider
   - `delete` - Delete provider
   - `getAll` - List providers with filters
   - `getById` - Get single provider
   - `toggleVetting` - Toggle vetting status
   - `togglePublishing` - Toggle publishing status
   - Admin-only procedures with proper authorization

6. **Data Validation**
   - Zod schemas for all input validation
   - Email format validation
   - Phone number validation
   - Australian postcode validation
   - Required field validation
   - URL validation for websites

7. **User Feedback**
   - Success messages on operations
   - Error handling with clear messages
   - Loading states during operations
   - Confirmation dialogs for deletions

#### Testing:
- Provider CRUD operations tested and working
- Admin authorization verified
- Form validation confirmed
- Database operations successful

All acceptance criteria have been met and the story is fully implemented.
