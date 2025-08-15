#!/usr/bin/env node

/**
 * Enhanced Database Setup Script
 *
 * Intelligently configures the database based on environment:
 * - Local: SQLite for fast development
 * - Preview: PostgreSQL branch database
 * - Production: PostgreSQL production database
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Environment detection
const ENV = detectEnvironment();

function detectEnvironment() {
  // Explicit environment variable
  if (process.env.APP_ENV) {
    return process.env.APP_ENV;
  }

  // Vercel deployment
  if (process.env.VERCEL) {
    if (process.env.VERCEL_ENV === 'production') {
      return 'production';
    }
    if (process.env.VERCEL_ENV === 'preview') {
      return 'preview';
    }
  }

  // GitHub Actions CI
  if (process.env.CI && process.env.GITHUB_ACTIONS) {
    return 'ci';
  }

  // Node environment
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }

  // Default to local development
  return 'development';
}

function getSchemaConfig() {
  const configs = {
    development: {
      schema: 'schema.sqlite.prisma',
      provider: 'sqlite',
      defaultUrl: 'file:./db.sqlite',
      seedScript: 'db:seed',
    },
    test: {
      schema: 'schema.sqlite.prisma',
      provider: 'sqlite',
      defaultUrl: 'file:./test.sqlite',
      seedScript: 'db:seed',
    },
    ci: {
      schema: 'schema.sqlite.prisma',
      provider: 'sqlite',
      defaultUrl: 'file:./ci.sqlite',
      seedScript: null, // No seed in CI
    },
    preview: {
      schema: 'schema.production.prisma',
      provider: 'postgresql',
      defaultUrl: null, // Must be provided by Vercel
      seedScript: 'db:seed:preview',
    },
    production: {
      schema: 'schema.production.prisma',
      provider: 'postgresql',
      defaultUrl: null, // Must be provided by Vercel
      seedScript: 'db:seed:production',
    },
  };

  return configs[ENV] || configs.development;
}

function setupSchema() {
  const config = getSchemaConfig();
  const prismaDir = path.join(__dirname, '..', 'prisma');
  const targetSchema = path.join(prismaDir, 'schema.prisma');
  const sourceSchema = path.join(prismaDir, config.schema);

  console.log('🔧 Database Configuration');
  console.log('   Environment:', ENV);
  console.log('   Provider:', config.provider);
  console.log('   Schema:', config.schema);

  // Ensure source schema exists
  if (!fs.existsSync(sourceSchema)) {
    console.error(`❌ Schema file not found: ${config.schema}`);
    console.log('   Creating from template...');
    createSchemaFromTemplate(config);
  }

  // Copy schema to active location
  const schemaContent = fs.readFileSync(sourceSchema, 'utf8');
  fs.writeFileSync(targetSchema, schemaContent);
  console.log('✅ Schema configured successfully');

  // Set DATABASE_URL if not present
  if (!process.env.DATABASE_URL && config.defaultUrl) {
    process.env.DATABASE_URL = config.defaultUrl;
    console.log(`   DATABASE_URL set to: ${config.defaultUrl}`);
  }

  return config;
}

function createSchemaFromTemplate(config) {
  const prismaDir = path.join(__dirname, '..', 'prisma');
  const templateSchema = path.join(prismaDir, 'schema.prisma');
  const targetSchema = path.join(prismaDir, config.schema);

  if (!fs.existsSync(templateSchema)) {
    console.error('❌ No template schema found');
    process.exit(1);
  }

  let content = fs.readFileSync(templateSchema, 'utf8');

  // Update provider
  if (config.provider === 'sqlite') {
    content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    // Convert array types to JSON strings
    content = content.replace(/String\[\]/g, 'String   @default("[]")');
    content = content.replace(/DateTime\[\]/g, 'String   @default("[]")');
  } else {
    content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  }

  fs.writeFileSync(targetSchema, content);
  console.log(`   Created ${config.schema}`);
}

function runMigrations(config) {
  if (ENV === 'ci') {
    console.log('⏭️  Skipping migrations in CI environment');
    return;
  }

  if (ENV === 'production' && !process.env.RUN_MIGRATIONS) {
    console.log('⏭️  Skipping automatic migrations in production');
    console.log('   Run with RUN_MIGRATIONS=true to apply migrations');
    return;
  }

  console.log('🔄 Running database migrations...');

  try {
    if (ENV === 'development' || ENV === 'test') {
      // Push schema for development
      execSync('npx prisma db push --skip-generate', {
        stdio: 'inherit',
        env: process.env,
      });
    } else {
      // Deploy migrations for preview/production
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env,
      });
    }
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (ENV === 'production') {
      process.exit(1);
    }
  }
}

function runSeed(config) {
  if (!config.seedScript) {
    console.log('⏭️  No seed script for this environment');
    return;
  }

  if (ENV === 'production' && !process.env.RUN_SEED) {
    console.log('⏭️  Skipping automatic seed in production');
    console.log('   Run with RUN_SEED=true to seed database');
    return;
  }

  if (process.env.SKIP_SEED === 'true') {
    console.log('⏭️  Skipping seed (SKIP_SEED=true)');
    return;
  }

  console.log('🌱 Seeding database...');

  try {
    execSync(`pnpm ${config.seedScript}`, {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('⚠️  Seed failed:', error.message);
    // Don't exit on seed failure (database might already be seeded)
  }
}

function generateClient() {
  console.log('📦 Generating Prisma Client...');

  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('✅ Prisma Client generated successfully');
  } catch (error) {
    console.error('❌ Client generation failed:', error.message);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('========================================');
  console.log('🚀 Database Setup Starting');
  console.log('========================================\n');

  const config = setupSchema();

  // Only run migrations and seed if requested
  if (process.argv.includes('--migrate')) {
    runMigrations(config);
  }

  if (process.argv.includes('--seed')) {
    runSeed(config);
  }

  // Always generate client
  generateClient();

  console.log('\n========================================');
  console.log('✨ Database Setup Complete');
  console.log('========================================');
  console.log(`
Environment: ${ENV}
Provider: ${config.provider}
Ready to start development!
  `);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});

// Run the setup
main();
