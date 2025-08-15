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

function createMockModel(modelName: string) {
  return {
    findUnique: jest.fn(({ where, include }: any) => {
      const item = mockStorage[modelName].find((item: any) =>
        Object.entries(where).every(([key, value]) => item[key] === value),
      );

      if (item && include) {
        // Handle includes (e.g., programs for provider)
        const result = { ...item };
        if (include.programs) {
          result.programs =
            mockStorage['program']?.filter((p: any) => p.providerId === item.id) || [];
        }
        return Promise.resolve(result);
      }

      return Promise.resolve(item || null);
    }),

    findFirst: jest.fn(({ where }: any) => {
      const item = mockStorage[modelName].find((item: any) =>
        Object.entries(where || {}).every(([key, value]) => item[key] === value),
      );
      return Promise.resolve(item || null);
    }),

    findMany: jest.fn((options: any = {}) => {
      let items = [...mockStorage[modelName]];

      if (options.where) {
        items = items.filter((item: any) => {
          // Handle direct where conditions
          const conditions = options.where;
          return Object.entries(conditions).every(([key, value]: [string, any]) => {
            // Handle OR conditions
            if (key === 'OR' && Array.isArray(value)) {
              return value.some((orCondition: any) =>
                Object.entries(orCondition).every(([k, v]: [string, any]) => {
                  if (typeof v === 'object' && v !== null) {
                    if (v.contains) {
                      return item[k]?.toLowerCase().includes(v.contains.toLowerCase());
                    }
                  }
                  return item[k] === v;
                }),
              );
            }

            // Handle nested conditions
            if (typeof value === 'object' && value !== null) {
              if (value.contains) {
                return item[key]?.toLowerCase().includes(value.contains.toLowerCase());
              }
              if (value.in) {
                return value.in.includes(item[key]);
              }
              if (value.some) {
                // For relational filters like programs: { some: {...} }
                return true; // Simplified for mock
              }
            }
            return item[key] === value;
          });
        });
      }

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

      if (options.skip) {
        items = items.slice(options.skip);
      }

      if (options.take) {
        items = items.slice(0, options.take);
      }

      if (options.include) {
        // Handle includes
        items = items.map((item) => {
          const result = { ...item };
          if (options.include.programs) {
            result.programs =
              mockStorage['program']?.filter((p: any) => p.providerId === item.id) || [];
          }
          return result;
        });
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
        mockStorage['program'] = mockStorage['program'].filter(
          (p: any) => p.providerId !== deleted.id,
        );
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
        items = items.filter((item: any) =>
          Object.entries(options.where).every(([key, value]) => item[key] === value),
        );
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
