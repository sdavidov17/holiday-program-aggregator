import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ProviderRepository } from '~/repositories/provider.repository';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { logger } from '~/utils/logger';

// Create repository instance
const providerRepository = new ProviderRepository();

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only admins can perform this action',
    });
  }
  return next();
});

// Input schemas
const createProviderSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone is required'),
  website: z.string().url().optional().or(z.literal('')),
  abn: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().min(1, 'Description is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  capacity: z.number().optional(),
  ageGroups: z.array(z.string()).optional(),
  specialNeeds: z.boolean().optional(),
  specialNeedsDetails: z.string().optional(),
  isVetted: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

// Search input schema for geospatial search
const searchProviderSchema = z.object({
  latitude: z.number().min(-90).max(90).optional().describe('Latitude for distance search'),
  longitude: z.number().min(-180).max(180).optional().describe('Longitude for distance search'),
  radius: z.number().min(1).max(500).optional().describe('Search radius in kilometers'),
  suburb: z.string().optional().describe('Filter by suburb'),
  state: z.string().optional().describe('Filter by state'),
  ageGroup: z.string().optional().describe('Filter by age group'),
  category: z.string().optional().describe('Filter by program category'),
  query: z.string().optional().describe('Search query for text search'),
});

const updateProviderSchema = createProviderSchema.partial().extend({
  id: z.string(),
});

const createProgramSchema = z.object({
  providerId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  ageMin: z.number().int().min(0),
  ageMax: z.number().int().min(0),
  price: z.number().min(0),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  daysOfWeek: z.array(z.string()).optional(),
  capacity: z.number().int().min(0).optional(),
  enrollmentUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const providerRouter = createTRPCRouter({
  // Get all providers (admin only)
  getAll: adminProcedure
    .input(
      z
        .object({
          includeUnpublished: z.boolean().optional(),
          includeUnvetted: z.boolean().optional(),
        })
        .optional(),
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
          createdAt: 'desc',
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
        businessName: 'asc',
      },
    });
  }),

  // Search providers by location and filters
  search: protectedProcedure.input(searchProviderSchema).query(async ({ ctx, input }) => {
    logger.info(
      'Provider search initiated',
      {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      },
      {
        hasCoordinates: !!(input.latitude && input.longitude),
        radius: input.radius,
        suburb: input.suburb,
        state: input.state,
      },
    );

    const providers = await providerRepository.findByLocation({
      latitude: input.latitude,
      longitude: input.longitude,
      radius: input.radius || 25, // Default 25km radius
      suburb: input.suburb,
      state: input.state,
      ageGroup: input.ageGroup,
      category: input.category,
      isPublished: true,
      isVetted: true,
    });

    logger.info(
      'Provider search completed',
      {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      },
      {
        resultsCount: providers.length,
      },
    );

    return providers;
  }),

  // Search by coordinates (convenience endpoint)
  searchByCoordinates: protectedProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radius: z.number().min(1).max(500).default(25),
      }),
    )
    .query(async ({ input }) => {
      return providerRepository.findByCoordinates(input.latitude, input.longitude, input.radius);
    }),

  // Get single provider
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const provider = await ctx.db.provider.findUnique({
      where: { id: input.id },
      include: {
        programs: true,
      },
    });

    if (!provider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Provider not found',
      });
    }

    // Check if user can view unpublished providers
    if (!provider.isPublished && ctx.session.user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'This provider is not published',
      });
    }

    return provider;
  }),

  // Create provider (admin only)
  create: adminProcedure.input(createProviderSchema).mutation(async ({ ctx, input }) => {
    const { ageGroups, ...providerData } = input;

    const provider = await ctx.db.provider.create({
      data: {
        ...providerData,
        ageGroups: ageGroups ? JSON.stringify(ageGroups) : '[]',
        vettingDate: input.isVetted ? new Date() : null,
        vettingStatus: input.isVetted ? 'APPROVED' : 'NOT_STARTED',
      },
    });

    // Audit log
    logger.info(
      'Provider created',
      {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      },
      {
        providerId: provider.id,
        action: 'PROVIDER_CREATED',
      },
    );

    return provider;
  }),

  // Update provider (admin only)
  update: adminProcedure.input(updateProviderSchema).mutation(async ({ ctx, input }) => {
    const { id, ageGroups, ...updateData } = input;

    // Check if vetting status changed
    const existingProvider = await ctx.db.provider.findUnique({
      where: { id },
      select: { isVetted: true, isPublished: true },
    });

    if (!existingProvider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Provider not found',
      });
    }

    const dataToUpdate: any = { ...updateData };

    // Handle JSON fields
    if (ageGroups !== undefined) {
      dataToUpdate.ageGroups = ageGroups ? JSON.stringify(ageGroups) : '[]';
    }

    // Update vetting info if status changed
    if (input.isVetted !== undefined && input.isVetted !== existingProvider.isVetted) {
      dataToUpdate.vettingDate = input.isVetted ? new Date() : null;
      dataToUpdate.vettingStatus = input.isVetted ? 'APPROVED' : 'NOT_STARTED';
    }

    // Update publishing info if status changed
    if (input.isPublished !== undefined && input.isPublished !== existingProvider.isPublished) {
      // Just update the isPublished flag, no publishedAt field in schema
    }

    const provider = await ctx.db.provider.update({
      where: { id },
      data: dataToUpdate,
    });

    // Audit log
    logger.info(
      'Provider updated',
      {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      },
      {
        providerId: id,
        action: 'PROVIDER_UPDATED',
      },
    );

    return provider;
  }),

  // Delete provider (admin only)
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // Get provider name for audit log
    const provider = await ctx.db.provider.findUnique({
      where: { id: input.id },
      select: { businessName: true },
    });

    if (!provider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Provider not found',
      });
    }

    await ctx.db.provider.delete({
      where: { id: input.id },
    });

    // Audit log
    logger.info(
      'Provider deleted',
      {
        userId: ctx.session.user.id,
        correlationId: ctx.correlationId,
      },
      {
        providerId: input.id,
        providerName: provider.businessName,
        action: 'PROVIDER_DELETED',
      },
    );

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
          code: 'NOT_FOUND',
          message: 'Provider not found',
        });
      }

      const updated = await ctx.db.provider.update({
        where: { id: input.id },
        data: {
          isVetted: !provider.isVetted,
          vettingDate: !provider.isVetted ? new Date() : null,
          vettingStatus: !provider.isVetted ? 'APPROVED' : 'NOT_STARTED',
        },
      });

      // Audit log
      logger.info(
        'Provider vetting status changed',
        {
          userId: ctx.session.user.id,
          correlationId: ctx.correlationId,
        },
        {
          providerId: input.id,
          isVetted: updated.isVetted,
          action: 'PROVIDER_VETTING_TOGGLED',
        },
      );

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
          code: 'NOT_FOUND',
          message: 'Provider not found',
        });
      }

      if (!provider.isVetted && !provider.isPublished) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provider must be vetted before publishing',
        });
      }

      const updated = await ctx.db.provider.update({
        where: { id: input.id },
        data: {
          isPublished: !provider.isPublished,
        },
      });

      // Audit log
      logger.info(
        'Provider publishing status changed',
        {
          userId: ctx.session.user.id,
          correlationId: ctx.correlationId,
        },
        {
          providerId: input.id,
          isPublished: updated.isPublished,
          action: 'PROVIDER_PUBLISHING_TOGGLED',
        },
      );

      return updated;
    }),

  // Create program for a provider (admin only)
  createProgram: adminProcedure.input(createProgramSchema).mutation(async ({ ctx, input }) => {
    const { daysOfWeek, ...programData } = input;

    const program = await ctx.db.program.create({
      data: {
        ...programData,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : '[]',
      },
    });

    return program;
  }),
});
