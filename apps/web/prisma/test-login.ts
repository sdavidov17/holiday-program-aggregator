/**
 * Test script to verify PostgreSQL connection and login functionality
 * Run with: tsx prisma/test-login.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Since SQLite doesn't support enums, we define them as constants
const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
type UserRole = typeof UserRole[keyof typeof UserRole];

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testLogin(email: string, password: string, expectedRole: UserRole) {
  console.log(`\n${colors.blue}Testing login for ${email}...${colors.reset}`);
  
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      console.log(`${colors.red}❌ User not found: ${email}${colors.reset}`);
      return false;
    }

    console.log(`${colors.green}✓ User found:${colors.reset}`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: !!user.emailVerified,
    });

    // Check password
    if (!user.password) {
      console.log(`${colors.red}❌ User has no password set${colors.reset}`);
      return false;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      console.log(`${colors.red}❌ Invalid password${colors.reset}`);
      return false;
    }

    console.log(`${colors.green}✓ Password valid${colors.reset}`);

    // Check role
    if (user.role !== expectedRole) {
      console.log(`${colors.yellow}⚠ Role mismatch: expected ${expectedRole}, got ${user.role}${colors.reset}`);
      return false;
    }

    console.log(`${colors.green}✓ Role correct: ${user.role}${colors.reset}`);
    console.log(`${colors.green}✅ Login successful for ${email}${colors.reset}`);
    return true;

  } catch (error) {
    console.error(`${colors.red}❌ Error testing login:${colors.reset}`, error);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log(`\n${colors.blue}Testing database connection...${colors.reset}`);
  
  try {
    // Test connection
    await prisma.$connect();
    console.log(`${colors.green}✓ Connected to database${colors.reset}`);

    // Get database info (SQLite compatible)
    try {
      const result = await prisma.$queryRaw`SELECT sqlite_version() as version`;
      console.log(`${colors.green}✓ Database info (SQLite):${colors.reset}`, result);
    } catch {
      // Try PostgreSQL if SQLite fails
      try {
        const result = await prisma.$queryRaw`SELECT current_database() as db, version() as version`;
        console.log(`${colors.green}✓ Database info (PostgreSQL):${colors.reset}`, result);
      } catch {
        console.log(`${colors.yellow}⚠ Could not determine database version${colors.reset}`);
      }
    }

    // Count users
    const userCount = await prisma.user.count();
    console.log(`${colors.green}✓ Total users in database: ${userCount}${colors.reset}`);

    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Database connection failed:${colors.reset}`, error);
    return false;
  }
}

async function main() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}   PostgreSQL Login Test Suite${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);

  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log(`\n${colors.red}❌ Cannot proceed without database connection${colors.reset}`);
    process.exit(1);
  }

  // Get credentials from environment (required for testing)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.log(`\n${colors.red}❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required${colors.reset}`);
    console.log(`${colors.yellow}Usage: ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="secure-password" tsx prisma/test-login.ts${colors.reset}`);
    process.exit(1);
  }
  
  const regularUserEmail = adminEmail.replace('@', '.user@');

  // Test admin login
  const adminSuccess = await testLogin(adminEmail, adminPassword, UserRole.ADMIN);

  // Test regular user login
  const userSuccess = await testLogin(regularUserEmail, adminPassword, UserRole.USER);

  // Test with wrong password
  console.log(`\n${colors.blue}Testing failed login (wrong password)...${colors.reset}`);
  const failedLogin = await testLogin(adminEmail, 'wrongpassword', UserRole.ADMIN);
  if (!failedLogin) {
    console.log(`${colors.green}✓ Correctly rejected invalid password${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}   Test Summary${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  
  const results = [
    { name: 'Database Connection', success: dbConnected },
    { name: `Admin Login (${adminEmail})`, success: adminSuccess },
    { name: `User Login (${regularUserEmail})`, success: userSuccess },
    { name: 'Invalid Password Rejection', success: !failedLogin },
  ];

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? colors.green : colors.red;
    console.log(`${color}${icon} ${result.name}${colors.reset}`);
  });

  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? colors.green : colors.red}${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}${colors.reset}\n`);

  process.exit(allPassed ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(`${colors.red}❌ Test error:${colors.reset}`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });