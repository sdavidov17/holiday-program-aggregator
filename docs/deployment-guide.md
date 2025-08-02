# Deployment Guide

## Overview

This guide covers deployment procedures for the Holiday Program Aggregator across all environments. We use Vercel for hosting with PostgreSQL on Neon.

## Environments

| Environment | URL | Branch | Purpose |
|------------|-----|--------|---------|
| Development | `dev-*.vercel.app` | feature branches | Development testing |
| Staging | `staging-*.vercel.app` | `staging` | Pre-production testing |
| Production | `holidayprograms.com.au` | `main` | Live system |

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] No security vulnerabilities (`pnpm audit`)

### Database
- [ ] Migrations tested locally
- [ ] Rollback plan documented
- [ ] Database backup completed
- [ ] Connection pooling configured

### Configuration
- [ ] Environment variables updated
- [ ] API keys rotated if needed
- [ ] Feature flags configured
- [ ] CDN cache rules set

## Deployment Process

### 1. Feature Branch Deployment (Automatic)

```bash
# Push to feature branch
git push origin feature/epic-1-story-2

# Vercel automatically creates preview deployment
# URL: https://holiday-program-aggregator-<hash>.vercel.app
```

### 2. Staging Deployment

```bash
# Merge to staging branch
git checkout staging
git merge feature/epic-1-story-2
git push origin staging

# Verify deployment
curl https://staging-holiday-programs.vercel.app/api/health
```

### 3. Production Deployment

#### Step 1: Pre-deployment
```bash
# Ensure on latest main
git checkout main
git pull origin main

# Create release tag
git tag -a v1.2.0 -m "Release: User authentication feature"
git push origin v1.2.0
```

#### Step 2: Database Migration
```bash
# Connect to production database
DATABASE_URL=$PROD_DATABASE_URL pnpm db:migrate deploy

# Verify migration
DATABASE_URL=$PROD_DATABASE_URL pnpm db:studio
```

#### Step 3: Deploy to Production
```bash
# Merge to main (triggers deployment)
git push origin main

# Monitor deployment
vercel logs --prod --follow
```

#### Step 4: Post-deployment Verification
```bash
# Health check
curl https://holidayprograms.com.au/api/health

# Run smoke tests
pnpm test:smoke --env=production

# Check error rates
vercel logs --prod --error
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=              # PostgreSQL connection string
DATABASE_POOL_URL=         # Pooled connection for serverless

# Authentication
NEXTAUTH_URL=             # Application URL
NEXTAUTH_SECRET=          # Random secret (openssl rand -hex 32)

# OAuth Providers
DISCORD_CLIENT_ID=        # Discord OAuth app ID
DISCORD_CLIENT_SECRET=    # Discord OAuth secret

# Email (SendGrid)
SENDGRID_API_KEY=         # SendGrid API key
EMAIL_FROM=               # Sender email address

# Stripe
STRIPE_SECRET_KEY=        # Stripe secret key
STRIPE_WEBHOOK_SECRET=    # Webhook endpoint secret
NEXT_PUBLIC_STRIPE_KEY=   # Publishable key

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN= # Mapbox public token

# Monitoring
SENTRY_DSN=              # Sentry error tracking
DATADOG_API_KEY=         # Datadog monitoring
```

### Environment-Specific Config

```typescript
// src/env.mjs
export const env = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  // Validation ensures all required vars are present
};
```

## Database Deployment

### Migration Strategy

```bash
# Create migration
pnpm db:migrate dev --name add_user_preferences

# Test migration
pnpm db:migrate deploy --dry-run

# Apply to staging
DATABASE_URL=$STAGING_DB pnpm db:migrate deploy

# Apply to production
DATABASE_URL=$PROD_DB pnpm db:migrate deploy
```

### Rollback Procedure

```bash
# View migration history
pnpm db:migrate status

# Rollback last migration
pnpm db:migrate rollback

# Rollback to specific migration
pnpm db:migrate rollback --to 20230801120000_initial
```

### Database Backup

```bash
# Automated daily backups via Neon
# Manual backup before major changes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_20230801_120000.sql
```

## Monitoring & Alerts

### Health Checks

```typescript
// apps/web/src/pages/api/health/index.ts
export default async function handler(req, res) {
  const checks = {
    api: 'ok',
    database: await checkDatabase(),
    redis: await checkRedis(),
    timestamp: new Date().toISOString(),
  };
  
  const healthy = Object.values(checks).every(v => v === 'ok' || v);
  res.status(healthy ? 200 : 503).json(checks);
}
```

### Monitoring Setup

1. **Vercel Analytics**: Automatic for all deployments
2. **Sentry**: Error tracking and performance
3. **Datadog**: Infrastructure and APM
4. **Uptime Robot**: External availability monitoring

### Alert Configuration

```yaml
# .github/monitoring/alerts.yml
alerts:
  - name: High Error Rate
    condition: error_rate > 1%
    duration: 5m
    notify: ["oncall@team.com"]
    
  - name: Slow API Response
    condition: p95_latency > 1000ms
    duration: 10m
    notify: ["dev@team.com"]
```

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```bash
# Vercel instant rollback
vercel rollback

# Or via dashboard
# https://vercel.com/dashboard -> Select deployment -> Rollback
```

### Database Rollback

```bash
# Stop application traffic
vercel --prod --scale 0

# Rollback database
pnpm db:migrate rollback

# Restore previous deployment
vercel rollback

# Resume traffic
vercel --prod --scale 1
```

### Full Rollback

```bash
# 1. Revert code
git revert HEAD
git push origin main

# 2. Rollback database if needed
DATABASE_URL=$PROD_DB pnpm db:migrate rollback

# 3. Clear caches
curl -X POST https://api.vercel.com/v1/purge?url=https://holidayprograms.com.au/*

# 4. Verify
pnpm test:smoke --env=production
```

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  images: {
    domains: ['images.holidayprograms.com.au'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
  },
};
```

### Edge Functions

```typescript
// Use edge runtime for better performance
export const config = {
  runtime: 'edge',
  regions: ['syd1'], // Sydney region
};
```

### Caching Strategy

```typescript
// API responses
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

// Static assets
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

## Security Checklist

### Pre-Production
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Authentication properly configured

### Production
- [ ] SSL certificate valid
- [ ] Secrets rotated from staging
- [ ] Admin access restricted
- [ ] Audit logging enabled
- [ ] WAF rules configured
- [ ] DDoS protection active

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build

# Check for missing environment variables
vercel env pull
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
DATABASE_POOL_URL=$PROD_POOL_URL pnpm db:studio
```

#### Performance Issues
```bash
# Analyze bundle size
pnpm analyze

# Check for memory leaks
vercel logs --prod | grep "JavaScript heap out of memory"

# Review function execution time
vercel logs --prod --output json | jq '.duration'
```

## Deployment Commands Reference

```bash
# Local development
pnpm dev                  # Start dev server
pnpm build               # Build production
pnpm start               # Start production server

# Database
pnpm db:push             # Push schema changes
pnpm db:migrate dev      # Create migration
pnpm db:migrate deploy   # Apply migrations
pnpm db:seed             # Seed database

# Deployment
vercel                   # Deploy preview
vercel --prod           # Deploy production
vercel rollback         # Rollback deployment
vercel logs --prod      # View production logs

# Monitoring
vercel env pull         # Pull environment variables
vercel inspect [url]    # Inspect deployment
```

## Post-Deployment Tasks

1. **Announce Deployment**
   - Update team in Slack
   - Log in deployment spreadsheet
   - Update status page if needed

2. **Monitor Metrics**
   - Error rates
   - Response times
   - User feedback
   - Business metrics

3. **Document Changes**
   - Update changelog
   - Update API documentation
   - Notify stakeholders

## Emergency Contacts

- **On-Call Engineer**: Check PagerDuty
- **Vercel Support**: support@vercel.com
- **Database Admin**: dba@team.com
- **Security Team**: security@team.com

## Related Documentation

- [Architecture Overview](./Specs/architecture/high-level-architecture.md)
- [Branching Strategy](./branching-strategy.md)
- [Testing Strategy](./testing-strategy.md)
- [Security Guide](./security-sre-observability.md)