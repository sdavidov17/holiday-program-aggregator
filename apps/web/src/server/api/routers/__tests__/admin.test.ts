/**
 * Admin Router Test Suite
 * Tests for admin user management endpoints
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Session } from 'next-auth';

describe('adminRouter', () => {
  // Mock functions
  let mockUserFindMany: jest.Mock;
  let mockUserFindUnique: jest.Mock;
  let mockUserUpdate: jest.Mock;
  let mockUserDelete: jest.Mock;
  let mockUserCount: jest.Mock;

  // Router and context
  let createInnerTRPCContext: typeof import('~/server/api/trpc').createInnerTRPCContext;
  let adminRouter: typeof import('../admin').adminRouter;

  const mockUserSession: Session = {
    user: { id: 'user-1', email: 'user@test.com', role: 'USER' },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockAdminSession: Session = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  beforeEach(async () => {
    jest.resetModules();

    // Create fresh mocks
    mockUserFindMany = jest.fn();
    mockUserFindUnique = jest.fn();
    mockUserUpdate = jest.fn();
    mockUserDelete = jest.fn();
    mockUserCount = jest.fn();

    // Mock the database
    jest.doMock('~/server/db', () => ({
      db: {
        user: {
          findMany: mockUserFindMany,
          findUnique: mockUserFindUnique,
          update: mockUserUpdate,
          delete: mockUserDelete,
          count: mockUserCount,
        },
      },
    }));

    // Suppress console output
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Import modules after mocks are set up
    const trpcModule = await import('~/server/api/trpc');
    createInnerTRPCContext = trpcModule.createInnerTRPCContext;

    const adminModule = await import('../admin');
    adminRouter = adminModule.adminRouter;
  });

  describe('getUsers', () => {
    it('should require admin role', async () => {
      const ctx = createInnerTRPCContext({
        session: mockUserSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.getUsers()).rejects.toThrow('Only admins can perform this action');
    });

    it('should return all users for admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          name: 'User 1',
          role: 'USER',
          createdAt: new Date(),
          emailVerified: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          name: 'User 2',
          role: 'ADMIN',
          createdAt: new Date(),
          emailVerified: null,
        },
      ];

      mockUserFindMany.mockResolvedValue(mockUsers);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserFindMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          emailVerified: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockUserFindMany.mockResolvedValue([]);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.getUsers();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserRole', () => {
    it('should require admin role', async () => {
      const ctx = createInnerTRPCContext({
        session: mockUserSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.updateUserRole({ userId: 'user-1', role: 'ADMIN' })).rejects.toThrow(
        'Only admins can perform this action',
      );
    });

    it('should update user role to ADMIN', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Test User',
        role: 'ADMIN',
      };

      mockUserUpdate.mockResolvedValue(updatedUser);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.updateUserRole({
        userId: 'user-1',
        role: 'ADMIN',
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    });

    it('should update user role to USER when multiple admins exist', async () => {
      const updatedUser = {
        id: 'user-2',
        email: 'user2@test.com',
        name: 'User 2',
        role: 'USER',
      };

      mockUserCount.mockResolvedValue(3); // 3 admins exist
      mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
      mockUserUpdate.mockResolvedValue(updatedUser);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.updateUserRole({
        userId: 'user-2',
        role: 'USER',
      });

      expect(result).toEqual(updatedUser);
    });

    it('should prevent removing the last admin', async () => {
      mockUserCount.mockResolvedValue(1); // Only 1 admin exists
      mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.updateUserRole({ userId: 'admin-only', role: 'USER' })).rejects.toThrow(
        'Cannot remove the last admin',
      );
    });

    it('should allow demoting admin when not the last one', async () => {
      const updatedUser = {
        id: 'admin-2',
        email: 'admin2@test.com',
        name: 'Admin 2',
        role: 'USER',
      };

      mockUserCount.mockResolvedValue(2); // 2 admins exist
      mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
      mockUserUpdate.mockResolvedValue(updatedUser);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.updateUserRole({
        userId: 'admin-2',
        role: 'USER',
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserUpdate).toHaveBeenCalled();
    });

    it('should allow demoting non-admin user to USER', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'User',
        role: 'USER',
      };

      mockUserCount.mockResolvedValue(1); // Only 1 admin exists
      mockUserFindUnique.mockResolvedValue({ role: 'USER' }); // User being demoted is not admin
      mockUserUpdate.mockResolvedValue(updatedUser);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.updateUserRole({
        userId: 'user-1',
        role: 'USER',
      });

      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should require admin role', async () => {
      const ctx = createInnerTRPCContext({
        session: mockUserSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.deleteUser({ userId: 'user-1' })).rejects.toThrow(
        'Only admins can perform this action',
      );
    });

    it('should delete a regular user', async () => {
      mockUserFindUnique.mockResolvedValue({ role: 'USER' });
      mockUserDelete.mockResolvedValue({ id: 'user-1' });

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.deleteUser({ userId: 'user-1' });

      expect(result).toEqual({ success: true });
      expect(mockUserDelete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should prevent deleting yourself', async () => {
      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(
        router.deleteUser({ userId: 'admin-1' }), // Same as session user
      ).rejects.toThrow('Cannot delete your own account');
    });

    it('should prevent deleting the last admin', async () => {
      mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
      mockUserCount.mockResolvedValue(1); // Only 1 admin exists

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.deleteUser({ userId: 'other-admin' })).rejects.toThrow(
        'Cannot delete the last admin',
      );
    });

    it('should allow deleting admin when not the last one', async () => {
      mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
      mockUserCount.mockResolvedValue(2); // 2 admins exist
      mockUserDelete.mockResolvedValue({ id: 'other-admin' });

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.deleteUser({ userId: 'other-admin' });

      expect(result).toEqual({ success: true });
      expect(mockUserDelete).toHaveBeenCalled();
    });

    it('should delete user that is not found (null role)', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserDelete.mockResolvedValue({ id: 'nonexistent' });

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.deleteUser({ userId: 'nonexistent' });

      expect(result).toEqual({ success: true });
    });
  });

  describe('getUserStats', () => {
    it('should require admin role', async () => {
      const ctx = createInnerTRPCContext({
        session: mockUserSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await expect(router.getUserStats()).rejects.toThrow('Only admins can perform this action');
    });

    it('should return user statistics', async () => {
      mockUserCount
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(5) // adminUsers
        .mockResolvedValueOnce(80) // verifiedUsers
        .mockResolvedValueOnce(15); // recentUsers

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.getUserStats();

      expect(result).toEqual({
        totalUsers: 100,
        adminUsers: 5,
        verifiedUsers: 80,
        recentUsers: 15,
      });
    });

    it('should call count with correct filters', async () => {
      mockUserCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      await router.getUserStats();

      // First call: total count (no filter)
      expect(mockUserCount).toHaveBeenNthCalledWith(1);

      // Second call: admin count
      expect(mockUserCount).toHaveBeenNthCalledWith(2, {
        where: { role: 'ADMIN' },
      });

      // Third call: verified users
      expect(mockUserCount).toHaveBeenNthCalledWith(3, {
        where: { NOT: { emailVerified: null } },
      });

      // Fourth call: recent users (last 30 days)
      expect(mockUserCount).toHaveBeenNthCalledWith(4, {
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should return zeros when no users exist', async () => {
      mockUserCount.mockResolvedValue(0);

      const ctx = createInnerTRPCContext({
        session: mockAdminSession,
        correlationId: 'test-correlation-id',
      });
      const router = adminRouter.createCaller(ctx);

      const result = await router.getUserStats();

      expect(result).toEqual({
        totalUsers: 0,
        adminUsers: 0,
        verifiedUsers: 0,
        recentUsers: 0,
      });
    });
  });
});
