/**
 * Unit Tests: Subscription Router
 * Tests tRPC subscription procedures
 */

import { TRPCError } from '@trpc/server';
import type { Session } from 'next-auth';

// Mock SubscriptionService
const mockGetSubscriptionStatus = jest.fn();
const mockGetSubscription = jest.fn();
const mockCreateCheckoutSession = jest.fn();
const mockCancelSubscription = jest.fn();
const mockResumeSubscription = jest.fn();

jest.mock('~/services/subscription.service', () => ({
  SubscriptionService: jest.fn().mockImplementation(() => ({
    getSubscriptionStatus: mockGetSubscriptionStatus,
    getSubscription: mockGetSubscription,
    createCheckoutSession: mockCreateCheckoutSession,
    cancelSubscription: mockCancelSubscription,
    resumeSubscription: mockResumeSubscription,
  })),
}));

// Mock database
jest.mock('~/server/db', () => ({
  db: {
    subscription: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Import router after mocks are set up
import { subscriptionRouter } from '../../server/api/routers/subscription';

describe('Subscription Router', () => {
  const mockDb = {} as any;

  // Create mock session for authenticated user
  const createMockSession = (overrides?: Partial<Session>): Session => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  });

  // Create mock context for tRPC
  const createMockContext = (session: Session | null = null, reqHeaders: Record<string, string> = {}) => ({
    session,
    db: mockDb,
    req: {
      headers: {
        host: 'localhost:3000',
        ...reqHeaders,
      },
    },
    res: {},
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status for authenticated user', async () => {
      const mockStatus = {
        hasSubscription: true,
        status: 'ACTIVE',
        expiresAt: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };
      mockGetSubscriptionStatus.mockResolvedValue(mockStatus);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.getSubscriptionStatus();

      expect(mockGetSubscriptionStatus).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockStatus);
    });

    it('should return no subscription status for user without subscription', async () => {
      const mockStatus = {
        hasSubscription: false,
        status: null,
        expiresAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
      mockGetSubscriptionStatus.mockResolvedValue(mockStatus);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.getSubscriptionStatus();

      expect(result.hasSubscription).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      const ctx = createMockContext(null);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.getSubscriptionStatus()).rejects.toThrow(TRPCError);
    });
  });

  describe('getStatus', () => {
    it('should return subscription details for user with subscription', async () => {
      const mockSubscription = {
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        currentPeriodEnd: new Date('2024-12-31'),
        cancelAtPeriodEnd: false,
      };
      mockGetSubscription.mockResolvedValue(mockSubscription);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.getStatus();

      expect(mockGetSubscription).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        status: 'ACTIVE',
        expiresAt: mockSubscription.expiresAt,
        currentPeriodEnd: mockSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });
    });

    it('should return null for user without subscription', async () => {
      mockGetSubscription.mockResolvedValue(null);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.getStatus();

      expect(result).toBeNull();
    });

    it('should reject unauthenticated requests', async () => {
      const ctx = createMockContext(null);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.getStatus()).rejects.toThrow(TRPCError);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session with default price', async () => {
      const mockSession = {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };
      mockCreateCheckoutSession.mockResolvedValue(mockSession);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.createCheckoutSession({});

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
        'http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}',
        'http://localhost:3000/subscription/cancelled',
      );
      expect(result).toEqual(mockSession);
    });

    it('should use http protocol for localhost', async () => {
      mockCreateCheckoutSession.mockResolvedValue({ sessionId: 'cs_test' });

      const session = createMockSession();
      const ctx = createMockContext(session, { host: 'localhost:3000' });
      const caller = subscriptionRouter.createCaller(ctx);

      await caller.createCheckoutSession({});

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('http://localhost:3000'),
        expect.stringContaining('http://localhost:3000'),
      );
    });

    it('should use https protocol for production hosts', async () => {
      mockCreateCheckoutSession.mockResolvedValue({ sessionId: 'cs_test' });

      const session = createMockSession();
      const ctx = createMockContext(session, { host: 'example.com' });
      const caller = subscriptionRouter.createCaller(ctx);

      await caller.createCheckoutSession({});

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('https://example.com'),
        expect.stringContaining('https://example.com'),
      );
    });

    it('should propagate service errors', async () => {
      mockCreateCheckoutSession.mockRejectedValue(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have an active subscription',
        }),
      );

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.createCheckoutSession({})).rejects.toThrow(
        'You already have an active subscription',
      );
    });

    it('should reject unauthenticated requests', async () => {
      const ctx = createMockContext(null);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.createCheckoutSession({})).rejects.toThrow(TRPCError);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription for authenticated user', async () => {
      const mockResult = {
        success: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date('2024-12-31'),
      };
      mockCancelSubscription.mockResolvedValue(mockResult);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.cancelSubscription();

      expect(mockCancelSubscription).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResult);
    });

    it('should propagate NOT_FOUND error when no subscription exists', async () => {
      mockCancelSubscription.mockRejectedValue(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription found',
        }),
      );

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.cancelSubscription()).rejects.toThrow(
        'No active subscription found',
      );
    });

    it('should reject unauthenticated requests', async () => {
      const ctx = createMockContext(null);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.cancelSubscription()).rejects.toThrow(TRPCError);
    });
  });

  describe('resumeSubscription', () => {
    it('should resume subscription for authenticated user', async () => {
      const mockResult = {
        success: true,
        cancelAtPeriodEnd: false,
      };
      mockResumeSubscription.mockResolvedValue(mockResult);

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      const result = await caller.resumeSubscription();

      expect(mockResumeSubscription).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResult);
    });

    it('should propagate error when subscription is not scheduled for cancellation', async () => {
      mockResumeSubscription.mockRejectedValue(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Subscription is not scheduled for cancellation',
        }),
      );

      const session = createMockSession();
      const ctx = createMockContext(session);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.resumeSubscription()).rejects.toThrow(
        'Subscription is not scheduled for cancellation',
      );
    });

    it('should reject unauthenticated requests', async () => {
      const ctx = createMockContext(null);
      const caller = subscriptionRouter.createCaller(ctx);

      await expect(caller.resumeSubscription()).rejects.toThrow(TRPCError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing host header', async () => {
      mockCreateCheckoutSession.mockResolvedValue({ sessionId: 'cs_test' });

      const session = createMockSession();
      const ctx = {
        session,
        db: mockDb,
        req: { headers: {} },
        res: {},
      };
      const caller = subscriptionRouter.createCaller(ctx);

      await caller.createCheckoutSession({});

      // Should fall back to localhost:3000
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('localhost:3000'),
        expect.stringContaining('localhost:3000'),
      );
    });

    it('should handle user with different roles', async () => {
      mockGetSubscriptionStatus.mockResolvedValue({
        hasSubscription: true,
        status: 'ACTIVE',
      });

      const adminSession = createMockSession({
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
      });
      const ctx = createMockContext(adminSession);
      const caller = subscriptionRouter.createCaller(ctx);

      await caller.getSubscriptionStatus();

      expect(mockGetSubscriptionStatus).toHaveBeenCalledWith('admin-123');
    });
  });
});
