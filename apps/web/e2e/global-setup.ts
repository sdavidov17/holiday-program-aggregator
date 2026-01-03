/**
 * Playwright Global Setup
 * Creates dynamic test users before E2E tests run
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Generate unique run ID for this test run
const runId = `e2e-${Date.now()}`;

// Test user configuration
const TEST_PASSWORD = 'Test123!@#';
const TEST_USERS = {
  premium: {
    email: `${runId}-premium@test.local`,
    name: 'E2E Premium User',
    hasSubscription: true,
    subscriptionId: `sub_${runId}_premium`,
  },
  basic: {
    email: `${runId}-basic@test.local`,
    name: 'E2E Basic User',
    hasSubscription: false,
  },
  premiumCancel: {
    email: `${runId}-premium-cancel@test.local`,
    name: 'E2E Premium Cancel User',
    hasSubscription: true,
    subscriptionId: `sub_${runId}_cancel`,
  },
};

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required for E2E tests');
  }
  return dbUrl;
}

async function globalSetup() {
  console.log('\n🚀 E2E Global Setup: Creating dynamic test users...\n');

  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Hash password once for all users
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    // Create premium user with subscription
    const premiumUser = await prisma.user.create({
      data: {
        email: TEST_USERS.premium.email,
        name: TEST_USERS.premium.name,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
        subscriptions: {
          create: {
            status: 'ACTIVE',
            stripeSubscriptionId: TEST_USERS.premium.subscriptionId,
            stripePriceId: 'price_e2e_premium',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          },
        },
      },
    });
    console.log(`✅ Created premium user: ${premiumUser.email}`);

    // Create basic user without subscription
    const basicUser = await prisma.user.create({
      data: {
        email: TEST_USERS.basic.email,
        name: TEST_USERS.basic.name,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created basic user: ${basicUser.email}`);

    // Create premium user for cancellation tests
    const cancelUser = await prisma.user.create({
      data: {
        email: TEST_USERS.premiumCancel.email,
        name: TEST_USERS.premiumCancel.name,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
        subscriptions: {
          create: {
            status: 'ACTIVE',
            stripeSubscriptionId: TEST_USERS.premiumCancel.subscriptionId,
            stripePriceId: 'price_e2e_premium',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          },
        },
      },
    });
    console.log(`✅ Created premium cancel user: ${cancelUser.email}`);

    // Store test user credentials in a file for tests to read
    const testUserData = {
      runId,
      password: TEST_PASSWORD,
      users: {
        premium: {
          email: TEST_USERS.premium.email,
          id: premiumUser.id,
          subscriptionId: TEST_USERS.premium.subscriptionId,
        },
        basic: {
          email: TEST_USERS.basic.email,
          id: basicUser.id,
        },
        premiumCancel: {
          email: TEST_USERS.premiumCancel.email,
          id: cancelUser.id,
          subscriptionId: TEST_USERS.premiumCancel.subscriptionId,
        },
      },
    };

    // Write to a temp file that tests can read
    const dataPath = path.join(__dirname, '.e2e-test-users.json');
    fs.writeFileSync(dataPath, JSON.stringify(testUserData, null, 2));
    console.log(`\n📁 Test user data saved to: ${dataPath}`);

    console.log('\n✅ E2E Global Setup complete!\n');
  } catch (error) {
    console.error('❌ E2E Global Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

export default globalSetup;
