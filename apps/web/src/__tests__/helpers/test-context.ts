import { db } from '~/server/db';
import type { Session } from 'next-auth';

interface MockContextOptions {
  session?: Session | null;
}

export function createMockContext(options?: MockContextOptions) {
  return {
    session: options?.session || null,
    db,
    req: {} as any,
    res: {} as any,
    ...options,
  };
}