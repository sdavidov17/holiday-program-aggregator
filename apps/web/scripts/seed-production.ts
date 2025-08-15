#!/usr/bin/env tsx
/**
 * Production Database Seeding Script
 *
 * This script creates the admin account in production PostgreSQL database.
 * Run this after deploying to Vercel to ensure admin account exists.
 *
 * Usage:
 *   DATABASE_URL="your-production-postgres-url" pnpm tsx scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seed...');

  // Admin credentials from environment (required)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    console.error(
      'Usage: ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="secure-password" pnpm tsx scripts/seed-production.ts',
    );
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log(`✅ Admin user created/updated: ${adminUser.email}`);

    // Also create regular user account with same credentials
    const userEmail = adminEmail.replace('@', '.user@');
    const regularUser = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        name: adminName.replace('Admin', 'User'),
        password: hashedPassword,
        role: 'USER',
      },
      create: {
        email: userEmail,
        name: adminName.replace('Admin', 'User'),
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    });

    console.log(`✅ Regular user created/updated: ${regularUser.email}`);

    // Verify the accounts can be found
    const verifyAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { email: true, role: true, password: true },
    });

    if (verifyAdmin?.password) {
      console.log(`✅ Verified admin account exists with role: ${verifyAdmin.role}`);

      // Test password verification
      const passwordValid = await bcrypt.compare(adminPassword, verifyAdmin.password);
      if (passwordValid) {
        console.log('✅ Password verification successful');
      } else {
        console.error('❌ Password verification failed!');
      }
    } else {
      console.error('❌ Admin account verification failed!');
    }

    console.log('🎉 Production database seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
