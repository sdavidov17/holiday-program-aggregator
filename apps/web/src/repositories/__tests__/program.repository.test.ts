/**
 * Program Repository Test Suite
 * Comprehensive tests for program database operations
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import { createTestProgram, createTestProvider } from '../../__tests__/factories';
import { cleanupMockDatabase, setupMockDatabase } from '../../__tests__/setup/mock-db';
import { ProgramRepository } from '../program.repository';

describe('ProgramRepository', () => {
  let repository: ProgramRepository;
  let prisma: PrismaClient;
  let testProviderId: string;

  beforeEach(async () => {
    prisma = setupMockDatabase() as any;
    repository = new ProgramRepository(prisma);

    // Create a test provider for programs
    const provider = await prisma.provider.create({
      data: createTestProvider({
        businessName: 'Test Provider',
        suburb: 'Sydney',
        state: 'NSW',
        isVetted: true,
        isPublished: true,
      }) as any,
    });
    testProviderId = provider.id;
  });

  afterEach(async () => {
    cleanupMockDatabase();
  });

  describe('constructor', () => {
    it('should create repository with default prisma client', () => {
      const repo = new ProgramRepository();
      expect(repo).toBeDefined();
    });

    it('should create repository with custom prisma client', () => {
      const repo = new ProgramRepository(prisma);
      expect(repo).toBeDefined();
    });
  });

  describe('findByIdWithProvider', () => {
    it('should find program with provider details', async () => {
      const programData = createTestProgram({ providerId: testProviderId });
      const created = await prisma.program.create({ data: programData as any });

      const result = await repository.findByIdWithProvider(created.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.provider).toBeDefined();
      expect(result?.provider?.businessName).toBe('Test Provider');
      expect(result?.provider?.suburb).toBe('Sydney');
      expect(result?.provider?.state).toBe('NSW');
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findByIdWithProvider('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findByProviderId', () => {
    beforeEach(async () => {
      // Create test programs
      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            name: 'Program 1',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Program 2',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Unpublished Program',
            isPublished: false,
            isActive: true,
          }),
        ] as any[],
      });
    });

    it('should find all published programs for provider', async () => {
      const result = await repository.findByProviderId(testProviderId);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isPublished)).toBe(true);
    });

    it('should include unpublished when requested', async () => {
      const result = await repository.findByProviderId(testProviderId, {
        includeUnpublished: true,
      });

      expect(result).toHaveLength(3);
    });

    it('should return empty array for provider with no programs', async () => {
      const otherProvider = await prisma.provider.create({
        data: createTestProvider() as any,
      });

      const result = await repository.findByProviderId(otherProvider.id);

      expect(result).toHaveLength(0);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      const melbourne = await prisma.provider.create({
        data: createTestProvider({
          businessName: 'Melbourne Provider',
          suburb: 'Melbourne',
          state: 'VIC',
          isVetted: true,
          isPublished: true,
        }) as any,
      });

      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            name: 'Sports Camp',
            category: 'Sports',
            ageMin: 5,
            ageMax: 10,
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-20'),
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Art Workshop',
            category: 'Arts',
            ageMin: 8,
            ageMax: 12,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-05'),
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: melbourne.id,
            name: 'Science Lab',
            category: 'Educational',
            ageMin: 10,
            ageMax: 15,
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-10'),
            isPublished: true,
            isActive: true,
          }),
        ] as any[],
      });
    });

    it('should search by category', async () => {
      const result = await repository.search({ category: 'Sports' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Sports');
    });

    it('should search by age range - find overlapping programs', async () => {
      const result = await repository.search({ ageMin: 9, ageMax: 11 });

      // All three programs overlap with ages 9-11:
      // - Sports Camp (5-10): ages 9-10 overlap
      // - Art Workshop (8-12): ages 9-11 overlap
      // - Science Lab (10-15): ages 10-11 overlap
      expect(result).toHaveLength(3);
    });

    it('should search by date range', async () => {
      const result = await repository.search({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sports Camp');
    });

    it('should search by location (suburb)', async () => {
      const result = await repository.search({ suburb: 'Sydney' });

      expect(result).toHaveLength(2);
      expect(
        result.every(
          (p) => p.provider?.suburb === 'Sydney' || p.provider?.suburb?.includes('Sydney'),
        ),
      ).toBe(true);
    });

    it('should search by location (state)', async () => {
      const result = await repository.search({ state: 'VIC' });

      expect(result).toHaveLength(1);
      expect(result[0].provider?.state).toBe('VIC');
    });

    it('should filter by published status', async () => {
      // Add unpublished program
      await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          name: 'Unpublished',
          isPublished: false,
          isActive: true,
        }) as any,
      });

      const result = await repository.search({ isPublished: true });

      expect(result.every((p) => p.isPublished)).toBe(true);
    });

    it('should filter by active status', async () => {
      const result = await repository.search({ isActive: true });

      expect(result.every((p) => p.isActive)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const result = await repository.search({
        category: 'Sports',
        ageMin: 5,
        state: 'NSW',
        isPublished: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sports Camp');
    });

    it('should return empty array when no matches', async () => {
      const result = await repository.search({ category: 'NonExistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('findUpcoming', () => {
    beforeEach(async () => {
      const _now = new Date();
      const future7 = new Date();
      future7.setDate(future7.getDate() + 7);
      const future45 = new Date();
      future45.setDate(future45.getDate() + 45);
      const past = new Date();
      past.setDate(past.getDate() - 10);

      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            name: 'Next Week',
            startDate: future7,
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Next Month',
            startDate: future45,
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Past Program',
            startDate: past,
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Unpublished Future',
            startDate: future7,
            isPublished: false,
            isActive: true,
          }),
        ] as any[],
      });
    });

    it('should find programs starting within default 30 days', async () => {
      const result = await repository.findUpcoming();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Next Week');
    });

    it('should find programs within custom day range', async () => {
      const result = await repository.findUpcoming(60);

      expect(result).toHaveLength(2);
    });

    it('should respect limit parameter', async () => {
      const result = await repository.findUpcoming(60, 1);

      expect(result).toHaveLength(1);
    });

    it('should only return published and active programs', async () => {
      const result = await repository.findUpcoming(30);

      expect(result.every((p) => p.isPublished && p.isActive)).toBe(true);
    });
  });

  describe('findByCategory', () => {
    beforeEach(async () => {
      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            name: 'Sports 1',
            category: 'Sports',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Sports 2',
            category: 'Sports',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            name: 'Arts 1',
            category: 'Arts',
            isPublished: true,
            isActive: true,
          }),
        ] as any[],
      });
    });

    it('should find all programs in category', async () => {
      const result = await repository.findByCategory('Sports');

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'Sports')).toBe(true);
    });

    it('should include provider information', async () => {
      const result = await repository.findByCategory('Sports');

      expect(result[0].provider).toBeDefined();
      expect(result[0].provider?.businessName).toBe('Test Provider');
    });

    it('should return empty for non-existent category', async () => {
      const result = await repository.findByCategory('NonExistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('createProgram', () => {
    it('should create program with required fields', async () => {
      const result = await repository.createProgram({
        providerId: testProviderId,
        name: 'New Program',
        description: 'A test program',
        category: 'Sports',
        ageMin: 5,
        ageMax: 10,
        price: 150,
        location: 'Sydney',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        startTime: '09:00',
        endTime: '15:00',
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Program');
      expect(result.category).toBe('Sports');
    });

    it('should create program with daysOfWeek array', async () => {
      const result = await repository.createProgram({
        providerId: testProviderId,
        name: 'Weekly Program',
        description: 'Runs weekly',
        category: 'Arts',
        ageMin: 8,
        ageMax: 12,
        price: 200,
        location: 'Melbourne',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        startTime: '10:00',
        endTime: '14:00',
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
      });

      expect(result.daysOfWeek).toBe('["Monday","Wednesday","Friday"]');
    });

    it('should create program with optional fields', async () => {
      const result = await repository.createProgram({
        providerId: testProviderId,
        name: 'Full Program',
        description: 'Complete program',
        category: 'Educational',
        ageMin: 10,
        ageMax: 14,
        price: 250,
        location: 'Brisbane',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-05'),
        startTime: '08:00',
        endTime: '16:00',
        capacity: 20,
        enrollmentUrl: 'https://example.com/enroll',
        imageUrl: 'https://example.com/image.jpg',
        isActive: true,
        isPublished: false,
      });

      expect(result.capacity).toBe(20);
      expect(result.enrollmentUrl).toBe('https://example.com/enroll');
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.isActive).toBe(true);
      expect(result.isPublished).toBe(false);
    });
  });

  describe('updateProgram', () => {
    let programId: string;

    beforeEach(async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          name: 'Original Name',
          category: 'Sports',
        }) as any,
      });
      programId = program.id;
    });

    it('should update program name', async () => {
      const result = await repository.updateProgram(programId, {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should update daysOfWeek array', async () => {
      const result = await repository.updateProgram(programId, {
        daysOfWeek: ['Tuesday', 'Thursday'],
      });

      expect(result.daysOfWeek).toBe('["Tuesday","Thursday"]');
    });

    it('should handle partial updates', async () => {
      const original = await repository.findById(programId);

      const result = await repository.updateProgram(programId, {
        price: 999,
      });

      expect(result.price).toBe(999);
      expect(result.name).toBe(original?.name);
    });
  });

  describe('togglePublishStatus', () => {
    it('should toggle from unpublished to published', async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          isPublished: false,
        }) as any,
      });

      const result = await repository.togglePublishStatus(program.id);

      expect(result.isPublished).toBe(true);
    });

    it('should toggle from published to unpublished', async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          isPublished: true,
        }) as any,
      });

      const result = await repository.togglePublishStatus(program.id);

      expect(result.isPublished).toBe(false);
    });

    it('should throw error for non-existent program', async () => {
      await expect(repository.togglePublishStatus('non-existent')).rejects.toThrow(
        'Program not found',
      );
    });
  });

  describe('toggleActiveStatus', () => {
    it('should toggle from inactive to active', async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          isActive: false,
        }) as any,
      });

      const result = await repository.toggleActiveStatus(program.id);

      expect(result.isActive).toBe(true);
    });

    it('should toggle from active to inactive', async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          isActive: true,
        }) as any,
      });

      const result = await repository.toggleActiveStatus(program.id);

      expect(result.isActive).toBe(false);
    });

    it('should throw error for non-existent program', async () => {
      await expect(repository.toggleActiveStatus('non-existent')).rejects.toThrow(
        'Program not found',
      );
    });
  });

  describe('updateProgramStatus', () => {
    let programId: string;

    beforeEach(async () => {
      const program = await prisma.program.create({
        data: createTestProgram({
          providerId: testProviderId,
          isPublished: false,
          isActive: false,
          programStatus: 'DRAFT',
        }) as any,
      });
      programId = program.id;
    });

    it('should set status to PUBLISHED and update flags', async () => {
      const result = await repository.updateProgramStatus(programId, 'PUBLISHED');

      expect(result.programStatus).toBe('PUBLISHED');
      expect(result.isPublished).toBe(true);
      expect(result.isActive).toBe(true);
    });

    it('should set status to ARCHIVED and deactivate', async () => {
      const result = await repository.updateProgramStatus(programId, 'ARCHIVED');

      expect(result.programStatus).toBe('ARCHIVED');
      expect(result.isActive).toBe(false);
    });

    it('should set status to CANCELLED and deactivate', async () => {
      const result = await repository.updateProgramStatus(programId, 'CANCELLED');

      expect(result.programStatus).toBe('CANCELLED');
      expect(result.isActive).toBe(false);
    });

    it('should set status to DRAFT and unpublish', async () => {
      // First publish
      await repository.updateProgramStatus(programId, 'PUBLISHED');

      const result = await repository.updateProgramStatus(programId, 'DRAFT');

      expect(result.programStatus).toBe('DRAFT');
      expect(result.isPublished).toBe(false);
    });
  });

  describe('getProviderStats', () => {
    beforeEach(async () => {
      const _now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const past = new Date();
      past.setDate(past.getDate() - 10);

      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            isPublished: true,
            isActive: true,
            startDate: future,
          }),
          createTestProgram({
            providerId: testProviderId,
            isPublished: true,
            isActive: true,
            startDate: past,
          }),
          createTestProgram({
            providerId: testProviderId,
            isPublished: false,
            isActive: true,
            startDate: future,
          }),
          createTestProgram({
            providerId: testProviderId,
            isPublished: true,
            isActive: false,
            startDate: future,
          }),
        ] as any[],
      });
    });

    it('should return correct stats', async () => {
      const stats = await repository.getProviderStats(testProviderId);

      expect(stats.total).toBe(4);
      expect(stats.published).toBe(3);
      expect(stats.active).toBe(3);
      expect(stats.upcoming).toBe(2); // Active programs with future start date
    });

    it('should return zeros for provider with no programs', async () => {
      const newProvider = await prisma.provider.create({
        data: createTestProvider() as any,
      });

      const stats = await repository.getProviderStats(newProvider.id);

      expect(stats.total).toBe(0);
      expect(stats.published).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.upcoming).toBe(0);
    });
  });

  describe('getCategories', () => {
    beforeEach(async () => {
      await prisma.program.createMany({
        data: [
          createTestProgram({
            providerId: testProviderId,
            category: 'Sports',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            category: 'Arts',
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            category: 'Sports', // Duplicate
            isPublished: true,
            isActive: true,
          }),
          createTestProgram({
            providerId: testProviderId,
            category: 'Educational',
            isPublished: false, // Not published
            isActive: true,
          }),
        ] as any[],
      });
    });

    it('should return unique categories', async () => {
      const categories = await repository.getCategories();

      expect(categories).toHaveLength(2); // Only published: Sports, Arts
      expect(categories).toContain('Sports');
      expect(categories).toContain('Arts');
    });

    it('should return sorted categories', async () => {
      const categories = await repository.getCategories();

      expect(categories[0]).toBe('Arts');
      expect(categories[1]).toBe('Sports');
    });
  });

  describe('bulkUpdateByProvider', () => {
    beforeEach(async () => {
      await prisma.program.createMany({
        data: [
          createTestProgram({ providerId: testProviderId, isActive: true }),
          createTestProgram({ providerId: testProviderId, isActive: true }),
          createTestProgram({ providerId: testProviderId, isActive: true }),
        ] as any[],
      });
    });

    it('should update all programs for provider', async () => {
      const count = await repository.bulkUpdateByProvider(testProviderId, {
        isActive: false,
      });

      expect(count).toBe(3);

      const programs = await repository.findByProviderId(testProviderId, {
        includeUnpublished: true,
      });
      expect(programs.every((p) => p.isActive === false)).toBe(true);
    });
  });

  describe('deleteByProviderId', () => {
    beforeEach(async () => {
      await prisma.program.createMany({
        data: [
          createTestProgram({ providerId: testProviderId }),
          createTestProgram({ providerId: testProviderId }),
        ] as any[],
      });
    });

    it('should delete all programs for provider', async () => {
      const count = await repository.deleteByProviderId(testProviderId);

      expect(count).toBe(2);

      const remaining = await prisma.program.count({
        where: { providerId: testProviderId },
      });
      expect(remaining).toBe(0);
    });
  });
});
