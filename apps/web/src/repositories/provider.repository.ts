/**
 * Provider Repository
 * Handles all database operations for providers with business logic
 */

import { Provider, Program, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface ProviderWithPrograms extends Provider {
  programs: Program[];
}

export interface ProviderSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  suburb?: string;
  state?: string;
  ageGroup?: string;
  category?: string;
  isVetted?: boolean;
  isPublished?: boolean;
}

export class ProviderRepository extends BaseRepository<Provider> {
  constructor(prisma?: any) {
    super('provider', prisma);
  }

  /**
   * Find providers by location using PostGIS (when implemented)
   * For now, using suburb/state filtering
   */
  async findByLocation(params: ProviderSearchParams): Promise<ProviderWithPrograms[]> {
    try {
      const where: Prisma.ProviderWhereInput = {
        isPublished: params.isPublished ?? true,
        isVetted: params.isVetted ?? true,
      };

      if (params.suburb) {
        where.suburb = {
          contains: params.suburb,
          mode: 'insensitive',
        };
      }

      if (params.state) {
        where.state = params.state;
      }

      // TODO: Implement PostGIS query when lat/lng columns are added
      // if (params.latitude && params.longitude && params.radius) {
      //   const query = Prisma.sql`
      //     SELECT * FROM "Provider"
      //     WHERE ST_DWithin(
      //       location::geography,
      //       ST_MakePoint(${params.longitude}, ${params.latitude})::geography,
      //       ${params.radius * 1000}
      //     )
      //   `;
      // }

      const providers = await this.prisma.provider.findMany({
        where,
        include: {
          programs: {
            where: {
              isActive: true,
              isPublished: true,
            },
          },
        },
        orderBy: {
          businessName: 'asc',
        },
      });

      return providers as ProviderWithPrograms[];
    } catch (error) {
      console.error('Error finding providers by location', { params, error });
      throw error;
    }
  }

  /**
   * Find vetted providers only
   */
  async findVettedProviders(): Promise<Provider[]> {
    return this.findMany({
      where: {
        isVetted: true,
        isPublished: true,
      },
      orderBy: {
        vettingDate: 'desc',
      },
    });
  }

  /**
   * Update vetting status
   */
  async updateVettingStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    notes: string,
    userId: string
  ): Promise<Provider> {
    const updateData = {
      isVetted: status === 'APPROVED',
      vettingStatus: status,
      vettingNotes: notes,
      vettingDate: new Date(),
    };

    return this.update(id, updateData, userId);
  }

  /**
   * Publish or unpublish a provider
   */
  async togglePublishStatus(id: string, userId: string): Promise<Provider> {
    const provider = await this.findById(id);
    if (!provider) {
      throw new Error('Provider not found');
    }

    return this.update(
      id,
      { isPublished: !provider.isPublished },
      userId
    );
  }

  /**
   * Get providers with upcoming programs
   */
  async findWithUpcomingPrograms(): Promise<ProviderWithPrograms[]> {
    const now = new Date();

    return this.prisma.provider.findMany({
      where: {
        isPublished: true,
        isVetted: true,
        programs: {
          some: {
            startDate: {
              gte: now,
            },
            isActive: true,
            isPublished: true,
          },
        },
      },
      include: {
        programs: {
          where: {
            startDate: {
              gte: now,
            },
            isActive: true,
            isPublished: true,
          },
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    }) as Promise<ProviderWithPrograms[]>;
  }

  /**
   * Search providers by keyword (legacy method for backward compatibility)
   */
  async searchByKeyword(keyword: string): Promise<Provider[]> {
    return this.findMany({
      where: {
        OR: [
          {
            businessName: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            programs: {
              some: {
                OR: [
                  {
                    name: {
                      contains: keyword,
                      mode: 'insensitive',
                    },
                  },
                  {
                    description: {
                      contains: keyword,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ],
        isPublished: true,
        isVetted: true,
      },
    });
  }

  /**
   * Get provider statistics
   */
  async getStatistics(): Promise<{
    total: number;
    vetted: number;
    published: number;
    withPrograms: number;
  }> {
    const [total, vetted, published, withPrograms] = await Promise.all([
      this.count(),
      this.count({ isVetted: true }),
      this.count({ isPublished: true }),
      this.count({
        programs: {
          some: {
            isActive: true,
          },
        },
      }),
    ]);

    return {
      total,
      vetted,
      published,
      withPrograms,
    };
  }

  /**
   * Create provider with programs in a transaction
   */
  async createWithPrograms(providerData: any, programsData: any[]): Promise<ProviderWithPrograms> {
    return await this.prisma.$transaction(async (tx) => {
      const provider = await tx.provider.create({
        data: providerData,
      });

      const programs = await Promise.all(
        programsData.map((programData) =>
          tx.program.create({
            data: {
              ...programData,
              providerId: provider.id,
            },
          })
        )
      );

      return {
        ...provider,
        programs,
      };
    });
  }

  /**
   * Search providers by query
   */
  async search(params: { query?: string; suburb?: string; state?: string } = {}): Promise<Provider[]> {
    const where: any = {
      isPublished: true,
      isVetted: true,
    };

    if (params.query) {
      where.OR = [
        { businessName: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.suburb) {
      where.suburb = params.suburb;
    }

    if (params.state) {
      where.state = params.state;
    }

    return await this.findMany({ where });
  }

  /**
   * Bulk create providers
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    return await (this.prisma as any)[this.modelName].createMany({
      data,
    });
  }

  /**
   * Bulk update providers
   */
  async updateMany(ids: string[], data: any): Promise<{ count: number }> {
    return await (this.prisma as any)[this.modelName].updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  /**
   * Bulk delete providers
   */
  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await (this.prisma as any)[this.modelName].deleteMany({
      where: { id: { in: ids } },
    });
  }
}