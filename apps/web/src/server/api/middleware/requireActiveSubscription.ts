import { TRPCError } from '@trpc/server';
import { SubscriptionStatus } from '~/server/db';
import { logger } from '~/utils/logger';
import { isSubscriptionActive } from '~/utils/subscription';
import type { Context } from '../trpc';

export const requireActiveSubscriptionMiddleware = async ({
  ctx,
  next,
}: {
  ctx: Context;
  next: (opts?: { ctx: Context }) => Promise<unknown>;
}) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const subscription = await ctx.db.subscription.findUnique({
    where: { userId: ctx.session.user.id },
  });

  if (!isSubscriptionActive(subscription)) {
    logger.warn('Access denied - no active subscription', {
      correlationId: ctx.correlationId,
      userId: ctx.session.user.id,
      subscriptionStatus: subscription?.status,
    });

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Active subscription required',
    });
  }

  // Check if subscription has expired and needs status update
  if (
    subscription?.expiresAt &&
    subscription.expiresAt < new Date() &&
    subscription.status === SubscriptionStatus.ACTIVE
  ) {
    // Update status to expired
    await ctx.db.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.EXPIRED },
    });

    logger.info('Subscription expired and status updated', {
      correlationId: ctx.correlationId,
      subscriptionId: subscription.id,
      userId: ctx.session.user.id,
    });

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Subscription has expired',
    });
  }

  return next({
    ctx,
  });
};
