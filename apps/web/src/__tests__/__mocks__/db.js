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
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    findMany: jest.fn(() => Promise.resolve([])),
    findUnique: jest.fn(() => Promise.resolve(null)),
    create: jest.fn(() => Promise.resolve({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'USER',
    })),
  },
  session: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
  },
  subscription: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    findUnique: jest.fn(() => Promise.resolve(null)),
  },
  account: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
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