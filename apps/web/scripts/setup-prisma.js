#!/usr/bin/env node

/**
 * Simplified Prisma setup script for PostgreSQL-only configuration
 * All environments now use PostgreSQL for consistency
 */

const _fs = require('node:fs');
const _path = require('node:path');

console.log('🔧 Configuring Prisma for PostgreSQL...');

const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const isDocker = process.env.DOCKER_ENV === 'true';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  if (isProduction) {
    console.error('❌ DATABASE_URL not set in production!');
    console.error('   Please configure your PostgreSQL database connection');
    process.exit(1);
  } else {
    // Default to local PostgreSQL (Docker or local installation)
    const defaultUrl = isDocker
      ? 'postgresql://postgres:postgres@postgres:5432/holiday_aggregator?schema=public'
      : 'postgresql://postgres:postgres@localhost:5432/holiday_aggregator?schema=public';

    process.env.DATABASE_URL = defaultUrl;
    console.log('⚠️  DATABASE_URL not set, using default local PostgreSQL connection');
    console.log(`   Set DATABASE_URL to: ${defaultUrl}`);
  }
}

// Validate PostgreSQL connection string
if (
  !process.env.DATABASE_URL.startsWith('postgresql://') &&
  !process.env.DATABASE_URL.startsWith('postgres://')
) {
  console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
  console.error('   Example: postgresql://user:password@localhost:5432/database');
  process.exit(1);
}

console.log('✅ PostgreSQL configuration ready');
console.log(`   Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`   Docker: ${isDocker ? 'Yes' : 'No'}`);
console.log(`   Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Hide password

// Check if PostGIS is required
if (process.env.ENABLE_POSTGIS === 'true') {
  console.log('🗺️  PostGIS extensions enabled for geospatial features');
}
