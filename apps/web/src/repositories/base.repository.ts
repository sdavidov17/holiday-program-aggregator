/**
 * Base Repository Pattern
 * Provides common database operations with audit logging
 */

import type { PrismaClient } from '@prisma/client';
import { db } from '~/server/db';
import { auditLogger } from '~/utils/auditLogger';

export interface FindOptions {
  where?: Record<string, any>;
  include?: Record<string, boolean>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
}

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string, prisma?: PrismaClient) {
    this.prisma = prisma || db;
    this.modelName = modelName;
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, include?: Record<string, boolean>): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
        include,
      });

      return result;
    } catch (error) {
      console.error(`Error finding ${this.modelName} by ID`, { id, error });
      throw error;
    }
  }

  /**
   * Find multiple records with options
   */
  async findMany(options: FindOptions = {}): Promise<T[]> {
    try {
      // Convert shorthand filters to proper Prisma format
      const prismaOptions: any = {};
      const knownOptions = ['where', 'orderBy', 'skip', 'take', 'include', 'select'];

      // Check if options contains direct filter properties
      const hasDirectFilters = Object.keys(options).some((key) => !knownOptions.includes(key));

      if (hasDirectFilters) {
        // Extract direct filters into where clause
        prismaOptions.where = {};
        Object.keys(options).forEach((key) => {
          if (!knownOptions.includes(key)) {
            prismaOptions.where[key] = (options as any)[key];
          } else {
            prismaOptions[key] = (options as any)[key];
          }
        });
      } else {
        // Use options as-is
        Object.assign(prismaOptions, options);
      }

      const results = await (this.prisma as any)[this.modelName].findMany(prismaOptions);
      return results;
    } catch (error) {
      console.error(`Error finding ${this.modelName} records`, { options, error });
      throw error;
    }
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: Record<string, any>): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findFirst({ where });
      return result;
    } catch (error) {
      console.error(`Error finding first ${this.modelName}`, { where, error });
      throw error;
    }
  }

  /**
   * Create a new record with audit logging
   */
  async create(data: Partial<T>, userId?: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({ data });

      // Audit log the creation
      await auditLogger.logAction(
        'CREATE',
        this.modelName,
        (result as any).id,
        userId || 'system',
        { created: data },
      );

      return result;
    } catch (error) {
      console.error(`Error creating ${this.modelName}`, { data, error });
      throw error;
    }
  }

  /**
   * Update a record with audit logging
   */
  async update(id: string, data: Partial<T>, userId?: string): Promise<T> {
    try {
      // Get current state for audit
      const before = await this.findById(id);

      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });

      // Audit log the update
      await auditLogger.logAction('UPDATE', this.modelName, id, userId || 'system', {
        before,
        after: result,
      });

      return result;
    } catch (error) {
      console.error(`Error updating ${this.modelName}`, { id, data, error });
      throw error;
    }
  }

  /**
   * Delete a record with audit logging
   */
  async delete(id: string, userId?: string): Promise<T> {
    try {
      // Get record before deletion for audit
      const before = await this.findById(id);

      const result = await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });

      // Audit log the deletion
      await auditLogger.logAction('DELETE', this.modelName, id, userId || 'system', {
        deleted: before,
      });

      return result;
    } catch (error) {
      console.error(`Error deleting ${this.modelName}`, { id, error });
      throw error;
    }
  }

  /**
   * Count records matching criteria
   */
  async count(where?: Record<string, any>): Promise<number> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({ where });
      return count;
    } catch (error) {
      console.error(`Error counting ${this.modelName}`, { where, error });
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Perform a transaction
   */
  async transaction<R>(
    fn: (
      prisma: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
      >,
    ) => Promise<R>,
  ): Promise<R> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      console.error(`Transaction failed for ${this.modelName}`, { error });
      throw error;
    }
  }
}
