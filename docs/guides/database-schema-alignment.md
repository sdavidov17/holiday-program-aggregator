# Database Schema Alignment Issues & Resolution Plan

## Current State Analysis

### Problem Summary
The codebase has multiple Prisma schemas with inconsistent field names, causing TypeScript compilation failures and CI/CD pipeline issues.

### Schema Files
1. **schema.prisma** - Active schema (dynamically selected)
2. **schema.sqlite.prisma** - SQLite for local development
3. **schema.production.prisma** - PostgreSQL for preview/production

### Field Name Inconsistencies

#### Provider Model
| Field Purpose | SQLite Schema | Production Schema (Current) | Code Expects |
|--------------|---------------|---------------------------|--------------|
| Business name | `businessName` | `name` | Mixed |
| Contact person | `contactName` | - | `contactName` |
| ABN | `abn` | - | `abn` |
| Banner image | `bannerUrl` | `bannerImageUrl` | Mixed |
| Vetting date | `vettingDate` | `vettedAt` | Mixed |
| Vetting user | - | `vettedBy` | `vettedBy` |
| Vetting status | `vettingStatus` | - | `vettingStatus` |
| Tags | - | `tags` | `tags` |
| Certifications | - | `certifications` | `certifications` |
| Specializations | - | `specializations` | `specializations` |
| Capacity | `capacity` | - | `capacity` |
| Special needs | `specialNeeds` | - | `specialNeeds` |
| Special needs details | `specialNeedsDetails` | - | `specialNeedsDetails` |
| Published date | - | `publishedAt` | `publishedAt` |

#### Program Model
| Field Purpose | SQLite Schema | Production Schema | Code Expects |
|--------------|---------------|------------------|--------------|
| Age minimum | `ageMin` | `minAge` | Mixed |
| Age maximum | `ageMax` | `maxAge` | Mixed |
| Location | `location` | `venue` | Mixed |
| Start time | `startTime` | `schedule` (combined) | `startTime` |
| End time | `endTime` | `schedule` (combined) | `endTime` |
| Days of week | `daysOfWeek` (String) | - | `daysOfWeek` |
| Enrollment URL | `enrollmentUrl` | - | `enrollmentUrl` |
| Program status | `programStatus` | - | `programStatus` |
| Gallery URLs | - | `galleryUrls` | `galleryUrls` |

#### Subscription Model
| Field Purpose | SQLite Schema | Production Schema | Code Expects |
|--------------|---------------|------------------|--------------|
| Last reminder | `lastReminderSent` | `lastReminderSentAt` | Mixed |

#### User Model
| Field Purpose | SQLite Schema | Production Schema | Code Expects |
|--------------|---------------|------------------|--------------|
| Phone | - | `phoneNumber` | `phoneNumber` |
| Date of birth | - | `dateOfBirth` | `dateOfBirth` |
| Address | - | `address` | `address` |

## Resolution Strategy

### Phase 1: Schema Standardization
1. **Choose SQLite schema as the canonical source** (since CI uses it)
2. **Update production schema to match SQLite field names**
3. **Ensure both schemas have identical field names**

### Phase 2: Code Alignment
1. **Update all TypeScript interfaces**
2. **Fix API router field references**
3. **Update admin page components**
4. **Fix seed scripts**

### Phase 3: Testing & Validation
1. **Test local development with SQLite**
2. **Test preview deployment with PostgreSQL**
3. **Verify CI pipeline passes**
4. **Test all CRUD operations**

## Implementation Checklist

### Schema Updates Required

#### schema.production.prisma
```prisma
model Provider {
  // Rename fields to match SQLite:
  businessName        String    // was: name
  contactName         String
  abn                 String?
  bannerUrl           String?   // was: bannerImageUrl
  vettingDate         DateTime? // was: vettedAt
  vettingStatus       String    @default("NOT_STARTED")
  // Remove fields not in SQLite:
  // - vettedBy
  // - publishedAt
  // - tags
  // - certifications
  // - specializations
  // Add SQLite fields:
  capacity            Int?
  specialNeeds        Boolean   @default(false)
  specialNeedsDetails String?
}

model Program {
  // Rename fields to match SQLite:
  ageMin         Int        // was: minAge
  ageMax         Int        // was: maxAge
  location       String     // was: venue
  startTime      String
  endTime        String
  daysOfWeek     String     @default("[]")
  enrollmentUrl  String?
  programStatus  String     @default("DRAFT")
  // Remove: galleryUrls (or add to SQLite)
}

model Subscription {
  // Rename fields:
  lastReminderSent DateTime? // was: lastReminderSentAt
}

model User {
  // Remove encrypted PII fields (not in SQLite):
  // - phoneNumber
  // - dateOfBirth
  // - address
}
```

### Code Updates Required

#### API Routes (`src/server/api/routers/provider.ts`)
- [ ] Change all `name` references to `businessName`
- [ ] Change all `vettedAt` references to `vettingDate`
- [ ] Remove `vettedBy` references (or add to schema)
- [ ] Remove `publishedAt` references (or add to schema)
- [ ] Change `minAge/maxAge` to `ageMin/ageMax`
- [ ] Remove `tags`, `certifications`, `specializations` handling

#### Admin Pages
- [ ] `src/pages/admin/index.tsx` - Update field references
- [ ] `src/pages/admin/providers/[id].tsx` - Update form fields
- [ ] `src/pages/admin/providers/index.tsx` - Update display fields
- [ ] `src/pages/admin/providers/new.tsx` - Update creation form

#### Services
- [ ] `src/services/subscription-lifecycle.ts` - Use `lastReminderSent`
- [ ] `src/server/api/routers/user.ts` - Remove PII field updates

#### Seed Scripts
- [ ] Update `prisma/seed.ts` to use correct field names
- [ ] Update `prisma/seed.preview.ts` to use correct field names
- [ ] Update `prisma/seed.production.ts` to use correct field names

## Testing Plan

### Local Development
```bash
# Reset and test with SQLite
pnpm db:reset
pnpm db:seed
pnpm dev
# Test: Create, read, update, delete providers
# Test: Admin functions
# Test: Subscription lifecycle
```

### CI Pipeline
```bash
# Ensure TypeScript compiles
pnpm type-check
pnpm lint
pnpm test
```

### Preview Deployment
```bash
# Push to branch
git push origin fix/schema-alignment
# Verify preview deployment
# Test with PostgreSQL database
```

## Migration Path

### For Existing Deployments
1. **Backup existing data**
2. **Create migration to rename columns**
3. **Update code references**
4. **Deploy in maintenance window**

### Migration Script Example
```sql
-- PostgreSQL migration for existing production
ALTER TABLE "Provider" RENAME COLUMN "name" TO "businessName";
ALTER TABLE "Provider" ADD COLUMN "contactName" TEXT;
ALTER TABLE "Provider" ADD COLUMN "abn" TEXT;
ALTER TABLE "Provider" RENAME COLUMN "bannerImageUrl" TO "bannerUrl";
ALTER TABLE "Provider" RENAME COLUMN "vettedAt" TO "vettingDate";
ALTER TABLE "Provider" ADD COLUMN "vettingStatus" TEXT DEFAULT 'NOT_STARTED';

ALTER TABLE "Program" RENAME COLUMN "minAge" TO "ageMin";
ALTER TABLE "Program" RENAME COLUMN "maxAge" TO "ageMax";
ALTER TABLE "Program" RENAME COLUMN "venue" TO "location";

ALTER TABLE "Subscription" RENAME COLUMN "lastReminderSentAt" TO "lastReminderSent";
```

## Risk Assessment

### High Risk
- Production data migration (if already deployed)
- Breaking changes to API

### Medium Risk
- CI/CD pipeline failures during transition
- Preview deployments during migration

### Low Risk
- Local development (can reset anytime)
- New deployments (no existing data)

## Success Criteria

1. ✅ All schemas use identical field names
2. ✅ TypeScript compilation passes in all environments
3. ✅ CI/CD pipeline passes
4. ✅ CRUD operations work in all environments
5. ✅ Seed scripts execute without errors
6. ✅ Admin panel functions correctly
7. ✅ No breaking changes to API endpoints

## Timeline

1. **Day 1**: Schema standardization
2. **Day 2**: Code updates and local testing
3. **Day 3**: CI/CD verification and preview testing
4. **Day 4**: Production migration planning
5. **Day 5**: Production deployment

## References

- [Database Management Strategy](./database-management-strategy.md)
- [Environment Setup Guide](./environment-setup-guide.md)
- Original PR: #129 (closed due to issues)
- Documentation PR: #130 (current)