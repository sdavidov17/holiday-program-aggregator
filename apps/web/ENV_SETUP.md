# Environment Variables Setup Guide

## Overview

This project uses a two-file strategy for environment variables to prevent accidental exposure of sensitive credentials.

## File Structure

### `.env` - Committed to Git
Contains only non-sensitive default values and serves as a template. This file is committed to the repository so developers know what environment variables are needed.

### `.env.local` - Never Committed
Contains your actual sensitive credentials (API keys, secrets, etc.). This file is listed in `.gitignore` and should NEVER be committed to the repository.

## Setup Instructions

1. **Create your `.env.local` file**:
   ```bash
   cp .env.example.local .env.local
   ```

2. **Add your sensitive credentials to `.env.local`**:
   ```env
   # NextAuth
   NEXTAUTH_SECRET="your-generated-secret"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. **Keep `.env` for non-sensitive defaults**:
   - Database URL (for local SQLite)
   - Default URLs
   - Feature flags
   - Non-sensitive configuration

## Loading Order

Next.js loads environment variables in this order:
1. `.env.local` (highest priority)
2. `.env`

This means values in `.env.local` will override values in `.env`.

## Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason
2. **Keep `.env` minimal** - Only non-sensitive defaults
3. **Document required variables** - List them in `.env` as comments
4. **Use `.env.backup`** - Create backups before major changes
5. **Generate strong secrets**:
   ```bash
   openssl rand -base64 32
   ```

## Backup Strategy

Before making changes to environment files:
```bash
cp .env.local .env.backup
```

## Troubleshooting

- If env variables aren't loading, restart the dev server
- Check that `.env.local` exists and has proper formatting
- Ensure no spaces around the `=` sign in env files
- Verify file permissions allow reading

## Example Files

### `.env` (committed)
```env
DATABASE_URL="file:./db.sqlite"
NEXTAUTH_URL="http://localhost:3000"
# Add actual values to .env.local
```

### `.env.local` (never committed)
```env
NEXTAUTH_SECRET="your-actual-secret"
GOOGLE_CLIENT_ID="your-actual-client-id"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```