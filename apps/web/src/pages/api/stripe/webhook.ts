import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { env } from '~/env.mjs';
import { db, SubscriptionStatus } from '~/server/db';
import { logger } from '~/utils/logger';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Missing stripe signature or webhook secret');
  }

  if (!stripe) {
    logger.error('Stripe is not configured', {
      correlationId: (req.headers['x-request-id'] as string) || 'unknown',
    });
    return res.status(500).send('Stripe is not configured on the server');
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      correlationId: (req.headers['x-request-id'] as string) || 'unknown',
      error: err,
    });
    return res
      .status(400)
      .send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.userId) {
          logger.error('No userId in session metadata', {
            correlationId: (req.headers['x-request-id'] as string) || 'unknown',
            sessionId: session.id,
          });
          return res.status(400).send('Missing userId in metadata');
        }

        // Create or update the subscription
        await db.subscription.update({
          where: { userId: session.metadata.userId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            stripePaymentStatus: 'succeeded',
            status: SubscriptionStatus.ACTIVE,
          },
        });

        logger.info('Checkout session completed', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          sessionId: session.id,
          userId: session.metadata?.userId,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!dbSubscription) {
          logger.error('No subscription found', {
            correlationId: (req.headers['x-request-id'] as string) || 'unknown',
            subscriptionId: subscription.id,
          });
          return res.status(404).send('Subscription not found');
        }

        // Update subscription details
        await db.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: mapStripeStatusToDbStatus(subscription.status),
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            expiresAt: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            trialEndsAt: (subscription as any).trial_end
              ? new Date((subscription as any).trial_end * 1000)
              : null,
          },
        });

        logger.info('Subscription updated', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!dbSubscription) {
          logger.error('No subscription found', {
            correlationId: (req.headers['x-request-id'] as string) || 'unknown',
            subscriptionId: subscription.id,
          });
          return res.status(404).send('Subscription not found');
        }

        // Mark subscription as expired
        await db.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: SubscriptionStatus.EXPIRED,
            expiresAt: new Date(),
            canceledAt: new Date(),
          },
        });

        logger.info('Subscription deleted', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          subscriptionId: subscription.id,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        if (!(invoice as any).subscription) {
          break;
        }

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: (invoice as any).subscription as string },
        });

        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              stripePaymentStatus: 'succeeded',
              status: SubscriptionStatus.ACTIVE,
            },
          });
        }

        logger.info('Invoice payment succeeded', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (!(invoice as any).subscription) {
          break;
        }

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: (invoice as any).subscription as string },
        });

        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              stripePaymentStatus: 'failed',
              status: SubscriptionStatus.PAST_DUE,
            },
          });
        }

        logger.warn('Invoice payment failed', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
        });
        break;
      }

      default:
        logger.info('Unhandled webhook event', {
          correlationId: (req.headers['x-request-id'] as string) || 'unknown',
          eventType: event.type,
        });
    }

    return res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook', {
      correlationId: (req.headers['x-request-id'] as string) || 'unknown',
      error,
    });
    return res.status(500).send('Webhook processing error');
  }
}

function mapStripeStatusToDbStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'unpaid':
      return SubscriptionStatus.EXPIRED;
    case 'trialing':
      return SubscriptionStatus.ACTIVE; // Consider trial as active
    default:
      return SubscriptionStatus.PENDING;
  }
}
