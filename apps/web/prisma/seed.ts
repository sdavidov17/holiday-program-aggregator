import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Since SQLite doesn't support enums, we define them as constants
const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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
    console.log(`✅ Test user already exists: ${testUserEmail}`)
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
  });