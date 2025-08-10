// User role constants to ensure consistency
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Validation helper
export function isValidRole(role: string): role is UserRoleType {
  return Object.values(UserRole).includes(role as UserRoleType);
}

// For use in Zod schemas
import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);