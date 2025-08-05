import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import {
  createStripeCustomer,
  createCheckoutSession,
  ANNUAL_SUBSCRIPTION_CONFIG,
} from "~/utils/stripe";
import { SubscriptionStatus } from "@prisma/client";

export const subscriptionRouter = createTRPCRouter({
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        status: "none" as const,
      };
    }

    return {
      hasSubscription: true,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      expiresAt: subscription.expiresAt,
    };
  }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        status: true,
        expiresAt: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      }
    });

    return subscription;
  }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      const { req, res } = ctx;

      if (!env.STRIPE_SECRET_KEY || !env.STRIPE_ANNUAL_PRICE_ID) {
        throw new Error("Stripe configuration is missing");
      }

      // Check if user already has a subscription
      const existingSubscription = await ctx.db.subscription.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (existingSubscription?.status === SubscriptionStatus.ACTIVE) {
        throw new Error("You already have an active subscription");
      }

      // Get or create Stripe customer
      let stripeCustomerId = existingSubscription?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await createStripeCustomer(
          user.email!,
          user.id,
          user.name
        );
        stripeCustomerId = customer.id;

        // Create or update subscription record
        await ctx.db.subscription.upsert({
          where: {
            userId: user.id,
          },
          create: {
            userId: user.id,
            stripeCustomerId,
            stripePriceId: input.priceId ?? env.STRIPE_ANNUAL_PRICE_ID,
            status: SubscriptionStatus.PENDING,
          },
          update: {
            stripeCustomerId,
            stripePriceId: input.priceId ?? env.STRIPE_ANNUAL_PRICE_ID,
          },
        });
      }

      // Create checkout session
      const host = req?.headers?.host ?? "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;

      const session = await createCheckoutSession(
        stripeCustomerId,
        user.id,
        input.priceId ?? env.STRIPE_ANNUAL_PRICE_ID,
        `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/subscription/cancelled`
      );

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("No active subscription found");
    }

    if (!subscription.stripeSubscriptionId) {
      throw new Error("Invalid subscription state");
    }

    // Import stripe utils dynamically to avoid circular dependency
    const { cancelSubscription } = await import("~/utils/stripe");
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update database
    await ctx.db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }),
});