/**
 * Unit Tests: Base Repository
 * Tests common database operations and audit logging
 */

import type { PrismaClient } from '@prisma/client';

// Create mock functions
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();
const mockTransaction = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLogAction = jest.fn();

// Mock logger
jest.mock('~/utils/logger', () => ({
  createLogger: () => ({
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    debug: jest.fn(),
    warn: jest.fn(),
  }),
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: (...args: unknown[]) => mockLoggerInfo(...args),
  },
}));

// Mock audit logger
jest.mock('~/utils/auditLogger', () => ({
  auditLogger: {
    logAction: (...args: unknown[]) => mockLogAction(...args),
  },
}));

// Import after mocks
import { BaseRepository } from '../../repositories/base.repository';

// Create a mock Prisma client to inject into the repository
const createMockPrisma = () =>
  ({
    testModel: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      count: mockCount,
    },
    $transaction: mockTransaction,
  }) as unknown as PrismaClient;

// Create a concrete implementation for testing
interface TestEntity {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(prisma: PrismaClient) {
    super('testModel', prisma);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    repository = new TestRepository(mockPrisma);
  });

  describe('findById', () => {
    it('should find a record by ID', async () => {
      const mockEntity = {
        id: 'test-1',
        name: 'Test Entity',
        status: 'active',
        createdAt: new Date(),
      };
      mockFindUnique.mockResolvedValue(mockEntity);

      const result = await repository.findById('test-1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'test-1' },
        include: undefined,
      });
      expect(result).toEqual(mockEntity);
    });

    it('should return null when record not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should include related records when specified', async () => {
      mockFindUnique.mockResolvedValue({ id: 'test-1', related: [] });

      await repository.findById('test-1', { related: true });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'test-1' },
        include: { related: true },
      });
    });

    it('should log and rethrow errors', async () => {
      const error = new Error('Database error');
      mockFindUnique.mockRejectedValue(error);

      await expect(repository.findById('test-1')).rejects.toThrow('Database error');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should find multiple records', async () => {
      const mockEntities = [
        { id: 'test-1', name: 'Entity 1' },
        { id: 'test-2', name: 'Entity 2' },
      ];
      mockFindMany.mockResolvedValue(mockEntities);

      const result = await repository.findMany();

      expect(mockFindMany).toHaveBeenCalled();
      expect(result).toEqual(mockEntities);
    });

    it('should apply where filter', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findMany({ where: { status: 'active' } });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { status: 'active' },
      });
    });

    it('should apply pagination with skip and take', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findMany({ skip: 10, take: 5 });

      expect(mockFindMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
    });

    it('should apply orderBy', async () => {
      mockFindMany.mockResolvedValue([]);

      await repository.findMany({ orderBy: { createdAt: 'desc' } });

      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should log and rethrow errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Query failed'));

      await expect(repository.findMany()).rejects.toThrow('Query failed');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('findFirst', () => {
    it('should find first record matching criteria', async () => {
      const mockEntity = { id: 'test-1', name: 'First Match' };
      mockFindFirst.mockResolvedValue(mockEntity);

      const result = await repository.findFirst({ status: 'active' });

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { status: 'active' },
      });
      expect(result).toEqual(mockEntity);
    });

    it('should return null when no match', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await repository.findFirst({ status: 'nonexistent' });

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a record and log audit', async () => {
      const createData = { name: 'New Entity', status: 'active' };
      const created = { id: 'new-1', ...createData };
      mockCreate.mockResolvedValue(created);
      mockLogAction.mockResolvedValue(undefined);

      const result = await repository.create(createData, 'user-123');

      expect(mockCreate).toHaveBeenCalledWith({ data: createData });
      expect(mockLogAction).toHaveBeenCalledWith('CREATE', 'testModel', 'new-1', 'user-123', {
        created: createData,
      });
      expect(result).toEqual(created);
    });

    it('should use "system" as userId when not provided', async () => {
      const created = { id: 'new-2', name: 'Entity' };
      mockCreate.mockResolvedValue(created);

      await repository.create({ name: 'Entity' });

      expect(mockLogAction).toHaveBeenCalledWith(
        'CREATE',
        'testModel',
        'new-2',
        'system',
        expect.any(Object),
      );
    });

    it('should log and rethrow errors', async () => {
      mockCreate.mockRejectedValue(new Error('Create failed'));

      await expect(repository.create({ name: 'Test' })).rejects.toThrow('Create failed');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a record and log audit', async () => {
      const beforeEntity = { id: 'test-1', name: 'Old Name', status: 'active' };
      const afterEntity = { id: 'test-1', name: 'New Name', status: 'active' };

      mockFindUnique.mockResolvedValue(beforeEntity);
      mockUpdate.mockResolvedValue(afterEntity);

      const result = await repository.update('test-1', { name: 'New Name' }, 'user-123');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-1' },
        data: { name: 'New Name' },
      });
      expect(mockLogAction).toHaveBeenCalledWith('UPDATE', 'testModel', 'test-1', 'user-123', {
        before: beforeEntity,
        after: afterEntity,
      });
      expect(result).toEqual(afterEntity);
    });

    it('should use "system" as userId when not provided', async () => {
      mockFindUnique.mockResolvedValue({ id: 'test-1' });
      mockUpdate.mockResolvedValue({ id: 'test-1', name: 'Updated' });

      await repository.update('test-1', { name: 'Updated' });

      expect(mockLogAction).toHaveBeenCalledWith(
        'UPDATE',
        'testModel',
        'test-1',
        'system',
        expect.any(Object),
      );
    });

    it('should log and rethrow errors', async () => {
      mockFindUnique.mockResolvedValue({ id: 'test-1' });
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      await expect(repository.update('test-1', { name: 'New' })).rejects.toThrow('Update failed');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a record and log audit', async () => {
      const entity = { id: 'test-1', name: 'To Delete' };
      mockFindUnique.mockResolvedValue(entity);
      mockDelete.mockResolvedValue(entity);

      const result = await repository.delete('test-1', 'user-123');

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'test-1' },
      });
      expect(mockLogAction).toHaveBeenCalledWith('DELETE', 'testModel', 'test-1', 'user-123', {
        deleted: entity,
      });
      expect(result).toEqual(entity);
    });

    it('should use "system" as userId when not provided', async () => {
      mockFindUnique.mockResolvedValue({ id: 'test-1' });
      mockDelete.mockResolvedValue({ id: 'test-1' });

      await repository.delete('test-1');

      expect(mockLogAction).toHaveBeenCalledWith(
        'DELETE',
        'testModel',
        'test-1',
        'system',
        expect.any(Object),
      );
    });

    it('should log and rethrow errors', async () => {
      mockFindUnique.mockResolvedValue({ id: 'test-1' });
      mockDelete.mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete('test-1')).rejects.toThrow('Delete failed');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should count all records', async () => {
      mockCount.mockResolvedValue(42);

      const result = await repository.count();

      expect(mockCount).toHaveBeenCalledWith({ where: undefined });
      expect(result).toBe(42);
    });

    it('should count with filter', async () => {
      mockCount.mockResolvedValue(10);

      const result = await repository.count({ status: 'active' });

      expect(mockCount).toHaveBeenCalledWith({ where: { status: 'active' } });
      expect(result).toBe(10);
    });

    it('should log and rethrow errors', async () => {
      mockCount.mockRejectedValue(new Error('Count failed'));

      await expect(repository.count()).rejects.toThrow('Count failed');
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true when record exists', async () => {
      mockCount.mockResolvedValue(1);

      const result = await repository.exists({ id: 'test-1' });

      expect(result).toBe(true);
    });

    it('should return false when record does not exist', async () => {
      mockCount.mockResolvedValue(0);

      const result = await repository.exists({ id: 'nonexistent' });

      expect(result).toBe(false);
    });

    it('should return true when multiple records match', async () => {
      mockCount.mockResolvedValue(5);

      const result = await repository.exists({ status: 'active' });

      expect(result).toBe(true);
    });
  });

  describe('transaction', () => {
    it('should execute function within transaction', async () => {
      const transactionFn = jest.fn().mockResolvedValue('result');
      mockTransaction.mockImplementation(async (fn: Function) => fn({}));

      const result = await repository.transaction(transactionFn);

      expect(mockTransaction).toHaveBeenCalled();
      expect(transactionFn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should log and rethrow transaction errors', async () => {
      mockTransaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(repository.transaction(() => Promise.resolve())).rejects.toThrow(
        'Transaction failed',
      );
      expect(mockLoggerError).toHaveBeenCalled();
    });

    it('should propagate errors from transaction function', async () => {
      mockTransaction.mockImplementation(async (fn: Function) => {
        return await fn({});
      });

      const errorFn = jest.fn().mockRejectedValue(new Error('Rollback needed'));

      await expect(repository.transaction(errorFn)).rejects.toThrow('Rollback needed');
    });
  });

  describe('Error Logging', () => {
    it('should include model name in error logs', async () => {
      mockFindUnique.mockRejectedValue(new Error('Test error'));

      await expect(repository.findById('test-1')).rejects.toThrow();

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('testModel'),
        expect.any(Object),
        expect.any(Error),
        expect.objectContaining({ model: 'testModel' }),
      );
    });

    it('should include query parameters in error context', async () => {
      mockFindMany.mockRejectedValue(new Error('Test error'));

      const options = { where: { status: 'test' } };
      await expect(repository.findMany(options)).rejects.toThrow();

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Error),
        expect.objectContaining({ options }),
      );
    });
  });
});
