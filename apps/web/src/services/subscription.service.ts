import { type Prisma, type PrismaClient, SubscriptionStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  createStripeCustomer,
  createCheckoutSession,
  ANNUAL_SUBSCRIPTION_CONFIG,
  stripe,
} from "~/utils/stripe";
import { logger } from "~/utils/logger";
import { env } from "~/env.mjs";
import { isSubscriptionActive } from "~/utils/subscription";

export class SubscriptionService {
  constructor(private db: PrismaClient) {}

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await this.db.subscription.findUnique({
      where: { userId },
    });

    return {
      hasSubscription: !!subscription,
      status: subscription?.status ?? null,
      expiresAt: subscription?.expiresAt ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    };
  }

  /**
   * Get full subscription details for a user
   */
  async getSubscription(userId: string) {
    return await this.db.subscription.findUnique({
      where: { userId },
    });
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    successUrl: string,
    cancelUrl: string
  ) {
    logger.info("Creating checkout session", {
      correlationId: 'checkout-' + Date.now(),
      userId,
      email,
      stripeConfig: {
        hasSecretKey: !!env.STRIPE_SECRET_KEY,
        hasPriceId: !!env.STRIPE_ANNUAL_PRICE_ID,
        priceId: env.STRIPE_ANNUAL_PRICE_ID,
      },
    });

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_ANNUAL_PRICE_ID) {
      throw new Error(
        "Stripe configuration is missing. Please set STRIPE_SECRET_KEY and STRIPE_ANNUAL_PRICE_ID in your .env file. " +
        `Current config: STRIPE_SECRET_KEY=${env.STRIPE_SECRET_KEY ? 'set' : 'missing'}, ` +
        `STRIPE_ANNUAL_PRICE_ID=${env.STRIPE_ANNUAL_PRICE_ID || 'missing'}`
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getSubscription(userId);
    if (isSubscriptionActive(existingSubscription)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You already have an active subscription",
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId = existingSubscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(email, userId);
      stripeCustomerId = customer.id;
      
      // Store customer ID if we have a subscription record
      if (existingSubscription) {
        await this.db.subscription.update({
          where: { id: existingSubscription.id },
          data: { stripeCustomerId },
        });
      }
    }

    // Create checkout session
    const session = await createCheckoutSession(
      stripeCustomerId,
      userId,
      env.STRIPE_ANNUAL_PRICE_ID,
      successUrl,
      cancelUrl
    );

    // Create or update subscription record with pending status
    await this.db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId,
        status: SubscriptionStatus.PENDING,
        stripePriceId: env.STRIPE_ANNUAL_PRICE_ID,
      },
      update: {
        stripeCustomerId,
        status: SubscriptionStatus.PENDING,
        stripePriceId: env.STRIPE_ANNUAL_PRICE_ID,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured",
      });
    }

    // Cancel at period end in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update database
    await this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    logger.info("Subscription canceled", {
      correlationId: 'cancel-' + Date.now(),
      userId,
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    });

    return {
      success: true,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  /**
   * Resume a canceled subscription
   */
  async resumeSubscription(userId: string) {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subscription found",
      });
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription is not scheduled for cancellation",
      });
    }

    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured",
      });
    }

    // Resume subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update database
    await this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    logger.info("Subscription resumed", {
      correlationId: 'resume-' + Date.now(),
      userId,
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    });

    return {
      success: true,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    };
  }

  /**
   * Handle successful subscription checkout
   */
  async handleCheckoutComplete(
    userId: string,
    stripeSubscriptionId: string,
    stripePriceId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  ) {
    await this.db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId,
        stripePriceId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        expiresAt: currentPeriodEnd,
      },
      update: {
        stripeSubscriptionId,
        stripePriceId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        expiresAt: currentPeriodEnd,
      },
    });

    logger.info("Checkout completed and subscription activated", {
      correlationId: 'checkout-complete-' + Date.now(),
      userId,
      stripeSubscriptionId,
    });
  }

  /**
   * Update subscription status from Stripe webhook
   */
  async updateSubscriptionFromWebhook(
    stripeSubscriptionId: string,
    updates: Partial<Prisma.SubscriptionUpdateInput>
  ) {
    const subscription = await this.db.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      logger.error("Subscription not found for webhook update", {
        correlationId: 'webhook-error-' + Date.now(),
        stripeSubscriptionId,
      });
      throw new Error("Subscription not found");
    }

    await this.db.subscription.update({
      where: { id: subscription.id },
      data: updates,
    });

    logger.info("Subscription updated from webhook", {
      correlationId: 'webhook-update-' + Date.now(),
      subscriptionId: subscription.id,
      stripeSubscriptionId,
      updates,
    });
  }
}