/**
 * Subscription Service Test Suite
 * Comprehensive tests for subscription lifecycle management
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import {
  createStripeCustomer as createStripeCustomerFactory,
  createStripeSubscription,
  createTestSubscription,
  createTestUser,
} from '../../__tests__/factories';
import { createMockPrismaClient } from '../../__tests__/setup/test-db';
import { SubscriptionService } from '../subscription.service';

// Mock ~/utils/stripe
jest.mock('~/utils/stripe', () => ({
  stripe: {
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    customers: {
      create: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  createStripeCustomer: jest.fn(),
  createCheckoutSession: jest.fn(),
}));

// Import mocked modules
import { stripe, createStripeCustomer, createCheckoutSession } from '~/utils/stripe';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockPrisma: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    service = new SubscriptionService(mockPrisma as PrismaClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session for new customer', async () => {
      const user = await createTestUser();
      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_test123',
        mode: 'subscription',
        success_url: 'http://localhost:3000/subscription/success',
        cancel_url: 'http://localhost:3000/subscription/cancel',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock helper exports
      (createStripeCustomer as jest.Mock).mockResolvedValue({ id: 'cus_test123' });
      (createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession(
        user.id!,
        'user@example.com',
        'http://localhost:3000/subscription/success',
        'http://localhost:3000/subscription/cancel',
      );

      expect(result).toEqual({
        sessionId: mockSession.id,
        url: mockSession.url,
      });
      expect(createStripeCustomer).toHaveBeenCalledWith(
        'user@example.com',
        user.id
      );
    });

    it('should use existing Stripe customer if available', async () => {
      const user = await createTestUser();
      const subscription = createTestSubscription({
        userId: user.id,
        stripeCustomerId: 'cus_existing',
        status: 'CANCELLED',
        expiresAt: new Date(),
      } as any);
      const mockSession = {
        id: 'cs_test456',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_existing',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);
      (createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession(
        user.id!,
        'user@example.com',
        'http://localhost:3000/subscription/success',
        'http://localhost:3000/subscription/cancel',
      );

      expect(result.sessionId).toBe('cs_test456');
      expect(createStripeCustomer).not.toHaveBeenCalled();
      expect(createCheckoutSession).toHaveBeenCalledWith(
        'cus_existing',
        user.id!,
        expect.any(String), // PRICE_ID
        'http://localhost:3000/subscription/success',
        'http://localhost:3000/subscription/cancel',
      );
    });

    it('should throw error if user already has active subscription', async () => {
      const user = await createTestUser();
      const subscription = createTestSubscription({
        userId: user.id,
        status: 'ACTIVE',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      await expect(
        service.createCheckoutSession(
          user.id!,
          'user@example.com',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel',
        ),
      ).rejects.toThrow('You already have an active subscription');
    });

    it('should handle Stripe API errors gracefully', async () => {
      const user = await createTestUser();
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);
      (createStripeCustomer as jest.Mock).mockRejectedValue(new Error('Stripe API error'));

      await expect(
        service.createCheckoutSession(
          user.id!,
          'user@example.com',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel',
        ),
      ).rejects.toThrow('Stripe API error');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        status: 'ACTIVE',
      });

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      // Mock stripe.subscriptions.update
      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          cancel_at_period_end: true,
        }),
      );

      (mockPrisma.subscription.update as jest.Mock).mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: true,
      });

      const result = await service.cancelSubscription('user123');

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: true,
      });
    });

    it('should throw error if subscription not found', async () => {
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.cancelSubscription('invalid-user')).rejects.toThrow(
        'No active subscription found',
      );
    });
  });

  describe('updateSubscription', () => {
    it('should upgrade subscription tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        tier: 'BASIC',
        stripePriceId: 'price_basic',
      } as any);

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{ id: 'si_test123' }],
          },
        }),
      );

      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [
              {
                price: {
                  id: 'price_premium',
                  metadata: { tier: 'PREMIUM' },
                },
              },
            ],
          },
        }),
      );

      (mockPrisma.subscription.update as jest.Mock).mockResolvedValue({
        ...subscription,
        tier: 'PREMIUM',
        stripePriceId: 'price_premium',
      } as any);

      const result = await service.updateSubscription('user123', 'price_premium');

      expect(result.tier).toBe('PREMIUM');
      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        expect.objectContaining({
          items: [
            {
              id: 'si_test123',
              price: 'price_premium',
            },
          ],
          proration_behavior: 'create_prorations',
        }),
      );
    });

    it('should downgrade subscription tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        tier: 'PREMIUM',
        stripePriceId: 'price_premium',
      } as any);

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{ id: 'si_test123' }],
          },
        }),
      );

      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [
              {
                price: {
                  id: 'price_basic',
                  metadata: { tier: 'BASIC' },
                },
              },
            ],
          },
        }),
      );

      (mockPrisma.subscription.update as jest.Mock).mockResolvedValue({
        ...subscription,
        tier: 'BASIC',
        stripePriceId: 'price_basic',
      } as any);

      const result = await service.updateSubscription('user123', 'price_basic');

      expect(result.tier).toBe('BASIC');
      expect(stripe.subscriptions.update).toHaveBeenCalled();
    });

    it('should not update if same tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripePriceId: 'price_essential',
        tier: 'ESSENTIAL',
      } as any);

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      await expect(service.updateSubscription('user123', 'price_essential')).rejects.toThrow(
        'Already subscribed to this plan',
      );

      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return active subscription status', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'ACTIVE',
        tier: 'PREMIUM',
        stripePriceId: 'price_premium',
        expiresAt: new Date(),
        currentPeriodEnd: new Date(),
      } as any);

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: true,
        isActive: true,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        expiresAt: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        stripeSubscriptionId: expect.any(String),
      });
    });

    it('should return inactive subscription status', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'CANCELLED',
        tier: 'BASIC',
        expiresAt: new Date(),
        currentPeriodEnd: new Date(),
      } as any);

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: true,
        isActive: false,
        tier: 'BASIC',
        status: 'CANCELLED',
        cancelAtPeriodEnd: false,
        expiresAt: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        stripeSubscriptionId: expect.any(String),
      });
    });

    it('should return no subscription status', async () => {
      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: false,
        isActive: false,
        tier: 'BASIC',
        status: null,
        cancelAtPeriodEnd: false,
        expiresAt: null,
        currentPeriodEnd: null,
        stripeSubscriptionId: null,
      });
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate cancelled subscription', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
      });

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          cancel_at_period_end: false,
        }),
      );

      (mockPrisma.subscription.update as jest.Mock).mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: false,
      } as any);

      const result = await service.reactivateSubscription('user123');

      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: false,
      });
    });

    it('should throw error if subscription not set to cancel', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        cancelAtPeriodEnd: false,
      });

      (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(subscription);

      await expect(service.reactivateSubscription('user123')).rejects.toThrow(
        'Subscription is not scheduled for cancellation',
      );
    });
  });
});
