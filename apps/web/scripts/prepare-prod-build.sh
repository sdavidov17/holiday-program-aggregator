#!/bin/bash
# Script to prepare production build with PostgreSQL

# Check if we're in production/preview environment
if [ "$VERCEL" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "Production/Preview environment detected - switching to PostgreSQL provider"
  
  # Update the provider in schema.prisma
  sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  
  # Generate Prisma client with PostgreSQL provider
  pnpm prisma generate
  
  # Deploy database schema (create tables if they don't exist)
  echo "Deploying database schema..."
  pnpm prisma db push --skip-generate
  
  # Fix role enum issue if it exists
  echo "Checking and fixing role field type..."
  if [ -f prisma/migrations/fix_role_enum.sql ]; then
    echo "Applying role enum fix migration..."
    pnpm prisma db execute --file prisma/migrations/fix_role_enum.sql || echo "Role field migration applied or not needed"
  else
    echo "No role enum fix migration file found"
  fi
  
  # Seed the database with admin account
  echo "Seeding database with admin account..."
  tsx prisma/seed.production.ts || echo "Seeding completed or data already exists"
  
  # Restore original schema for next builds
  mv prisma/schema.prisma.bak prisma/schema.prisma
else
  echo "Development environment - using SQLite"
  pnpm prisma generate
fi