import { createTRPCRouter } from "~/server/api/trpc";
import { healthzRouter } from "~/server/api/routers/healthz";

export const appRouter = createTRPCRouter({
  healthz: healthzRouter,
});

export type AppRouter = typeof appRouter;