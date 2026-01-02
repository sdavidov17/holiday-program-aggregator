import path from 'node:path';
import { defineConfig } from 'prisma/config';

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

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: getDatabaseUrl(),
  },
});
