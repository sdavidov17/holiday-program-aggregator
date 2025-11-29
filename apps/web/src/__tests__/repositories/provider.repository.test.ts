/**
 * Unit Tests: Provider Repository
 * Tests provider-specific operations including geospatial search
 */

// Mock logger
jest.mock('~/utils/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  }),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock audit logger
jest.mock('~/utils/auditLogger', () => ({
  auditLogger: {
    logAction: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Prisma operations
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();
const mockQueryRaw = jest.fn();
const mockTransaction = jest.fn();
const mockCreateMany = jest.fn();
const mockUpdateMany = jest.fn();
const mockDeleteMany = jest.fn();
const mockProgramFindMany = jest.fn();
const mockProgramCreateMany = jest.fn();

jest.mock('~/server/db', () => ({
  db: {
    provider: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
      count: (...args: unknown[]) => mockCount(...args),
      createMany: (...args: unknown[]) => mockCreateMany(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
    program: {
      findMany: (...args: unknown[]) => mockProgramFindMany(...args),
      createMany: (...args: unknown[]) => mockProgramCreateMany(...args),
    },
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

import { ProviderRepository } from '../../repositories/provider.repository';

describe('ProviderRepository', () => {
  let repository: ProviderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ProviderRepository();

    // Default mock implementations
    mockTransaction.mockImplementation(async (fn) =>
      fn({ provider: { create: mockCreate }, program: { createMany: mockProgramCreateMany } }),
    );
  });

  describe('findByLocation', () => {
    it('should find providers by suburb', async () => {
      const mockProviders = [
        { id: 'prov-1', businessName: 'Provider 1', suburb: 'Sydney', programs: [] },
        { id: 'prov-2', businessName: 'Provider 2', suburb: 'Sydney', programs: [] },
      ];
      mockFindMany.mockResolvedValue(mockProviders);

      const result = await repository.findByLocation({
        suburb: 'Sydney',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            suburb: { contains: 'Sydney', mode: 'insensitive' },
          }),
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('should find providers by state', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findByLocation({ state: 'NSW' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            state: 'NSW',
          }),
        }),
      );
    });

    it('should combine suburb and state filters', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findByLocation({
        suburb: 'Parramatta',
        state: 'NSW',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            suburb: { contains: 'Parramatta', mode: 'insensitive' },
            state: 'NSW',
          }),
        }),
      );
    });

    it('should filter by isVetted and isPublished by default', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findByLocation({ suburb: 'Melbourne' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isVetted: true,
            isPublished: true,
          }),
        }),
      );
    });

    it('should include programs when specified', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findByLocation({
        suburb: 'Brisbane',
        includePrograms: true,
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            programs: true,
          }),
        }),
      );
    });
  });

  describe('findByCoordinates', () => {
    it('should fall back to Haversine when PostGIS unavailable', async () => {
      // Simulate PostGIS not available
      mockQueryRaw.mockRejectedValue(new Error('PostGIS not available'));

      const mockProviders = [
        { id: 'prov-1', latitude: -33.8688, longitude: 151.2093 },
        { id: 'prov-2', latitude: -33.9, longitude: 151.2 },
      ];
      mockFindMany.mockResolvedValue(mockProviders);

      const result = await repository.findByCoordinates(-33.8688, 151.2093, 10);

      expect(mockFindMany).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should filter providers outside radius using Haversine', async () => {
      mockQueryRaw.mockRejectedValue(new Error('PostGIS not available'));

      // Provider 1 is very close, Provider 2 is far
      const mockProviders = [
        { id: 'prov-1', latitude: -33.8688, longitude: 151.2093, businessName: 'Close' },
        { id: 'prov-2', latitude: -34.0, longitude: 152.0, businessName: 'Far' }, // ~90km away
      ];
      mockFindMany.mockResolvedValue(mockProviders);

      const result = await repository.findByCoordinates(-33.8688, 151.2093, 5);

      // Only the close provider should be returned
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should handle zero radius', async () => {
      mockQueryRaw.mockRejectedValue(new Error('PostGIS not available'));
      mockFindMany.mockResolvedValue([]);

      const result = await repository.findByCoordinates(-33.8688, 151.2093, 0);

      expect(result).toEqual([]);
    });

    it('should use PostGIS when available', async () => {
      const mockPostGISResult = [{ id: 'prov-1', businessName: 'PostGIS Result', distance: 500 }];
      mockQueryRaw.mockResolvedValue(mockPostGISResult);

      const result = await repository.findByCoordinates(-33.8688, 151.2093, 10);

      expect(mockQueryRaw).toHaveBeenCalled();
      // PostGIS query was used
      expect(result).toEqual(mockPostGISResult);
    });
  });

  describe('findVettedProviders', () => {
    it('should find only vetted providers', async () => {
      const vettedProviders = [{ id: 'prov-1', isVetted: true, vettingStatus: 'APPROVED' }];
      mockFindMany.mockResolvedValue(vettedProviders);

      const result = await repository.findVettedProviders();

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isVetted: true,
          }),
        }),
      );
      expect(result).toEqual(vettedProviders);
    });
  });

  describe('updateVettingStatus', () => {
    it('should update vetting status to APPROVED', async () => {
      mockFindUnique.mockResolvedValue({ id: 'prov-1', vettingStatus: 'PENDING' });
      mockUpdate.mockResolvedValue({
        id: 'prov-1',
        vettingStatus: 'APPROVED',
        isVetted: true,
        vettingDate: expect.any(Date),
      });

      const result = await repository.updateVettingStatus(
        'prov-1',
        'APPROVED',
        'Verified business credentials',
        'admin-1',
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'prov-1' },
        data: expect.objectContaining({
          vettingStatus: 'APPROVED',
          isVetted: true,
          vettingNotes: 'Verified business credentials',
          vettingDate: expect.any(Date),
        }),
      });
      expect(result.vettingStatus).toBe('APPROVED');
    });

    it('should update vetting status to REJECTED', async () => {
      mockFindUnique.mockResolvedValue({ id: 'prov-1', vettingStatus: 'PENDING' });
      mockUpdate.mockResolvedValue({
        id: 'prov-1',
        vettingStatus: 'REJECTED',
        isVetted: false,
      });

      const _result = await repository.updateVettingStatus(
        'prov-1',
        'REJECTED',
        'Missing required documentation',
        'admin-1',
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'prov-1' },
        data: expect.objectContaining({
          vettingStatus: 'REJECTED',
          isVetted: false,
        }),
      });
    });
  });

  describe('togglePublishStatus', () => {
    it('should toggle from unpublished to published', async () => {
      mockFindUnique.mockResolvedValue({ id: 'prov-1', isPublished: false });
      mockUpdate.mockResolvedValue({ id: 'prov-1', isPublished: true });

      const result = await repository.togglePublishStatus('prov-1', 'admin-1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'prov-1' },
        data: { isPublished: true },
      });
      expect(result.isPublished).toBe(true);
    });

    it('should toggle from published to unpublished', async () => {
      mockFindUnique.mockResolvedValue({ id: 'prov-1', isPublished: true });
      mockUpdate.mockResolvedValue({ id: 'prov-1', isPublished: false });

      const result = await repository.togglePublishStatus('prov-1', 'admin-1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'prov-1' },
        data: { isPublished: false },
      });
      expect(result.isPublished).toBe(false);
    });
  });

  describe('findWithUpcomingPrograms', () => {
    it('should find providers with programs starting in the future', async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const providersWithPrograms = [
        {
          id: 'prov-1',
          programs: [{ id: 'prog-1', startDate: futureDate, isActive: true }],
        },
      ];
      mockFindMany.mockResolvedValue(providersWithPrograms);

      const result = await repository.findWithUpcomingPrograms();

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            programs: expect.objectContaining({
              where: expect.objectContaining({
                startDate: expect.objectContaining({
                  gte: expect.any(Date),
                }),
                isActive: true,
                isPublished: true,
              }),
            }),
          }),
        }),
      );
      expect(result).toEqual(providersWithPrograms);
    });
  });

  describe('getStatistics', () => {
    it('should return provider statistics', async () => {
      mockCount
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // vetted
        .mockResolvedValueOnce(75) // published
        .mockResolvedValueOnce(60); // withPrograms

      const result = await repository.getStatistics();

      expect(result).toEqual({
        total: 100,
        vetted: 80,
        published: 75,
        withPrograms: 60,
      });
    });
  });

  describe('createWithPrograms', () => {
    it('should create provider and programs in transaction', async () => {
      const providerData = {
        businessName: 'New Provider',
        email: 'test@provider.com',
      };
      const programsData = [
        { name: 'Program 1', price: 100 },
        { name: 'Program 2', price: 200 },
      ];

      const createdProvider = { id: 'new-prov-1', ...providerData };
      const createdPrograms = programsData.map((p, i) => ({
        id: `prog-${i}`,
        ...p,
        providerId: 'new-prov-1',
      }));

      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          provider: { create: jest.fn().mockResolvedValue(createdProvider) },
          program: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        await fn(mockTx);
        return { ...createdProvider, programs: createdPrograms };
      });

      const result = await repository.createWithPrograms(providerData as any, programsData as any);

      expect(mockTransaction).toHaveBeenCalled();
      expect(result.businessName).toBe('New Provider');
    });

    it('should rollback on error', async () => {
      mockTransaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        repository.createWithPrograms({ businessName: 'Fail' } as any, []),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('search', () => {
    it('should search by keyword in business name', async () => {
      const mockProviders = [{ id: 'prov-1', businessName: 'Kids Camp Sydney' }];
      mockFindMany.mockResolvedValue(mockProviders);

      const result = await repository.search({ query: 'Kids' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                businessName: { contains: 'Kids', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
      expect(result).toEqual(mockProviders);
    });

    it('should search in description', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.search({ query: 'adventure' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                description: { contains: 'adventure', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('Bulk Operations', () => {
    describe('createMany', () => {
      it('should create multiple providers', async () => {
        mockCreateMany.mockResolvedValue({ count: 5 });

        const result = await repository.createMany([
          { businessName: 'Provider 1' },
          { businessName: 'Provider 2' },
        ] as any);

        expect(mockCreateMany).toHaveBeenCalled();
        expect(result.count).toBe(5);
      });
    });

    describe('updateMany', () => {
      it('should update multiple providers', async () => {
        mockUpdateMany.mockResolvedValue({ count: 3 });

        const result = await repository.updateMany(['prov-1', 'prov-2', 'prov-3'], {
          isPublished: true,
        });

        expect(mockUpdateMany).toHaveBeenCalledWith({
          where: { id: { in: ['prov-1', 'prov-2', 'prov-3'] } },
          data: { isPublished: true },
        });
        expect(result.count).toBe(3);
      });
    });

    describe('deleteMany', () => {
      it('should delete multiple providers', async () => {
        mockDeleteMany.mockResolvedValue({ count: 2 });

        const result = await repository.deleteMany(['prov-1', 'prov-2']);

        expect(mockDeleteMany).toHaveBeenCalledWith({
          where: { id: { in: ['prov-1', 'prov-2'] } },
        });
        expect(result.count).toBe(2);
      });
    });
  });

  describe('Haversine Distance Calculation', () => {
    it('should calculate correct distance between two points', async () => {
      // Access private method for testing
      const haversine = (repository as any).haversineDistance.bind(repository);

      // Sydney to Melbourne is approximately 713 km
      const distance = haversine(-33.8688, 151.2093, -37.8136, 144.9631);

      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(750);
    });

    it('should return 0 for same coordinates', async () => {
      const haversine = (repository as any).haversineDistance.bind(repository);

      const distance = haversine(-33.8688, 151.2093, -33.8688, 151.2093);

      expect(distance).toBe(0);
    });
  });
});
