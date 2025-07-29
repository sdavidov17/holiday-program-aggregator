import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const healthzRouter = createTRPCRouter({
  healthz: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
});