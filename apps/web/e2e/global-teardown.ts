/**
 * Playwright Global Teardown
 * Cleans up dynamic test users after E2E tests complete
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required for E2E tests');
  }
  return dbUrl;
}

async function globalTeardown() {
  console.log('\n🧹 E2E Global Teardown: Cleaning up test users...\n');

  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Read the test user data file to get the run ID
    const dataPath = path.join(__dirname, '.e2e-test-users.json');

    if (fs.existsSync(dataPath)) {
      const testUserData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const runId = testUserData.runId;

      console.log(`🔍 Cleaning up users for run: ${runId}`);

      // Delete subscriptions first (foreign key constraint)
      const deletedSubs = await prisma.subscription.deleteMany({
        where: {
          stripeSubscriptionId: {
            startsWith: `sub_${runId}`,
          },
        },
      });
      console.log(`🗑️  Deleted ${deletedSubs.count} subscriptions`);

      // Delete test users
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: runId,
          },
        },
      });
      console.log(`🗑️  Deleted ${deletedUsers.count} test users`);

      // Remove the temp file
      fs.unlinkSync(dataPath);
      console.log(`🗑️  Removed temp data file`);
    } else {
      console.log('⚠️  No test user data file found, skipping cleanup');
    }

    // Also clean up any orphaned e2e test users (from failed runs)
    const orphanedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'e2e-',
        },
      },
    });
    if (orphanedUsers.count > 0) {
      console.log(`🗑️  Cleaned up ${orphanedUsers.count} orphaned test users from previous runs`);
    }

    console.log('\n✅ E2E Global Teardown complete!\n');
  } catch (error) {
    console.error('❌ E2E Global Teardown failed:', error);
    // Don't throw - we don't want cleanup failures to fail the test run
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

export default globalTeardown;
