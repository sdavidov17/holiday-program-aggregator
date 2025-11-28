/**
 * Unit Tests: Subscription Service
 * Tests subscription business logic
 */

import { TRPCError } from '@trpc/server';
import { SubscriptionService } from '../../services/subscription.service';

// Mock Stripe utilities
const mockCreateStripeCustomer = jest.fn();
const mockCreateCheckoutSession = jest.fn();
const mockStripe = {
  subscriptions: {
    update: jest.fn(),
  },
};

jest.mock('~/utils/stripe', () => ({
  stripe: mockStripe,
  createStripeCustomer: (...args: unknown[]) => mockCreateStripeCustomer(...args),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
  ANNUAL_SUBSCRIPTION_CONFIG: {
    mode: 'subscription',
    priceId: 'price_test',
  },
}));

// Mock environment
jest.mock('~/env.mjs', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_ANNUAL_PRICE_ID: 'price_annual_test',
  },
}));

// Mock logger
jest.mock('~/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock subscription utility
jest.mock('~/utils/subscription', () => ({
  isSubscriptionActive: jest.fn().mockImplementation((sub) => {
    if (!sub) return false;
    return sub.status === 'ACTIVE';
  }),
}));

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      subscription: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };

    service = new SubscriptionService(mockDb);
  });

  describe('getSubscriptionStatus', () => {
    it('should return status for user with active subscription', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-123',
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        currentPeriodEnd: new Date('2024-12-31'),
        cancelAtPeriodEnd: false,
      };
      mockDb.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.getSubscriptionStatus('user-123');

      expect(mockDb.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual({
        hasSubscription: true,
        status: 'ACTIVE',
        expiresAt: mockSubscription.expiresAt,
        currentPeriodEnd: mockSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });
    });

    it('should return no subscription status for user without subscription', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('user-123');

      expect(result).toEqual({
        hasSubscription: false,
        status: null,
        expiresAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    });

    it('should return cancelAtPeriodEnd: true when set', async () => {
      const mockSubscription = {
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
        expiresAt: null,
        currentPeriodEnd: new Date(),
      };
      mockDb.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.getSubscriptionStatus('user-123');

      expect(result.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('getSubscription', () => {
    it('should return full subscription object', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        status: 'ACTIVE',
      };
      mockDb.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.getSubscription('user-123');

      expect(result).toEqual(mockSubscription);
    });

    it('should return null when no subscription exists', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription('user-123');

      expect(result).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for new subscriber', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);
      mockCreateStripeCustomer.mockResolvedValue({ id: 'cus_new' });
      mockCreateCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      });
      mockDb.subscription.upsert.mockResolvedValue({});

      const result = await service.createCheckoutSession(
        'user-123',
        'test@example.com',
        'http://success',
        'http://cancel',
      );

      expect(mockCreateStripeCustomer).toHaveBeenCalledWith(
        'test@example.com',
        'user-123',
      );
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        'cus_new',
        'user-123',
        'price_annual_test',
        'http://success',
        'http://cancel',
      );
      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      });
    });

    it('should reuse existing Stripe customer ID', async () => {
      const existingSubscription = {
        id: 'sub-1',
        stripeCustomerId: 'cus_existing',
        status: 'EXPIRED', // Not active, so can create new checkout
      };
      mockDb.subscription.findUnique.mockResolvedValue(existingSubscription);
      mockCreateCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com',
      });
      mockDb.subscription.upsert.mockResolvedValue({});

      await service.createCheckoutSession(
        'user-123',
        'test@example.com',
        'http://success',
        'http://cancel',
      );

      expect(mockCreateStripeCustomer).not.toHaveBeenCalled();
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        'cus_existing',
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should throw error if user already has active subscription', async () => {
      const activeSubscription = {
        id: 'sub-1',
        status: 'ACTIVE',
        stripeCustomerId: 'cus_123',
      };
      mockDb.subscription.findUnique.mockResolvedValue(activeSubscription);

      await expect(
        service.createCheckoutSession(
          'user-123',
          'test@example.com',
          'http://success',
          'http://cancel',
        ),
      ).rejects.toThrow(TRPCError);

      await expect(
        service.createCheckoutSession(
          'user-123',
          'test@example.com',
          'http://success',
          'http://cancel',
        ),
      ).rejects.toThrow('You already have an active subscription');
    });

    it('should create pending subscription record', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);
      mockCreateStripeCustomer.mockResolvedValue({ id: 'cus_new' });
      mockCreateCheckoutSession.mockResolvedValue({ id: 'cs_test', url: 'url' });
      mockDb.subscription.upsert.mockResolvedValue({});

      await service.createCheckoutSession(
        'user-123',
        'test@example.com',
        'http://success',
        'http://cancel',
      );

      expect(mockDb.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        create: expect.objectContaining({
          userId: 'user-123',
          stripeCustomerId: 'cus_new',
          status: 'PENDING',
        }),
        update: expect.objectContaining({
          stripeCustomerId: 'cus_new',
          status: 'PENDING',
        }),
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        currentPeriodEnd: new Date('2024-12-31'),
      };
      mockDb.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.update.mockResolvedValue({
        cancel_at_period_end: true,
      });
      mockDb.subscription.update.mockResolvedValue({});

      const result = await service.cancelSubscription('user-123');

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_stripe_123',
        { cancel_at_period_end: true },
      );
      expect(mockDb.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: expect.any(Date),
        },
      });
      expect(result.success).toBe(true);
      expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it('should throw NOT_FOUND if no subscription exists', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);

      await expect(service.cancelSubscription('user-123')).rejects.toThrow(
        TRPCError,
      );
      await expect(service.cancelSubscription('user-123')).rejects.toThrow(
        'No active subscription found',
      );
    });

    it('should throw NOT_FOUND if subscription has no Stripe ID', async () => {
      mockDb.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: null,
      });

      await expect(service.cancelSubscription('user-123')).rejects.toThrow(
        'No active subscription found',
      );
    });
  });

  describe('resumeSubscription', () => {
    it('should resume canceled subscription', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        cancelAtPeriodEnd: true,
      };
      mockDb.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.update.mockResolvedValue({
        cancel_at_period_end: false,
      });
      mockDb.subscription.update.mockResolvedValue({});

      const result = await service.resumeSubscription('user-123');

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_stripe_123',
        { cancel_at_period_end: false },
      );
      expect(mockDb.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });
      expect(result.success).toBe(true);
      expect(result.cancelAtPeriodEnd).toBe(false);
    });

    it('should throw NOT_FOUND if no subscription exists', async () => {
      mockDb.subscription.findUnique.mockResolvedValue(null);

      await expect(service.resumeSubscription('user-123')).rejects.toThrow(
        'No subscription found',
      );
    });

    it('should throw BAD_REQUEST if subscription is not scheduled for cancellation', async () => {
      mockDb.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: 'sub_stripe_123',
        cancelAtPeriodEnd: false, // Not scheduled for cancellation
      });

      await expect(service.resumeSubscription('user-123')).rejects.toThrow(
        'Subscription is not scheduled for cancellation',
      );
    });
  });

  describe('handleCheckoutComplete', () => {
    it('should create/update subscription to ACTIVE status', async () => {
      mockDb.subscription.upsert.mockResolvedValue({});

      const currentPeriodStart = new Date('2024-01-01');
      const currentPeriodEnd = new Date('2025-01-01');

      await service.handleCheckoutComplete(
        'user-123',
        'sub_stripe_123',
        'price_annual',
        currentPeriodStart,
        currentPeriodEnd,
      );

      expect(mockDb.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        create: {
          userId: 'user-123',
          stripeSubscriptionId: 'sub_stripe_123',
          stripePriceId: 'price_annual',
          status: 'ACTIVE',
          currentPeriodStart,
          currentPeriodEnd,
          expiresAt: currentPeriodEnd,
        },
        update: {
          stripeSubscriptionId: 'sub_stripe_123',
          stripePriceId: 'price_annual',
          status: 'ACTIVE',
          currentPeriodStart,
          currentPeriodEnd,
          expiresAt: currentPeriodEnd,
        },
      });
    });
  });

  describe('updateSubscriptionFromWebhook', () => {
    it('should update subscription from webhook data', async () => {
      const subscription = { id: 'sub-1', stripeSubscriptionId: 'sub_stripe_123' };
      mockDb.subscription.findFirst.mockResolvedValue(subscription);
      mockDb.subscription.update.mockResolvedValue({});

      await service.updateSubscriptionFromWebhook('sub_stripe_123', {
        status: 'CANCELED',
      });

      expect(mockDb.subscription.findFirst).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_stripe_123' },
      });
      expect(mockDb.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'CANCELED' },
      });
    });

    it('should throw error if subscription not found', async () => {
      mockDb.subscription.findFirst.mockResolvedValue(null);

      await expect(
        service.updateSubscriptionFromWebhook('sub_invalid', { status: 'CANCELED' }),
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('Stripe Configuration Errors', () => {
    it('should throw error from cancelSubscription when Stripe is null', async () => {
      // Create a new mock where stripe is null
      jest.resetModules();
      jest.doMock('~/utils/stripe', () => ({
        stripe: null,
        createStripeCustomer: mockCreateStripeCustomer,
        createCheckoutSession: mockCreateCheckoutSession,
        ANNUAL_SUBSCRIPTION_CONFIG: { mode: 'subscription', priceId: 'price_test' },
      }));

      const { SubscriptionService: FreshService } = await import(
        '../../services/subscription.service'
      );
      const freshService = new FreshService(mockDb);

      mockDb.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: 'sub_stripe_123',
      });

      await expect(freshService.cancelSubscription('user-123')).rejects.toThrow(
        'Stripe is not configured',
      );
    });

    it('should throw error from resumeSubscription when Stripe is null', async () => {
      jest.resetModules();
      jest.doMock('~/utils/stripe', () => ({
        stripe: null,
        createStripeCustomer: mockCreateStripeCustomer,
        createCheckoutSession: mockCreateCheckoutSession,
        ANNUAL_SUBSCRIPTION_CONFIG: { mode: 'subscription', priceId: 'price_test' },
      }));

      const { SubscriptionService: FreshService } = await import(
        '../../services/subscription.service'
      );
      const freshService = new FreshService(mockDb);

      mockDb.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: 'sub_stripe_123',
        cancelAtPeriodEnd: true,
      });

      await expect(freshService.resumeSubscription('user-123')).rejects.toThrow(
        'Stripe is not configured',
      );
    });
  });
});
