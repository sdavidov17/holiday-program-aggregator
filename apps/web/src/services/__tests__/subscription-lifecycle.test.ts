/**
 * Subscription Lifecycle Service Test Suite
 * Tests for renewal reminders and expiration processing
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { addDays, startOfDay } from 'date-fns';

describe('Subscription Lifecycle Service', () => {
  // Create mock functions
  let mockFindMany: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockSendRenewalReminder: jest.Mock;
  let mockSendExpirationNotice: jest.Mock;
  let mockIncrementRemindersQueued: jest.Mock;
  let mockIncrementRemindersSent: jest.Mock;
  let mockIncrementRemindersFailed: jest.Mock;
  let mockIncrementSubscriptionsExpired: jest.Mock;
  let mockIncrementExpirationNoticesSent: jest.Mock;
  let mockIncrementExpirationNoticesFailed: jest.Mock;
  let mockLogMetrics: jest.Mock;

  let processSubscriptionLifecycle: () => Promise<{
    reminders: number;
    expired: number;
    errors: string[];
  }>;

  const now = new Date();
  const sevenDaysFromNow = addDays(startOfDay(now), 7);

  beforeEach(async () => {
    // Reset all modules to ensure clean state
    jest.resetModules();

    // Create fresh mocks for each test
    mockFindMany = jest.fn();
    mockUpdate = jest.fn();
    mockSendRenewalReminder = jest.fn();
    mockSendExpirationNotice = jest.fn();
    mockIncrementRemindersQueued = jest.fn();
    mockIncrementRemindersSent = jest.fn();
    mockIncrementRemindersFailed = jest.fn();
    mockIncrementSubscriptionsExpired = jest.fn();
    mockIncrementExpirationNoticesSent = jest.fn();
    mockIncrementExpirationNoticesFailed = jest.fn();
    mockLogMetrics = jest.fn();

    // Mock modules using doMock (after resetModules)
    jest.doMock('~/server/db', () => ({
      db: {
        subscription: {
          findMany: mockFindMany,
          update: mockUpdate,
        },
      },
      SubscriptionStatus: {
        ACTIVE: 'ACTIVE',
        EXPIRED: 'EXPIRED',
        CANCELLED: 'CANCELLED',
        PENDING: 'PENDING',
      },
    }));

    jest.doMock('../email', () => ({
      sendRenewalReminder: mockSendRenewalReminder,
      sendExpirationNotice: mockSendExpirationNotice,
    }));

    jest.doMock('~/utils/subscription-metrics', () => ({
      SubscriptionMetricsCollector: jest.fn().mockImplementation(() => ({
        incrementRemindersQueued: mockIncrementRemindersQueued,
        incrementRemindersSent: mockIncrementRemindersSent,
        incrementRemindersFailed: mockIncrementRemindersFailed,
        incrementSubscriptionsExpired: mockIncrementSubscriptionsExpired,
        incrementExpirationNoticesSent: mockIncrementExpirationNoticesSent,
        incrementExpirationNoticesFailed: mockIncrementExpirationNoticesFailed,
        logMetrics: mockLogMetrics,
      })),
    }));

    // Import the module after mocks are set up
    const module = await import('../subscription-lifecycle');
    processSubscriptionLifecycle = module.processSubscriptionLifecycle;

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NEXTAUTH_URL = 'https://example.com';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processSubscriptionLifecycle', () => {
    it('should return empty results when no subscriptions need processing', async () => {
      mockFindMany.mockResolvedValue([]);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(0);
      expect(results.expired).toBe(0);
      expect(results.errors).toHaveLength(0);
    });

    it('should send renewal reminders for subscriptions expiring in 7 days', async () => {
      const expiringSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([expiringSubscription]) // For reminder query
        .mockResolvedValueOnce([]); // For expiration query
      mockUpdate.mockResolvedValue(expiringSubscription);
      mockSendRenewalReminder.mockResolvedValue(undefined);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(1);
      expect(mockSendRenewalReminder).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          userName: 'Test User',
          renewalUrl: 'https://example.com/subscription/renew',
        }),
      );
      expect(mockIncrementRemindersSent).toHaveBeenCalled();
    });

    it('should handle users without email for reminders', async () => {
      const subscriptionNoEmail = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          id: 'user-1',
          email: null,
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([subscriptionNoEmail])
        .mockResolvedValueOnce([]);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(0);
      expect(results.errors).toContain('No email for user user-1');
      expect(mockIncrementRemindersFailed).toHaveBeenCalled();
    });

    it('should process expired subscriptions', async () => {
      const expiredSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: addDays(now, -1), // Expired yesterday
        user: {
          id: 'user-1',
          email: 'expired@example.com',
          name: 'Expired User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([]) // No reminders
        .mockResolvedValueOnce([expiredSubscription]); // One expired
      mockUpdate.mockResolvedValue({
        ...expiredSubscription,
        status: 'EXPIRED',
      });
      mockSendExpirationNotice.mockResolvedValue(undefined);

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: { status: 'EXPIRED' },
        }),
      );
      expect(mockSendExpirationNotice).toHaveBeenCalledWith(
        'expired@example.com',
        expect.objectContaining({
          userName: 'Expired User',
          renewalUrl: 'https://example.com/subscription/renew',
        }),
      );
      expect(mockIncrementSubscriptionsExpired).toHaveBeenCalled();
      expect(mockIncrementExpirationNoticesSent).toHaveBeenCalled();
    });

    it('should handle email send errors gracefully', async () => {
      const subscriptionWithError = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([subscriptionWithError])
        .mockResolvedValueOnce([]);
      mockSendRenewalReminder.mockRejectedValue(new Error('Email service down'));

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(0);
      expect(results.errors.some((e) => e.includes('Email service down'))).toBe(true);
      expect(mockIncrementRemindersFailed).toHaveBeenCalled();
    });

    it('should handle expiration email errors without failing the update', async () => {
      const expiredSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: addDays(now, -1),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([expiredSubscription]);
      mockUpdate.mockResolvedValue({
        ...expiredSubscription,
        status: 'EXPIRED',
      });
      mockSendExpirationNotice.mockRejectedValue(new Error('Email failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1); // Still counts as processed
      expect(results.errors.some((e) => e.includes('Email failed'))).toBe(true);
      expect(mockIncrementExpirationNoticesFailed).toHaveBeenCalled();
    });

    it('should handle database query errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));

      const results = await processSubscriptionLifecycle();

      expect(results.errors.some((e) => e.includes('Database error'))).toBe(true);
    });

    it('should update reminder tracking after sending', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        reminderCount: 0,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([subscription])
        .mockResolvedValueOnce([]);
      mockUpdate.mockResolvedValue(subscription);
      mockSendRenewalReminder.mockResolvedValue(undefined);

      await processSubscriptionLifecycle();

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            lastReminderSent: expect.any(Date),
            reminderCount: { increment: 1 },
          }),
        }),
      );
    });

    it('should process multiple subscriptions', async () => {
      const subscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'ACTIVE',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          status: 'ACTIVE',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { id: 'user-2', email: 'user2@example.com', name: 'User 2' },
        },
      ];

      mockFindMany
        .mockResolvedValueOnce(subscriptions)
        .mockResolvedValueOnce([]);
      mockUpdate.mockResolvedValue({});
      mockSendRenewalReminder.mockResolvedValue(undefined);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(2);
      expect(mockSendRenewalReminder).toHaveBeenCalledTimes(2);
      expect(mockIncrementRemindersQueued).toHaveBeenCalledWith(2);
    });

    it('should use default name for users without name', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: null,
        },
      };

      mockFindMany
        .mockResolvedValueOnce([subscription])
        .mockResolvedValueOnce([]);
      mockUpdate.mockResolvedValue(subscription);
      mockSendRenewalReminder.mockResolvedValue(undefined);

      await processSubscriptionLifecycle();

      expect(mockSendRenewalReminder).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          userName: 'Valued Customer',
        }),
      );
    });

    it('should not send expiration notice for users without email', async () => {
      const expiredNoEmail = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: addDays(now, -1),
        user: {
          id: 'user-1',
          email: null,
          name: 'No Email User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([expiredNoEmail]);
      mockUpdate.mockResolvedValue({
        ...expiredNoEmail,
        status: 'EXPIRED',
      });

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1);
      expect(mockSendExpirationNotice).not.toHaveBeenCalled();
    });

    it('should log lifecycle run results', async () => {
      mockFindMany.mockResolvedValue([]);

      await processSubscriptionLifecycle();

      expect(console.log).toHaveBeenCalledWith(
        'Subscription lifecycle run completed:',
        expect.objectContaining({
          reminders: 0,
          expired: 0,
          errors: 0,
        }),
      );
    });

    it('should call metrics logMetrics on completion', async () => {
      mockFindMany.mockResolvedValue([]);

      await processSubscriptionLifecycle();

      expect(mockLogMetrics).toHaveBeenCalled();
    });

    it('should handle subscription update errors during expiration', async () => {
      const expiredSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: addDays(now, -1),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([expiredSubscription]);
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(0);
      expect(results.errors.some((e) => e.includes('Update failed'))).toBe(true);
    });
  });
});
