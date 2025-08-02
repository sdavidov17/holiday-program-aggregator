import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { encryptPII } from "~/utils/encryption";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phoneNumber: z.string().optional(),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, phoneNumber, dateOfBirth, address } = input;

      // Encrypt PII fields
      const encryptedPhone = phoneNumber ? encryptPII(phoneNumber) : undefined;
      const encryptedDOB = dateOfBirth ? encryptPII(dateOfBirth) : undefined;
      const encryptedAddress = address ? encryptPII(address) : undefined;

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name,
          phoneNumber: encryptedPhone,
          dateOfBirth: encryptedDOB,
          address: encryptedAddress,
        },
        select: {
          id: true,
          name: true,
          email: true,
          // Don't return encrypted fields
        },
      });

      return updatedUser;
    }),
});