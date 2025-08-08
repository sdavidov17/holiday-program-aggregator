#!/usr/bin/env tsx
// Script to make a user an admin
// Usage: pnpm tsx scripts/make-admin.ts <email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address");
    console.error("Usage: pnpm tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ User ${user.email} is now an admin`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("Make sure the user exists with that email address");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);