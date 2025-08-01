import { appRouter } from '../src/server/api/root';
import { createInnerTRPCContext } from '../src/server/api/trpc';

// Mock the database and auth session
jest.mock('../src/server/db', () => ({
  db: {},
}));

jest.mock('../src/server/auth', () => ({
  getServerAuthSession: jest.fn(() => Promise.resolve(null)),
}));

describe('healthz endpoint', () => {
  it('should return status ok', async () => {
    const ctx = createInnerTRPCContext({ 
      session: null,
      correlationId: 'test-correlation-id-1' 
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthz.healthz();

    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
    
    // Verify timestamp is a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('should return consistent status', async () => {
    const ctx = createInnerTRPCContext({ 
      session: null,
      correlationId: 'test-correlation-id-2' 
    });
    const caller = appRouter.createCaller(ctx);

    const result1 = await caller.healthz.healthz();
    const result2 = await caller.healthz.healthz();

    expect(result1.status).toBe('ok');
    expect(result2.status).toBe('ok');
    expect(result1.status).toBe(result2.status);
  });
});