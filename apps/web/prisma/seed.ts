import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Since SQLite doesn't support enums, we define them as constants
const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// Get database URL from environment
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const isDocker = process.env.DOCKER_ENV === 'true';
  return isDocker
    ? 'postgresql://postgres:postgres@postgres:5432/holiday_aggregator?schema=public'
    : 'postgresql://postgres:postgres@localhost:5432/holiday_aggregator?schema=public';
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up test users first
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['premium@test.com', 'basic@test.com'],
      },
    },
  });

  // Create premium user for E2E tests
  const premiumEmail = 'premium@test.com';
  const existingPremium = await prisma.user.findUnique({ where: { email: premiumEmail } });
  if (!existingPremium) {
    await prisma.user.create({
      data: {
        email: premiumEmail,
        name: 'Premium User',
        password: await bcrypt.hash('Test123!@#', 10),
        role: UserRole.USER,
        emailVerified: new Date(),
        subscriptions: {
          create: {
            status: 'ACTIVE',
            stripeSubscriptionId: 'sub_premium',
            stripePriceId: 'price_premium',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false,
          },
        },
      },
    });
    console.log(`✅ Created premium user: ${premiumEmail} with subscription`);
  } else {
    await prisma.user.update({
      where: { email: premiumEmail },
      data: { password: await bcrypt.hash('Test123!@#', 10) },
    });
    console.log(`✅ Updated existing premium user password`);
  }

  // Create premium user for cancellation tests
  const premiumCancelEmail = 'premium_cancel@test.com';
  const existingPremiumCancel = await prisma.user.findUnique({ where: { email: premiumCancelEmail } });
  if (!existingPremiumCancel) {
    await prisma.user.create({
      data: {
        email: premiumCancelEmail,
        name: 'Premium Cancel User',
        password: await bcrypt.hash('Test123!@#', 10),
        role: UserRole.USER,
        emailVerified: new Date(),
        subscriptions: {
          create: {
            status: 'ACTIVE',
            stripeSubscriptionId: 'sub_premium_cancel',
            stripePriceId: 'price_premium',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false,
          },
        },
      },
    });
    console.log(`✅ Created premium cancel user: ${premiumCancelEmail}`);
  } else {
    await prisma.user.update({
      where: { email: premiumCancelEmail },
      data: { password: await bcrypt.hash('Test123!@#', 10) },
    });
    console.log(`✅ Updated existing premium cancel user password`);
  }

  // Create basic user for E2E tests
  const basicEmail = 'basic@test.com';
  const existingBasic = await prisma.user.findUnique({ where: { email: basicEmail } });
  if (!existingBasic) {
    await prisma.user.create({
      data: {
        email: basicEmail,
        name: 'Basic User',
        password: await bcrypt.hash('Test123!@#', 10),
        role: UserRole.USER,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created basic user: ${basicEmail}`);
  } else {
    await prisma.user.update({
      where: { email: basicEmail },
      data: { password: await bcrypt.hash('Test123!@#', 10) },
    });
    console.log(`✅ Updated existing basic user password`);
  }

  // Get admin credentials from environment variables ONLY
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️  Admin credentials not found in environment variables');
    console.log('   Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
    console.log('   Skipping admin user creation...');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);

    // Update to ensure they have admin role and password
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: UserRole.ADMIN,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
    console.log(`📝 Updated ${adminEmail} to ADMIN role with latest password`);
  } else {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created admin user: ${admin.email}`);
  }

  // Also create the same account as a regular user for testing
  const regularUserEmail = 'serge.user@test.com';
  const existingRegularUser = await prisma.user.findUnique({
    where: { email: regularUserEmail },
  });

  if (existingRegularUser) {
    console.log(`✅ Regular user already exists: ${regularUserEmail}`);
    // Update password to match
    await prisma.user.update({
      where: { email: regularUserEmail },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
    console.log(`📝 Updated ${regularUserEmail} password`);
  } else {
    // Create regular user with same password
    await prisma.user.create({
      data: {
        email: regularUserEmail,
        name: 'Serge (User)',
        password: hashedPassword,
        role: UserRole.USER,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created regular user: ${regularUserEmail}`);
  }

  // Create a test user if it doesn't exist
  const testUserEmail = 'user@test.com';
  const existingTestUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (!existingTestUser) {
    await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        password: await bcrypt.hash('Test123456', 10),
        role: UserRole.USER,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created test user: ${testUserEmail}`);
  } else {
    console.log(`✅ Test user already exists: ${testUserEmail}`);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
