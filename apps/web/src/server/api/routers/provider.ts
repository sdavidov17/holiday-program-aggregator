import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ProviderRepository } from '~/repositories/provider.repository';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { logger } from '~/utils/logger';

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
  description: z.string().min(1, 'Description is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  capacity: z.coerce.number().optional(),
  ageGroups: z.array(z.string()).optional(),
  specialNeeds: z.boolean().optional(),
  specialNeedsDetails: z.string().optional(),
  isVetted: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const updateProviderSchema = createProviderSchema.partial().extend({
  id: z.string(),
});

const createProgramSchema = z.object({
  providerId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  ageMin: z.coerce.number().int().min(0),
  ageMax: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  daysOfWeek: z.array(z.string()).optional(),
  capacity: z.coerce.number().int().min(0).optional(),
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
      const providerRepository = new ProviderRepository(ctx.db);
      const where: any = {};

      if (!input?.includeUnpublished) {
        where.isPublished = true;
      }

      if (!input?.includeUnvetted) {
        where.isVetted = true;
      }

      return providerRepository.findManyWithPrograms({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  // Get published providers (public)
  getPublished: protectedProcedure.query(async ({ ctx }) => {
    const providerRepository = new ProviderRepository(ctx.db);
    return providerRepository.findMany({
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

  // Get single provider
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const providerRepository = new ProviderRepository(ctx.db);
    const provider = await providerRepository.findByIdWithPrograms(input.id);

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
    const providerRepository = new ProviderRepository(ctx.db);
    return providerRepository.createProvider(input, ctx.session.user.id);
  }),

  // Update provider (admin only)
  update: adminProcedure.input(updateProviderSchema).mutation(async ({ ctx, input }) => {
    const providerRepository = new ProviderRepository(ctx.db);
    const { id, ...updateData } = input;

    const existingProvider = await providerRepository.findById(id);
    if (!existingProvider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Provider not found',
      });
    }

    return providerRepository.updateProvider(id, updateData, ctx.session.user.id);
  }),

  // Delete provider (admin only)
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const providerRepository = new ProviderRepository(ctx.db);
    const provider = await providerRepository.findById(input.id);

    if (!provider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Provider not found',
      });
    }

    await providerRepository.delete(input.id, ctx.session.user.id);
    return { success: true };
  }),

  // Toggle vetting status (admin only)
  toggleVetting: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const providerRepository = new ProviderRepository(ctx.db);
      const provider = await providerRepository.findById(input.id);

      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Provider not found',
        });
      }

      // Use updateProvider to handle the toggle logic if we want to keep it simple,
      // or use updateVettingStatus if we want to be explicit.
      // Since toggleVetting in repo isn't exactly what we want (it takes status),
      // we can just use updateProvider with the toggled value.
      return providerRepository.updateProvider(
        input.id,
        { isVetted: !provider.isVetted },
        ctx.session.user.id,
      );
    }),

  // Toggle publishing status (admin only)
  togglePublishing: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const providerRepository = new ProviderRepository(ctx.db);
      const provider = await providerRepository.findById(input.id);

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

      return providerRepository.togglePublishStatus(input.id, ctx.session.user.id);
    }),

  // Create program for a provider (admin only)
  createProgram: adminProcedure.input(createProgramSchema).mutation(async ({ ctx, input }) => {
    const { daysOfWeek, ...programData } = input;

    // TODO: Move Program logic to ProgramRepository when created
    const program = await ctx.db.program.create({
      data: {
        ...programData,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : '[]',
      },
    });

    return program;
  }),
});
