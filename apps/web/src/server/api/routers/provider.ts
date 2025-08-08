import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logger } from "~/utils/logger";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can perform this action",
    });
  }
  return next();
});

// Input schemas
const createProviderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  ageGroups: z.array(z.string()).optional(),
  isVetted: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const updateProviderSchema = createProviderSchema.partial().extend({
  id: z.string(),
});

const createProgramSchema = z.object({
  providerId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  duration: z.string().optional(),
  schedule: z.string().optional(),
  minAge: z.number().int().min(0).optional(),
  maxAge: z.number().int().min(0).optional(),
  capacity: z.number().int().min(0).optional(),
  spotsAvailable: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  earlyBirdPrice: z.number().min(0).optional(),
  earlyBirdDeadline: z.date().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  galleryUrls: z.array(z.string().url()).optional(),
  requirements: z.array(z.string()).optional(),
  includedItems: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const providerRouter = createTRPCRouter({
  // Get all providers (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        includeUnpublished: z.boolean().optional(),
        includeUnvetted: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (!input?.includeUnpublished) {
        where.isPublished = true;
      }
      
      if (!input?.includeUnvetted) {
        where.isVetted = true;
      }
      
      return ctx.db.provider.findMany({
        where,
        include: {
          programs: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // Get published providers (public)
  getPublished: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.provider.findMany({
      where: {
        isPublished: true,
        isVetted: true,
      },
      include: {
        programs: {
          where: {
            isPublished: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),

  // Get single provider
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const provider = await ctx.db.provider.findUnique({
        where: { id: input.id },
        include: {
          programs: true,
        },
      });

      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      // Check if user can view unpublished providers
      if (!provider.isPublished && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This provider is not published",
        });
      }

      return provider;
    }),

  // Create provider (admin only)
  create: adminProcedure
    .input(createProviderSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, certifications, specializations, ageGroups, ...providerData } = input;
      
      const provider = await ctx.db.provider.create({
        data: {
          ...providerData,
          tags: tags ? JSON.stringify(tags) : null,
          certifications: certifications ? JSON.stringify(certifications) : null,
          specializations: specializations ? JSON.stringify(specializations) : null,
          ageGroups: ageGroups ? JSON.stringify(ageGroups) : null,
          vettedBy: input.isVetted ? ctx.session.user.id : null,
          vettedAt: input.isVetted ? new Date() : null,
          publishedAt: input.isPublished ? new Date() : null,
        },
      });

      // Audit log
      logger.info("Provider created", {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      }, {
        providerId: provider.id,
        action: "PROVIDER_CREATED",
      });

      return provider;
    }),

  // Update provider (admin only)
  update: adminProcedure
    .input(updateProviderSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, certifications, specializations, ageGroups, ...updateData } = input;
      
      // Check if vetting status changed
      const existingProvider = await ctx.db.provider.findUnique({
        where: { id },
        select: { isVetted: true, isPublished: true },
      });

      if (!existingProvider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      const dataToUpdate: any = { ...updateData };
      
      // Handle JSON fields
      if (tags !== undefined) {
        dataToUpdate.tags = tags ? JSON.stringify(tags) : null;
      }
      if (certifications !== undefined) {
        dataToUpdate.certifications = certifications ? JSON.stringify(certifications) : null;
      }
      if (specializations !== undefined) {
        dataToUpdate.specializations = specializations ? JSON.stringify(specializations) : null;
      }
      if (ageGroups !== undefined) {
        dataToUpdate.ageGroups = ageGroups ? JSON.stringify(ageGroups) : null;
      }

      // Update vetting info if status changed
      if (input.isVetted !== undefined && input.isVetted !== existingProvider.isVetted) {
        dataToUpdate.vettedBy = input.isVetted ? ctx.session.user.id : null;
        dataToUpdate.vettedAt = input.isVetted ? new Date() : null;
      }

      // Update publishing info if status changed
      if (input.isPublished !== undefined && input.isPublished !== existingProvider.isPublished) {
        dataToUpdate.publishedAt = input.isPublished ? new Date() : null;
      }

      const provider = await ctx.db.provider.update({
        where: { id },
        data: dataToUpdate,
      });

      // Audit log
      logger.info("Provider updated", {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      }, {
        providerId: id,
        action: "PROVIDER_UPDATED",
      });

      return provider;
    }),

  // Delete provider (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get provider name for audit log
      const provider = await ctx.db.provider.findUnique({
        where: { id: input.id },
        select: { name: true },
      });

      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      await ctx.db.provider.delete({
        where: { id: input.id },
      });
      
      // Audit log
      logger.info("Provider deleted", {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      }, {
        providerId: input.id,
        providerName: provider.name,
        action: "PROVIDER_DELETED",
      });
      
      return { success: true };
    }),

  // Toggle vetting status (admin only)
  toggleVetting: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const provider = await ctx.db.provider.findUnique({
        where: { id: input.id },
        select: { isVetted: true },
      });

      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      const updated = await ctx.db.provider.update({
        where: { id: input.id },
        data: {
          isVetted: !provider.isVetted,
          vettedBy: !provider.isVetted ? ctx.session.user.id : null,
          vettedAt: !provider.isVetted ? new Date() : null,
        },
      });

      // Audit log
      logger.info("Provider vetting status changed", {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      }, {
        providerId: input.id,
        isVetted: updated.isVetted,
        action: "PROVIDER_VETTING_TOGGLED",
      });

      return updated;
    }),

  // Toggle publishing status (admin only)
  togglePublishing: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const provider = await ctx.db.provider.findUnique({
        where: { id: input.id },
        select: { isPublished: true, isVetted: true },
      });

      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      if (!provider.isVetted && !provider.isPublished) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provider must be vetted before publishing",
        });
      }

      const updated = await ctx.db.provider.update({
        where: { id: input.id },
        data: {
          isPublished: !provider.isPublished,
          publishedAt: !provider.isPublished ? new Date() : null,
        },
      });

      // Audit log
      logger.info("Provider publishing status changed", {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      }, {
        providerId: input.id,
        isPublished: updated.isPublished,
        action: "PROVIDER_PUBLISHING_TOGGLED",
      });

      return updated;
    }),

  // Create program for a provider (admin only)
  createProgram: adminProcedure
    .input(createProgramSchema)
    .mutation(async ({ ctx, input }) => {
      const { 
        galleryUrls, 
        requirements, 
        includedItems, 
        activities, 
        ...programData 
      } = input;

      const program = await ctx.db.program.create({
        data: {
          ...programData,
          galleryUrls: galleryUrls ? JSON.stringify(galleryUrls) : null,
          requirements: requirements ? JSON.stringify(requirements) : null,
          includedItems: includedItems ? JSON.stringify(includedItems) : null,
          activities: activities ? JSON.stringify(activities) : null,
        },
      });

      return program;
    }),
});