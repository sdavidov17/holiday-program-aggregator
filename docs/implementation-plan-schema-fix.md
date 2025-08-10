# Implementation Plan: Schema Field Alignment Fix

## Objective
Fix all TypeScript compilation errors by aligning code with the SQLite schema field names that are used in CI/CD.

## Step-by-Step Implementation Guide

### Step 1: Create New Branch
```bash
git checkout main
git pull origin main
git checkout -b fix/schema-field-alignment
```

### Step 2: Update Production Schema
**File: `apps/web/prisma/schema.production.prisma`**

Replace the Provider model with SQLite-compatible fields:
```prisma
model Provider {
  id                  String   @id @default(cuid())
  businessName        String   // Changed from 'name'
  contactName         String   // Added
  email               String
  phone               String
  website             String?
  abn                 String?  // Added
  address             String
  suburb              String
  state               String
  postcode            String
  description         String
  logoUrl             String?
  bannerUrl           String?  // Changed from 'bannerImageUrl'
  capacity            Int?     // Added
  ageGroups           String[] // Keep as array for PostgreSQL
  specialNeeds        Boolean  @default(false) // Added
  specialNeedsDetails String?  // Added
  isPublished         Boolean  @default(false)
  isVetted            Boolean  @default(false)
  vettingNotes        String?  // Added
  vettingDate         DateTime? // Changed from 'vettedAt'
  vettingStatus       String   @default("NOT_STARTED") // Added
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  programs Program[]

  @@index([suburb, state])
  @@index([isPublished, isVetted])
}
```

### Step 3: Fix Provider Router
**File: `apps/web/src/server/api/routers/provider.ts`**

Key changes:
```typescript
// Line ~119: Fix orderBy
orderBy: {
  createdAt: "desc", // Change from 'name' or 'businessName'
},

// Line ~160: Fix create mutation
const provider = await ctx.db.provider.create({
  data: {
    businessName: input.name, // Map input.name to businessName
    contactName: "", // Add required field
    email: input.email || "",
    phone: input.phone || "",
    website: input.website,
    abn: "", // Add field
    address: input.address || "",
    suburb: input.suburb || "",
    state: input.state || "",
    postcode: input.postcode || "",
    description: input.description || "",
    logoUrl: input.logoUrl,
    bannerUrl: input.bannerImageUrl, // Map field
    capacity: 0,
    ageGroups: ageGroups ? JSON.stringify(ageGroups) : "[]",
    specialNeeds: false,
    specialNeedsDetails: "",
    isVetted: input.isVetted ?? false,
    isPublished: input.isPublished ?? false,
    vettingDate: input.isVetted ? new Date() : null,
    vettingStatus: input.isVetted ? "APPROVED" : "NOT_STARTED",
  },
});

// Line ~265: Fix select
select: { 
  businessName: true, // Change from 'name'
  ...
}

// Line ~287: Fix delete mutation reference
providerName: provider.businessName, // Change from 'name'

// Line ~301: Fix vetting update
data: {
  isVetted: !provider.isVetted,
  vettingDate: !provider.isVetted ? new Date() : null,
  vettingStatus: !provider.isVetted ? "APPROVED" : "NOT_STARTED",
  // Remove vettedBy, vettedAt
}

// Line ~346: Remove publishedAt update
data: {
  isPublished: !provider.isPublished,
  // Remove publishedAt
}

// Line ~370: Fix program creation
data: {
  ...programData,
  // Remove minAge, maxAge, galleryUrls mappings
  // The programData already has the correct field names
}
```

### Step 4: Fix Admin Pages
**File: `apps/web/src/pages/admin/providers/[id].tsx`**

Complete field mapping update:
```typescript
// Update form state to match schema
const [formData, setFormData] = useState({
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  abn: "",
  address: "",
  suburb: "",
  state: "",
  postcode: "",
  description: "",
  logoUrl: "",
  bannerUrl: "",
  capacity: 0,
  ageGroups: "",
  specialNeeds: false,
  specialNeedsDetails: "",
  isVetted: false,
  isPublished: false,
});

// Update effect to map provider fields
useEffect(() => {
  if (provider) {
    setFormData({
      businessName: provider.businessName || "",
      contactName: provider.contactName || "",
      // ... map all fields from provider
    });
  }
}, [provider]);

// Update submit handler
updateProvider.mutate({
  id,
  name: formData.businessName, // Map back for API
  // ... other fields
});

// Update JSX field references
<AdminLayout title={`Edit Provider: ${provider.businessName}`}>
// ... update all input fields
```

**File: `apps/web/src/pages/admin/providers/index.tsx`**
```typescript
// Line ~123: Update display
<td>{provider.businessName}</td>

// Line ~175: Update search/filter
provider.businessName.toLowerCase().includes(searchTerm)
```

**File: `apps/web/src/pages/admin/index.tsx`**
```typescript
// Line ~109: Update display
{provider.businessName}
```

### Step 5: Fix Subscription Lifecycle
**File: `apps/web/src/services/subscription-lifecycle.ts`**

```typescript
// Line ~64-65: Fix field name
OR: [
  { lastReminderSent: null },
  { lastReminderSent: { lt: addDays(new Date(), -1) } }
]

// Line ~93: Fix update
data: {
  lastReminderSent: new Date(),
  reminderCount: { increment: 1 }
}
```

### Step 6: Fix User Router
**File: `apps/web/src/server/api/routers/user.ts`**

Remove PII fields that don't exist in SQLite schema:
```typescript
// Remove or comment out:
// phoneNumber: encryptedPhone,
// dateOfBirth: encryptedDOB,
// address: encryptedAddress,
```

### Step 7: Update Seed Scripts
**Files: `apps/web/prisma/seed*.ts`**

Update all seed scripts to use correct field names:
- Use `businessName` not `name`
- Use `contactName` field
- Use `vettingDate` not `vettedAt`
- Add `vettingStatus` field
- Remove references to non-existent fields

### Step 8: Test Locally
```bash
# Regenerate Prisma client
cd apps/web
pnpm install

# Test TypeScript compilation
pnpm type-check

# Test with local database
pnpm db:push
pnpm db:seed
pnpm dev

# Run tests
pnpm test
pnpm test:e2e
```

### Step 9: Create Pull Request
```bash
git add -A
git commit -m "fix: Align all code with SQLite schema field names

- Updated production schema to match SQLite field names
- Fixed all TypeScript compilation errors
- Updated admin pages to use correct field names
- Fixed API routers to use consistent fields
- Updated seed scripts for all environments

Resolves CI/CD pipeline failures and ensures consistency across environments."

git push -u origin fix/schema-field-alignment
gh pr create --title "fix: Schema field alignment for CI/CD compatibility" \
  --body "Implements the schema alignment plan from PR #130"
```

## Validation Checklist

- [ ] All TypeScript errors resolved (`pnpm type-check` passes)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Local development works with SQLite
- [ ] Admin panel CRUD operations work
- [ ] Seed scripts execute successfully
- [ ] Unit tests pass
- [ ] E2E tests pass (update if needed)
- [ ] CI pipeline passes
- [ ] Preview deployment works

## Potential Issues & Solutions

### Issue: Existing data in production
**Solution**: Create a migration script to rename columns (see migration example in schema-alignment.md)

### Issue: API breaking changes
**Solution**: Create a compatibility layer that accepts both old and new field names during transition

### Issue: Third-party integrations
**Solution**: Review and update any external systems that depend on the API

## Notes for Implementation

1. **Start with schema changes** - Get the schemas aligned first
2. **Fix compilation errors systematically** - Work through each file methodically
3. **Test frequently** - Run `pnpm type-check` after each major change
4. **Keep changes focused** - Only fix field name issues, don't refactor other code
5. **Document any decisions** - If you need to make choices, document why

## References

- [Database Schema Alignment Issues](./database-schema-alignment.md)
- [Database Management Strategy](./database-management-strategy.md)
- [Environment Setup Guide](./environment-setup-guide.md)
- PR #130 - Documentation and strategy