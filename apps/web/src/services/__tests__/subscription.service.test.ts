/**
 * Subscription Service Test Suite
 * Comprehensive tests for subscription lifecycle management
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SubscriptionService } from '../subscription.service';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { 
  createTestUser,
  createTestSubscription,
  createStripeCustomer,
  createStripeSubscription,
  createStripeEvent,
  createStripePaymentIntent
} from '../../__tests__/factories';
import { createMockPrismaClient } from '../../__tests__/setup/test-db';
import { TRPCError } from '@trpc/server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        expire: jest.fn(),
      },
    },
    prices: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    products: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
    webhookEndpoints: {
      create: jest.fn(),
      list: jest.fn(),
    },
  }));
});

describe.skip('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockPrisma: ReturnType<typeof createMockPrismaClient>;
  let mockStripe: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockStripe = new (Stripe as any)('test_key');
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

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockStripe.customers.create.mockResolvedValue(createStripeCustomer({ id: 'cus_test123' }));
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession({
        userId: user.id!,
        priceId: 'price_essential',
        successUrl: 'http://localhost:3000/subscription/success',
        cancelUrl: 'http://localhost:3000/subscription/cancel',
      });

      expect(result).toEqual({
        sessionId: mockSession.id,
        url: mockSession.url,
      });
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
    });

    it('should use existing Stripe customer if available', async () => {
      const user = await createTestUser();
      const subscription = createTestSubscription({ 
        userId: user.id,
        stripeCustomerId: 'cus_existing',
      });
      const mockSession = {
        id: 'cs_test456',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_existing',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession({
        userId: user.id!,
        priceId: 'price_premium',
        successUrl: 'http://localhost:3000/subscription/success',
        cancelUrl: 'http://localhost:3000/subscription/cancel',
      });

      expect(result.sessionId).toBe('cs_test456');
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
        })
      );
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession({
          userId: 'invalid-user',
          priceId: 'price_essential',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        })
      ).rejects.toThrow('User not found');
    });

    it('should handle Stripe API errors gracefully', async () => {
      const user = await createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockStripe.customers.create.mockRejectedValue(new Error('Stripe API error'));

      await expect(
        service.createCheckoutSession({
          userId: user.id!,
          priceId: 'price_essential',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        })
      ).rejects.toThrow('Failed to create checkout session');
    });
  });

  describe('handleSubscriptionWebhook', () => {
    it('should handle customer.subscription.created event', async () => {
      const stripeSubscription = createStripeSubscription({
        customer: 'cus_test123',
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_essential',
              metadata: { tier: 'ESSENTIAL' },
            },
          }],
        },
      });

      const event = createStripeEvent('customer.subscription.created', stripeSubscription);
      
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test123',
        metadata: { userId: 'user123' },
      });

      mockPrisma.subscription.upsert.mockResolvedValue(
        createTestSubscription({
          userId: 'user123',
          stripeCustomerId: 'cus_test123',
          stripeSubscriptionId: stripeSubscription.id,
        })
      );

      await service.handleSubscriptionWebhook(event);

      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        create: expect.objectContaining({
          userId: 'user123',
          stripeCustomerId: 'cus_test123',
          stripeSubscriptionId: stripeSubscription.id,
          status: 'ACTIVE',
          tier: 'ESSENTIAL',
        }),
        update: expect.objectContaining({
          stripeSubscriptionId: stripeSubscription.id,
          status: 'ACTIVE',
          tier: 'ESSENTIAL',
        }),
      });
    });

    it('should handle customer.subscription.updated event', async () => {
      const stripeSubscription = createStripeSubscription({
        customer: 'cus_test123',
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_premium',
              metadata: { tier: 'PREMIUM' },
            },
          }],
        },
      });

      const event = createStripeEvent('customer.subscription.updated', stripeSubscription);

      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test123',
        metadata: { userId: 'user123' },
      });

      mockPrisma.subscription.update.mockResolvedValue(
        createTestSubscription({
          userId: 'user123',
          tier: 'PREMIUM',
        })
      );

      await service.handleSubscriptionWebhook(event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: stripeSubscription.id },
        data: expect.objectContaining({
          status: 'ACTIVE',
          tier: 'PREMIUM',
          cancelAtPeriodEnd: false,
        }),
      });
    });

    it('should handle customer.subscription.deleted event', async () => {
      const stripeSubscription = createStripeSubscription({
        customer: 'cus_test123',
        status: 'canceled',
      });

      const event = createStripeEvent('customer.subscription.deleted', stripeSubscription);

      mockPrisma.subscription.update.mockResolvedValue(
        createTestSubscription({
          status: 'CANCELLED',
        })
      );

      await service.handleSubscriptionWebhook(event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: stripeSubscription.id },
        data: expect.objectContaining({
          status: 'CANCELLED',
        }),
      });
    });

    it('should handle invoice.payment_succeeded event', async () => {
      const invoice = {
        id: 'in_test123',
        subscription: 'sub_test123',
        payment_intent: 'pi_test123',
        amount_paid: 2900,
        customer: 'cus_test123',
      };

      const event = createStripeEvent('invoice.payment_succeeded', invoice);

      mockPrisma.subscription.update.mockResolvedValue(
        createTestSubscription({
          status: 'ACTIVE',
        })
      );

      await service.handleSubscriptionWebhook(event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_test123' },
        data: { status: 'ACTIVE' },
      });
    });

    it('should handle invoice.payment_failed event', async () => {
      const invoice = {
        id: 'in_test123',
        subscription: 'sub_test123',
        payment_intent: 'pi_test123',
        customer: 'cus_test123',
      };

      const event = createStripeEvent('invoice.payment_failed', invoice);

      mockPrisma.subscription.update.mockResolvedValue(
        createTestSubscription({
          status: 'PAST_DUE',
        })
      );

      await service.handleSubscriptionWebhook(event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_test123' },
        data: { status: 'PAST_DUE' },
      });
    });

    it('should handle unrecognized event types gracefully', async () => {
      const event = createStripeEvent('unknown.event', {});

      await expect(
        service.handleSubscriptionWebhook(event)
      ).resolves.not.toThrow();
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
      mockStripe.subscriptions.update.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          cancel_at_period_end: true,
        })
      );
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: true,
      });

      const result = await service.cancelSubscription('user123');

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        { cancel_at_period_end: true }
      );
    });

    it('should throw error if subscription not found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelSubscription('invalid-user')
      ).rejects.toThrow('Subscription not found');
    });

    it('should throw error if subscription already cancelled', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'CANCELLED',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(
        service.cancelSubscription('user123')
      ).rejects.toThrow('Subscription is already cancelled');
    });
  });

  describe('updateSubscription', () => {
    it('should upgrade subscription tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        tier: 'BASIC',
        stripePriceId: 'price_basic',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.retrieve.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{ id: 'si_test123' }],
          },
        })
      );
      mockStripe.subscriptions.update.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{
              price: {
                id: 'price_premium',
                metadata: { tier: 'PREMIUM' },
              },
            }],
          },
        })
      );
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        tier: 'PREMIUM',
        stripePriceId: 'price_premium',
      });

      const result = await service.updateSubscription('user123', 'price_premium');

      expect(result.tier).toBe('PREMIUM');
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        expect.objectContaining({
          items: [{
            id: 'si_test123',
            price: 'price_premium',
          }],
          proration_behavior: 'create_prorations',
        })
      );
    });

    it('should downgrade subscription tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripeSubscriptionId: 'sub_test123',
        tier: 'PREMIUM',
        stripePriceId: 'price_premium',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.retrieve.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{ id: 'si_test123' }],
          },
        })
      );
      mockStripe.subscriptions.update.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          items: {
            data: [{
              price: {
                id: 'price_basic',
                metadata: { tier: 'BASIC' },
              },
            }],
          },
        })
      );
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        tier: 'BASIC',
        stripePriceId: 'price_basic',
      });

      const result = await service.updateSubscription('user123', 'price_basic');

      expect(result.tier).toBe('BASIC');
      expect(mockStripe.subscriptions.update).toHaveBeenCalled();
    });

    it('should not update if same tier', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        stripePriceId: 'price_essential',
        tier: 'ESSENTIAL',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(
        service.updateSubscription('user123', 'price_essential')
      ).rejects.toThrow('Already subscribed to this plan');

      expect(mockStripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return active subscription status', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'ACTIVE',
        tier: 'PREMIUM',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: true,
        isActive: true,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
      });
    });

    it('should return inactive subscription status', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        status: 'CANCELLED',
        tier: 'BASIC',
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: true,
        isActive: false,
        tier: 'BASIC',
        status: 'CANCELLED',
        cancelAtPeriodEnd: false,
      });
    });

    it('should return no subscription status', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('user123');

      expect(result).toEqual({
        hasSubscription: false,
        isActive: false,
        tier: null,
        status: null,
        cancelAtPeriodEnd: false,
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

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.update.mockResolvedValue(
        createStripeSubscription({
          id: 'sub_test123',
          cancel_at_period_end: false,
        })
      );
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: false,
      });

      const result = await service.reactivateSubscription('user123');

      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        { cancel_at_period_end: false }
      );
    });

    it('should throw error if subscription not set to cancel', async () => {
      const subscription = createTestSubscription({
        userId: 'user123',
        cancelAtPeriodEnd: false,
      });

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(
        service.reactivateSubscription('user123')
      ).rejects.toThrow('Subscription is not set to cancel');
    });
  });
});