# Environment Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm installed
- Git configured with repository access
- Vercel CLI (for deployment)

### Local Development Setup (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/holiday-program-aggregator.git
cd holiday-program-aggregator
pnpm install

# 2. Configure environment
cd apps/web
cp .env.example .env
# Edit .env with your keys (see Environment Variables section)

# 3. Setup database
pnpm db:push
pnpm db:seed

# 4. Start development
pnpm dev
# Open http://localhost:3000
```

## Environment Configurations

### Local Development

**Purpose**: Individual developer workstations

**Database**: SQLite (file-based)
- No external database required
- Data stored in `prisma/db.sqlite`
- Reset anytime with `pnpm db:reset`

**Key Features**:
- Hot module replacement
- Debug logging enabled
- Test payment providers
- Local email testing (console output)

**Environment Variables**:
```env
DATABASE_URL="file:./db.sqlite"
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="local-dev-key-32-characters-min"

# Test Stripe keys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Optional: Local email testing
RESEND_API_KEY="re_test_..."
```

### Preview/Staging

**Purpose**: Pull request testing and pre-production validation

**Database**: PostgreSQL on Neon (auto-provisioned)
- Separate database per PR
- Automatic migrations
- Cleaned up when PR closes

**Key Features**:
- Production-like environment
- Real email sending (sandboxed)
- Test payment processing
- Performance monitoring

**Automatic Setup by Vercel**:
1. Push to feature branch
2. Create pull request
3. Vercel creates preview deployment
4. Neon provisions branch database
5. Access at: `https://holiday-program-[pr-number].vercel.app`

**Environment Variables** (set in Vercel Dashboard):
```env
# Auto-configured by Vercel
DATABASE_URL="postgresql://..."
VERCEL_URL="https://..."

# Must configure
NEXTAUTH_SECRET="[secure random string]"
ENCRYPTION_KEY="[preview-encryption-key]"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
RESEND_API_KEY="re_..."
```

### Production

**Purpose**: Live application serving real users

**Database**: PostgreSQL on Neon (production cluster)
- High availability configuration
- Automatic backups
- Connection pooling

**Key Features**:
- Optimized builds
- CDN distribution
- Real payment processing
- Production monitoring

**Domain**: `https://holidayprograms.com.au`

**Environment Variables** (set in Vercel Dashboard):
```env
# Database
DATABASE_URL="postgresql://...?sslmode=require"

# Authentication
NEXTAUTH_SECRET="[production secret - generate with openssl]"
NEXTAUTH_URL="https://holidayprograms.com.au"

# Security
ENCRYPTION_KEY="[production encryption key - keep secure]"

# Payments (Live keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email
RESEND_API_KEY="re_..."

# Monitoring (optional)
SENTRY_DSN="https://..."
```

## Database Schema Management

### Automatic Schema Selection

The `scripts/setup-prisma.js` automatically configures the correct schema:

| Condition | Schema Used | Database |
|-----------|------------|----------|
| Local development (default) | `schema.sqlite.prisma` | SQLite |
| `VERCEL=1` | `schema.production.prisma` | PostgreSQL |
| `NODE_ENV=production` | `schema.production.prisma` | PostgreSQL |

### Manual Schema Management

```bash
# View current schema
cat prisma/schema.prisma

# Force PostgreSQL schema locally
NODE_ENV=production pnpm install

# Force SQLite schema
NODE_ENV=development pnpm install

# Generate Prisma client
pnpm prisma generate
```

## Seed Data by Environment

### Development Seed

**File**: `prisma/seed.ts`

**Contents**:
- Admin account: `admin@test.com` / `Password123!`
- 10 test users
- 20 providers (mixed states)
- 50+ programs
- Sample subscriptions

```bash
pnpm db:seed
```

### Preview Seed

**Applied automatically on deployment**

**Contents**:
- 1 admin user
- Minimal test data
- Published providers only

### Production Seed

**File**: `prisma/seed.production.ts`

**Contents**:
- Admin account (from env vars)
- System configuration
- No test data

```bash
DATABASE_URL=$PROD_URL pnpm db:seed:prod
```

## Common Development Tasks

### Switching Environments

```bash
# Work with preview database locally
export DATABASE_URL="postgresql://preview-connection-string"
pnpm dev

# Reset to local SQLite
unset DATABASE_URL
pnpm dev
```

### Database Operations

```bash
# View data
pnpm db:studio

# Reset database
pnpm db:reset

# Create migration
pnpm db:migrate dev --name feature_name

# Apply migrations
pnpm db:migrate dev
```

### Testing Different User Roles

```bash
# Login as admin
# Email: admin@test.com
# Password: Password123!

# Login as regular user
# Email: user1@test.com
# Password: Password123!

# Create new test user
pnpm db:studio
# Add user via UI
```

## Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process
lsof -i :3000

# Use different port
PORT=3001 pnpm dev
```

### Issue: Database Connection Errors

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# For SQLite
DATABASE_URL="file:./db.sqlite" pnpm dev

# Regenerate Prisma client
pnpm prisma generate
```

### Issue: Schema Mismatch Errors

```bash
# Reset to correct schema
rm prisma/schema.prisma
pnpm install  # Regenerates correct schema

# Push schema to database
pnpm db:push
```

### Issue: Authentication Not Working

```bash
# Check NEXTAUTH_URL matches your URL
# Local: http://localhost:3000
# Production: https://yourdomain.com

# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32
```

## CI/CD Configuration

### GitHub Actions Environment

The CI environment uses:
- SQLite database (default)
- Test environment variables
- Automated testing

**To use PostgreSQL in CI**:
Add to workflow file:
```yaml
env:
  DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
  NODE_ENV: production
```

### Vercel Build Environment

Automatically configured with:
- `VERCEL=1` environment variable
- PostgreSQL schema selection
- Production optimizations

## Security Best Practices

1. **Never commit .env files**
   - Use .env.example as template
   - Store secrets in Vercel dashboard

2. **Use different keys per environment**
   - Separate encryption keys
   - Environment-specific API keys
   - Different JWT secrets

3. **Rotate credentials regularly**
   - Quarterly for production
   - After any security incident
   - When team members leave

4. **Limit database access**
   - Read-only replicas for analytics
   - Connection pooling for scalability
   - IP allowlisting in production

## Monitoring and Logging

### Local Development
- Console logging
- React Query devtools
- Next.js debug mode

### Preview Environment
- Vercel deployment logs
- Basic error tracking
- Performance metrics

### Production
- Vercel Analytics
- Error tracking (Sentry)
- Database monitoring (Neon)
- Custom application metrics

## Next Steps

1. Complete [Developer Onboarding](./developer-onboarding.md)
2. Review [Database Management Strategy](./database-management-strategy.md)
3. Read [Testing Strategy](./testing-strategy.md)
4. Check [Deployment Guide](./deployment-guide.md)

## Support

- GitHub Issues: Bug reports and feature requests
- Team Slack: `#dev-holiday-programs`
- Documentation: `/docs` directory
- Emergency: Contact DevOps team