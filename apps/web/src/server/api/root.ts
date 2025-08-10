import { createTRPCRouter } from "~/server/api/trpc";
import { healthzRouter } from "~/server/api/routers/healthz";
import { userRouter } from "~/server/api/routers/user";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { providerRouter } from "~/server/api/routers/provider";
import { adminRouter } from "~/server/api/routers/admin";

export const appRouter = createTRPCRouter({
  healthz: healthzRouter,
  user: userRouter,
  subscription: subscriptionRouter,
  provider: providerRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;