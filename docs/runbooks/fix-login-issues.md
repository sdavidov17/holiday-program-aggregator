# Fixing Login Issues

## Problem
Users cannot login to the application due to database connection or authentication configuration issues.

## Common Issues and Solutions

### 1. PostgreSQL Database Not Running

**Error:** 
```
Can't reach database server at `localhost:5432`
```

**Solution:**
```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d postgres

# Wait for database to be ready
sleep 5
docker-compose exec postgres pg_isready

# Push Prisma schema
pnpm prisma db push
```

### 2. No Admin User Exists

**Solution:**
```bash
# Create admin user using the script
npx tsx scripts/create-admin.ts admin@test.com Admin123!

# Or update .env.local with admin credentials and seed
echo 'ADMIN_EMAIL="admin@test.com"' >> apps/web/.env.local
echo 'ADMIN_PASSWORD="Admin123!"' >> apps/web/.env.local
pnpm prisma db seed
```

### 3. Missing Authentication Configuration

**Error:**
```
client_id is required (for Google OAuth)
```

**Solution:**
For development, you can use credentials-based authentication:
1. Ensure `NEXTAUTH_SECRET` is set in `.env.local`
2. Use the test login page at `/test-login`
3. Or disable Google OAuth temporarily by leaving `GOOGLE_CLIENT_ID` empty

### 4. Test Login Page

A test login page is available at: http://localhost:3000/test-login

**Default Test Credentials:**
- Email: admin@test.com
- Password: Admin123!

## Quick Fix Script

```bash
#!/bin/bash
# fix-login.sh

# 1. Start database
docker-compose up -d postgres
sleep 5

# 2. Push schema
pnpm prisma db push

# 3. Create admin user
npx tsx scripts/create-admin.ts admin@test.com Admin123!

# 4. Restart dev server
pnpm dev

echo "✅ Login should now work with:"
echo "   Email: admin@test.com"
echo "   Password: Admin123!"
echo "   Test at: http://localhost:3000/test-login"
```

## Environment Variables Checklist

Ensure these are set in `apps/web/.env.local`:
- [x] `NEXTAUTH_SECRET` - Any random string for development
- [x] `ENCRYPTION_KEY` - 32-character string
- [ ] `GOOGLE_CLIENT_ID` - Optional for Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Optional for Google OAuth

## Database Status Check

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database connection
docker-compose exec postgres pg_isready

# View database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U postgres -d holiday_aggregator
```

## Troubleshooting Steps

1. **Check server logs:** Look for authentication errors in the dev server output
2. **Verify database:** Ensure PostgreSQL is running and accessible
3. **Check credentials:** Verify the email/password combination exists in the database
4. **Clear cookies:** Sometimes old session cookies can cause issues
5. **Restart services:** Stop and restart both the database and dev server

## Related Files

- `/scripts/create-admin.ts` - Script to create admin users
- `/apps/web/.env.local` - Local environment configuration
- `/docker-compose.yml` - Database container configuration
- `/apps/web/prisma/schema.prisma` - Database schema
- `/apps/web/src/pages/test-login.tsx` - Test login page