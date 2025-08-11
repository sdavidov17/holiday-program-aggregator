/**
 * Production Environment Seed Script
 * 
 * Minimal seed data for production environment.
 * This only creates essential system data and the initial admin user.
 * 
 * IMPORTANT: This should only be run ONCE during initial setup.
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing production database...");

  // Check if already initialized
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("⚠️  Production database already initialized. Skipping seed.");
    return;
  }

  // Create initial admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "System Administrator";
  
  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    console.log('   Please set them in your production environment');
    process.exit(1);
  }

  // In production with custom admin credentials, validate password strength
  if (process.env.ADMIN_PASSWORD && adminPassword.length < 12) {
    throw new Error("Admin password must be at least 12 characters");
  }

  const hashedPassword = await hash(adminPassword, 12);
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create default subscription plan metadata (if using Stripe)
  // This is just metadata - actual Stripe products should be created in Stripe Dashboard
  console.log("✅ Production database initialized successfully");

  console.log(`
========================================
PRODUCTION DATABASE INITIALIZED

Admin Account Created:
- Email: ${adminEmail}
- Name: ${adminName}

IMPORTANT REMINDERS:
1. Change the admin password after first login
2. Enable 2FA for admin account
3. Configure Stripe products in Stripe Dashboard
4. Set up email templates in Resend
5. Configure monitoring and alerts

Security Notes:
- Delete ADMIN_PASSWORD from environment after setup
- Rotate NEXTAUTH_SECRET quarterly
- Monitor failed login attempts
- Review audit logs regularly
========================================
  `);

  // Log initialization for audit
  console.log(
    JSON.stringify({
      event: "PRODUCTION_DB_INITIALIZED",
      timestamp: new Date().toISOString(),
      adminEmail: adminEmail,
      version: process.env.npm_package_version || "unknown",
    })
  );
}

main()
  .catch((e) => {
    console.error("❌ Error initializing production database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });