import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { logger, type LogContext } from "~/utils/logger";
import { withRequestContext, type RequestContext } from "~/utils/requestContext";

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
  
  // Get correlation ID from headers (set by middleware)
  const correlationId = req.headers['x-correlation-id'] as string || `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  
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
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
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
      }
    );
    
    throw error;
  }
});

export const createTRPCRouter = t.router;

// Public procedure with logging
export const publicProcedure = t.procedure.use(loggingMiddleware);

// Protected procedure with logging (for future use when auth is implemented)
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

// Import the subscription middleware
import { requireActiveSubscriptionMiddleware } from "./middleware/requireActiveSubscription";

// Premium procedure that requires an active subscription
export const premiumProcedure = protectedProcedure
  .use(requireActiveSubscriptionMiddleware);