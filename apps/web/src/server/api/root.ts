import { createTRPCRouter } from "~/server/api/trpc";
import { healthzRouter } from "~/server/api/routers/healthz";
import { userRouter } from "~/server/api/routers/user";

export const appRouter = createTRPCRouter({
  healthz: healthzRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;