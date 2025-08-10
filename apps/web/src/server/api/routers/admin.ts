import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure
    .query(async ({ ctx }) => {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          emailVerified: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return users;
    }),

  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["USER", "ADMIN"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent removing the last admin
      if (input.role === "USER") {
        const adminCount = await ctx.db.user.count({
          where: { role: "ADMIN" },
        });
        
        const userToUpdate = await ctx.db.user.findUnique({
          where: { id: input.userId },
          select: { role: true },
        });
        
        if (adminCount <= 1 && userToUpdate?.role === "ADMIN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove the last admin",
          });
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return updatedUser;
    }),

  deleteUser: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent deleting yourself
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      // Prevent deleting the last admin
      const userToDelete = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true },
      });
      
      if (userToDelete?.role === "ADMIN") {
        const adminCount = await ctx.db.user.count({
          where: { role: "ADMIN" },
        });
        
        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete the last admin",
          });
        }
      }

      await ctx.db.user.delete({
        where: { id: input.userId },
      });

      return { success: true };
    }),

  getUserStats: adminProcedure
    .query(async ({ ctx }) => {
      const [totalUsers, adminUsers, verifiedUsers, recentUsers] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: "ADMIN" } }),
        ctx.db.user.count({ where: { NOT: { emailVerified: null } } }),
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      return {
        totalUsers,
        adminUsers,
        verifiedUsers,
        recentUsers,
      };
    }),
});