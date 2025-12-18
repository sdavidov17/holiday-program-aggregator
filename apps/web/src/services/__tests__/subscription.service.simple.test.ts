/**
 * Subscription Service Test Suite - Simplified
 * Tests for actual subscription service implementation
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../subscription.service';

// Define SubscriptionStatus enum for tests
const SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

import { createTestSubscription, createTestUser } from '../../__tests__/factories';
import { createMockPrismaClient } from '../../__tests__/setup/test-db';

// Mock stripe utils
jest.mock('~/utils/stripe', () => ({
  stripe: {
    subscriptions: {
      update: jest.fn(),
    },
  },
  createStripeCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test123',
    url: 'https://checkout.stripe.com/test',
  }),
  ANNUAL_SUBSCRIPTION_CONFIG: {
    price: 29900,
    interval: 'year',
  },
}));

// Mock environment
jest.mock('~/env.mjs', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_ANNUAL_PRICE_ID: 'price_test_123',
  },
}));

// Mock logger
jest.mock('~/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockPrisma: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    service = new SubscriptionService(mockPrisma as unknown as PrismaClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status for active subscription', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: true,
        status: 'ACTIVE',
        expiresAt: subscription.expiresAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        isActive: true,
        tier: 'PREMIUM',
      });
    });

    it('should return no subscription status when subscription not found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: false,
        status: null,
        expiresAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        isActive: false,
        tier: 'BASIC',
      });
    });
  });

  describe('getSubscription', () => {
    it('should return full subscription details', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'ACTIVE',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      const result = await service.getSubscription('user123');

      expect(result).toEqual(subscription);
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });

    it('should return null when subscription not found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription('user123');

      expect(result).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for new subscription', async () => {
      const user = await createTestUser();
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockPrisma.subscription.upsert.mockResolvedValue(
        createTestSubscription({
          userId: user.id!,
          status: 'PENDING',
        }),
      );

      const { createStripeCustomer, createCheckoutSession } = require('~/utils/stripe');
      createStripeCustomer.mockResolvedValue({ id: 'cus_test123' });
      createCheckoutSession.mockResolvedValue({
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/test',
      });

      const result = await service.createCheckoutSession(
        user.id!,
        user.email!,
        'http://localhost:3000/success',
        'http://localhost:3000/cancel',
      );

      expect(result).toEqual({
        sessionId: 'cs_test123',
        url: 'https://checkout.stripe.com/test',
      });
      expect(createStripeCustomer).toHaveBeenCalledWith(user.email, user.id);
    });

    it('should throw error if user already has active subscription', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'ACTIVE',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(
        service.createCheckoutSession(
          'user123',
          'user@test.com',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel',
        ),
      ).rejects.toThrow('You already have an active subscription');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        status: 'ACTIVE',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      });

      const { stripe } = require('~/utils/stripe');
      stripe.subscriptions.update.mockResolvedValue({
        cancel_at_period_end: true,
      });

      const result = await service.cancelSubscription('user123');

      expect(result.success).toBe(true);
      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: true,
      });
    });

    it('should throw error if no active subscription found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(service.cancelSubscription('user123')).rejects.toThrow(
        'No active subscription found',
      );
    });
  });

  describe('resumeSubscription', () => {
    it('should resume a canceled subscription', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        cancelAtPeriodEnd: true,
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });

      const { stripe } = require('~/utils/stripe');
      stripe.subscriptions.update.mockResolvedValue({
        cancel_at_period_end: false,
      });

      const result = await service.resumeSubscription('user123');

      expect(result.success).toBe(true);
      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: false,
      });
    });

    it('should throw error if subscription not scheduled for cancellation', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        cancelAtPeriodEnd: false,
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(service.resumeSubscription('user123')).rejects.toThrow(
        'Subscription is not scheduled for cancellation',
      );
    });
  });

  describe('handleCheckoutComplete', () => {
    it('should activate subscription after successful checkout', async () => {
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      mockPrisma.subscription.upsert.mockResolvedValue(
        createTestSubscription({
          userId: 'user123',
          stripeSubscriptionId: 'sub_test123',
          status: 'ACTIVE',
          currentPeriodStart,
          currentPeriodEnd,
        }),
      );

      await service.handleCheckoutComplete(
        'user123',
        'sub_test123',
        'price_test123',
        currentPeriodStart,
        currentPeriodEnd,
      );

      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        create: expect.objectContaining({
          userId: 'user123',
          stripeSubscriptionId: 'sub_test123',
          status: SubscriptionStatus.ACTIVE,
        }),
        update: expect.objectContaining({
          stripeSubscriptionId: 'sub_test123',
          status: SubscriptionStatus.ACTIVE,
        }),
      });
    });
  });

  describe('updateSubscriptionFromWebhook', () => {
    it('should update subscription from webhook data', async () => {
      const subscription = createTestSubscription({
        stripeSubscriptionId: 'sub_test123',
      });

      mockPrisma.subscription.findFirst.mockResolvedValue(subscription);
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        status: 'CANCELLED',
      });

      await service.updateSubscriptionFromWebhook('sub_test123', {
        status: SubscriptionStatus.CANCELLED,
      });

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });
    });

    it('should throw error if subscription not found', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);

      await expect(
        service.updateSubscriptionFromWebhook('sub_invalid', {
          status: SubscriptionStatus.ACTIVE,
        }),
      ).rejects.toThrow('Subscription not found');
    });
  });
});
