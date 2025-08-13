// Mock Prisma client for tests
let mockProviders = [];

// Export enums from types/database
const SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  TRIALING: 'TRIALING',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
};

const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  PROVIDER: 'PROVIDER',
};

const VettingStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const ProgramStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

const mockPrismaClient = {
  provider: {
    deleteMany: jest.fn(() => {
      const count = mockProviders.length;
      mockProviders = [];
      return Promise.resolve({ count });
    }),
    create: jest.fn((args) => {
      const newProvider = {
        id: `provider-${Date.now()}-${Math.random()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: args.data.userId || 'admin-1',
      };
      mockProviders.push(newProvider);
      return Promise.resolve(newProvider);
    }),
    createMany: jest.fn((args) => {
      const created = args.data.map((data, index) => ({
        id: `provider-${Date.now()}-${index}-${Math.random()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: data.userId || 'admin-1',
      }));
      mockProviders.push(...created);
      return Promise.resolve({ count: created.length });
    }),
    findMany: jest.fn((args) => {
      let filtered = [...mockProviders];
      
      // Apply where filters if provided
      if (args?.where) {
        if (args.where.isPublished !== undefined) {
          filtered = filtered.filter(p => p.isPublished === args.where.isPublished);
        }
        if (args.where.isVetted !== undefined) {
          filtered = filtered.filter(p => p.isVetted === args.where.isVetted);
        }
        if (args.where.email?.startsWith) {
          filtered = filtered.filter(p => p.email?.startsWith(args.where.email.startsWith));
        }
      }
      
      return Promise.resolve(filtered);
    }),
    findUnique: jest.fn((args) => {
      const provider = mockProviders.find(p => p.id === args.where.id);
      return Promise.resolve(provider || null);
    }),
    update: jest.fn((args) => {
      const index = mockProviders.findIndex(p => p.id === args.where.id);
      if (index !== -1) {
        mockProviders[index] = {
          ...mockProviders[index],
          ...args.data,
          updatedAt: new Date(),
        };
        return Promise.resolve(mockProviders[index]);
      }
      return Promise.resolve(null);
    }),
    delete: jest.fn((args) => {
      const index = mockProviders.findIndex(p => p.id === args.where.id);
      if (index !== -1) {
        const deleted = mockProviders.splice(index, 1)[0];
        return Promise.resolve(deleted);
      }
      // Return null for non-existent providers instead of throwing
      return Promise.resolve(null);
    }),
  },
  user: {
    deleteMany: jest.fn((args) => {
      // Handle complex where clauses for test cleanup
      if (args?.where?.email?.in) {
        // Simulate deleting test users
        return Promise.resolve({ count: args.where.email.in.length });
      }
      return Promise.resolve({ count: 0 });
    }),
    findMany: jest.fn(() => Promise.resolve([])),
    findUnique: jest.fn((args) => {
      // Return a mock user if searching for test users
      if (args?.where?.email?.startsWith('test-')) {
        return Promise.resolve({
          id: `user-${Date.now()}`,
          email: args.where.email,
          role: args.where.email.includes('admin') ? 'ADMIN' : 'USER',
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn((args) => {
      return Promise.resolve({
        id: `user-${Date.now()}-${Math.random()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
    update: jest.fn((args) => {
      return Promise.resolve({
        id: args.where.id || `user-${Date.now()}`,
        ...args.data,
        updatedAt: new Date(),
      });
    }),
  },
  session: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
  },
  subscription: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    findUnique: jest.fn(() => Promise.resolve(null)),
    create: jest.fn(() => Promise.resolve({ 
      id: 'sub-test-id',
      userId: 'user-test-id',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    update: jest.fn(() => Promise.resolve({
      id: 'sub-test-id',
      userId: 'user-test-id', 
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    findFirst: jest.fn(() => Promise.resolve(null)),
  },
  account: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
  },
  program: {
    create: jest.fn(() => Promise.resolve({
      id: 'program-test-id',
      providerId: 'provider-test-id',
      name: 'Test Program',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    findMany: jest.fn(() => Promise.resolve([])),
    update: jest.fn(() => Promise.resolve({
      id: 'program-test-id',
      providerId: 'provider-test-id',
      name: 'Test Program',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    delete: jest.fn(() => Promise.resolve({
      id: 'program-test-id',
    })),
  },
  $connect: jest.fn(() => Promise.resolve(undefined)),
  $disconnect: jest.fn(() => Promise.resolve(undefined)),
};

module.exports = {
  mockPrismaClient,
  db: mockPrismaClient,
  SubscriptionStatus,
  UserRole,
  VettingStatus,
  ProgramStatus,
};