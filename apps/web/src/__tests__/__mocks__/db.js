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

// Store mock users
let mockUsers = [];

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
          filtered = filtered.filter((p) => p.isPublished === args.where.isPublished);
        }
        if (args.where.isVetted !== undefined) {
          filtered = filtered.filter((p) => p.isVetted === args.where.isVetted);
        }
        if (args.where.email?.startsWith) {
          filtered = filtered.filter((p) => p.email?.startsWith(args.where.email.startsWith));
        }
      }

      return Promise.resolve(filtered);
    }),
    findUnique: jest.fn((args) => {
      const provider = mockProviders.find((p) => p.id === args.where.id);
      return Promise.resolve(provider || null);
    }),
    update: jest.fn((args) => {
      const index = mockProviders.findIndex((p) => p.id === args.where.id);
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
      const index = mockProviders.findIndex((p) => p.id === args.where.id);
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
        // Filter and remove matching users
        const emailsToDelete = args.where.email.in;
        const toDelete = mockUsers.filter((u) => emailsToDelete.includes(u.email));
        mockUsers = mockUsers.filter((u) => !emailsToDelete.includes(u.email));
        return Promise.resolve({ count: toDelete.length });
      }
      if (args?.where?.email) {
        // Delete single user by email
        const initialCount = mockUsers.length;
        mockUsers = mockUsers.filter((u) => u.email !== args.where.email);
        return Promise.resolve({ count: initialCount - mockUsers.length });
      }
      // Delete all if no filter
      const count = mockUsers.length;
      mockUsers = [];
      return Promise.resolve({ count });
    }),
    findMany: jest.fn((args) => {
      let results = [...mockUsers];

      // Apply where filters
      if (args?.where) {
        if (args.where.email) {
          // Exact email match
          if (typeof args.where.email === 'string') {
            results = results.filter((u) => u.email === args.where.email);
          }
          // Email in list
          else if (args.where.email.in) {
            results = results.filter((u) => args.where.email.in.includes(u.email));
          }
        }
        if (args.where.role) {
          results = results.filter((u) => u.role === args.where.role);
        }
      }

      return Promise.resolve(results);
    }),
    findUnique: jest.fn((args) => {
      // Find user by email or id
      if (args?.where?.email) {
        const user = mockUsers.find((u) => u.email === args.where.email);
        return Promise.resolve(user || null);
      }
      if (args?.where?.id) {
        const user = mockUsers.find((u) => u.id === args.where.id);
        return Promise.resolve(user || null);
      }
      return Promise.resolve(null);
    }),
    create: jest.fn((args) => {
      const newUser = {
        id: `user-${Date.now()}-${Math.random()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return Promise.resolve(newUser);
    }),
    update: jest.fn((args) => {
      const index = mockUsers.findIndex(
        (u) =>
          (args.where.id && u.id === args.where.id) ||
          (args.where.email && u.email === args.where.email),
      );
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...args.data,
          updatedAt: new Date(),
        };
        return Promise.resolve(mockUsers[index]);
      }
      return Promise.resolve(null);
    }),
  },
  session: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    create: jest.fn((args) => {
      return Promise.resolve({
        id: `session-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
  },
  subscription: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    findUnique: jest.fn(() => Promise.resolve(null)),
    create: jest.fn(() =>
      Promise.resolve({
        id: 'sub-test-id',
        userId: 'user-test-id',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    update: jest.fn(() =>
      Promise.resolve({
        id: 'sub-test-id',
        userId: 'user-test-id',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    findFirst: jest.fn(() => Promise.resolve(null)),
  },
  account: {
    deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
    create: jest.fn((args) => {
      return Promise.resolve({
        id: `account-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
  },
  program: {
    create: jest.fn(() =>
      Promise.resolve({
        id: 'program-test-id',
        providerId: 'provider-test-id',
        name: 'Test Program',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    findMany: jest.fn(() => Promise.resolve([])),
    update: jest.fn(() =>
      Promise.resolve({
        id: 'program-test-id',
        providerId: 'provider-test-id',
        name: 'Test Program',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    delete: jest.fn(() =>
      Promise.resolve({
        id: 'program-test-id',
      }),
    ),
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
