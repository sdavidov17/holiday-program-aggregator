/**
 * Provider Repository Test Suite
 * Tests for data persistence layer and complex queries
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProviderRepository } from '../provider.repository';
import { PrismaClient } from '@prisma/client';
import {
  createTestProvider,
  createTestProgram,
  createProviderWithPrograms,
} from '../../__tests__/factories';
import { 
  setupMockDatabase, 
  cleanupMockDatabase
} from '../../__tests__/setup/mock-db';

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
      
      await expect(
        repository.create(providerData)
      ).rejects.toThrow();
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

      await expect(
        repository.createWithPrograms(provider, programs)
      ).rejects.toThrow();

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
            isVetted: true 
          }),
          createTestProvider({ 
            businessName: 'Unpublished Provider',
            isPublished: false, 
            isVetted: true 
          }),
          createTestProvider({ 
            businessName: 'Unvetted Provider',
            isPublished: true, 
            isVetted: false 
          }),
          createTestProvider({ 
            businessName: 'Inactive Provider',
            isPublished: false, 
            isVetted: false 
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
      expect(result.every(p => p.isPublished)).toBe(true);
    });

    it('should filter by vetted status', async () => {
      const result = await repository.findMany({ isVetted: true });

      expect(result).toHaveLength(2);
      expect(result.every(p => p.isVetted)).toBe(true);
    });

    it('should filter by both published and vetted', async () => {
      const result = await repository.findMany({ 
        isPublished: true, 
        isVetted: true 
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
        orderBy: { businessName: 'asc' } 
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
      await expect(
        repository.update('non-existent', { businessName: 'Test' })
      ).rejects.toThrow();
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
      await expect(
        repository.delete('non-existent')
      ).rejects.toThrow();
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

      expect(result.every(p => p.isPublished && p.isVetted)).toBe(true);
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
        })
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
      const ids = toUpdate.map(p => p.id);
      
      const result = await repository.updateMany(ids, { isPublished: true });

      expect(result.count).toBe(3);
      
      const updated = await repository.findMany();
      expect(updated.every(p => p.isPublished)).toBe(true);
    });

    it('should delete multiple providers', async () => {
      const providers = Array.from({ length: 4 }, () => createTestProvider());
      await repository.createMany(providers);
      
      const toDelete = await repository.findMany({ take: 2 });
      const ids = toDelete.map(p => p.id);
      
      const result = await repository.deleteMany(ids);

      expect(result.count).toBe(2);
      
      const remaining = await repository.findMany();
      expect(remaining).toHaveLength(2);
    });
  });
});