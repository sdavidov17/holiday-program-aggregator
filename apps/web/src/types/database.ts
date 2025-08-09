/**
 * Database type definitions
 * These types are used when the database provider doesn't support enums (SQLite)
 */

// User roles
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  PROVIDER: 'PROVIDER',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Subscription statuses
export const SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  TRIALING: 'TRIALING',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// Vetting statuses
export const VettingStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type VettingStatus = typeof VettingStatus[keyof typeof VettingStatus];

// Program statuses
export const ProgramStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  FULLY_BOOKED: 'FULLY_BOOKED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type ProgramStatus = typeof ProgramStatus[keyof typeof ProgramStatus];

// Re-export for compatibility with @prisma/client when using SQLite
export { 
  UserRole as PrismaUserRole,
  SubscriptionStatus as PrismaSubscriptionStatus,
  VettingStatus as PrismaVettingStatus,
  ProgramStatus as PrismaProgramStatus,
};