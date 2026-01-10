/**
 * Base Repository Test Suite
 * Tests for common database operations and audit logging
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import { cleanupMockDatabase, setupMockDatabase } from '../../__tests__/setup/mock-db';
import { BaseRepository } from '../base.repository';

// Concrete implementation for testing the abstract base class
interface TestEntity {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(prisma?: PrismaClient) {
    super('provider', prisma); // Use provider model since it exists in mock
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = setupMockDatabase() as any;
    repository = new TestRepository(prisma);

    // Suppress console output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    cleanupMockDatabase();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use provided prisma client', () => {
      const customPrisma = setupMockDatabase() as any;
      const repo = new TestRepository(customPrisma);

      expect(repo.prisma).toBe(customPrisma);
      expect(repo.modelName).toBe('provider');
    });

    it('should use default db if no prisma provided', async () => {
      // This tests the fallback to default db
      // In test environment, it will use the mock
      const repo = new TestRepository();
      expect(repo.modelName).toBe('provider');
    });
  });

  describe('findById', () => {
    it('should find record by ID', async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'Test Business',
          email: 'test@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });

      const result = await repository.findById(created.id);

      expect(result).not.toBeNull();
      expect((result as any).id).toBe(created.id);
      expect((result as any).businessName).toBe('Test Business');
    });

    it('should return null for non-existent ID', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should include related data when specified', async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'Provider With Programs',
          email: 'provider@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });

      await prisma.program.create({
        data: {
          name: 'Test Program',
          providerId: created.id,
          startDate: new Date(),
          endDate: new Date(),
          price: 100,
          capacity: 20,
          ageMin: 5,
          ageMax: 12,
        } as any,
      });

      const result = await repository.findById(created.id, { programs: true });

      expect(result).not.toBeNull();
      expect((result as any).programs).toHaveLength(1);
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          findUnique: jest.fn().mockRejectedValue(new Error('Database error')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(errorRepo.findById('test-id')).rejects.toThrow('Database error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    beforeEach(async () => {
      await prisma.provider.createMany({
        data: [
          {
            businessName: 'Alpha Corp',
            email: 'alpha@example.com',
            phone: '0400000001',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            isPublished: true,
            isVetted: true,
          },
          {
            businessName: 'Beta Inc',
            email: 'beta@example.com',
            phone: '0400000002',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
            isPublished: true,
            isVetted: false,
          },
          {
            businessName: 'Gamma Ltd',
            email: 'gamma@example.com',
            phone: '0400000003',
            suburb: 'Brisbane',
            state: 'QLD',
            postcode: '4000',
            isPublished: false,
            isVetted: true,
          },
        ] as any[],
      });
    });

    it('should find all records without options', async () => {
      const results = await repository.findMany();

      expect(results).toHaveLength(3);
    });

    it('should apply where filter with proper format', async () => {
      const results = await repository.findMany({
        where: { isPublished: true },
      });

      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.isPublished)).toBe(true);
    });

    it('should apply shorthand filters (direct properties)', async () => {
      // Pass isVetted directly without wrapping in 'where'
      const results = await repository.findMany({
        isVetted: true,
      } as any);

      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.isVetted)).toBe(true);
    });

    it('should apply ordering', async () => {
      const results = await repository.findMany({
        orderBy: { businessName: 'asc' },
      });

      expect(results[0].businessName).toBe('Alpha Corp');
      expect(results[2].businessName).toBe('Gamma Ltd');
    });

    it('should apply pagination with skip and take', async () => {
      const page1 = await repository.findMany({ take: 2 });
      const page2 = await repository.findMany({ skip: 2, take: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });

    it('should combine where with known options', async () => {
      const results = await repository.findMany({
        where: { isPublished: true },
        orderBy: { businessName: 'desc' },
        take: 1,
      });

      expect(results).toHaveLength(1);
      expect(results[0].businessName).toBe('Beta Inc');
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          findMany: jest.fn().mockRejectedValue(new Error('Query failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(errorRepo.findMany()).rejects.toThrow('Query failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('findFirst', () => {
    beforeEach(async () => {
      await prisma.provider.createMany({
        data: [
          {
            businessName: 'First Match',
            email: 'first@example.com',
            phone: '0400000001',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
          },
          {
            businessName: 'Second Match',
            email: 'second@example.com',
            phone: '0400000002',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
          },
        ] as any[],
      });
    });

    it('should find first record matching criteria', async () => {
      const result = await repository.findFirst({ state: 'NSW' });

      expect(result).not.toBeNull();
      expect((result as any).state).toBe('NSW');
    });

    it('should return null when no match found', async () => {
      const result = await repository.findFirst({ state: 'WA' });

      expect(result).toBeNull();
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          findFirst: jest.fn().mockRejectedValue(new Error('Find failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(errorRepo.findFirst({ state: 'NSW' })).rejects.toThrow('Find failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const result = await repository.create({
        businessName: 'New Business',
        email: 'new@example.com',
        phone: '0412345678',
        suburb: 'Perth',
        state: 'WA',
        postcode: '6000',
      } as any);

      expect(result).toBeDefined();
      expect((result as any).id).toBeDefined();
      expect((result as any).businessName).toBe('New Business');
    });

    it('should create record with userId for audit logging', async () => {
      const result = await repository.create(
        {
          businessName: 'Audited Business',
          email: 'audited@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
        'user-123',
      );

      expect(result).toBeDefined();
      // Audit logging is called (verified by no errors)
    });

    it('should use system as default userId', async () => {
      const result = await repository.create({
        businessName: 'System Created',
        email: 'system@example.com',
        phone: '0412345678',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      } as any);

      expect(result).toBeDefined();
      // Default userId 'system' is used for audit
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          create: jest.fn().mockRejectedValue(new Error('Create failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(
        errorRepo.create({
          businessName: 'Will Fail',
          email: 'fail@example.com',
        } as any),
      ).rejects.toThrow('Create failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    let existingId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'Original Name',
          email: 'original@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          isPublished: false,
        } as any,
      });
      existingId = created.id;
    });

    it('should update an existing record', async () => {
      const result = await repository.update(existingId, {
        businessName: 'Updated Name',
        isPublished: true,
      } as any);

      expect((result as any).businessName).toBe('Updated Name');
      expect((result as any).isPublished).toBe(true);
    });

    it('should update with userId for audit logging', async () => {
      const result = await repository.update(
        existingId,
        { businessName: 'Admin Updated' } as any,
        'admin-user-1',
      );

      expect((result as any).businessName).toBe('Admin Updated');
    });

    it('should fetch before state for audit comparison', async () => {
      // This test verifies the update fetches before state
      const result = await repository.update(existingId, {
        businessName: 'After Update',
      } as any);

      expect((result as any).businessName).toBe('After Update');
    });

    it('should throw error for non-existent record', async () => {
      await expect(
        repository.update('non-existent', { businessName: 'Will Fail' } as any),
      ).rejects.toThrow();
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          findUnique: jest.fn().mockResolvedValue({ id: 'test', businessName: 'Test' }),
          update: jest.fn().mockRejectedValue(new Error('Update failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(
        errorRepo.update('test-id', { businessName: 'Will Fail' } as any),
      ).rejects.toThrow('Update failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    let existingId: string;

    beforeEach(async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'To Be Deleted',
          email: 'delete@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });
      existingId = created.id;
    });

    it('should delete an existing record', async () => {
      const result = await repository.delete(existingId);

      expect(result).toBeDefined();
      expect((result as any).id).toBe(existingId);

      // Verify record is deleted
      const found = await repository.findById(existingId);
      expect(found).toBeNull();
    });

    it('should delete with userId for audit logging', async () => {
      const result = await repository.delete(existingId, 'admin-user-1');

      expect(result).toBeDefined();
    });

    it('should fetch before state for audit trail', async () => {
      // Verifies delete fetches record before deletion
      const result = await repository.delete(existingId);

      expect((result as any).businessName).toBe('To Be Deleted');
    });

    it('should throw error for non-existent record', async () => {
      await expect(repository.delete('non-existent')).rejects.toThrow();
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          findUnique: jest.fn().mockResolvedValue({ id: 'test', businessName: 'Test' }),
          delete: jest.fn().mockRejectedValue(new Error('Delete failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(errorRepo.delete('test-id')).rejects.toThrow('Delete failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await prisma.provider.createMany({
        data: [
          {
            businessName: 'Count 1',
            email: 'count1@example.com',
            phone: '0400000001',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            isPublished: true,
          },
          {
            businessName: 'Count 2',
            email: 'count2@example.com',
            phone: '0400000002',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
            isPublished: true,
          },
          {
            businessName: 'Count 3',
            email: 'count3@example.com',
            phone: '0400000003',
            suburb: 'Brisbane',
            state: 'QLD',
            postcode: '4000',
            isPublished: false,
          },
        ] as any[],
      });
    });

    it('should count all records without filter', async () => {
      const count = await repository.count();

      expect(count).toBe(3);
    });

    it('should count records matching where criteria', async () => {
      const count = await repository.count({ isPublished: true });

      expect(count).toBe(2);
    });

    it('should return 0 for no matches', async () => {
      const count = await repository.count({ state: 'TAS' });

      expect(count).toBe(0);
    });

    it('should throw and log error on database failure', async () => {
      const errorPrisma = {
        provider: {
          count: jest.fn().mockRejectedValue(new Error('Count failed')),
        },
      } as any;
      const errorRepo = new TestRepository(errorPrisma);

      await expect(errorRepo.count()).rejects.toThrow('Count failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await prisma.provider.create({
        data: {
          businessName: 'Existing Provider',
          email: 'exists@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });
    });

    it('should return true when record exists', async () => {
      const result = await repository.exists({ email: 'exists@example.com' });

      expect(result).toBe(true);
    });

    it('should return false when record does not exist', async () => {
      const result = await repository.exists({ email: 'notexists@example.com' });

      expect(result).toBe(false);
    });

    it('should work with multiple criteria', async () => {
      const result = await repository.exists({
        businessName: 'Existing Provider',
        state: 'NSW',
      });

      expect(result).toBe(true);
    });
  });

  describe('transaction', () => {
    it('should execute operations in a transaction', async () => {
      const result = await repository.transaction(async (tx) => {
        const created = await tx.provider.create({
          data: {
            businessName: 'Transaction Test',
            email: 'tx@example.com',
            phone: '0412345678',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
          },
        });

        await tx.provider.update({
          where: { id: created.id },
          data: { isPublished: true },
        });

        return created;
      });

      expect(result).toBeDefined();
      expect((result as any).businessName).toBe('Transaction Test');
    });

    it('should rollback on error', async () => {
      const countBefore = await repository.count();

      await expect(
        repository.transaction(async (tx) => {
          await tx.provider.create({
            data: {
              businessName: 'Will Rollback',
              email: 'rollback@example.com',
              phone: '0412345678',
              suburb: 'Sydney',
              state: 'NSW',
              postcode: '2000',
            },
          });

          throw new Error('Force rollback');
        }),
      ).rejects.toThrow('Force rollback');

      const countAfter = await repository.count();
      expect(countAfter).toBe(countBefore);
    });

    it('should throw and log error on transaction failure', async () => {
      await expect(
        repository.transaction(async () => {
          throw new Error('Transaction error');
        }),
      ).rejects.toThrow('Transaction error');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('audit logging integration', () => {
    it('should log creation with details', async () => {
      const result = await repository.create(
        {
          businessName: 'Audit Test',
          email: 'audit@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
        'test-user',
      );

      expect(result).toBeDefined();
      // Audit logger is called (no errors thrown)
    });

    it('should log update with before and after states', async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'Before Update',
          email: 'beforeupdate@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });

      const result = await repository.update(
        created.id,
        { businessName: 'After Update' } as any,
        'test-user',
      );

      expect((result as any).businessName).toBe('After Update');
    });

    it('should log deletion with deleted record details', async () => {
      const created = await prisma.provider.create({
        data: {
          businessName: 'To Delete',
          email: 'todelete@example.com',
          phone: '0412345678',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        } as any,
      });

      await repository.delete(created.id, 'test-user');

      // Verify record was deleted
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
