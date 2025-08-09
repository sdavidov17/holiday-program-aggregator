import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

// Re-export enum replacements for SQLite compatibility
export { UserRole, SubscriptionStatus, VettingStatus, ProgramStatus } from "~/types/database";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Also export as prisma for compatibility
export const prisma = db;