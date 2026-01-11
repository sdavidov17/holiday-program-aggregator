import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

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

async function _main() {
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
  const existingPremiumCancel = await prisma.user.findUnique({
    where: { email: premiumCancelEmail },
  });
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
  } else {
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
  } // End of admin credentials else block

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

  // Create test providers and programs for E2E search tests
  console.log('🌱 Creating test providers and programs...');

  // Clean up existing test providers
  await prisma.program.deleteMany({
    where: {
      provider: {
        email: {
          endsWith: '@test-provider.com',
        },
      },
    },
  });
  await prisma.provider.deleteMany({
    where: {
      email: {
        endsWith: '@test-provider.com',
      },
    },
  });

  // Create vetted and published providers
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        businessName: 'Sydney Sports Academy',
        contactName: 'John Smith',
        email: 'contact@test-provider.com',
        phone: '02 9999 0001',
        website: 'https://sportsacademy.example.com',
        abn: '12345678901',
        address: '123 Sports St',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        description: 'Premier sports training for kids of all ages',
        isVetted: true,
        isPublished: true,
        vettingDate: new Date(),
        vettingStatus: 'APPROVED',
      },
    }),
    prisma.provider.create({
      data: {
        businessName: 'Creative Kids Art Studio',
        contactName: 'Sarah Johnson',
        email: 'hello@test-provider.com',
        phone: '02 9999 0002',
        website: 'https://creativekids.example.com',
        abn: '23456789012',
        address: '456 Art Lane',
        suburb: 'Bondi',
        state: 'NSW',
        postcode: '2026',
        description: 'Nurturing creativity through art and crafts',
        isVetted: true,
        isPublished: true,
        vettingDate: new Date(),
        vettingStatus: 'APPROVED',
      },
    }),
    prisma.provider.create({
      data: {
        businessName: 'Tech Explorers Academy',
        contactName: 'Mike Chen',
        email: 'info@test-provider.com',
        phone: '02 9999 0003',
        website: 'https://techexplorers.example.com',
        abn: '34567890123',
        address: '789 Innovation Dr',
        suburb: 'Chatswood',
        state: 'NSW',
        postcode: '2067',
        description: 'STEM education and technology programs for the future',
        isVetted: true,
        isPublished: true,
        vettingDate: new Date(),
        vettingStatus: 'APPROVED',
      },
    }),
  ]);
  console.log('✅ Created 3 test providers');

  // Create programs for each provider
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const programsData = [
    // Sports Academy programs
    {
      providerId: providers[0].id,
      name: 'Summer Soccer Camp',
      description: 'Intensive soccer training for young athletes',
      category: 'Sports',
      ageMin: 8,
      ageMax: 14,
      price: 250,
      location: 'Sydney Sports Complex',
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '15:00',
      capacity: 30,
      isActive: true,
      isPublished: true,
    },
    {
      providerId: providers[0].id,
      name: 'Basketball Skills Clinic',
      description: 'Improve your basketball game with pro coaches',
      category: 'Sports',
      ageMin: 10,
      ageMax: 16,
      price: 180,
      location: 'Indoor Sports Centre',
      startDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '14:00',
      capacity: 20,
      isActive: true,
      isPublished: true,
    },
    // Art Studio programs
    {
      providerId: providers[1].id,
      name: 'Young Artists Workshop',
      description: 'Explore painting, drawing and mixed media',
      category: 'Arts',
      ageMin: 6,
      ageMax: 12,
      price: 200,
      location: 'Creative Kids Studio Bondi',
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: '09:30',
      endTime: '12:30',
      capacity: 15,
      isActive: true,
      isPublished: true,
    },
    // Tech programs
    {
      providerId: providers[2].id,
      name: 'Robotics Workshop',
      description: 'Build and program robots with LEGO and Arduino',
      category: 'Technology',
      ageMin: 10,
      ageMax: 15,
      price: 350,
      location: 'Tech Hub Chatswood',
      startDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextMonth.getTime() + 19 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '15:00',
      capacity: 12,
      isActive: true,
      isPublished: true,
    },
    {
      providerId: providers[2].id,
      name: 'Game Development Basics',
      description: 'Create your first video game with Scratch and Unity',
      category: 'Technology',
      ageMin: 12,
      ageMax: 17,
      price: 300,
      location: 'Tech Hub Chatswood',
      startDate: new Date(nextMonth.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextMonth.getTime() + 26 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '16:00',
      capacity: 10,
      isActive: true,
      isPublished: true,
    },
  ];

  await prisma.program.createMany({
    data: programsData,
  });
  console.log('✅ Created 5 test programs');

  console.log('🎉 Database seed completed!');
}

_main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
