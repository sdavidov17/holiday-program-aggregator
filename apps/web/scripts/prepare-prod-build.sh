#!/bin/bash
# Script to prepare production build with PostgreSQL

# Check if we're in production/preview environment
if [ "$VERCEL" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "Production/Preview environment detected - switching to PostgreSQL provider"
  
  # Update the provider in schema.prisma
  sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  
  # Generate Prisma client with PostgreSQL provider
  pnpm prisma generate
  
  # Restore original schema for next builds
  mv prisma/schema.prisma.bak prisma/schema.prisma
else
  echo "Development environment - using SQLite"
  pnpm prisma generate
fi