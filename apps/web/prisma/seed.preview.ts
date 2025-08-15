/**
 * Preview Environment Seed Script
 *
 * Minimal seed data for preview/staging environments.
 * This provides just enough data to test features without
 * overwhelming the preview database.
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding preview database...');

  // Clean existing data
  await prisma.program.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await hash('PreviewAdmin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@preview.test',
      name: 'Preview Admin',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user: admin@preview.test');

  // Create test users
  const userPassword = await hash('TestUser123!', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'parent@preview.test',
        name: 'Test Parent',
        password: userPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'subscriber@preview.test',
        name: 'Test Subscriber',
        password: userPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    }),
  ]);
  console.log('✅ Created 2 test users');

  // Create active subscription for test user
  await prisma.subscription.create({
    data: {
      userId: users[1].id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      stripePriceId: 'price_preview_test',
      stripeSubscriptionId: 'sub_preview_test',
    },
  });
  console.log('✅ Created test subscription');

  // Create vetted and published providers
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        businessName: 'Sydney Sports Academy',
        contactName: 'John Smith',
        email: 'contact@sportsacademy.com.au',
        phone: '02 9999 0001',
        website: 'https://sportsacademy.com.au',
        abn: '12345678901',
        address: '123 Sports St',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        description: 'Premier sports training for kids',
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
        email: 'hello@creativekids.com.au',
        phone: '02 9999 0002',
        website: 'https://creativekids.com.au',
        abn: '23456789012',
        address: '456 Art Lane',
        suburb: 'Bondi',
        state: 'NSW',
        postcode: '2026',
        description: 'Nurturing creativity through art',
        isVetted: true,
        isPublished: true,
        vettingDate: new Date(),
        vettingStatus: 'APPROVED',
      },
    }),
    prisma.provider.create({
      data: {
        businessName: 'Tech Explorers',
        contactName: 'Mike Chen',
        email: 'info@techexplorers.com.au',
        phone: '02 9999 0003',
        website: 'https://techexplorers.com.au',
        abn: '34567890123',
        address: '789 Innovation Dr',
        suburb: 'Chatswood',
        state: 'NSW',
        postcode: '2067',
        description: 'STEM education for the future',
        isVetted: true,
        isPublished: true,
        vettingDate: new Date(),
        vettingStatus: 'APPROVED',
      },
    }),
  ]);
  console.log('✅ Created 3 providers');

  // Create programs for each provider
  const programsData = [
    // Sports Academy programs
    {
      providerId: providers[0].id,
      name: 'Summer Soccer Camp',
      description: 'Intensive soccer training',
      category: 'Sports',
      ageMin: 8,
      ageMax: 14,
      price: 250,
      location: 'Sydney Sports Complex',
      startDate: new Date('2024-01-08'),
      endDate: new Date('2024-01-12'),
      startTime: '09:00',
      endTime: '15:00',
      capacity: 30,
      isActive: true,
      isPublished: true,
    },
    {
      providerId: providers[0].id,
      name: 'Basketball Skills Clinic',
      description: 'Improve your basketball game',
      category: 'Sports',
      ageMin: 10,
      ageMax: 16,
      price: 180,
      location: 'Indoor Sports Centre',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-17'),
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
      description: 'Explore painting and drawing',
      category: 'Arts',
      ageMin: 6,
      ageMax: 12,
      price: 200,
      location: 'Creative Kids Studio',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-14'),
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
      description: 'Build and program robots',
      category: 'STEM',
      ageMin: 10,
      ageMax: 15,
      price: 350,
      location: 'Tech Hub Chatswood',
      startDate: new Date('2024-01-22'),
      endDate: new Date('2024-01-26'),
      startTime: '09:00',
      endTime: '15:00',
      capacity: 12,
      isActive: true,
      isPublished: true,
    },
    {
      providerId: providers[2].id,
      name: 'Game Development Basics',
      description: 'Create your first video game',
      category: 'STEM',
      ageMin: 12,
      ageMax: 17,
      price: 300,
      location: 'Tech Hub Chatswood',
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-09'),
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
  console.log('✅ Created 5 programs');

  console.log(`
========================================
Preview database seeded successfully!

Test Accounts:
- Admin: admin@preview.test / PreviewAdmin123!
- Parent: parent@preview.test / TestUser123!
- Subscriber: subscriber@preview.test / TestUser123!

Providers: 3 (all vetted and published)
Programs: 5 (all active)
========================================
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding preview database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
