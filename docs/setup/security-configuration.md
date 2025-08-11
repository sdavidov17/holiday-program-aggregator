# Security Configuration Guide

## Overview

This guide covers the security configuration requirements for the Holiday Program Aggregator application, focusing on eliminating hardcoded credentials and implementing proper environment-based configuration.

## Required Environment Variables

### Critical Security Variables

These environment variables **MUST** be set in production. The application will fail to start or function properly without them:

```bash
# Admin Credentials (REQUIRED)
ADMIN_EMAIL="admin@yourdomain.com"        # Admin account email
ADMIN_PASSWORD="<strong-password>"        # Min 12 chars, mixed case, numbers, symbols
ADMIN_NAME="System Administrator"         # Display name for admin
ADMIN_SETUP_KEY="<random-32-char-key>"   # Secret key for admin setup endpoint

# Authentication (REQUIRED)
NEXTAUTH_SECRET="<random-32-char-key>"   # Session encryption key
ENCRYPTION_KEY="<random-32-char-key>"    # PII data encryption key

# Database (REQUIRED)
DATABASE_URL="postgresql://..."          # PostgreSQL connection string
```

### Generating Secure Keys

Use these commands to generate secure random keys:

```bash
# Generate a 32-character key (for NEXTAUTH_SECRET, ENCRYPTION_KEY, ADMIN_SETUP_KEY)
openssl rand -base64 32

# Generate a strong password for ADMIN_PASSWORD
openssl rand -base64 24
```

## Configuration by Environment

### Development Environment

For local development, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
vim .env
```

**Important**: Never commit `.env` files to version control.

### Production Environment (Vercel)

Set environment variables in Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each required variable
4. Select appropriate environments (Production/Preview/Development)

### CI/CD Environment

For GitHub Actions, add secrets:

1. Go to repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `DATABASE_URL`

## Security Best Practices

### 1. Password Requirements

Admin passwords should meet these criteria:
- Minimum 12 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Unique to this application
- Changed regularly (every 90 days)

### 2. Key Rotation

Rotate encryption keys periodically:
- `NEXTAUTH_SECRET`: Every 6 months
- `ENCRYPTION_KEY`: Every 12 months
- `ADMIN_SETUP_KEY`: After each use

### 3. Environment Separation

Never share credentials between environments:
- ❌ Don't use production credentials in development
- ❌ Don't use the same database for multiple environments
- ✅ Use separate credentials for each environment

### 4. Access Control

- Limit who has access to production environment variables
- Use role-based access in your deployment platform
- Audit access logs regularly

## Removing Legacy Hardcoded Values

The following files have been updated to remove hardcoded credentials:

1. **`/api/admin/setup.ts`**: Now requires environment variables
2. **`/api/debug/seed-admin.ts`**: Requires ADMIN_EMAIL and ADMIN_PASSWORD
3. **`scripts/seed-production.ts`**: Will exit if credentials not provided
4. **`prisma/test-login.ts`**: Test script requires environment variables

### Migration Steps

If you're upgrading from a version with hardcoded credentials:

1. **Set environment variables** before deploying:
   ```bash
   export ADMIN_EMAIL="your-admin@domain.com"
   export ADMIN_PASSWORD="your-secure-password"
   export ADMIN_SETUP_KEY="your-setup-key"
   ```

2. **Update existing admin accounts** if using old defaults:
   ```bash
   # Run the password update script
   pnpm tsx scripts/update-admin-password.ts
   ```

3. **Verify configuration**:
   ```bash
   # Test that environment variables are set correctly
   pnpm tsx scripts/verify-env.ts
   ```

## Monitoring and Alerts

### Failed Authentication Attempts

Monitor for:
- Multiple failed login attempts (rate limiting enforced)
- Attempts to access `/api/admin/setup` without proper key
- Access to debug endpoints in production (blocked by middleware)

### Environment Variable Validation

The application validates required environment variables on startup:
- Missing variables will cause startup failure
- Check logs for specific missing variable errors

## Troubleshooting

### Common Issues

1. **"Admin credentials not configured"**
   - Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set
   - Check for typos in environment variable names

2. **"Server configuration error"**
   - Missing `ADMIN_SETUP_KEY` environment variable
   - Set it using: `export ADMIN_SETUP_KEY=$(openssl rand -base64 32)`

3. **"Invalid credentials during seed"**
   - Password doesn't meet complexity requirements
   - Email format is invalid

### Verification Commands

```bash
# Check if environment variables are set
env | grep ADMIN_

# Test database connection with credentials
pnpm tsx prisma/test-connection.ts

# Verify admin account creation
ADMIN_EMAIL="test@example.com" ADMIN_PASSWORD="TestPass123!" pnpm tsx scripts/seed-production.ts
```

## Security Checklist

Before deploying to production:

- [ ] All required environment variables are set in Vercel
- [ ] No hardcoded credentials remain in codebase
- [ ] Admin password meets complexity requirements
- [ ] ADMIN_SETUP_KEY is unique and secure
- [ ] Database URL uses SSL connection
- [ ] Rate limiting is enabled
- [ ] Debug endpoints are blocked in production
- [ ] Environment variables are documented for team
- [ ] Key rotation schedule is established
- [ ] Access audit logging is configured

## Support

For security concerns or questions:
1. Review this documentation
2. Check environment variable configuration
3. Contact the security team for sensitive issues
4. Never share credentials in public channels