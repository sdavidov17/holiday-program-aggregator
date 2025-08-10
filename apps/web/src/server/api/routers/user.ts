import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { encryptPII } from "~/utils/encryption";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
  
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return updatedUser;
    }),
});