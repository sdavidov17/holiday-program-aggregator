import { createTRPCRouter } from "~/server/api/trpc";
import { healthzRouter } from "~/server/api/routers/healthz";
import { userRouter } from "~/server/api/routers/user";
import { subscriptionRouter } from "~/server/api/routers/subscription";

export const appRouter = createTRPCRouter({
  healthz: healthzRouter,
  user: userRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;