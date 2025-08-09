# Database Configuration

This project supports both SQLite (for local development) and PostgreSQL (for production/staging).

## Quick Start

### Local Development (SQLite)
```bash
# Switch to SQLite schema
pnpm db:switch:sqlite

# Update .env file
DATABASE_URL="file:./db.sqlite"

# Push schema to database
pnpm db:push

# Run migrations (optional, for migration history)
pnpm db:migrate
```

### Production/Staging (PostgreSQL)
```bash
# Switch to PostgreSQL schema
pnpm db:switch:postgres

# Update .env file with PostgreSQL connection
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# For Vercel/Neon, use pooled connection:
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&pgbouncer=true"

# Deploy migrations
pnpm db:migrate:prod
```

## Environment Setup

### Vercel Environment Variables
Set these in Vercel Dashboard:
- `DATABASE_URL`: PostgreSQL connection string from Neon
- Use the pooled connection string for serverless compatibility

### Local Development
1. Copy `.env.example` to `.env`
2. Use SQLite for simplicity: `DATABASE_URL="file:./db.sqlite"`

## Schema Files

- `schema.prisma` - Current active schema (do not edit directly)
- `schema.postgresql.prisma` - PostgreSQL schema for production
- `schema.sqlite.prisma` - SQLite schema for local development

## Database Commands

```bash
# Switch between database types
pnpm db:switch:sqlite      # Use SQLite
pnpm db:switch:postgres    # Use PostgreSQL

# Database operations
pnpm db:push              # Push schema changes (development)
pnpm db:migrate           # Create migration (development)
pnpm db:migrate:prod      # Deploy migrations (production)
pnpm db:studio            # Open Prisma Studio GUI
pnpm db:generate          # Regenerate Prisma Client
```

## Migration Strategy

### Development
- Use `db:push` for rapid prototyping
- Use `db:migrate` when you want to track schema changes

### Production
- Always use migrations: `pnpm db:migrate:prod`
- Test migrations locally first with PostgreSQL
- Back up database before deploying migrations

## Troubleshooting

### "Provider mismatch" error
- Ensure you're using the correct schema file
- Run `pnpm db:switch:sqlite` or `pnpm db:switch:postgres`

### Connection errors
- Check DATABASE_URL in .env
- For Vercel: Use pooled connection string
- For local: Ensure SQLite file exists or PostgreSQL is running

### Type errors after schema change
- Run `pnpm db:generate` to update Prisma Client
- Restart TypeScript server in your IDE