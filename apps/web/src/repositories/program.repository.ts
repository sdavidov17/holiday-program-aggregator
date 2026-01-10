/**
 * Program Repository
 * Provides database operations for Program entities with audit logging
 */

import type { Prisma, PrismaClient, Program } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface ProgramWithProvider extends Program {
  provider?: {
    id: string;
    businessName: string;
    suburb: string;
    state: string;
  };
}

export interface ProgramSearchOptions {
  category?: string;
  ageMin?: number;
  ageMax?: number;
  startDate?: Date;
  endDate?: Date;
  suburb?: string;
  state?: string;
  isActive?: boolean;
  isPublished?: boolean;
  providerId?: string;
}

export interface ProgramCreateInput {
  providerId: string;
  name: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  price: number;
  location: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  daysOfWeek?: string[];
  capacity?: number;
  enrollmentUrl?: string;
  imageUrl?: string;
  isActive?: boolean;
  isPublished?: boolean;
  programStatus?: string;
}

export interface ProgramUpdateInput {
  name?: string;
  description?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
  price?: number;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  capacity?: number;
  enrollmentUrl?: string;
  imageUrl?: string;
  isActive?: boolean;
  isPublished?: boolean;
  programStatus?: string;
}

export class ProgramRepository extends BaseRepository<Program> {
  constructor(prisma?: PrismaClient) {
    super('program', prisma);
  }

  /**
   * Find a program by ID with its provider
   */
  async findByIdWithProvider(id: string): Promise<ProgramWithProvider | null> {
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              suburb: true,
              state: true,
            },
          },
        },
      });
      return program;
    } catch (error) {
      console.error('Error finding program by ID with provider', { id, error });
      throw error;
    }
  }

  /**
   * Find all programs for a provider
   */
  async findByProviderId(
    providerId: string,
    options?: { includeUnpublished?: boolean },
  ): Promise<Program[]> {
    try {
      const where: Prisma.ProgramWhereInput = { providerId };

      if (!options?.includeUnpublished) {
        where.isPublished = true;
        where.isActive = true;
      }

      return await this.prisma.program.findMany({
        where,
        orderBy: { startDate: 'asc' },
      });
    } catch (error) {
      console.error('Error finding programs by provider ID', { providerId, error });
      throw error;
    }
  }

  /**
   * Search programs with filters
   */
  async search(options: ProgramSearchOptions): Promise<ProgramWithProvider[]> {
    try {
      const where: Prisma.ProgramWhereInput = {};

      // Category filter
      if (options.category) {
        where.category = options.category;
      }

      // Age range filter - find programs that overlap with the given age range
      if (options.ageMin !== undefined || options.ageMax !== undefined) {
        if (options.ageMin !== undefined) {
          where.ageMax = { gte: options.ageMin };
        }
        if (options.ageMax !== undefined) {
          where.ageMin = { lte: options.ageMax };
        }
      }

      // Date range filter - find programs that overlap with the given date range
      if (options.startDate || options.endDate) {
        where.AND = [];
        if (options.startDate) {
          where.AND.push({ endDate: { gte: options.startDate } });
        }
        if (options.endDate) {
          where.AND.push({ startDate: { lte: options.endDate } });
        }
      }

      // Location filter via provider
      if (options.suburb || options.state) {
        where.provider = {};
        if (options.suburb) {
          where.provider.suburb = { contains: options.suburb, mode: 'insensitive' };
        }
        if (options.state) {
          where.provider.state = options.state;
        }
      }

      // Status filters
      if (options.isActive !== undefined) {
        where.isActive = options.isActive;
      }
      if (options.isPublished !== undefined) {
        where.isPublished = options.isPublished;
      }
      if (options.providerId) {
        where.providerId = options.providerId;
      }

      const programs = await this.prisma.program.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              suburb: true,
              state: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      });

      return programs;
    } catch (error) {
      console.error('Error searching programs', { options, error });
      throw error;
    }
  }

  /**
   * Find upcoming programs (starting within the next N days)
   */
  async findUpcoming(days: number = 30, limit: number = 20): Promise<ProgramWithProvider[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await this.prisma.program.findMany({
        where: {
          isPublished: true,
          isActive: true,
          startDate: {
            gte: now,
            lte: futureDate,
          },
        },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              suburb: true,
              state: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error finding upcoming programs', { days, limit, error });
      throw error;
    }
  }

  /**
   * Find programs by category
   */
  async findByCategory(category: string): Promise<ProgramWithProvider[]> {
    try {
      return await this.prisma.program.findMany({
        where: {
          category,
          isPublished: true,
          isActive: true,
        },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              suburb: true,
              state: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      });
    } catch (error) {
      console.error('Error finding programs by category', { category, error });
      throw error;
    }
  }

  /**
   * Create a program with proper data formatting
   */
  async createProgram(data: ProgramCreateInput, userId?: string): Promise<Program> {
    try {
      const { daysOfWeek, ...rest } = data;

      const programData = {
        ...rest,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : '[]',
      };

      return await this.create(programData as Partial<Program>, userId);
    } catch (error) {
      console.error('Error creating program', { data, error });
      throw error;
    }
  }

  /**
   * Update a program with proper data formatting
   */
  async updateProgram(id: string, data: ProgramUpdateInput, userId?: string): Promise<Program> {
    try {
      const { daysOfWeek, ...rest } = data;

      const updateData: Partial<Program> = { ...rest };
      if (daysOfWeek !== undefined) {
        updateData.daysOfWeek = JSON.stringify(daysOfWeek);
      }

      return await this.update(id, updateData, userId);
    } catch (error) {
      console.error('Error updating program', { id, data, error });
      throw error;
    }
  }

  /**
   * Toggle program published status
   */
  async togglePublishStatus(id: string, userId?: string): Promise<Program> {
    try {
      const program = await this.findById(id);
      if (!program) {
        throw new Error('Program not found');
      }

      return await this.update(id, { isPublished: !program.isPublished }, userId);
    } catch (error) {
      console.error('Error toggling program publish status', { id, error });
      throw error;
    }
  }

  /**
   * Toggle program active status
   */
  async toggleActiveStatus(id: string, userId?: string): Promise<Program> {
    try {
      const program = await this.findById(id);
      if (!program) {
        throw new Error('Program not found');
      }

      return await this.update(id, { isActive: !program.isActive }, userId);
    } catch (error) {
      console.error('Error toggling program active status', { id, error });
      throw error;
    }
  }

  /**
   * Update program status (DRAFT, PUBLISHED, ARCHIVED, CANCELLED)
   */
  async updateProgramStatus(
    id: string,
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED',
    userId?: string,
  ): Promise<Program> {
    try {
      const updateData: Partial<Program> = { programStatus: status };

      // Auto-update related flags based on status
      switch (status) {
        case 'PUBLISHED':
          updateData.isPublished = true;
          updateData.isActive = true;
          break;
        case 'ARCHIVED':
        case 'CANCELLED':
          updateData.isActive = false;
          break;
        case 'DRAFT':
          updateData.isPublished = false;
          break;
      }

      return await this.update(id, updateData, userId);
    } catch (error) {
      console.error('Error updating program status', { id, status, error });
      throw error;
    }
  }

  /**
   * Get program statistics for a provider
   */
  async getProviderStats(providerId: string): Promise<{
    total: number;
    published: number;
    active: number;
    upcoming: number;
  }> {
    try {
      const now = new Date();

      const [total, published, active, upcoming] = await Promise.all([
        this.prisma.program.count({ where: { providerId } }),
        this.prisma.program.count({ where: { providerId, isPublished: true } }),
        this.prisma.program.count({ where: { providerId, isActive: true } }),
        this.prisma.program.count({
          where: {
            providerId,
            startDate: { gte: now },
            isActive: true,
          },
        }),
      ]);

      return { total, published, active, upcoming };
    } catch (error) {
      console.error('Error getting provider program stats', { providerId, error });
      throw error;
    }
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const programs = await this.prisma.program.findMany({
        where: { isPublished: true, isActive: true },
        select: { category: true },
        distinct: ['category'],
      });

      return programs.map((p) => p.category).sort();
    } catch (error) {
      console.error('Error getting program categories', { error });
      throw error;
    }
  }

  /**
   * Bulk update programs for a provider
   */
  async bulkUpdateByProvider(
    providerId: string,
    data: Partial<Program>,
    _userId?: string,
  ): Promise<number> {
    try {
      const result = await this.prisma.program.updateMany({
        where: { providerId },
        data,
      });

      return result.count;
    } catch (error) {
      console.error('Error bulk updating programs', { providerId, data, error });
      throw error;
    }
  }

  /**
   * Delete all programs for a provider
   */
  async deleteByProviderId(providerId: string, _userId?: string): Promise<number> {
    try {
      const result = await this.prisma.program.deleteMany({
        where: { providerId },
      });

      return result.count;
    } catch (error) {
      console.error('Error deleting programs by provider', { providerId, error });
      throw error;
    }
  }
}
