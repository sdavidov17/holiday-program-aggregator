import { adminRouter } from '~/server/api/routers/admin';
import { healthzRouter } from '~/server/api/routers/healthz';
import { providerRouter } from '~/server/api/routers/provider';
import { subscriptionRouter } from '~/server/api/routers/subscription';
import { userRouter } from '~/server/api/routers/user';
import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  healthz: healthzRouter,
  user: userRouter,
  subscription: subscriptionRouter,
  provider: providerRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
