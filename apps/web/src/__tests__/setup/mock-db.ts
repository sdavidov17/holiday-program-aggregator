/**
 * Mock Database Setup for Testing
 * Provides in-memory database simulation for tests
 */

// In-memory storage
const mockStorage: Record<string, any[]> = {
  user: [],
  provider: [],
  subscription: [],
  program: [],
  booking: [],
  session: [],
  account: [],
};

// Mock Prisma Client that uses in-memory storage
export class MockPrismaClient {
  user = createMockModel('user');
  provider = createMockModel('provider');
  subscription = createMockModel('subscription');
  program = createMockModel('program');
  booking = createMockModel('booking');
  session = createMockModel('session');
  account = createMockModel('account');

  $connect = jest.fn().mockResolvedValue(undefined);
  $disconnect = jest.fn().mockResolvedValue(undefined);
  $executeRaw = jest.fn().mockResolvedValue(0);
  $executeRawUnsafe = jest.fn().mockResolvedValue(0);
  $queryRaw = jest.fn().mockResolvedValue([]);
  $queryRawUnsafe = jest.fn().mockResolvedValue([]);

  $transaction = jest.fn(async (fn: any) => {
    // Create a snapshot of current state for rollback
    const snapshot: Record<string, any[]> = {};
    Object.keys(mockStorage).forEach((key) => {
      snapshot[key] = [...mockStorage[key]];
    });

    try {
      const result = await fn(this);
      return result;
    } catch (error) {
      // Rollback by restoring snapshot
      Object.keys(snapshot).forEach((key) => {
        mockStorage[key] = snapshot[key];
      });
      throw error;
    }
  });
}

// Helper to match a single where condition value
function matchCondition(itemValue: any, condition: any): boolean {
  if (condition === null || condition === undefined) {
    return itemValue === condition;
  }

  if (typeof condition === 'object') {
    // Handle comparison operators
    if (condition.gte !== undefined && condition.lte !== undefined) {
      return itemValue >= condition.gte && itemValue <= condition.lte;
    }
    if (condition.gte !== undefined) {
      return itemValue >= condition.gte;
    }
    if (condition.lte !== undefined) {
      return itemValue <= condition.lte;
    }
    if (condition.gt !== undefined) {
      return itemValue > condition.gt;
    }
    if (condition.lt !== undefined) {
      return itemValue < condition.lt;
    }
    if (condition.contains !== undefined) {
      const mode = condition.mode === 'insensitive' ? 'i' : '';
      if (mode === 'i') {
        return itemValue?.toLowerCase().includes(condition.contains.toLowerCase());
      }
      return itemValue?.includes(condition.contains);
    }
    if (condition.in !== undefined) {
      return condition.in.includes(itemValue);
    }
    if (condition.notIn !== undefined) {
      return !condition.notIn.includes(itemValue);
    }
    if (condition.equals !== undefined) {
      return itemValue === condition.equals;
    }
    if (condition.not !== undefined) {
      return itemValue !== condition.not;
    }
  }

  return itemValue === condition;
}

// Helper to match where conditions against an item
function matchWhere(item: any, where: any): boolean {
  if (!where) return true;

  return Object.entries(where).every(([key, value]: [string, any]) => {
    // Handle OR conditions
    if (key === 'OR' && Array.isArray(value)) {
      return value.some((orCondition: any) => matchWhere(item, orCondition));
    }

    // Handle AND conditions
    if (key === 'AND' && Array.isArray(value)) {
      return value.every((andCondition: any) => matchWhere(item, andCondition));
    }

    // Handle NOT conditions
    if (key === 'NOT') {
      return !matchWhere(item, value);
    }

    // Handle nested relation filters (e.g., provider: { suburb: {...} })
    if (typeof value === 'object' && value !== null && !isComparisonOperator(value)) {
      // Check if this is a relation (provider, program, etc.)
      const relatedModel = getRelatedModel(key);
      if (relatedModel) {
        const relatedItem = getRelatedItem(item, key);
        if (!relatedItem) return false;
        return matchWhere(relatedItem, value);
      }
    }

    return matchCondition(item[key], value);
  });
}

// Check if an object is a comparison operator object
function isComparisonOperator(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const operatorKeys = ['gte', 'lte', 'gt', 'lt', 'contains', 'in', 'notIn', 'equals', 'not', 'mode'];
  return Object.keys(obj).some(key => operatorKeys.includes(key));
}

// Get the related model name for a relation field
function getRelatedModel(fieldName: string): string | null {
  const relationMap: Record<string, string> = {
    provider: 'provider',
    programs: 'program',
    user: 'user',
    subscription: 'subscription',
  };
  return relationMap[fieldName] || null;
}

// Get related item from storage
function getRelatedItem(item: any, relation: string): any {
  if (relation === 'provider' && item.providerId) {
    return mockStorage.provider.find((p: any) => p.id === item.providerId);
  }
  return null;
}

// Apply includes to an item
function applyIncludes(item: any, include: any): any {
  if (!include) return item;

  const result = { ...item };

  if (include.programs) {
    result.programs = mockStorage.program?.filter((p: any) => p.providerId === item.id) || [];
  }

  if (include.provider) {
    const provider = mockStorage.provider?.find((p: any) => p.id === item.providerId);
    if (provider && typeof include.provider === 'object' && include.provider.select) {
      // Apply select to the provider
      const selected: any = {};
      Object.keys(include.provider.select).forEach(key => {
        if (include.provider.select[key]) {
          selected[key] = provider[key];
        }
      });
      result.provider = selected;
    } else {
      result.provider = provider || undefined;
    }
  }

  if (include.user) {
    result.user = mockStorage.user?.find((u: any) => u.id === item.userId) || undefined;
  }

  return result;
}

function createMockModel(modelName: string) {
  return {
    findUnique: jest.fn(({ where, include }: any) => {
      const item = mockStorage[modelName].find((item: any) =>
        Object.entries(where).every(([key, value]) => item[key] === value),
      );

      if (item) {
        return Promise.resolve(applyIncludes(item, include));
      }

      return Promise.resolve(null);
    }),

    findFirst: jest.fn(({ where }: any) => {
      const item = mockStorage[modelName].find((item: any) =>
        Object.entries(where || {}).every(([key, value]) => item[key] === value),
      );
      return Promise.resolve(item || null);
    }),

    findMany: jest.fn((options: any = {}) => {
      let items = [...mockStorage[modelName]];

      // Apply where filter using the new matchWhere helper
      if (options.where) {
        items = items.filter((item: any) => matchWhere(item, options.where));
      }

      // Apply distinct - filter to unique values of specified fields
      if (options.distinct) {
        const distinctFields = Array.isArray(options.distinct) ? options.distinct : [options.distinct];
        const seen = new Set();
        items = items.filter((item) => {
          const key = distinctFields.map((field: string) => item[field]).join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      // Apply ordering
      if (options.orderBy) {
        const sortKey = Object.keys(options.orderBy)[0];
        const sortOrder = options.orderBy[sortKey];
        items.sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (options.skip) {
        items = items.slice(options.skip);
      }

      if (options.take) {
        items = items.slice(0, options.take);
      }

      // Apply select to limit fields returned
      if (options.select) {
        items = items.map((item) => {
          const selected: any = {};
          Object.keys(options.select).forEach(key => {
            if (options.select[key]) {
              selected[key] = item[key];
            }
          });
          return selected;
        });
      }

      // Apply includes using the applyIncludes helper
      if (options.include) {
        items = items.map((item) => applyIncludes(item, options.include));
      }

      return Promise.resolve(items);
    }),

    create: jest.fn(({ data }: any) => {
      // Check for unique constraints (e.g., email for providers and users)
      if ((modelName === 'provider' || modelName === 'user') && data.email) {
        const existing = mockStorage[modelName].find((item: any) => item.email === data.email);
        if (existing) {
          return Promise.reject(new Error('Unique constraint violation'));
        }
      }

      // Basic validation for required fields
      if (modelName === 'program' && !data.name) {
        return Promise.reject(new Error('Program name is required'));
      }

      const item = {
        id: `mock-${modelName}-${Date.now()}-${Math.random()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStorage[modelName].push(item);
      return Promise.resolve(item);
    }),

    createMany: jest.fn(({ data }: any) => {
      const items = data.map((itemData: any) => ({
        id: `mock-${modelName}-${Date.now()}-${Math.random()}`,
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      mockStorage[modelName].push(...items);
      return Promise.resolve({ count: items.length });
    }),

    update: jest.fn(({ where, data }: any) => {
      const index = mockStorage[modelName].findIndex((item: any) =>
        Object.entries(where).every(([key, value]) => item[key] === value),
      );

      if (index === -1) {
        return Promise.reject(new Error('Record not found'));
      }

      mockStorage[modelName][index] = {
        ...mockStorage[modelName][index],
        ...data,
        updatedAt: new Date(),
      };

      return Promise.resolve(mockStorage[modelName][index]);
    }),

    updateMany: jest.fn(({ where, data }: any) => {
      let count = 0;
      mockStorage[modelName] = mockStorage[modelName].map((item: any) => {
        const matches = where.id?.in
          ? where.id.in.includes(item.id)
          : Object.entries(where).every(([key, value]) => item[key] === value);

        if (matches) {
          count++;
          return { ...item, ...data, updatedAt: new Date() };
        }
        return item;
      });

      return Promise.resolve({ count });
    }),

    delete: jest.fn(({ where }: any) => {
      const index = mockStorage[modelName].findIndex((item: any) =>
        Object.entries(where).every(([key, value]) => item[key] === value),
      );

      if (index === -1) {
        return Promise.reject(new Error('Record not found'));
      }

      const [deleted] = mockStorage[modelName].splice(index, 1);

      // Handle cascade deletes
      if (modelName === 'provider' && deleted) {
        // Delete related programs
        mockStorage.program = mockStorage.program.filter((p: any) => p.providerId !== deleted.id);
      }

      return Promise.resolve(deleted);
    }),

    deleteMany: jest.fn(({ where }: any) => {
      const initialLength = mockStorage[modelName].length;

      if (where?.id?.in) {
        mockStorage[modelName] = mockStorage[modelName].filter(
          (item: any) => !where.id.in.includes(item.id),
        );
      } else if (where) {
        mockStorage[modelName] = mockStorage[modelName].filter(
          (item: any) => !Object.entries(where).every(([key, value]) => item[key] === value),
        );
      } else {
        mockStorage[modelName] = [];
      }

      const count = initialLength - mockStorage[modelName].length;
      return Promise.resolve({ count });
    }),

    count: jest.fn((options: any = {}) => {
      let items = [...mockStorage[modelName]];

      if (options.where) {
        items = items.filter((item: any) => matchWhere(item, options.where));
      }

      return Promise.resolve(items.length);
    }),

    upsert: jest.fn(({ where, create, update }: any) => {
      const existing = mockStorage[modelName].find((item: any) =>
        Object.entries(where).every(([key, value]) => item[key] === value),
      );

      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return Promise.resolve(existing);
      } else {
        const item = {
          id: `mock-${modelName}-${Date.now()}-${Math.random()}`,
          ...create,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockStorage[modelName].push(item);
        return Promise.resolve(item);
      }
    }),
  };
}

// Test setup helpers
export const setupMockDatabase = (): MockPrismaClient => {
  // Clear all storage
  Object.keys(mockStorage).forEach((key) => {
    mockStorage[key] = [];
  });

  return new MockPrismaClient() as any;
};

export const cleanupMockDatabase = () => {
  Object.keys(mockStorage).forEach((key) => {
    mockStorage[key] = [];
  });
};

// Helper to seed mock data
export const seedMockData = (model: string, data: any[]) => {
  mockStorage[model] = [...data];
};

// Helper to get mock data
export const getMockData = (model: string) => {
  return [...mockStorage[model]];
};
