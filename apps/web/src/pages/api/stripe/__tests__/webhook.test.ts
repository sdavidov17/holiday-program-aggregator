import { createMocks } from 'node-mocks-http';
import { db } from '~/server/db';
import { SubscriptionStatus } from '~/server/db';

// Mock dependencies before imports
jest.mock('micro', () => ({
  buffer: jest.fn().mockResolvedValue(Buffer.from('test-body')),
}));

const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

jest.mock('~/server/db', () => ({
  db: {
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
  SubscriptionStatus: {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    PAST_DUE: 'PAST_DUE',
    CANCELED: 'CANCELED',
    EXPIRED: 'EXPIRED',
  },
}));

jest.mock('~/env.mjs', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_xxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_xxx',
  },
}));

// Import handler after mocks are set up
import handler from '../webhook';

describe('/api/stripe/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toEqual({ allow: 'POST' });
  });

  it('should reject requests without stripe signature', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toBe('Missing stripe signature or webhook secret');
  });

  describe('checkout.session.completed', () => {
    it('should update subscription when checkout completes', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { userId: 'user123' },
            subscription: 'sub_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        data: {
          stripeSubscriptionId: 'sub_test_123',
          stripePaymentStatus: 'succeeded',
          status: SubscriptionStatus.ACTIVE,
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ received: true });
    });

    it('should reject when userId is missing from metadata', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {},
            subscription: 'sub_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toBe('Missing userId in metadata');
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription details', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            current_period_start: 1704067200, // 2024-01-01
            current_period_end: 1735689600,   // 2025-01-01
            cancel_at_period_end: false,
            trial_end: null,
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(1704067200 * 1000),
          currentPeriodEnd: new Date(1735689600 * 1000),
          expiresAt: new Date(1735689600 * 1000),
          cancelAtPeriodEnd: false,
          trialEndsAt: null,
        },
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle past_due status', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'past_due',
            current_period_start: 1704067200,
            current_period_end: 1735689600,
            cancel_at_period_end: false,
            trial_end: null,
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: expect.objectContaining({
          status: SubscriptionStatus.PAST_DUE,
        }),
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should mark subscription as expired', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: {
          status: SubscriptionStatus.EXPIRED,
          expiresAt: expect.any(Date),
          canceledAt: expect.any(Date),
        },
      });
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('invoice.payment_succeeded', () => {
    it('should activate subscription on payment success', async () => {
      const event = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: {
          stripePaymentStatus: 'succeeded',
          status: SubscriptionStatus.ACTIVE,
        },
      });
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('invoice.payment_failed', () => {
    it('should mark subscription as past due on payment failure', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(event as any);
      (db.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });
      (db.subscription.update as jest.Mock).mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature',
        },
        body: Buffer.from('test-body'),
      });

      await handler(req, res);

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: {
          stripePaymentStatus: 'failed',
          status: SubscriptionStatus.PAST_DUE,
        },
      });
      expect(res._getStatusCode()).toBe(200);
    });
  });

  it('should handle unhandled event types', async () => {
    const event = {
      type: 'some.unknown.event',
      data: {
        object: {},
      },
    };

    mockConstructEvent.mockReturnValue(event as any);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature',
      },
      body: Buffer.from('test-body'),
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ received: true });
  });

  it('should handle webhook signature verification failure', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid-signature',
      },
      body: Buffer.from('test-body'),
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toBe('Webhook Error: Invalid signature');
  });

  it('should handle processing errors gracefully', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { userId: 'user123' },
          subscription: 'sub_test_123',
        },
      },
    };

    mockConstructEvent.mockReturnValue(event as any);
    (db.subscription.update as jest.Mock).mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature',
      },
      body: Buffer.from('test-body'),
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toBe('Webhook processing error');
  });
});