/**
 * Unit Tests: Subscription Lifecycle Service
 * Tests renewal reminders and expiration processing
 */

import { addDays, startOfDay } from 'date-fns';

// Use the global mock from __tests__/__mocks__/db.js
import { db } from '~/server/db';

// Get references to the mocked functions
const mockFindMany = db.subscription.findMany as jest.Mock;
const mockUpdate = db.subscription.update as jest.Mock;

// Mock email service
const mockSendRenewalReminder = jest.fn();
const mockSendExpirationNotice = jest.fn();

jest.mock('../../services/email', () => ({
  sendRenewalReminder: (...args: unknown[]) => mockSendRenewalReminder(...args),
  sendExpirationNotice: (...args: unknown[]) => mockSendExpirationNotice(...args),
}));

// Mock subscription metrics
const mockIncrementRemindersQueued = jest.fn();
const mockIncrementRemindersSent = jest.fn();
const mockIncrementRemindersFailed = jest.fn();
const mockIncrementSubscriptionsExpired = jest.fn();
const mockIncrementExpirationNoticesSent = jest.fn();
const mockIncrementExpirationNoticesFailed = jest.fn();
const mockLogMetrics = jest.fn();

jest.mock('~/utils/subscription-metrics', () => ({
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

// Import after mocks are set up
import { processSubscriptionLifecycle } from '../../services/subscription-lifecycle';

// Mock environment
process.env.NEXTAUTH_URL = 'http://localhost:3000';

describe('Subscription Lifecycle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no subscriptions found
    mockFindMany.mockResolvedValue([]);
    mockUpdate.mockResolvedValue({});
    mockSendRenewalReminder.mockResolvedValue(undefined);
    mockSendExpirationNotice.mockResolvedValue(undefined);
  });

  describe('processSubscriptionLifecycle', () => {
    it('should return empty results when no subscriptions exist', async () => {
      const results = await processSubscriptionLifecycle();

      expect(results).toEqual({
        reminders: 0,
        expired: 0,
        errors: [],
      });
    });

    it('should call metrics logMetrics at the end', async () => {
      await processSubscriptionLifecycle();

      expect(mockLogMetrics).toHaveBeenCalled();
    });

    it('should handle general errors gracefully', async () => {
      mockFindMany.mockRejectedValueOnce(new Error('Database connection failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.errors).toContain('Reminder query error: Database connection failed');
    });
  });

  describe('sendRenewalReminders', () => {
    it('should send reminders for subscriptions expiring in 7 days', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscription = {
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

      mockFindMany.mockResolvedValueOnce([mockSubscription]); // For reminders
      mockFindMany.mockResolvedValueOnce([]); // For expirations

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(1);
      expect(mockSendRenewalReminder).toHaveBeenCalledWith('test@example.com', {
        userName: 'Test User',
        expirationDate: sevenDaysFromNow.toLocaleDateString('en-AU'),
        renewalUrl: 'http://localhost:3000/subscription/renew',
      });
    });

    it('should update lastReminderSent and reminderCount after sending', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([mockSubscription]);
      mockFindMany.mockResolvedValueOnce([]);

      await processSubscriptionLifecycle();

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          lastReminderSent: expect.any(Date),
          reminderCount: { increment: 1 },
        },
      });
    });

    it('should skip users without email and add error', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          id: 'user-1',
          email: null, // No email
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([mockSubscription]);
      mockFindMany.mockResolvedValueOnce([]);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(0);
      expect(results.errors).toContain('No email for user user-1');
      expect(mockSendRenewalReminder).not.toHaveBeenCalled();
      expect(mockIncrementRemindersFailed).toHaveBeenCalled();
    });

    it('should continue processing other subscriptions if one fails', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { email: 'fail@example.com', name: 'Fail User' },
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { email: 'success@example.com', name: 'Success User' },
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockSubscriptions);
      mockFindMany.mockResolvedValueOnce([]);

      // First email fails, second succeeds
      mockSendRenewalReminder
        .mockRejectedValueOnce(new Error('Email service down'))
        .mockResolvedValueOnce(undefined);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(1);
      expect(results.errors).toHaveLength(1);
      expect(results.errors[0]).toContain('user-1');
      expect(mockSendRenewalReminder).toHaveBeenCalledTimes(2);
    });

    it('should use "Valued Customer" for users without name', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: {
          email: 'test@example.com',
          name: null, // No name
        },
      };

      mockFindMany.mockResolvedValueOnce([mockSubscription]);
      mockFindMany.mockResolvedValueOnce([]);

      await processSubscriptionLifecycle();

      expect(mockSendRenewalReminder).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          userName: 'Valued Customer',
        }),
      );
    });

    it('should track metrics correctly', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);

      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { email: 'test1@example.com', name: 'User 1' },
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          expiresAt: sevenDaysFromNow,
          lastReminderSent: null,
          user: { email: 'test2@example.com', name: 'User 2' },
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockSubscriptions);
      mockFindMany.mockResolvedValueOnce([]);

      await processSubscriptionLifecycle();

      expect(mockIncrementRemindersQueued).toHaveBeenCalledWith(2);
      expect(mockIncrementRemindersSent).toHaveBeenCalledTimes(2);
    });
  });

  describe('processExpiredSubscriptions', () => {
    it('should process and mark expired subscriptions', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        status: 'ACTIVE',
        expiresAt: yesterday,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([]); // For reminders
      mockFindMany.mockResolvedValueOnce([mockSubscription]); // For expirations

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'EXPIRED' },
      });
    });

    it('should send expiration notice email', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: yesterday,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([mockSubscription]);

      await processSubscriptionLifecycle();

      expect(mockSendExpirationNotice).toHaveBeenCalledWith('test@example.com', {
        userName: 'Test User',
        expiredDate: yesterday.toLocaleDateString('en-AU'),
        renewalUrl: 'http://localhost:3000/subscription/renew',
      });
    });

    it('should skip email for users without email but still expire subscription', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: yesterday,
        user: {
          email: null, // No email
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([mockSubscription]);

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'EXPIRED' },
      });
      expect(mockSendExpirationNotice).not.toHaveBeenCalled();
    });

    it('should continue processing if email fails but add error', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: yesterday,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([mockSubscription]);
      mockSendExpirationNotice.mockRejectedValueOnce(new Error('Email failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(1);
      expect(results.errors).toContain('Failed to send expiration email for user-1: Email failed');
      expect(mockIncrementExpirationNoticesFailed).toHaveBeenCalled();
    });

    it('should handle database update failures', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        expiresAt: yesterday,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([mockSubscription]);
      mockUpdate.mockRejectedValueOnce(new Error('DB update failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.expired).toBe(0);
      expect(results.errors).toContain('Failed to process expiration for user-1: DB update failed');
    });

    it('should track expiration metrics correctly', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          expiresAt: yesterday,
          user: { email: 'test1@example.com', name: 'User 1' },
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          expiresAt: yesterday,
          user: { email: 'test2@example.com', name: 'User 2' },
        },
      ];

      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce(mockSubscriptions);

      await processSubscriptionLifecycle();

      expect(mockIncrementSubscriptionsExpired).toHaveBeenCalledTimes(2);
      expect(mockIncrementExpirationNoticesSent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Combined Scenarios', () => {
    it('should process both reminders and expirations in one run', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const reminderSub = {
        id: 'sub-reminder',
        userId: 'user-reminder',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: { email: 'reminder@example.com', name: 'Reminder User' },
      };

      const expiredSub = {
        id: 'sub-expired',
        userId: 'user-expired',
        expiresAt: yesterday,
        user: { email: 'expired@example.com', name: 'Expired User' },
      };

      mockFindMany.mockResolvedValueOnce([reminderSub]);
      mockFindMany.mockResolvedValueOnce([expiredSub]);

      const results = await processSubscriptionLifecycle();

      expect(results.reminders).toBe(1);
      expect(results.expired).toBe(1);
      expect(results.errors).toHaveLength(0);
    });

    it('should accumulate errors from both reminders and expirations', async () => {
      const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const reminderSub = {
        id: 'sub-reminder',
        userId: 'user-reminder',
        expiresAt: sevenDaysFromNow,
        lastReminderSent: null,
        user: { email: null, name: 'No Email User' }, // Will cause error
      };

      const expiredSub = {
        id: 'sub-expired',
        userId: 'user-expired',
        expiresAt: yesterday,
        user: { email: 'expired@example.com', name: 'Expired User' },
      };

      mockFindMany.mockResolvedValueOnce([reminderSub]);
      mockFindMany.mockResolvedValueOnce([expiredSub]);
      mockSendExpirationNotice.mockRejectedValueOnce(new Error('Email failed'));

      const results = await processSubscriptionLifecycle();

      expect(results.errors).toHaveLength(2);
      expect(results.errors[0]).toContain('No email for user');
      expect(results.errors[1]).toContain('Failed to send expiration email');
    });
  });

  describe('Query Conditions', () => {
    it('should query for active subscriptions expiring in 7 days', async () => {
      await processSubscriptionLifecycle();

      const reminderQuery = mockFindMany.mock.calls[0]?.[0];
      expect(reminderQuery?.where?.status).toBe('ACTIVE');
      expect(reminderQuery?.where?.expiresAt?.gte).toBeDefined();
      expect(reminderQuery?.where?.expiresAt?.lt).toBeDefined();
      expect(reminderQuery?.include?.user).toBe(true);
    });

    it('should query for active subscriptions that have expired', async () => {
      mockFindMany.mockResolvedValueOnce([]);

      await processSubscriptionLifecycle();

      const expirationQuery = mockFindMany.mock.calls[1]?.[0];
      expect(expirationQuery?.where?.status).toBe('ACTIVE');
      expect(expirationQuery?.where?.expiresAt?.lt).toBeDefined();
      expect(expirationQuery?.include?.user).toBe(true);
    });

    it('should filter out subscriptions with recent reminders', async () => {
      await processSubscriptionLifecycle();

      const reminderQuery = mockFindMany.mock.calls[0]?.[0];
      expect(reminderQuery?.where?.OR).toBeDefined();
      expect(reminderQuery?.where?.OR).toHaveLength(2);
    });
  });
});
