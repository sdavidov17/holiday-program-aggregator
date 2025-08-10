# Database Management Strategy

## Overview

This document outlines the comprehensive database management strategy for the Holiday Program Aggregator across all environments (local development, preview/staging, and production).

## Environment Configuration

### Database Providers by Environment

| Environment | Database | Provider | Connection | Purpose |
|------------|----------|----------|------------|---------|
| Local Development | SQLite | `file:./db.sqlite` | Local file | Fast iteration, no external dependencies |
| Preview (Vercel) | PostgreSQL | Neon | Connection pooling | Feature branch testing |
| Production | PostgreSQL | Neon | Connection pooling | Live application |

### Schema Management

We maintain environment-specific Prisma schemas to handle database provider differences:

- **schema.sqlite.prisma**: SQLite-specific schema for local development
- **schema.production.prisma**: PostgreSQL-specific schema for preview/production
- **schema.prisma**: Active schema (automatically configured by setup script)

The `scripts/setup-prisma.js` automatically selects the appropriate schema based on:
- `VERCEL=1` environment variable (uses PostgreSQL)
- `NODE_ENV=production` (uses PostgreSQL)
- Default (uses SQLite for local development)

## Database Setup by Environment

### Local Development Setup

```bash
# Initial setup
pnpm install          # Runs setup-prisma.js automatically
pnpm db:push          # Create SQLite database
pnpm db:seed          # Seed with development data

# Daily workflow
pnpm dev              # Start development server
pnpm db:studio        # Open Prisma Studio for data inspection
```

### Preview Environment Setup

Preview databases are automatically provisioned by Vercel for each pull request:

1. Vercel creates a preview deployment
2. Neon provisions a branch database
3. Schema is automatically migrated
4. Minimal seed data is applied

### Production Environment Setup

```bash
# One-time setup
vercel env pull                           # Get production env vars
DATABASE_URL=$PROD_URL pnpm db:push      # Initialize schema
DATABASE_URL=$PROD_URL pnpm db:seed:prod # Production seed data
```

## Seed Data Strategy

### Development Seed Data (`prisma/seed.ts`)

Comprehensive test data for all features:

```typescript
// Development seed includes:
- Admin user (admin@test.com / Password123!)
- 10 test users with various subscription states
- 20 providers (mix of vetted/unvetted, published/draft)
- 50+ holiday programs across different categories
- Sample subscriptions (active, expired, cancelled)
- Test payment records
```

### Preview Seed Data (`prisma/seed.preview.ts`)

Minimal data for testing features:

```typescript
// Preview seed includes:
- 1 admin user
- 3 test users
- 5 providers (all vetted and published)
- 10 holiday programs
- 2 active subscriptions
```

### Production Seed Data (`prisma/seed.production.ts`)

Essential data only:

```typescript
// Production seed includes:
- Initial admin user (from env vars)
- System configuration records
- Default subscription plans
- Essential lookup data
```

## Migration Procedures

### Local Development Migrations

```bash
# Create new migration
pnpm db:migrate dev --name add_feature_x

# Apply migrations
pnpm db:migrate dev

# Reset database (caution: data loss)
pnpm db:reset
```

### Preview Environment Migrations

Migrations are automatically applied on deployment:
1. Vercel build process runs `setup-prisma.js`
2. Prisma migrations are applied
3. Preview-specific seed data is loaded

### Production Migrations

**Pre-Migration Checklist:**
- [ ] Backup production database
- [ ] Test migration on staging
- [ ] Document rollback procedure
- [ ] Schedule maintenance window if needed

**Migration Process:**
```bash
# 1. Backup current data
pg_dump $PROD_DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Test on staging
DATABASE_URL=$STAGING_URL pnpm db:migrate deploy

# 3. Apply to production
DATABASE_URL=$PROD_DATABASE_URL pnpm db:migrate deploy

# 4. Verify
DATABASE_URL=$PROD_DATABASE_URL pnpm db:studio
```

## Data Management

### Backup Strategy

| Environment | Frequency | Retention | Method |
|------------|-----------|-----------|---------|
| Local | On-demand | N/A | File copy |
| Preview | None | N/A | Ephemeral |
| Production | Daily | 30 days | Neon automatic backups |

### Data Privacy

- PII is encrypted using AES-256-GCM
- Encryption keys are environment-specific
- Local development uses test encryption key
- Production uses secure key from environment variables

### Database Monitoring

**Local Development:**
- Use Prisma Studio for query inspection
- SQLite file size monitoring
- Query performance via Next.js dev tools

**Production:**
- Neon dashboard for connection metrics
- Vercel Analytics for API performance
- Custom logging for slow queries

## Common Tasks

### Switching Between Environments

```bash
# Work with production data locally (read-only)
DATABASE_URL=$PROD_DATABASE_URL pnpm db:studio

# Test with preview database
DATABASE_URL=$PREVIEW_URL pnpm dev

# Reset to local development
pnpm db:reset
pnpm db:seed
```

### Troubleshooting

**Issue: Schema drift between environments**
```bash
# Regenerate schemas from source
rm prisma/schema.sqlite.prisma
rm prisma/schema.production.prisma
pnpm install  # Recreates schemas
```

**Issue: Seed data fails**
```bash
# Check for existing data
pnpm db:studio

# Force reseed
pnpm db:reset
pnpm db:seed
```

**Issue: Production migration fails**
```bash
# Rollback procedure
psql $PROD_DATABASE_URL < backup-latest.sql

# Investigate
DATABASE_URL=$PROD_DATABASE_URL pnpm db:studio
```

## Best Practices

1. **Never use production data in development**
   - Use anonymized exports if needed
   - Maintain realistic test data

2. **Test all migrations in preview first**
   - Use pull request preview deployments
   - Verify data integrity

3. **Keep schemas synchronized**
   - Run tests in CI to catch drift
   - Document schema changes in PRs

4. **Monitor database performance**
   - Set up alerts for slow queries
   - Regular index optimization
   - Connection pool tuning

5. **Maintain seed data quality**
   - Keep seed data realistic
   - Update seeds when features change
   - Test seed scripts regularly

## Environment Variables Reference

```bash
# Local Development (.env)
DATABASE_URL="file:./db.sqlite"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="local-test-key-not-for-production"

# Preview (Vercel Environment)
DATABASE_URL="postgresql://..." # Auto-provisioned by Neon
NEXTAUTH_URL="https://*.vercel.app"
ENCRYPTION_KEY="preview-key"

# Production (Vercel Environment)
DATABASE_URL="postgresql://..." # Production Neon database
NEXTAUTH_URL="https://holidayprograms.com.au"
ENCRYPTION_KEY="[secure production key]"
```

## Related Documentation

- [Deployment Guide](./deployment-guide.md) - Deployment procedures
- [Testing Strategy](./testing-strategy.md) - Database testing approaches
- [Developer Onboarding](./developer-onboarding.md) - Initial setup instructions
- [API Reference](./api-reference.md) - Database query patterns

## Maintenance Schedule

- **Daily**: Production backups (automatic)
- **Weekly**: Preview environment cleanup
- **Monthly**: Performance review and optimization
- **Quarterly**: Schema optimization review