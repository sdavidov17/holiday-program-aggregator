/**
 * Unit Tests: Stripe Utilities
 * Tests Stripe customer, checkout, webhook, and subscription operations
 */

// Mock Stripe SDK
const mockCustomersCreate = jest.fn();
const mockCheckoutSessionsCreate = jest.fn();
const mockWebhooksConstructEvent = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();
const mockSubscriptionsUpdate = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: mockCustomersCreate,
    },
    checkout: {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    },
    webhooks: {
      constructEvent: mockWebhooksConstructEvent,
    },
    subscriptions: {
      retrieve: mockSubscriptionsRetrieve,
      update: mockSubscriptionsUpdate,
    },
  }));
});

// Mock environment with Stripe configured
jest.mock('~/env.mjs', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_mock_secret_key',
    STRIPE_ANNUAL_PRICE_ID: 'price_annual_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_mock_webhook_secret',
  },
}));

// Mock logger
jest.mock('~/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Stripe Utilities', () => {
  let stripeUtils: typeof import('../../utils/stripe');

  beforeEach(async () => {
    jest.clearAllMocks();
    // Re-import to get fresh module with mocks
    jest.resetModules();
    stripeUtils = await import('../../utils/stripe');
  });

  describe('stripe instance', () => {
    it('should create Stripe instance when secret key is configured', () => {
      expect(stripeUtils.stripe).toBeDefined();
    });

    it('should export ANNUAL_SUBSCRIPTION_CONFIG', () => {
      expect(stripeUtils.ANNUAL_SUBSCRIPTION_CONFIG).toEqual({
        mode: 'subscription',
        priceId: 'price_annual_mock',
        recurring: {
          interval: 'year',
          interval_count: 1,
        },
      });
    });
  });

  describe('createStripeCustomer', () => {
    it('should create a Stripe customer with email and userId', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      };
      mockCustomersCreate.mockResolvedValue(mockCustomer);

      const result = await stripeUtils.createStripeCustomer('test@example.com', 'user-123');

      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: undefined,
        metadata: { userId: 'user-123' },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should include name when provided', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user-123' },
      };
      mockCustomersCreate.mockResolvedValue(mockCustomer);

      await stripeUtils.createStripeCustomer('test@example.com', 'user-123', 'Test User');

      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user-123' },
      });
    });

    it('should handle null name by passing undefined', async () => {
      mockCustomersCreate.mockResolvedValue({ id: 'cus_test123' });

      await stripeUtils.createStripeCustomer('test@example.com', 'user-123', null);

      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: undefined,
        metadata: { userId: 'user-123' },
      });
    });

    it('should propagate Stripe API errors', async () => {
      mockCustomersCreate.mockRejectedValue(new Error('Invalid email address'));

      await expect(stripeUtils.createStripeCustomer('invalid', 'user-123')).rejects.toThrow(
        'Invalid email address',
      );
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with valid parameters', async () => {
      const mockSession = {
        id: 'cs_test_session123',
        url: 'https://checkout.stripe.com/pay/cs_test_session123',
      };
      mockCheckoutSessionsCreate.mockResolvedValue(mockSession);

      const result = await stripeUtils.createCheckoutSession(
        'cus_test123',
        'user-123',
        'price_annual_mock',
        'https://example.com/success',
        'https://example.com/cancel',
      );

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
        customer: 'cus_test123',
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [{ price: 'price_annual_mock', quantity: 1 }],
        mode: 'subscription',
        allow_promotion_codes: true,
        subscription_data: {
          metadata: { userId: 'user-123' },
        },
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: { userId: 'user-123' },
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw error for invalid price ID (price_...)', async () => {
      await expect(
        stripeUtils.createCheckoutSession(
          'cus_test123',
          'user-123',
          'price_...',
          'https://example.com/success',
          'https://example.com/cancel',
        ),
      ).rejects.toThrow('Invalid Stripe price ID');
    });

    it('should throw error for empty price ID', async () => {
      await expect(
        stripeUtils.createCheckoutSession(
          'cus_test123',
          'user-123',
          '',
          'https://example.com/success',
          'https://example.com/cancel',
        ),
      ).rejects.toThrow('Invalid Stripe price ID');
    });

    it('should propagate Stripe API errors', async () => {
      mockCheckoutSessionsCreate.mockRejectedValue(new Error('Invalid price'));

      await expect(
        stripeUtils.createCheckoutSession(
          'cus_test123',
          'user-123',
          'price_invalid',
          'https://example.com/success',
          'https://example.com/cancel',
        ),
      ).rejects.toThrow('Invalid price');
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct and return a valid webhook event', async () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test123' } },
      };
      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const result = await stripeUtils.constructWebhookEvent(
        '{"id":"evt_test123"}',
        'sig_test_signature',
      );

      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        '{"id":"evt_test123"}',
        'sig_test_signature',
        'whsec_test_mock_webhook_secret',
      );
      expect(result).toEqual(mockEvent);
    });

    it('should handle Buffer raw body', async () => {
      const mockEvent = { id: 'evt_test123', type: 'test' };
      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const bufferBody = Buffer.from('{"id":"evt_test123"}');
      await stripeUtils.constructWebhookEvent(bufferBody, 'sig_test');

      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        bufferBody,
        'sig_test',
        'whsec_test_mock_webhook_secret',
      );
    });

    it('should throw and log error on signature verification failure', async () => {
      const { logger } = await import('~/utils/logger');
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error('Signature verification failed');
      });

      await expect(stripeUtils.constructWebhookEvent('invalid', 'bad_sig')).rejects.toThrow(
        'Webhook signature verification failed',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Webhook signature verification failed',
        expect.objectContaining({
          correlationId: expect.stringContaining('webhook-verify-'),
          error: expect.any(Error),
        }),
      );
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription by ID', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_end: 1234567890,
      };
      mockSubscriptionsRetrieve.mockResolvedValue(mockSubscription);

      const result = await stripeUtils.getSubscription('sub_test123');

      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_test123');
      expect(result).toEqual(mockSubscription);
    });

    it('should propagate Stripe errors for invalid subscription ID', async () => {
      mockSubscriptionsRetrieve.mockRejectedValue(new Error('No such subscription'));

      await expect(stripeUtils.getSubscription('sub_invalid')).rejects.toThrow(
        'No such subscription',
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        cancel_at_period_end: true,
      };
      mockSubscriptionsUpdate.mockResolvedValue(mockSubscription);

      const result = await stripeUtils.cancelSubscription('sub_test123');

      expect(mockSubscriptionsUpdate).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: true,
      });
      expect(result).toEqual(mockSubscription);
    });

    it('should propagate Stripe errors', async () => {
      mockSubscriptionsUpdate.mockRejectedValue(new Error('Subscription already canceled'));

      await expect(stripeUtils.cancelSubscription('sub_canceled')).rejects.toThrow(
        'Subscription already canceled',
      );
    });
  });
});

describe('Stripe Utilities - No Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should set stripe to null when STRIPE_SECRET_KEY is missing', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: '',
        STRIPE_ANNUAL_PRICE_ID: 'price_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');
    expect(stripeUtils.stripe).toBeNull();
  });

  it('should throw error from createStripeCustomer when Stripe not configured', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: '',
        STRIPE_ANNUAL_PRICE_ID: '',
        STRIPE_WEBHOOK_SECRET: '',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');

    await expect(stripeUtils.createStripeCustomer('test@example.com', 'user-123')).rejects.toThrow(
      'Stripe is not configured',
    );
  });

  it('should throw error from createCheckoutSession when Stripe not configured', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: '',
        STRIPE_ANNUAL_PRICE_ID: '',
        STRIPE_WEBHOOK_SECRET: '',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');

    await expect(
      stripeUtils.createCheckoutSession(
        'cus_test',
        'user-123',
        'price_test',
        'http://success',
        'http://cancel',
      ),
    ).rejects.toThrow('Stripe is not configured');
  });

  it('should throw error from constructWebhookEvent when webhook secret missing', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: 'sk_test_key',
        STRIPE_ANNUAL_PRICE_ID: 'price_test',
        STRIPE_WEBHOOK_SECRET: '',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');

    await expect(stripeUtils.constructWebhookEvent('body', 'sig')).rejects.toThrow(
      'Stripe webhook secret is not configured',
    );
  });

  it('should throw error from getSubscription when Stripe not configured', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: '',
        STRIPE_ANNUAL_PRICE_ID: '',
        STRIPE_WEBHOOK_SECRET: '',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');

    await expect(stripeUtils.getSubscription('sub_test')).rejects.toThrow(
      'Stripe is not configured',
    );
  });

  it('should throw error from cancelSubscription when Stripe not configured', async () => {
    jest.doMock('~/env.mjs', () => ({
      env: {
        STRIPE_SECRET_KEY: '',
        STRIPE_ANNUAL_PRICE_ID: '',
        STRIPE_WEBHOOK_SECRET: '',
      },
    }));

    const stripeUtils = await import('../../utils/stripe');

    await expect(stripeUtils.cancelSubscription('sub_test')).rejects.toThrow(
      'Stripe is not configured',
    );
  });
});
