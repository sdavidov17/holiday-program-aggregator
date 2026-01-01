import Stripe from 'stripe';
import { env } from '~/env.mjs';
import { logger } from '~/utils/logger';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

export const ANNUAL_SUBSCRIPTION_CONFIG = {
  mode: 'subscription' as const,
  priceId: env.STRIPE_ANNUAL_PRICE_ID ?? '',
  recurring: {
    interval: 'year' as const,
    interval_count: 1,
  },
};

export async function createStripeCustomer(email: string, userId: string, name?: string | null) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      userId,
    },
  });

  return customer;
}

export async function createCheckoutSession(
  customerId: string,
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
  }

  if (!priceId || priceId === 'price_...') {
    throw new Error(
      'Invalid Stripe price ID. Please set STRIPE_ANNUAL_PRICE_ID in your .env file with a valid price ID from your Stripe dashboard.',
    );
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        userId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function constructWebhookEvent(rawBody: string | Buffer, signature: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      'Stripe webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET in your .env file.',
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      correlationId: 'webhook-verify-' + Date.now(),
      error: err,
    });
    throw new Error('Webhook signature verification failed');
  }
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
  }

  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
