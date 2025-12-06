import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { SubscriptionService } from '~/services/subscription.service';

export const subscriptionRouter = createTRPCRouter({
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const service = new SubscriptionService(ctx.db);
    return await service.getSubscriptionStatus(ctx.session.user.id);
  }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const service = new SubscriptionService(ctx.db);
    const subscription = await service.getSubscription(ctx.session.user.id);

    if (!subscription) {
      return null;
    }

    return {
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx }) => {
      const service = new SubscriptionService(ctx.db);
      const { user } = ctx.session;
      const { req } = ctx;

      // Build URLs for redirect
      const host = req?.headers?.host ?? 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/subscription/cancelled`;

      return await service.createCheckoutSession(user.id, user.email!, successUrl, cancelUrl);
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const service = new SubscriptionService(ctx.db);
    return await service.cancelSubscription(ctx.session.user.id);
  }),

  resumeSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const service = new SubscriptionService(ctx.db);
    return await service.resumeSubscription(ctx.session.user.id);
  }),
});
