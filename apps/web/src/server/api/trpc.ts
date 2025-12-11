import { randomBytes } from 'node:crypto';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import type { Session } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { type LogContext, logger } from '~/utils/logger';
import { type RequestContext, withRequestContext } from '~/utils/requestContext';

type CreateContextOptions = {
  session: Session | null;
  correlationId: string;
  requestPath?: string;
  req?: CreateNextContextOptions['req'];
  res?: CreateNextContextOptions['res'];
};

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
    correlationId: opts.correlationId,
    requestPath: opts.requestPath,
    req: opts.req,
    res: opts.res,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  // Get correlation ID from headers (set by middleware) or generate secure one
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    `${Date.now()}-${randomBytes(6).toString('hex')}`;

  // Get request path for logging
  const requestPath = req.url;

  return createInnerTRPCContext({
    session,
    correlationId,
    requestPath,
    req,
    res,
  });
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Logging middleware
const loggingMiddleware = t.middleware(async ({ path, next, ctx }) => {
  const logContext: LogContext = {
    correlationId: ctx.correlationId,
    userId: ctx.session?.user?.id,
    sessionId: ctx.session?.user?.email || undefined, // Using email as session identifier for now
  };

  const requestContext: RequestContext = {
    ...logContext,
    journey: path,
    startTime: Date.now(),
  };

  // Log the incoming request
  logger.info(`tRPC request started: ${path}`, logContext, {
    path,
    hasSession: !!ctx.session,
  });

  try {
    // Run the procedure with request context
    const result = await withRequestContext(requestContext, () => next({ ctx }));

    // Log successful completion
    const duration = Date.now() - requestContext.startTime;
    logger.info(`tRPC request completed: ${path}`, logContext, {
      path,
      duration,
      success: true,
    });

    return result;
  } catch (error) {
    // Log error
    const duration = Date.now() - requestContext.startTime;
    logger.error(
      `tRPC request failed: ${path}`,
      logContext,
      error instanceof Error ? error : new Error('Unknown error'),
      {
        path,
        duration,
        errorType: error instanceof TRPCError ? error.code : 'UNKNOWN',
      },
    );

    throw error;
  }
});

export const createTRPCRouter = t.router;

// Public procedure with logging
export const publicProcedure = t.procedure.use(loggingMiddleware);

// Protected procedure with logging (for future use when auth is implemented)
export const protectedProcedure = t.procedure.use(loggingMiddleware).use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Import the subscription middleware

// Admin procedure that requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only admins can perform this action',
    });
  }
  return next({ ctx });
});

// Premium procedure that requires an active subscription
export const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { isSubscriptionActive } = await import('~/utils/subscription');
  const { SubscriptionStatus } = await import('~/server/db');

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
    // Use transaction to prevent race conditions
    try {
      await ctx.db.$transaction(async (tx) => {
        // Re-check status within transaction to prevent race condition
        const currentSub = await tx.subscription.findUnique({
          where: { id: subscription.id },
        });

        if (currentSub?.status === SubscriptionStatus.ACTIVE) {
          await tx.subscription.update({
            where: {
              id: subscription.id,
              status: SubscriptionStatus.ACTIVE, // Optimistic lock on status
            },
            data: { status: SubscriptionStatus.EXPIRED },
          });
        }
      });

      logger.info('Subscription expired and status updated', {
        correlationId: ctx.correlationId,
        subscriptionId: subscription.id,
        userId: ctx.session.user.id,
      });
    } catch (_error) {
      // If update fails due to concurrent modification, that's ok
      logger.debug('Subscription status already updated by another request', {
        correlationId: ctx.correlationId,
        subscriptionId: subscription.id,
      });
    }

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Subscription has expired',
    });
  }

  return next({
    ctx,
  });
});
