/**
 * Stripe Utility Test Suite
 * Tests for Stripe customer creation, checkout sessions, webhooks, and subscription management
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mock types
interface MockStripeCustomer {
  id: string;
  email: string;
  name: string | null;
  metadata: Record<string, string>;
}

interface MockStripeSession {
  id: string;
  url: string;
  customer: string;
  mode: string;
}

interface MockStripeSubscription {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: number;
}

interface MockStripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

// Mock Stripe methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCustomersCreate = jest.fn<(...args: any[]) => Promise<MockStripeCustomer>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCheckoutSessionsCreate = jest.fn<(...args: any[]) => Promise<MockStripeSession>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSubscriptionsRetrieve = jest.fn<(...args: any[]) => Promise<MockStripeSubscription>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSubscriptionsUpdate = jest.fn<(...args: any[]) => Promise<MockStripeSubscription>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWebhooksConstructEvent = jest.fn<(...args: any[]) => MockStripeEvent>();

// Mock Stripe class
const MockStripe = jest.fn().mockImplementation(() => ({
  customers: {
    create: mockCustomersCreate,
  },
  checkout: {
    sessions: {
      create: mockCheckoutSessionsCreate,
    },
  },
  subscriptions: {
    retrieve: mockSubscriptionsRetrieve,
    update: mockSubscriptionsUpdate,
  },
  webhooks: {
    constructEvent: mockWebhooksConstructEvent,
  },
}));

// Mock the stripe module
jest.mock('stripe', () => ({
  __esModule: true,
  default: MockStripe,
}));

// Mock logger
const mockLoggerError = jest.fn();
jest.mock('~/utils/logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}));

describe('Stripe Utilities', () => {
  describe('When Stripe is configured', () => {
    let createStripeCustomer: typeof import('../stripe').createStripeCustomer;
    let createCheckoutSession: typeof import('../stripe').createCheckoutSession;
    let constructWebhookEvent: typeof import('../stripe').constructWebhookEvent;
    let getSubscription: typeof import('../stripe').getSubscription;
    let cancelSubscription: typeof import('../stripe').cancelSubscription;
    let stripe: typeof import('../stripe').stripe;
    let ANNUAL_SUBSCRIPTION_CONFIG: typeof import('../stripe').ANNUAL_SUBSCRIPTION_CONFIG;

    beforeEach(async () => {
      jest.resetModules();

      // Reset all mocks
      mockCustomersCreate.mockReset();
      mockCheckoutSessionsCreate.mockReset();
      mockSubscriptionsRetrieve.mockReset();
      mockSubscriptionsUpdate.mockReset();
      mockWebhooksConstructEvent.mockReset();
      mockLoggerError.mockReset();

      // Mock env with valid Stripe keys
      jest.doMock('~/env.mjs', () => ({
        env: {
          STRIPE_SECRET_KEY: 'sk_test_valid_key',
          STRIPE_ANNUAL_PRICE_ID: 'price_annual_123',
          STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
        },
      }));

      const stripeModule = await import('../stripe');
      createStripeCustomer = stripeModule.createStripeCustomer;
      createCheckoutSession = stripeModule.createCheckoutSession;
      constructWebhookEvent = stripeModule.constructWebhookEvent;
      getSubscription = stripeModule.getSubscription;
      cancelSubscription = stripeModule.cancelSubscription;
      stripe = stripeModule.stripe;
      ANNUAL_SUBSCRIPTION_CONFIG = stripeModule.ANNUAL_SUBSCRIPTION_CONFIG;
    });

    describe('Stripe client initialization', () => {
      it('should create stripe client when STRIPE_SECRET_KEY is provided', () => {
        expect(stripe).not.toBeNull();
      });

      it('should configure with correct API version', () => {
        expect(MockStripe).toHaveBeenCalledWith('sk_test_valid_key', {
          apiVersion: '2025-12-15.clover',
          typescript: true,
        });
      });
    });

    describe('ANNUAL_SUBSCRIPTION_CONFIG', () => {
      it('should have correct mode', () => {
        expect(ANNUAL_SUBSCRIPTION_CONFIG.mode).toBe('subscription');
      });

      it('should have priceId from env', () => {
        expect(ANNUAL_SUBSCRIPTION_CONFIG.priceId).toBe('price_annual_123');
      });

      it('should have yearly recurring interval', () => {
        expect(ANNUAL_SUBSCRIPTION_CONFIG.recurring.interval).toBe('year');
        expect(ANNUAL_SUBSCRIPTION_CONFIG.recurring.interval_count).toBe(1);
      });
    });

    describe('createStripeCustomer', () => {
      it('should create customer with email, name, and userId metadata', async () => {
        const mockCustomer: MockStripeCustomer = {
          id: 'cus_test123',
          email: 'test@example.com',
          name: 'Test User',
          metadata: { userId: 'user_123' },
        };
        mockCustomersCreate.mockResolvedValue(mockCustomer);

        const result = await createStripeCustomer('test@example.com', 'user_123', 'Test User');

        expect(mockCustomersCreate).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: 'Test User',
          metadata: { userId: 'user_123' },
        });
        expect(result).toEqual(mockCustomer);
      });

      it('should create customer with undefined name when name is null', async () => {
        const mockCustomer: MockStripeCustomer = {
          id: 'cus_test123',
          email: 'test@example.com',
          name: null,
          metadata: { userId: 'user_123' },
        };
        mockCustomersCreate.mockResolvedValue(mockCustomer);

        await createStripeCustomer('test@example.com', 'user_123', null);

        expect(mockCustomersCreate).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: undefined,
          metadata: { userId: 'user_123' },
        });
      });

      it('should create customer without name when not provided', async () => {
        const mockCustomer: MockStripeCustomer = {
          id: 'cus_test123',
          email: 'test@example.com',
          name: null,
          metadata: { userId: 'user_123' },
        };
        mockCustomersCreate.mockResolvedValue(mockCustomer);

        await createStripeCustomer('test@example.com', 'user_123');

        expect(mockCustomersCreate).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: undefined,
          metadata: { userId: 'user_123' },
        });
      });

      it('should propagate Stripe API errors', async () => {
        const stripeError = new Error('Stripe API error');
        mockCustomersCreate.mockRejectedValue(stripeError);

        await expect(createStripeCustomer('test@example.com', 'user_123')).rejects.toThrow(
          'Stripe API error',
        );
      });
    });

    describe('createCheckoutSession', () => {
      it('should create checkout session with all required parameters', async () => {
        const mockSession: MockStripeSession = {
          id: 'cs_test123',
          url: 'https://checkout.stripe.com/session_123',
          customer: 'cus_123',
          mode: 'subscription',
        };
        mockCheckoutSessionsCreate.mockResolvedValue(mockSession);

        const result = await createCheckoutSession(
          'cus_123',
          'user_123',
          'price_annual_123',
          'https://example.com/success',
          'https://example.com/cancel',
        );

        expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
          customer: 'cus_123',
          payment_method_types: ['card'],
          billing_address_collection: 'required',
          line_items: [{ price: 'price_annual_123', quantity: 1 }],
          mode: 'subscription',
          allow_promotion_codes: true,
          subscription_data: {
            metadata: { userId: 'user_123' },
          },
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
          metadata: { userId: 'user_123' },
        });
        expect(result).toEqual(mockSession);
      });

      it('should throw error for empty priceId', async () => {
        await expect(
          createCheckoutSession(
            'cus_123',
            'user_123',
            '',
            'https://example.com/success',
            'https://example.com/cancel',
          ),
        ).rejects.toThrow('Invalid Stripe price ID');
      });

      it('should throw error for placeholder priceId', async () => {
        await expect(
          createCheckoutSession(
            'cus_123',
            'user_123',
            'price_...',
            'https://example.com/success',
            'https://example.com/cancel',
          ),
        ).rejects.toThrow('Invalid Stripe price ID');
      });

      it('should propagate Stripe API errors', async () => {
        mockCheckoutSessionsCreate.mockRejectedValue(new Error('Invalid price'));

        await expect(
          createCheckoutSession(
            'cus_123',
            'user_123',
            'price_invalid',
            'https://example.com/success',
            'https://example.com/cancel',
          ),
        ).rejects.toThrow('Invalid price');
      });
    });

    describe('constructWebhookEvent', () => {
      it('should construct event from valid webhook payload', async () => {
        const mockEvent: MockStripeEvent = {
          id: 'evt_test123',
          type: 'customer.subscription.created',
          data: { object: { id: 'sub_123' } },
        };
        mockWebhooksConstructEvent.mockReturnValue(mockEvent);

        const result = await constructWebhookEvent('raw_body', 'sig_123');

        expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
          'raw_body',
          'sig_123',
          'whsec_test_secret',
        );
        expect(result).toEqual(mockEvent);
      });

      it('should accept Buffer as raw body', async () => {
        const mockEvent: MockStripeEvent = {
          id: 'evt_test123',
          type: 'customer.subscription.updated',
          data: { object: { id: 'sub_123' } },
        };
        mockWebhooksConstructEvent.mockReturnValue(mockEvent);
        const bufferBody = Buffer.from('webhook_payload');

        const result = await constructWebhookEvent(bufferBody, 'sig_123');

        expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
          bufferBody,
          'sig_123',
          'whsec_test_secret',
        );
        expect(result).toEqual(mockEvent);
      });

      it('should throw error when signature verification fails', async () => {
        mockWebhooksConstructEvent.mockImplementation(() => {
          throw new Error('Invalid signature');
        });

        await expect(constructWebhookEvent('raw_body', 'invalid_sig')).rejects.toThrow(
          'Webhook signature verification failed',
        );
      });

      it('should log error when signature verification fails', async () => {
        const signatureError = new Error('Invalid signature');
        mockWebhooksConstructEvent.mockImplementation(() => {
          throw signatureError;
        });

        try {
          await constructWebhookEvent('raw_body', 'invalid_sig');
        } catch {
          // Expected to throw
        }

        expect(mockLoggerError).toHaveBeenCalledWith(
          'Webhook signature verification failed',
          expect.objectContaining({
            correlationId: expect.stringMatching(/^webhook-verify-\d+$/),
            error: signatureError,
          }),
        );
      });
    });

    describe('getSubscription', () => {
      it('should retrieve subscription by ID', async () => {
        const mockSubscription: MockStripeSubscription = {
          id: 'sub_test123',
          status: 'active',
          cancel_at_period_end: false,
          current_period_end: Date.now() / 1000 + 86400,
        };
        mockSubscriptionsRetrieve.mockResolvedValue(mockSubscription);

        const result = await getSubscription('sub_test123');

        expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_test123');
        expect(result).toEqual(mockSubscription);
      });

      it('should propagate errors for non-existent subscription', async () => {
        mockSubscriptionsRetrieve.mockRejectedValue(new Error('No such subscription'));

        await expect(getSubscription('sub_invalid')).rejects.toThrow('No such subscription');
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription at period end', async () => {
        const mockCancelledSubscription: MockStripeSubscription = {
          id: 'sub_test123',
          status: 'active',
          cancel_at_period_end: true,
          current_period_end: Date.now() / 1000 + 86400,
        };
        mockSubscriptionsUpdate.mockResolvedValue(mockCancelledSubscription);

        const result = await cancelSubscription('sub_test123');

        expect(mockSubscriptionsUpdate).toHaveBeenCalledWith('sub_test123', {
          cancel_at_period_end: true,
        });
        expect(result.cancel_at_period_end).toBe(true);
      });

      it('should propagate errors for non-existent subscription', async () => {
        mockSubscriptionsUpdate.mockRejectedValue(new Error('No such subscription'));

        await expect(cancelSubscription('sub_invalid')).rejects.toThrow('No such subscription');
      });
    });
  });

  describe('When Stripe is NOT configured', () => {
    let createStripeCustomer: typeof import('../stripe').createStripeCustomer;
    let createCheckoutSession: typeof import('../stripe').createCheckoutSession;
    let constructWebhookEvent: typeof import('../stripe').constructWebhookEvent;
    let getSubscription: typeof import('../stripe').getSubscription;
    let cancelSubscription: typeof import('../stripe').cancelSubscription;
    let stripe: typeof import('../stripe').stripe;

    beforeEach(async () => {
      jest.resetModules();

      // Reset mocks
      mockLoggerError.mockReset();

      // Mock env without Stripe keys
      jest.doMock('~/env.mjs', () => ({
        env: {
          STRIPE_SECRET_KEY: undefined,
          STRIPE_ANNUAL_PRICE_ID: undefined,
          STRIPE_WEBHOOK_SECRET: undefined,
        },
      }));

      const stripeModule = await import('../stripe');
      createStripeCustomer = stripeModule.createStripeCustomer;
      createCheckoutSession = stripeModule.createCheckoutSession;
      constructWebhookEvent = stripeModule.constructWebhookEvent;
      getSubscription = stripeModule.getSubscription;
      cancelSubscription = stripeModule.cancelSubscription;
      stripe = stripeModule.stripe;
    });

    it('should have null stripe client', () => {
      expect(stripe).toBeNull();
    });

    it('should throw error from createStripeCustomer', async () => {
      await expect(createStripeCustomer('test@example.com', 'user_123')).rejects.toThrow(
        'Stripe is not configured',
      );
    });

    it('should throw error from createCheckoutSession', async () => {
      await expect(
        createCheckoutSession(
          'cus_123',
          'user_123',
          'price_123',
          'https://example.com/success',
          'https://example.com/cancel',
        ),
      ).rejects.toThrow('Stripe is not configured');
    });

    it('should throw error from constructWebhookEvent', async () => {
      await expect(constructWebhookEvent('raw_body', 'sig_123')).rejects.toThrow(
        'Stripe is not configured',
      );
    });

    it('should throw error from getSubscription', async () => {
      await expect(getSubscription('sub_123')).rejects.toThrow('Stripe is not configured');
    });

    it('should throw error from cancelSubscription', async () => {
      await expect(cancelSubscription('sub_123')).rejects.toThrow('Stripe is not configured');
    });
  });

  describe('When webhook secret is missing', () => {
    let constructWebhookEvent: typeof import('../stripe').constructWebhookEvent;

    beforeEach(async () => {
      jest.resetModules();
      mockLoggerError.mockReset();

      // Mock env with Stripe key but no webhook secret
      jest.doMock('~/env.mjs', () => ({
        env: {
          STRIPE_SECRET_KEY: 'sk_test_valid_key',
          STRIPE_ANNUAL_PRICE_ID: 'price_annual_123',
          STRIPE_WEBHOOK_SECRET: undefined,
        },
      }));

      const stripeModule = await import('../stripe');
      constructWebhookEvent = stripeModule.constructWebhookEvent;
    });

    it('should throw error when webhook secret is missing', async () => {
      await expect(constructWebhookEvent('raw_body', 'sig_123')).rejects.toThrow(
        'Stripe webhook secret is not configured',
      );
    });
  });

  describe('ANNUAL_SUBSCRIPTION_CONFIG with missing env', () => {
    let ANNUAL_SUBSCRIPTION_CONFIG: typeof import('../stripe').ANNUAL_SUBSCRIPTION_CONFIG;

    beforeEach(async () => {
      jest.resetModules();

      jest.doMock('~/env.mjs', () => ({
        env: {
          STRIPE_SECRET_KEY: 'sk_test_key',
          STRIPE_ANNUAL_PRICE_ID: undefined,
          STRIPE_WEBHOOK_SECRET: 'whsec_test',
        },
      }));

      const stripeModule = await import('../stripe');
      ANNUAL_SUBSCRIPTION_CONFIG = stripeModule.ANNUAL_SUBSCRIPTION_CONFIG;
    });

    it('should default to empty string for missing priceId', () => {
      expect(ANNUAL_SUBSCRIPTION_CONFIG.priceId).toBe('');
    });
  });
});
