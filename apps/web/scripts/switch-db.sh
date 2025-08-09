#!/bin/bash

# Script to switch between SQLite (development) and PostgreSQL (production) schemas

if [ "$1" = "sqlite" ]; then
    echo "Switching to SQLite schema for local development..."
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    echo "✅ Switched to SQLite"
    echo "📝 Update your .env file: DATABASE_URL=\"file:./db.sqlite\""
elif [ "$1" = "postgresql" ] || [ "$1" = "postgres" ]; then
    echo "Switching to PostgreSQL schema for production..."
    cp prisma/schema.postgresql.prisma prisma/schema.prisma
    echo "✅ Switched to PostgreSQL"
    echo "📝 Update your .env file with PostgreSQL connection string"
else
    echo "Usage: ./scripts/switch-db.sh [sqlite|postgresql]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/switch-db.sh sqlite      # For local development"
    echo "  ./scripts/switch-db.sh postgresql  # For production/staging"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Update your DATABASE_URL in .env"
echo "2. Run: pnpm db:push (for dev) or pnpm db:migrate (for production)"
echo "3. Run: pnpm db:generate to regenerate Prisma client"