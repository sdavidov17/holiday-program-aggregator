import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { env } from '~/env.mjs';

// Re-export enum replacements for SQLite compatibility
export { ProgramStatus, SubscriptionStatus, UserRole, VettingStatus } from '~/types/database';

// Determine environment
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const isDocker = process.env.DOCKER_ENV === 'true';

// Get DATABASE_URL or use default for development
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (isProduction) {
    throw new Error('DATABASE_URL must be set in production');
  }

  // Default to local PostgreSQL
  return isDocker
    ? 'postgresql://postgres:postgres@postgres:5432/holiday_aggregator?schema=public'
    : 'postgresql://postgres:postgres@localhost:5432/holiday_aggregator?schema=public';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create PostgreSQL connection pool
const pool = globalForPrisma.pool ?? new Pool({ connectionString: getDatabaseUrl() });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
  globalForPrisma.pool = pool;
}

// Also export as prisma for compatibility
export const prisma = db;
