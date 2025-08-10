# Claude Context: Schema Alignment Implementation

## Current Task
Fix TypeScript compilation errors caused by schema field name mismatches between SQLite and PostgreSQL schemas.

## Background
The codebase has inconsistent field names across different Prisma schemas, causing CI/CD failures. This document provides complete context for implementing the fix after conversation compaction.

## Quick Reference - Field Mappings

### Critical Field Differences
```
Provider Model:
  SQLite/CI → Code Currently Uses → Fix Required
  businessName → name → Change all to businessName
  contactName → (missing) → Add contactName
  vettingDate → vettedAt → Change all to vettingDate
  bannerUrl → bannerImageUrl → Change all to bannerUrl
  (no field) → vettedBy → Remove vettedBy references
  (no field) → publishedAt → Remove publishedAt references

Subscription Model:
  lastReminderSent → lastReminderSentAt → Change all to lastReminderSent

User Model:
  (no field) → phoneNumber → Remove phoneNumber
  (no field) → dateOfBirth → Remove dateOfBirth
  (no field) → address → Remove address
```

## Files That Need Fixing

### Priority 1 - Schema Files
- [ ] `apps/web/prisma/schema.production.prisma` - Align with SQLite schema

### Priority 2 - API Routes (Most Errors)
- [ ] `apps/web/src/server/api/routers/provider.ts`
  - Line 119: Change orderBy name → createdAt
  - Line 160-182: Fix create mutation field mapping
  - Line 265: Fix select businessName
  - Line 287: Fix delete reference
  - Line 301-303: Fix vetting update
  - Line 346: Remove publishedAt
  - Line 370+: Fix program creation

- [ ] `apps/web/src/server/api/routers/user.ts`
  - Remove phoneNumber, dateOfBirth, address updates

### Priority 3 - Admin Pages
- [ ] `apps/web/src/pages/admin/index.tsx`
  - Line 109: provider.name → provider.businessName

- [ ] `apps/web/src/pages/admin/providers/[id].tsx`
  - Lines 22-40: Update formData state fields
  - Lines 44-62: Update useEffect mapping
  - Line 104: Update title
  - Lines 112-400: Update all form fields

- [ ] `apps/web/src/pages/admin/providers/index.tsx`
  - Line 123: provider.name → provider.businessName
  - Line 175: Update filter

- [ ] `apps/web/src/pages/test-provider.tsx`
  - Line 39: provider.name → provider.businessName

### Priority 4 - Services
- [ ] `apps/web/src/services/subscription-lifecycle.ts`
  - Lines 64-65: lastReminderSentAt → lastReminderSent
  - Line 93: Fix update field

### Priority 5 - Seed Scripts
- [ ] `apps/web/prisma/seed.ts`
- [ ] `apps/web/prisma/seed.preview.ts`
- [ ] `apps/web/prisma/seed.production.ts`
  - Update all to use businessName, contactName, vettingDate, etc.

## Implementation Steps

### Step 1: Setup
```bash
# Start from main
git checkout main
git pull origin main
git checkout -b fix/schema-field-alignment

# Go to web app
cd apps/web
```

### Step 2: Fix Schemas
```bash
# Copy SQLite schema structure to production
# Edit: apps/web/prisma/schema.production.prisma
# Make Provider, Program, Subscription, User models match SQLite
```

### Step 3: Regenerate Prisma
```bash
# This will use SQLite schema for local dev
pnpm install

# Verify no TypeScript errors with new schema
pnpm type-check
```

### Step 4: Fix Each File
Work through the file list above, fixing field references.

### Step 5: Test
```bash
# TypeScript check
pnpm type-check

# Lint
pnpm lint

# Test database operations
pnpm db:push
pnpm db:seed
pnpm dev

# Run tests
pnpm test
```

### Step 6: Commit and PR
```bash
git add -A
git commit -m "fix: Align all code with SQLite schema field names

- Updated production schema to match SQLite field names
- Fixed all TypeScript compilation errors
- Updated admin pages to use correct field names
- Fixed API routers to use consistent fields
- Updated seed scripts for all environments

Implements schema alignment plan from PR #130
Resolves CI/CD pipeline failures"

git push -u origin fix/schema-field-alignment
```

## Testing Checklist
```
[ ] pnpm type-check passes
[ ] pnpm lint passes
[ ] pnpm db:seed works
[ ] Admin panel loads
[ ] Can create a provider
[ ] Can edit a provider
[ ] Can delete a provider
[ ] CI pipeline passes
```

## Related Documentation
- Full analysis: `/docs/database-schema-alignment.md`
- Implementation guide: `/docs/implementation-plan-schema-fix.md`
- Database strategy: `/docs/database-management-strategy.md`
- Environment setup: `/docs/environment-setup-guide.md`

## PR References
- PR #130: Documentation and strategy (current)
- PR #129: Previous attempt (closed)

## Key Decisions Made
1. Use SQLite schema as canonical (CI uses it)
2. Remove fields not in SQLite rather than add them
3. Keep changes minimal - only fix field names
4. Don't refactor unrelated code

## After Implementation
1. Update PR #130 with results
2. Create new PR with implementation
3. Monitor CI/CD pipeline
4. Test preview deployment
5. Plan production migration if needed

---
*This file should be checked first when continuing work after conversation compaction.*