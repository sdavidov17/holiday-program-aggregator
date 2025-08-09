# Admin Account Setup Guide

This guide explains how to set up the admin account for both local development and production deployments.

## Local Development

The admin account is automatically created when you run the database seed:

```bash
# Run from apps/web directory
pnpm prisma db seed
```

This creates:
- Admin account: `serge@test.com` (password: `Password120619`)
- Regular user: `serge.user@test.com` (same password)
- Test user: `user@test.com` (password: `password123`)

## Production Setup (Vercel)

### Method 1: Environment Variables (Recommended)

1. Go to your Vercel Dashboard
2. Navigate to Project Settings → Environment Variables
3. Add these variables:
   ```
   ADMIN_EMAIL=serge@test.com
   ADMIN_PASSWORD=Password120619
   ADMIN_NAME=Serge Admin
   ADMIN_SETUP_KEY=setup-admin-120619
   ```

4. After deployment, call the setup endpoint ONCE:
   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/setup \
     -H "X-Setup-Key: setup-admin-120619" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### Method 2: Direct Script Execution

If you have direct database access:

```bash
# Set your production database URL
DATABASE_URL="postgresql://..." \
ADMIN_EMAIL="serge@test.com" \
ADMIN_PASSWORD="Password120619" \
pnpm tsx scripts/seed-production.ts
```

### Method 3: Manual Database Insert

If the above methods don't work, you can manually insert the admin account using Prisma Studio or direct SQL:

1. Connect to your production database
2. Hash the password: `Password120619` → `$2a$10$...` (use bcrypt with 10 rounds)
3. Insert into User table:
   ```sql
   INSERT INTO "User" (id, email, name, password, role, emailVerified)
   VALUES (
     gen_random_uuid(),
     'serge@test.com',
     'Serge Admin',
     '$2a$10$YOUR_HASHED_PASSWORD',
     'ADMIN',
     NOW()
   );
   ```

## Verifying Setup

After setup, verify the admin account:

1. Go to `/auth/signin`
2. Sign in with:
   - Email: `serge@test.com`
   - Password: `Password120619`
3. You should have admin access

## Security Notes

⚠️ **IMPORTANT**: 
- Change the default password immediately after first login
- Never commit the `.env.local` file
- Use strong, unique passwords in production
- Rotate the `ADMIN_SETUP_KEY` after initial setup
- The setup endpoint can only be used once (it checks if an admin already exists)

## Troubleshooting

### "Admin account already exists"
- The setup has already been completed
- Use the existing credentials to sign in

### "Invalid setup key"
- Ensure `ADMIN_SETUP_KEY` is set in environment variables
- Check that you're using the correct key in the request header

### Cannot sign in after setup
1. Check database connection:
   ```bash
   pnpm prisma studio
   ```
2. Verify the user exists in the User table
3. Check that `role` is set to `ADMIN`
4. Ensure `emailVerified` is not null
5. Check NextAuth configuration and database connection

### PostgreSQL specific issues
- Ensure `DATABASE_URL` uses the pooled connection for serverless
- Add `?pgbouncer=true&connection_limit=1` to the connection string
- Use the correct SSL mode: `?sslmode=require`

## Environment Variables Reference

```env
# Required for PostgreSQL
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Required for authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"

# Admin setup (optional, with defaults)
ADMIN_EMAIL="serge@test.com"
ADMIN_PASSWORD="Password120619"
ADMIN_NAME="Serge Admin"
ADMIN_SETUP_KEY="setup-admin-120619"
```