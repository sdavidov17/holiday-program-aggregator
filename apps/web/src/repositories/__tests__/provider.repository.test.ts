/**
 * Provider Repository Test Suite
 * Tests for data persistence layer and complex queries
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import {
  createProviderWithPrograms,
  createTestProgram,
  createTestProvider,
} from '../../__tests__/factories';
import { cleanupMockDatabase, setupMockDatabase } from '../../__tests__/setup/mock-db';
import { ProviderRepository } from '../provider.repository';

describe('ProviderRepository', () => {
  let repository: ProviderRepository;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = setupMockDatabase() as any;
    repository = new ProviderRepository(prisma);
  });

  afterEach(async () => {
    cleanupMockDatabase();
  });

  describe('create', () => {
    it('should create a new provider', async () => {
      const providerData = createTestProvider();

      const result = await repository.create(providerData);

      expect(result).toMatchObject({
        businessName: providerData.businessName,
        email: providerData.email,
        isVetted: providerData.isVetted,
        isPublished: providerData.isPublished,
      });
      expect(result.id).toBeDefined();
    });

    it('should handle duplicate email gracefully', async () => {
      const providerData = createTestProvider({ email: 'duplicate@test.com' });

      await repository.create(providerData);

      await expect(repository.create(providerData)).rejects.toThrow();
    });

    it('should create provider with programs', async () => {
      const { provider, programs } = createProviderWithPrograms(3);

      const result = await repository.createWithPrograms(provider, programs);

      expect(result.id).toBeDefined();
      expect(result.programs).toHaveLength(3);
      expect(result.programs[0].providerId).toBe(result.id);
    });

    it('should rollback on partial failure', async () => {
      const { provider, programs } = createProviderWithPrograms(3);
      // Make one program invalid
      programs[1].name = null as any; // Invalid data

      await expect(repository.createWithPrograms(provider, programs)).rejects.toThrow();

      // Verify nothing was created
      const count = await prisma.provider.count();
      expect(count).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find provider by id', async () => {
      const created = await prisma.provider.create({
        data: createTestProvider() as any,
      });

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        businessName: created.businessName,
      });
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should include programs when requested', async () => {
      const providerData = createTestProvider();
      const created = await prisma.provider.create({
        data: providerData as any,
      });

      const program = createTestProgram({ providerId: created.id });
      await prisma.program.create({
        data: program as any,
      });

      const result = await repository.findById(created.id, { programs: true });

      expect(result?.programs).toHaveLength(1);
      expect(result?.programs[0].providerId).toBe(created.id);
    });
  });

  describe('findMany', () => {
    beforeEach(async () => {
      // Create test data
      await prisma.provider.createMany({
        data: [
          createTestProvider({
            businessName: 'Active Provider',
            isPublished: true,
            isVetted: true,
          }),
          createTestProvider({
            businessName: 'Unpublished Provider',
            isPublished: false,
            isVetted: true,
          }),
          createTestProvider({
            businessName: 'Unvetted Provider',
            isPublished: true,
            isVetted: false,
          }),
          createTestProvider({
            businessName: 'Inactive Provider',
            isPublished: false,
            isVetted: false,
          }),
        ] as any[],
      });
    });

    it('should find all providers', async () => {
      const result = await repository.findMany();

      expect(result).toHaveLength(4);
    });

    it('should filter by published status', async () => {
      const result = await repository.findMany({ isPublished: true });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isPublished)).toBe(true);
    });

    it('should filter by vetted status', async () => {
      const result = await repository.findMany({ isVetted: true });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isVetted)).toBe(true);
    });

    it('should filter by both published and vetted', async () => {
      const result = await repository.findMany({
        isPublished: true,
        isVetted: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Active Provider');
    });

    it('should paginate results', async () => {
      const page1 = await repository.findMany({ skip: 0, take: 2 });
      const page2 = await repository.findMany({ skip: 2, take: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('should order results', async () => {
      const result = await repository.findMany({
        orderBy: { businessName: 'asc' },
      });

      expect(result[0].businessName).toBe('Active Provider');
      expect(result[3].businessName).toBe('Unvetted Provider');
    });
  });

  describe('update', () => {
    let providerId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: createTestProvider() as any,
      });
      providerId = created.id;
    });

    it('should update provider', async () => {
      const result = await repository.update(providerId, {
        businessName: 'Updated Name',
        isVetted: true,
        vettingDate: new Date(),
      });

      expect(result.businessName).toBe('Updated Name');
      expect(result.isVetted).toBe(true);
      expect(result.vettingDate).toBeDefined();
    });

    it('should throw error for non-existent provider', async () => {
      await expect(repository.update('non-existent', { businessName: 'Test' })).rejects.toThrow();
    });

    it('should handle partial updates', async () => {
      const original = await repository.findById(providerId);

      const result = await repository.update(providerId, {
        isPublished: true,
      });

      expect(result.isPublished).toBe(true);
      expect(result.businessName).toBe(original?.businessName);
    });
  });

  describe('delete', () => {
    let providerId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: createTestProvider() as any,
      });
      providerId = created.id;
    });

    it('should delete provider', async () => {
      await repository.delete(providerId);

      const result = await repository.findById(providerId);
      expect(result).toBeNull();
    });

    it('should cascade delete programs', async () => {
      const program = createTestProgram({ providerId });
      await prisma.program.create({
        data: program as any,
      });

      await repository.delete(providerId);

      const programCount = await prisma.program.count({
        where: { providerId },
      });
      expect(programCount).toBe(0);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(repository.delete('non-existent')).rejects.toThrow();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await prisma.provider.createMany({
        data: [
          createTestProvider({
            businessName: 'Sydney Sports Academy',
            suburb: 'Sydney',
            state: 'NSW',
            description: 'Sports programs for kids',
            isPublished: true,
            isVetted: true,
          }),
          createTestProvider({
            businessName: 'Melbourne Arts Studio',
            suburb: 'Melbourne',
            state: 'VIC',
            description: 'Creative arts and crafts',
            isPublished: true,
            isVetted: true,
          }),
          createTestProvider({
            businessName: 'Brisbane Science Lab',
            suburb: 'Brisbane',
            state: 'QLD',
            description: 'STEM education programs',
            isPublished: true,
            isVetted: true,
          }),
        ] as any[],
      });
    });

    it('should search by name', async () => {
      const result = await repository.search({ query: 'Sports' });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toContain('Sports');
    });

    it('should search by description', async () => {
      const result = await repository.search({ query: 'arts' });

      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('arts');
    });

    it('should search by location', async () => {
      const result = await repository.search({
        suburb: 'Sydney',
        state: 'NSW',
      });

      expect(result).toHaveLength(1);
      expect(result[0].suburb).toBe('Sydney');
    });

    it('should combine search criteria', async () => {
      const result = await repository.search({
        query: 'Academy',
        state: 'NSW',
      });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Sydney Sports Academy');
    });

    it('should return empty array for no matches', async () => {
      const result = await repository.search({ query: 'NonExistent' });

      expect(result).toHaveLength(0);
    });

    it('should only return published and vetted by default', async () => {
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Unpublished Provider',
          isPublished: false,
          isVetted: true,
        }) as any,
      });

      const result = await repository.search({});

      expect(result.every((p) => p.isPublished && p.isVetted)).toBe(true);
    });
  });

  describe('transaction handling', () => {
    it('should execute multiple operations in transaction', async () => {
      await prisma.$transaction(async (tx) => {
        const repo = new ProviderRepository(tx);

        const provider1 = await repo.create(createTestProvider());
        const provider2 = await repo.create(createTestProvider());

        await repo.update(provider1.id, { isPublished: true });
        await repo.delete(provider2.id);

        const remaining = await repo.findMany();
        expect(remaining).toHaveLength(1);
      });

      // In mock, transaction doesn't actually rollback
      // This test mainly verifies the operations work within transaction context
    });

    it('should handle transaction errors', async () => {
      await expect(
        prisma.$transaction(async (tx) => {
          const repo = new ProviderRepository(tx);

          await repo.create(createTestProvider());

          // Force an error
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');
    });
  });

  describe('bulk operations', () => {
    it('should create multiple providers', async () => {
      const providers = Array.from({ length: 5 }, () => createTestProvider());

      const result = await repository.createMany(providers);

      expect(result.count).toBe(5);

      const allProviders = await repository.findMany();
      expect(allProviders).toHaveLength(5);
    });

    it('should update multiple providers', async () => {
      const providers = Array.from({ length: 3 }, () => createTestProvider());
      await repository.createMany(providers);

      const toUpdate = await repository.findMany();
      const ids = toUpdate.map((p) => p.id);

      const result = await repository.updateMany(ids, { isPublished: true });

      expect(result.count).toBe(3);

      const updated = await repository.findMany();
      expect(updated.every((p) => p.isPublished)).toBe(true);
    });

    it('should delete multiple providers', async () => {
      const providers = Array.from({ length: 4 }, () => createTestProvider());
      await repository.createMany(providers);

      const toDelete = await repository.findMany({ take: 2 });
      const ids = toDelete.map((p) => p.id);

      const result = await repository.deleteMany(ids);

      expect(result.count).toBe(2);

      const remaining = await repository.findMany();
      expect(remaining).toHaveLength(2);
    });
  });

  describe('findByIdWithPrograms', () => {
    it('should find provider with programs included', async () => {
      const providerData = createTestProvider({ isVetted: true, isPublished: true });
      const created = await prisma.provider.create({
        data: providerData as any,
      });

      const program1 = createTestProgram({ providerId: created.id, name: 'Program 1' });
      const program2 = createTestProgram({ providerId: created.id, name: 'Program 2' });
      await prisma.program.create({ data: program1 as any });
      await prisma.program.create({ data: program2 as any });

      const result = await repository.findByIdWithPrograms(created.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(created.id);
      expect(result?.programs).toHaveLength(2);
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findByIdWithPrograms('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findManyWithPrograms', () => {
    it('should find all providers with programs included', async () => {
      const provider1 = await prisma.provider.create({
        data: createTestProvider({ businessName: 'Provider 1' }) as any,
      });
      const provider2 = await prisma.provider.create({
        data: createTestProvider({ businessName: 'Provider 2' }) as any,
      });

      await prisma.program.create({
        data: createTestProgram({ providerId: provider1.id }) as any,
      });
      await prisma.program.create({
        data: createTestProgram({ providerId: provider2.id }) as any,
      });

      const result = await repository.findManyWithPrograms();

      expect(result).toHaveLength(2);
      expect(result[0].programs).toBeDefined();
      expect(result[1].programs).toBeDefined();
    });

    it('should apply options while including programs', async () => {
      await prisma.provider.create({
        data: createTestProvider({ businessName: 'Published', isPublished: true }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({ businessName: 'Unpublished', isPublished: false }) as any,
      });

      const result = await repository.findManyWithPrograms({ where: { isPublished: true } });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Published');
    });
  });

  describe('findByLocation', () => {
    beforeEach(async () => {
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Sydney Provider',
          suburb: 'Bondi',
          state: 'NSW',
          isPublished: true,
          isVetted: true,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Melbourne Provider',
          suburb: 'St Kilda',
          state: 'VIC',
          isPublished: true,
          isVetted: true,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Unpublished Sydney',
          suburb: 'Bondi',
          state: 'NSW',
          isPublished: false,
          isVetted: true,
        }) as any,
      });
    });

    it('should find providers by suburb', async () => {
      const result = await repository.findByLocation({ suburb: 'Bondi' });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Sydney Provider');
    });

    it('should find providers by state', async () => {
      const result = await repository.findByLocation({ state: 'VIC' });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Melbourne Provider');
    });

    it('should filter by published and vetted by default', async () => {
      const result = await repository.findByLocation({});

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isPublished && p.isVetted)).toBe(true);
    });

    it('should allow overriding isPublished filter', async () => {
      const result = await repository.findByLocation({ isPublished: false });

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Unpublished Sydney');
    });

    it('should include only active published programs', async () => {
      const provider = await prisma.provider.findFirst({
        where: { businessName: 'Sydney Provider' },
      });

      await prisma.program.create({
        data: createTestProgram({
          providerId: provider!.id,
          isActive: true,
          isPublished: true,
          name: 'Active Program',
        }) as any,
      });
      await prisma.program.create({
        data: createTestProgram({
          providerId: provider!.id,
          isActive: false,
          isPublished: true,
          name: 'Inactive Program',
        }) as any,
      });

      const result = await repository.findByLocation({ suburb: 'Bondi' });

      expect(result[0].programs).toHaveLength(1);
      expect(result[0].programs[0].name).toBe('Active Program');
    });
  });

  describe('findVettedProviders', () => {
    beforeEach(async () => {
      const vettingDate1 = new Date('2024-01-15');
      const vettingDate2 = new Date('2024-01-20');

      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Vetted Early',
          isVetted: true,
          isPublished: true,
          vettingDate: vettingDate1,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Vetted Late',
          isVetted: true,
          isPublished: true,
          vettingDate: vettingDate2,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Not Vetted',
          isVetted: false,
          isPublished: true,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Not Published',
          isVetted: true,
          isPublished: false,
        }) as any,
      });
    });

    it('should return only vetted and published providers', async () => {
      const result = await repository.findVettedProviders();

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isVetted && p.isPublished)).toBe(true);
    });

    it('should order by vetting date descending', async () => {
      const result = await repository.findVettedProviders();

      expect(result[0].businessName).toBe('Vetted Late');
      expect(result[1].businessName).toBe('Vetted Early');
    });
  });

  describe('updateVettingStatus', () => {
    let providerId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: createTestProvider({
          isVetted: false,
          vettingStatus: 'NOT_STARTED',
        }) as any,
      });
      providerId = created.id;
    });

    it('should approve provider vetting', async () => {
      const result = await repository.updateVettingStatus(
        providerId,
        'APPROVED',
        'Meets all requirements',
        'admin-user-1',
      );

      expect(result.isVetted).toBe(true);
      expect(result.vettingStatus).toBe('APPROVED');
      expect(result.vettingNotes).toBe('Meets all requirements');
      expect(result.vettingDate).toBeDefined();
    });

    it('should reject provider vetting', async () => {
      const result = await repository.updateVettingStatus(
        providerId,
        'REJECTED',
        'Missing documentation',
        'admin-user-1',
      );

      expect(result.isVetted).toBe(false);
      expect(result.vettingStatus).toBe('REJECTED');
      expect(result.vettingNotes).toBe('Missing documentation');
    });
  });

  describe('togglePublishStatus', () => {
    it('should unpublish a published vetted provider', async () => {
      const created = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      const result = await repository.togglePublishStatus(created.id, 'user-1');

      expect(result.isPublished).toBe(false);
    });

    it('should publish an unpublished vetted provider', async () => {
      const created = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          isPublished: false,
        }) as any,
      });

      const result = await repository.togglePublishStatus(created.id, 'user-1');

      expect(result.isPublished).toBe(true);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(repository.togglePublishStatus('non-existent', 'user-1')).rejects.toThrow(
        'Provider not found',
      );
    });

    it('should throw error when trying to publish unvetted provider', async () => {
      const created = await prisma.provider.create({
        data: createTestProvider({
          isVetted: false,
          isPublished: false,
        }) as any,
      });

      await expect(repository.togglePublishStatus(created.id, 'user-1')).rejects.toThrow(
        'Provider must be vetted before publishing',
      );
    });
  });

  describe('findWithUpcomingPrograms', () => {
    it('should find providers with upcoming programs', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const provider1 = await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Has Future Programs',
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      const provider2 = await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Only Past Programs',
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      // Future program
      await prisma.program.create({
        data: createTestProgram({
          providerId: provider1.id,
          startDate: futureDate,
          isActive: true,
          isPublished: true,
        }) as any,
      });

      // Past program
      await prisma.program.create({
        data: createTestProgram({
          providerId: provider2.id,
          startDate: pastDate,
          isActive: true,
          isPublished: true,
        }) as any,
      });

      const result = await repository.findWithUpcomingPrograms();

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toBe('Has Future Programs');
      expect(result[0].programs).toHaveLength(1);
    });

    it('should exclude inactive programs', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const provider = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      await prisma.program.create({
        data: createTestProgram({
          providerId: provider.id,
          startDate: futureDate,
          isActive: false,
          isPublished: true,
        }) as any,
      });

      const result = await repository.findWithUpcomingPrograms();

      expect(result).toHaveLength(0);
    });

    it('should exclude unpublished programs', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const provider = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      await prisma.program.create({
        data: createTestProgram({
          providerId: provider.id,
          startDate: futureDate,
          isActive: true,
          isPublished: false,
        }) as any,
      });

      const result = await repository.findWithUpcomingPrograms();

      expect(result).toHaveLength(0);
    });

    it('should order programs by start date', async () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 3);

      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 10);

      const provider = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      await prisma.program.create({
        data: createTestProgram({
          providerId: provider.id,
          name: 'Far Future',
          startDate: farFuture,
          isActive: true,
          isPublished: true,
        }) as any,
      });

      await prisma.program.create({
        data: createTestProgram({
          providerId: provider.id,
          name: 'Near Future',
          startDate: nearFuture,
          isActive: true,
          isPublished: true,
        }) as any,
      });

      const result = await repository.findWithUpcomingPrograms();

      expect(result[0].programs[0].name).toBe('Near Future');
      expect(result[0].programs[1].name).toBe('Far Future');
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Create providers with various states
      const p1 = await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Vetted Published With Programs',
          isVetted: true,
          isPublished: true,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Vetted Published No Programs',
          isVetted: true,
          isPublished: true,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Vetted Unpublished',
          isVetted: true,
          isPublished: false,
        }) as any,
      });
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Not Vetted',
          isVetted: false,
          isPublished: false,
        }) as any,
      });

      // Add active program to first provider
      await prisma.program.create({
        data: createTestProgram({
          providerId: p1.id,
          isActive: true,
        }) as any,
      });
    });

    it('should return correct statistics', async () => {
      const stats = await repository.getStatistics();

      expect(stats.total).toBe(4);
      expect(stats.vetted).toBe(3);
      expect(stats.published).toBe(2);
      expect(stats.withPrograms).toBe(1);
    });
  });

  describe('searchByKeyword', () => {
    beforeEach(async () => {
      await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Summer Camp Adventures',
          isVetted: true,
          isPublished: true,
        }) as any,
      });
    });

    it('should delegate to search method', async () => {
      const result = await repository.searchByKeyword('Summer');

      expect(result).toHaveLength(1);
      expect(result[0].businessName).toContain('Summer');
    });
  });

  describe('createProvider', () => {
    it('should create provider with ageGroups as JSON', async () => {
      const result = await repository.createProvider(
        {
          businessName: 'New Provider',
          email: 'new@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          ageGroups: ['5-8', '9-12'],
        },
        'user-1',
      );

      expect(result.businessName).toBe('New Provider');
      expect(result.ageGroups).toBe(JSON.stringify(['5-8', '9-12']));
      expect(result.vettingStatus).toBe('NOT_STARTED');
    });

    it('should set vetting status and date when isVetted is true', async () => {
      const result = await repository.createProvider(
        {
          businessName: 'Pre-approved Provider',
          email: 'approved@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          isVetted: true,
        },
        'admin-1',
      );

      expect(result.isVetted).toBe(true);
      expect(result.vettingStatus).toBe('APPROVED');
      expect(result.vettingDate).toBeDefined();
    });

    it('should handle empty ageGroups', async () => {
      const result = await repository.createProvider(
        {
          businessName: 'No Age Groups',
          email: 'noage@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        },
        'user-1',
      );

      expect(result.ageGroups).toBe('[]');
    });
  });

  describe('updateProvider', () => {
    let providerId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: createTestProvider({
          ageGroups: JSON.stringify(['5-8']),
          isVetted: false,
        }) as any,
      });
      providerId = created.id;
    });

    it('should update ageGroups as JSON', async () => {
      const result = await repository.updateProvider(
        providerId,
        {
          ageGroups: ['9-12', '13-16'],
        },
        'user-1',
      );

      expect(result.ageGroups).toBe(JSON.stringify(['9-12', '13-16']));
    });

    it('should update vetting status when isVetted changes to true', async () => {
      const result = await repository.updateProvider(
        providerId,
        {
          isVetted: true,
        },
        'admin-1',
      );

      expect(result.isVetted).toBe(true);
      expect(result.vettingStatus).toBe('APPROVED');
      expect(result.vettingDate).toBeDefined();
    });

    it('should update vetting status when isVetted changes to false', async () => {
      // First vet the provider
      await repository.updateProvider(providerId, { isVetted: true }, 'admin-1');

      // Then unvet
      const result = await repository.updateProvider(
        providerId,
        {
          isVetted: false,
        },
        'admin-1',
      );

      expect(result.isVetted).toBe(false);
      expect(result.vettingStatus).toBe('NOT_STARTED');
      expect(result.vettingDate).toBeNull();
    });

    it('should not change vetting status if isVetted stays the same', async () => {
      // Create a vetted provider with specific vetting date
      const vettedProvider = await prisma.provider.create({
        data: createTestProvider({
          isVetted: true,
          vettingStatus: 'APPROVED',
          vettingDate: new Date('2024-01-01'),
        }) as any,
      });

      const result = await repository.updateProvider(
        vettedProvider.id,
        {
          businessName: 'Updated Name',
          isVetted: true, // Same as current
        },
        'user-1',
      );

      expect(result.businessName).toBe('Updated Name');
      // Vetting date should remain unchanged
      expect(result.vettingDate?.toISOString()).toBe(new Date('2024-01-01').toISOString());
    });

    it('should handle null ageGroups', async () => {
      const result = await repository.updateProvider(
        providerId,
        {
          ageGroups: null,
        },
        'user-1',
      );

      expect(result.ageGroups).toBe('[]');
    });
  });
});
