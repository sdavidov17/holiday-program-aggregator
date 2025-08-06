import { TRPCError } from "@trpc/server";
import { SubscriptionStatus } from "@prisma/client";
import { type Context } from "../trpc";

export const requireActiveSubscriptionMiddleware = async ({ 
  ctx, 
  next 
}: {
  ctx: Context;
  next: (opts?: { ctx: Context }) => Promise<any>;
}) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const subscription = await ctx.db.subscription.findUnique({
    where: { userId: ctx.session.user.id },
    select: { 
      id: true,
      status: true, 
      expiresAt: true,
      currentPeriodEnd: true,
    }
  });

  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Active subscription required'
    });
  }

  // Check if subscription has expired
  if (subscription.expiresAt && subscription.expiresAt < new Date()) {
    // Update status to expired
    await ctx.db.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.EXPIRED }
    });
    
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Subscription has expired'
    });
  }

  return next({
    ctx,
  });
};