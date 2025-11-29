/**
 * Provider Repository
 * Handles all database operations for providers with business logic
 */

import { BaseRepository } from './base.repository';
import { createLogger } from '~/utils/logger';

// Create a child logger for the provider repository
const providerLogger = createLogger('provider-repository');

// Define Provider type locally to avoid Prisma client generation timing issues
// IMPORTANT: Keep in sync with prisma/schema.prisma - see __tests__/types/schema-sync.test.ts
export interface Provider {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  abn: string | null;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  capacity: number | null;
  ageGroups: string; // JSON array stored as text in Prisma
  specialNeeds: boolean;
  specialNeedsDetails: string | null;
  isVetted: boolean;
  isPublished: boolean;
  vettingStatus: string;
  vettingNotes: string | null;
  vettingDate: Date | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
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
  daysOfWeek: string;
  capacity: number | null;
  enrollmentUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  programStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

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
   * Find providers by location using PostGIS for geospatial queries
   * Falls back to suburb/state filtering when coordinates aren't available
   */
  async findByLocation(params: ProviderSearchParams): Promise<ProviderWithPrograms[]> {
    try {
      // If we have coordinates and radius, use PostGIS geospatial query
      if (params.latitude && params.longitude && params.radius) {
        return this.findByCoordinates(
          params.latitude,
          params.longitude,
          params.radius,
          params,
        );
      }

      // Otherwise fall back to text-based search
      const where: Record<string, unknown> = {
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
      providerLogger.error('Error finding providers by location', {}, error as Error, { params });
      throw error;
    }
  }

  /**
   * Find providers within a radius using PostGIS ST_DWithin
   * Uses Haversine formula when PostGIS is not available
   */
  async findByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number,
    additionalFilters?: Partial<ProviderSearchParams>,
  ): Promise<ProviderWithPrograms[]> {
    try {
      const radiusMeters = radiusKm * 1000;

      // Try PostGIS query first (if PostGIS extension is available)
      try {
        const providers = await this.prisma.$queryRaw<ProviderWithPrograms[]>`
          SELECT
            p.*,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) / 1000 as distance_km
          FROM "Provider" p
          WHERE p."isPublished" = true
            AND p."isVetted" = true
            AND p.latitude IS NOT NULL
            AND p.longitude IS NOT NULL
            AND ST_DWithin(
              ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${radiusMeters}
            )
          ORDER BY distance_km ASC
        `;

        providerLogger.info('PostGIS geospatial query executed', {}, {
          resultsCount: providers.length,
          latitude,
          longitude,
          radiusKm,
        });

        // Load programs for each provider
        const providerIds = providers.map((p: ProviderWithPrograms) => p.id);
        const programs = await this.prisma.program.findMany({
          where: {
            providerId: { in: providerIds },
            isActive: true,
            isPublished: true,
          },
        });

        // Map programs to providers
        const programsByProvider = (programs as Program[]).reduce(
          (acc: Record<string, Program[]>, program: Program) => {
            const providerId = program.providerId;
            if (!acc[providerId]) {
              acc[providerId] = [];
            }
            acc[providerId]!.push(program);
            return acc;
          },
          {} as Record<string, Program[]>,
        );

        return providers.map((provider: ProviderWithPrograms) => ({
          ...provider,
          programs: programsByProvider[provider.id] || [],
        }));
      } catch (postgisError) {
        // PostGIS not available, fall back to Haversine calculation
        providerLogger.warn('PostGIS query failed, falling back to Haversine', {}, {
          error: (postgisError as Error).message,
        });

        return this.findByHaversine(latitude, longitude, radiusKm, additionalFilters);
      }
    } catch (error) {
      providerLogger.error('Error in geospatial search', {}, error as Error, {
        latitude,
        longitude,
        radiusKm,
      });
      throw error;
    }
  }

  /**
   * Fallback: Find providers using Haversine formula (without PostGIS)
   * Less efficient but works without PostGIS extension
   */
  private async findByHaversine(
    latitude: number,
    longitude: number,
    radiusKm: number,
    additionalFilters?: Partial<ProviderSearchParams>,
  ): Promise<ProviderWithPrograms[]> {
    // Get all providers with coordinates
    const allProviders = await this.prisma.provider.findMany({
      where: {
        isPublished: additionalFilters?.isPublished ?? true,
        isVetted: additionalFilters?.isVetted ?? true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        programs: {
          where: {
            isActive: true,
            isPublished: true,
          },
        },
      },
    });

    // Filter by Haversine distance
    const providersWithDistance = (allProviders as ProviderWithPrograms[])
      .map((provider: ProviderWithPrograms) => ({
        ...provider,
        distance_km: this.haversineDistance(
          latitude,
          longitude,
          provider.latitude!,
          provider.longitude!,
        ),
      }))
      .filter((provider: ProviderWithPrograms & { distance_km: number }) => provider.distance_km <= radiusKm)
      .sort((a: ProviderWithPrograms & { distance_km: number }, b: ProviderWithPrograms & { distance_km: number }) => a.distance_km - b.distance_km);

    providerLogger.info('Haversine fallback query executed', {}, {
      totalProviders: allProviders.length,
      matchingProviders: providersWithDistance.length,
      radiusKm,
    });

    return providersWithDistance as ProviderWithPrograms[];
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
    userId: string,
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

    return this.update(id, { isPublished: !provider.isPublished }, userId);
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
   * Search providers by keyword (delegates to search method)
   * @deprecated Use search() method instead
   */
  async searchByKeyword(keyword: string): Promise<Provider[]> {
    return this.search({ query: keyword, includePrograms: true });
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
  async createWithPrograms(
    providerData: Partial<Provider>,
    programsData: Partial<Program>[],
  ): Promise<ProviderWithPrograms> {
    const result = await this.prisma.$transaction(async (tx: { provider: { create: (args: { data: unknown }) => Promise<Provider> }; program: { create: (args: { data: unknown }) => Promise<Program> } }) => {
      const provider = await tx.provider.create({
        data: providerData,
      });

      const programs = await Promise.all(
        programsData.map((programData: Partial<Program>) =>
          tx.program.create({
            data: {
              ...programData,
              providerId: provider.id,
            },
          }),
        ),
      );

      return {
        ...provider,
        programs,
      };
    });

    return result as ProviderWithPrograms;
  }

  /**
   * Search providers by query with optional filters
   */
  async search(
    params: { query?: string; suburb?: string; state?: string; includePrograms?: boolean } = {},
  ): Promise<Provider[]> {
    const where: any = {
      isPublished: true,
      isVetted: true,
    };

    if (params.query) {
      const searchConditions: any[] = [
        { businessName: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ];

      // Include program search if requested
      if (params.includePrograms) {
        searchConditions.push({
          programs: {
            some: {
              OR: [
                { name: { contains: params.query, mode: 'insensitive' } },
                { description: { contains: params.query, mode: 'insensitive' } },
              ],
            },
          },
        });
      }

      where.OR = searchConditions;
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
