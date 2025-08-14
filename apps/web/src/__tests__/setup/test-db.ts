/**
 * Test Database Setup
 * Provides isolated test database configuration and utilities
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

// Generate unique test database URL for isolation
export const generateTestDatabaseUrl = (): string => {
  const testId = randomBytes(4).toString('hex');
  const baseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test';
  
  // Parse and modify the database name
  const url = new URL(baseUrl);
  const originalDb = url.pathname.slice(1);
  url.pathname = `/${originalDb}_test_${testId}`;
  
  return url.toString();
};

// Test database client with transaction support
export class TestDatabaseClient {
  private prisma: PrismaClient;
  private databaseUrl: string;
  private isTransactionOpen = false;

  constructor(databaseUrl?: string) {
    this.databaseUrl = databaseUrl || generateTestDatabaseUrl();
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.databaseUrl,
        },
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : [],
    });
  }

  async setup(): Promise<void> {
    try {
      // Push schema to test database
      execSync(`DATABASE_URL="${this.databaseUrl}" npx prisma db push --skip-generate`, {
        stdio: process.env.DEBUG_TESTS ? 'inherit' : 'ignore',
      });
      
      await this.prisma.$connect();
    } catch (error) {
      console.error('Failed to setup test database:', error);
      throw error;
    }
  }

  async teardown(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      
      // Drop test database
      const url = new URL(this.databaseUrl);
      const dbName = url.pathname.slice(1);
      const baseUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}/postgres`;
      
      execSync(`psql "${baseUrl}" -c "DROP DATABASE IF EXISTS ${dbName}"`, {
        stdio: process.env.DEBUG_TESTS ? 'inherit' : 'ignore',
      });
    } catch (error) {
      console.error('Failed to teardown test database:', error);
    }
  }

  async beginTransaction(): Promise<void> {
    if (this.isTransactionOpen) {
      throw new Error('Transaction already open');
    }
    
    await this.prisma.$executeRaw`BEGIN`;
    this.isTransactionOpen = true;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.isTransactionOpen) {
      throw new Error('No transaction to rollback');
    }
    
    await this.prisma.$executeRaw`ROLLBACK`;
    this.isTransactionOpen = false;
  }

  async clean(): Promise<void> {
    // Clean all tables in reverse dependency order
    const tables = [
      'Program',
      'Subscription',
      'Provider',
      'Session',
      'Account',
      'User',
    ];

    for (const table of tables) {
      try {
        await this.prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      } catch (error) {
        // Table might not exist, ignore
      }
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }
}

// Global test database instance
let globalTestDb: TestDatabaseClient | null = null;

export const getTestDatabase = async (): Promise<TestDatabaseClient> => {
  if (!globalTestDb) {
    globalTestDb = new TestDatabaseClient();
    await globalTestDb.setup();
  }
  return globalTestDb;
};

export const closeTestDatabase = async (): Promise<void> => {
  if (globalTestDb) {
    await globalTestDb.teardown();
    globalTestDb = null;
  }
};

// Jest lifecycle hooks
export const setupTestDatabase = async (): Promise<PrismaClient> => {
  const testDb = await getTestDatabase();
  return testDb.getClient();
};

export const cleanupTestDatabase = async (): Promise<void> => {
  const testDb = await getTestDatabase();
  await testDb.clean();
};

// Test transaction wrapper
export const withTestTransaction = async <T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const testDb = await getTestDatabase();
  const prisma = testDb.getClient();
  
  try {
    await testDb.beginTransaction();
    const result = await fn(prisma);
    await testDb.rollbackTransaction();
    return result;
  } catch (error) {
    await testDb.rollbackTransaction();
    throw error;
  }
};

// Mock Prisma client for unit tests
export const createMockPrismaClient = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    program: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  };

  return mockPrisma as unknown as PrismaClient;
};