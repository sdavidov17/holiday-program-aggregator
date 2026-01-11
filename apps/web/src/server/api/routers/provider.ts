import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ProviderRepository } from '~/repositories/provider.repository';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

// Activity categories for filtering
const _ACTIVITY_CATEGORIES = [
  'Sports',
  'Arts',
  'Educational',
  'Outdoor',
  'Technology',
  'Music',
  'Drama',
  'Dance',
  'Cooking',
  'Science',
] as const;

// Search input schema
const _searchSchema = z.object({
  query: z.string().optional(),
  suburb: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  categories: z.array(z.string()).optional(),
  ageMin: z.coerce.number().int().min(0).max(18).optional(),
  ageMax: z.coerce.number().int().min(0).max(18).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
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

// Re-export categories for frontend
export const ACTIVITY_CATEGORIES = _ACTIVITY_CATEGORIES;

export const providerRouter = createTRPCRouter({
  // Search providers and programs with filters
  search: protectedProcedure.input(_searchSchema).query(async ({ ctx, input }) => {
    const {
      query,
      suburb,
      state,
      postcode,
      categories,
      ageMin,
      ageMax,
      startDate,
      endDate,
      maxPrice,
      limit,
      offset,
    } = input;

    // Build provider where clause
    const providerWhere: Record<string, unknown> = {
      isPublished: true,
      isVetted: true,
    };

    // Location filters
    if (suburb) {
      providerWhere.suburb = { contains: suburb, mode: 'insensitive' };
    }
    if (state) {
      providerWhere.state = state;
    }
    if (postcode) {
      providerWhere.postcode = postcode;
    }

    // Text search on business name and description
    if (query) {
      providerWhere.OR = [
        { businessName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Build program where clause for filtering
    const programWhere: Record<string, unknown> = {
      isPublished: true,
      isActive: true,
    };

    // Category filter
    if (categories && categories.length > 0) {
      programWhere.category = { in: categories };
    }

    // Age range filter - find programs that overlap with requested age range
    if (ageMin !== undefined || ageMax !== undefined) {
      const ageFilters: Record<string, unknown>[] = [];
      if (ageMin !== undefined) {
        // Program's max age must be >= user's min age
        ageFilters.push({ ageMax: { gte: ageMin } });
      }
      if (ageMax !== undefined) {
        // Program's min age must be <= user's max age
        ageFilters.push({ ageMin: { lte: ageMax } });
      }
      programWhere.AND = ageFilters;
    }

    // Date range filter
    if (startDate || endDate) {
      const dateFilters: Record<string, unknown>[] = [];
      if (startDate) {
        // Program ends after or on the requested start date
        dateFilters.push({ endDate: { gte: new Date(startDate) } });
      }
      if (endDate) {
        // Program starts before or on the requested end date
        dateFilters.push({ startDate: { lte: new Date(endDate) } });
      }
      programWhere.AND = [
        ...((programWhere.AND as Record<string, unknown>[]) || []),
        ...dateFilters,
      ];
    }

    // Max price filter
    if (maxPrice !== undefined) {
      programWhere.price = { lte: maxPrice };
    }

    // Query providers with matching programs
    const [providers, totalCount] = await Promise.all([
      ctx.db.provider.findMany({
        where: {
          ...providerWhere,
          programs: {
            some: programWhere,
          },
        },
        include: {
          programs: {
            where: programWhere,
            orderBy: { startDate: 'asc' },
          },
        },
        orderBy: { businessName: 'asc' },
        skip: offset,
        take: limit,
      }),
      ctx.db.provider.count({
        where: {
          ...providerWhere,
          programs: {
            some: programWhere,
          },
        },
      }),
    ]);

    return {
      providers,
      totalCount,
      hasMore: offset + providers.length < totalCount,
      limit,
      offset,
    };
  }),

  // Get activity categories
  getCategories: protectedProcedure.query(() => {
    return ACTIVITY_CATEGORIES;
  }),

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
      try {
        return await providerRepository.togglePublishStatus(input.id, ctx.session.user.id);
      } catch (error: any) {
        if (error.message === 'Provider not found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Provider not found',
          });
        }
        if (error.message === 'Provider must be vetted before publishing') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Create program for a provider (admin only)
  createProgram: adminProcedure.input(createProgramSchema).mutation(async ({ ctx, input }) => {
    const { ProgramRepository } = await import('~/repositories/program.repository');
    const programRepository = new ProgramRepository(ctx.db);

    return programRepository.createProgram(input, ctx.session.user.id);
  }),
});
