/**
 * Audit Logger Test Suite
 * Tests for security audit logging, event tracking, and compliance reporting
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { AuditEventType } from '../auditLogger';

// Mock database functions
let mockAuditLogCreate: jest.Mock;
let mockAuditLogFindMany: jest.Mock;
let mockAuditLogCount: jest.Mock;

// Mock logger functions
let mockLoggerInfo: jest.Mock;
let mockLoggerError: jest.Mock;

describe('AuditLogger', () => {
  let AuditLogger: typeof import('../auditLogger').AuditLogger;
  let auditLogger: import('../auditLogger').AuditLogger;

  beforeEach(async () => {
    // Reset modules for fresh imports
    jest.resetModules();

    // Create fresh mocks
    mockAuditLogCreate = jest.fn();
    mockAuditLogFindMany = jest.fn();
    mockAuditLogCount = jest.fn();
    mockLoggerInfo = jest.fn();
    mockLoggerError = jest.fn();

    // Set up mocks using doMock (after resetModules)
    jest.doMock('~/server/db', () => ({
      db: {
        auditLog: {
          create: mockAuditLogCreate,
          findMany: mockAuditLogFindMany,
          count: mockAuditLogCount,
        },
      },
    }));

    jest.doMock('../logger', () => ({
      logger: {
        info: mockLoggerInfo,
        error: mockLoggerError,
      },
    }));

    // Import after mocks are set up
    const module = await import('../auditLogger');
    AuditLogger = module.AuditLogger;
    auditLogger = new AuditLogger();
  });

  describe('logEvent', () => {
    const baseContext = { correlationId: 'test-correlation-123' };

    it('should log successful login event', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-1' });

      await auditLogger.logEvent('AUTH_LOGIN_SUCCESS', baseContext, {
        userId: 'user-123',
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        result: 'success',
      });

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Audit Event: AUTH_LOGIN_SUCCESS',
        baseContext,
        expect.objectContaining({
          auditEvent: expect.objectContaining({
            eventType: 'AUTH_LOGIN_SUCCESS',
            userId: 'user-123',
            email: 'test@example.com',
            result: 'success',
          }),
          journey: 'authentication',
        }),
      );

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'AUTH_LOGIN_SUCCESS',
          userId: 'user-123',
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          correlationId: 'test-correlation-123',
          result: 'success',
        }),
      });
    });

    it('should log failed login event with error message', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-2' });

      await auditLogger.logEvent('AUTH_LOGIN_FAILED', baseContext, {
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        result: 'failure',
        errorMessage: 'Invalid credentials',
      });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'AUTH_LOGIN_FAILED',
          email: 'test@example.com',
          result: 'failure',
          errorMessage: 'Invalid credentials',
        }),
      });
    });

    it('should log event with metadata', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-3' });

      await auditLogger.logEvent('PAYMENT_SUCCEEDED', baseContext, {
        userId: 'user-123',
        result: 'success',
        metadata: {
          amount: 9900,
          currency: 'aud',
          subscriptionId: 'sub-123',
        },
      });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'PAYMENT_SUCCEEDED',
          metadata: JSON.stringify({
            amount: 9900,
            currency: 'aud',
            subscriptionId: 'sub-123',
          }),
        }),
      });
    });

    it('should handle null metadata', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-4' });

      await auditLogger.logEvent('AUTH_LOGOUT', baseContext, {
        userId: 'user-123',
        result: 'success',
      });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'AUTH_LOGOUT',
          metadata: null,
        }),
      });
    });

    it('should not throw when database logging fails', async () => {
      mockAuditLogCreate.mockRejectedValue(new Error('Database connection failed'));

      // Should not throw
      await expect(
        auditLogger.logEvent('AUTH_LOGIN_SUCCESS', baseContext, {
          userId: 'user-123',
          result: 'success',
        }),
      ).resolves.toBeUndefined();

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to log audit event',
        baseContext,
        expect.any(Error),
        expect.objectContaining({
          eventType: 'AUTH_LOGIN_SUCCESS',
        }),
      );
    });

    it('should log all supported event types', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });

      const eventTypes: AuditEventType[] = [
        'AUTH_LOGIN_SUCCESS',
        'AUTH_LOGIN_FAILED',
        'AUTH_LOGOUT',
        'AUTH_SIGNUP',
        'AUTH_PASSWORD_RESET_REQUEST',
        'AUTH_PASSWORD_RESET_COMPLETE',
        'AUTH_EMAIL_VERIFIED',
        'SUBSCRIPTION_CREATED',
        'SUBSCRIPTION_CANCELLED',
        'PAYMENT_SUCCEEDED',
        'PAYMENT_FAILED',
      ];

      for (const eventType of eventTypes) {
        await auditLogger.logEvent(eventType, baseContext, {
          userId: 'user-123',
          result: 'success',
        });
      }

      expect(mockAuditLogCreate).toHaveBeenCalledTimes(eventTypes.length);
    });

    it('should include timestamp in audit event', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });
      const beforeTime = new Date();

      await auditLogger.logEvent('AUTH_SIGNUP', baseContext, {
        userId: 'user-123',
        email: 'new@example.com',
        result: 'success',
      });

      const afterTime = new Date();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          auditEvent: expect.objectContaining({
            timestamp: expect.any(Date),
          }),
        }),
      );

      // Verify timestamp is within expected range
      const call = mockLoggerInfo.mock.calls[0];
      const loggedEvent = (call as any[])[2].auditEvent;
      expect(loggedEvent.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(loggedEvent.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('queryAuditLogs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        eventType: 'AUTH_LOGIN_SUCCESS',
        userId: 'user-1',
        email: 'user1@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        correlationId: 'corr-1',
        metadata: JSON.stringify({ browser: 'Chrome' }),
        result: 'success',
        errorMessage: null,
      },
      {
        id: 'log-2',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: null,
        email: 'attacker@example.com',
        ipAddress: '10.0.0.1',
        userAgent: null,
        correlationId: 'corr-2',
        metadata: null,
        result: 'failure',
        errorMessage: 'Invalid password',
      },
    ];

    it('should query logs without filters', async () => {
      mockAuditLogFindMany.mockResolvedValue(mockLogs);

      const result = await auditLogger.queryAuditLogs({});

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should query logs by date range', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[0]]);
      const startDate = new Date('2024-01-15T00:00:00Z');
      const endDate = new Date('2024-01-15T12:00:00Z');

      await auditLogger.queryAuditLogs({ startDate, endDate });

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: {
          timestamp: { gte: startDate, lte: endDate },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should query logs by userId', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[0]]);

      await auditLogger.queryAuditLogs({ userId: 'user-1' });

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should query logs by eventType', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[1]]);

      await auditLogger.queryAuditLogs({ eventType: 'AUTH_LOGIN_FAILED' });

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: { eventType: 'AUTH_LOGIN_FAILED' },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should query logs by result', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[1]]);

      await auditLogger.queryAuditLogs({ result: 'failure' });

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: { result: 'failure' },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should combine multiple filters', async () => {
      mockAuditLogFindMany.mockResolvedValue([]);
      const startDate = new Date('2024-01-01');

      await auditLogger.queryAuditLogs({
        startDate,
        userId: 'user-1',
        eventType: 'AUTH_LOGIN_SUCCESS',
        result: 'success',
      });

      expect(mockAuditLogFindMany).toHaveBeenCalledWith({
        where: {
          timestamp: { gte: startDate },
          userId: 'user-1',
          eventType: 'AUTH_LOGIN_SUCCESS',
          result: 'success',
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should transform database records to AuditEvent format', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[0]]);

      const result = await auditLogger.queryAuditLogs({});

      expect(result[0]).toEqual({
        id: 'log-1',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        eventType: 'AUTH_LOGIN_SUCCESS',
        userId: 'user-1',
        email: 'user1@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        correlationId: 'corr-1',
        metadata: { browser: 'Chrome' },
        result: 'success',
        errorMessage: undefined,
      });
    });

    it('should handle null fields correctly', async () => {
      mockAuditLogFindMany.mockResolvedValue([mockLogs[1]]);

      const result = await auditLogger.queryAuditLogs({});

      expect(result[0]).toEqual({
        id: 'log-2',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: undefined,
        email: 'attacker@example.com',
        ipAddress: '10.0.0.1',
        userAgent: undefined,
        correlationId: 'corr-2',
        metadata: undefined,
        result: 'failure',
        errorMessage: 'Invalid password',
      });
    });

    it('should handle empty correlationId', async () => {
      mockAuditLogFindMany.mockResolvedValue([{ ...mockLogs[0], correlationId: null }]);

      const result = await auditLogger.queryAuditLogs({});

      expect(result[0]?.correlationId).toBe('');
    });

    it('should return empty array on database error', async () => {
      mockAuditLogFindMany.mockRejectedValue(new Error('Database error'));

      const result = await auditLogger.queryAuditLogs({});

      expect(result).toEqual([]);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to query audit logs',
        { correlationId: 'query' },
        expect.any(Error),
      );
    });
  });

  describe('getFailedLoginAttempts', () => {
    it('should count failed login attempts by email', async () => {
      mockAuditLogCount.mockResolvedValue(5);

      const count = await auditLogger.getFailedLoginAttempts({ email: 'test@example.com' });

      expect(count).toBe(5);
      expect(mockAuditLogCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          eventType: 'AUTH_LOGIN_FAILED',
          email: 'test@example.com',
          timestamp: { gte: expect.any(Date) },
        }),
      });
    });

    it('should count failed login attempts by IP address', async () => {
      mockAuditLogCount.mockResolvedValue(10);

      const count = await auditLogger.getFailedLoginAttempts({ ipAddress: '192.168.1.1' });

      expect(count).toBe(10);
      expect(mockAuditLogCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          eventType: 'AUTH_LOGIN_FAILED',
          ipAddress: '192.168.1.1',
          timestamp: { gte: expect.any(Date) },
        }),
      });
    });

    it('should use default 30 minute window', async () => {
      mockAuditLogCount.mockResolvedValue(3);
      const beforeCall = Date.now();

      await auditLogger.getFailedLoginAttempts({ email: 'test@example.com' });

      const call = mockAuditLogCount.mock.calls[0] as any[];
      const sinceDate = call[0].where.timestamp.gte as Date;
      const expectedSince = beforeCall - 30 * 60 * 1000;

      // Should be within 1 second of expected time
      expect(Math.abs(sinceDate.getTime() - expectedSince)).toBeLessThan(1000);
    });

    it('should use custom time window', async () => {
      mockAuditLogCount.mockResolvedValue(2);
      const beforeCall = Date.now();

      await auditLogger.getFailedLoginAttempts({ email: 'test@example.com' }, 15);

      const call = mockAuditLogCount.mock.calls[0] as any[];
      const sinceDate = call[0].where.timestamp.gte as Date;
      const expectedSince = beforeCall - 15 * 60 * 1000;

      expect(Math.abs(sinceDate.getTime() - expectedSince)).toBeLessThan(1000);
    });

    it('should return 0 when no identifier provided', async () => {
      const count = await auditLogger.getFailedLoginAttempts({});

      expect(count).toBe(0);
      expect(mockAuditLogCount).not.toHaveBeenCalled();
    });

    it('should prefer email over IP when both provided', async () => {
      mockAuditLogCount.mockResolvedValue(3);

      await auditLogger.getFailedLoginAttempts({
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
      });

      expect(mockAuditLogCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          email: 'test@example.com',
        }),
      });

      // Verify ipAddress is not in the query when email is provided
      const call = mockAuditLogCount.mock.calls[0] as any[];
      expect(call[0].where.ipAddress).toBeUndefined();
    });

    it('should return 0 on database error', async () => {
      mockAuditLogCount.mockRejectedValue(new Error('Database error'));

      const count = await auditLogger.getFailedLoginAttempts({ email: 'test@example.com' });

      expect(count).toBe(0);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to count failed logins',
        { correlationId: 'security-check' },
        expect.any(Error),
      );
    });
  });

  describe('logAction', () => {
    it('should log CREATE action', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });

      await auditLogger.logAction('CREATE', 'Provider', 'provider-123', 'user-456');

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Data Action: CREATE Provider',
        expect.objectContaining({
          correlationId: expect.stringMatching(/^audit-create-\d+$/),
        }),
        expect.objectContaining({
          action: 'CREATE',
          modelName: 'Provider',
          recordId: 'provider-123',
          userId: 'user-456',
          journey: 'data-audit',
        }),
      );

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'DATA_CREATE',
          userId: 'user-456',
          result: 'success',
          metadata: JSON.stringify({
            modelName: 'Provider',
            recordId: 'provider-123',
            details: undefined,
          }),
        }),
      });
    });

    it('should log UPDATE action with details', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });

      await auditLogger.logAction('UPDATE', 'Program', 'program-789', 'user-456', {
        changedFields: ['title', 'description'],
        previousValues: { title: 'Old Title' },
      });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'DATA_UPDATE',
          metadata: JSON.stringify({
            modelName: 'Program',
            recordId: 'program-789',
            details: {
              changedFields: ['title', 'description'],
              previousValues: { title: 'Old Title' },
            },
          }),
        }),
      });
    });

    it('should log DELETE action', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });

      await auditLogger.logAction('DELETE', 'Subscription', 'sub-123', 'admin-001', {
        reason: 'User requested cancellation',
      });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'DATA_DELETE',
          userId: 'admin-001',
          metadata: expect.stringContaining('User requested cancellation'),
        }),
      });
    });

    it('should not throw when database logging fails', async () => {
      mockAuditLogCreate.mockRejectedValue(new Error('Database error'));

      await expect(
        auditLogger.logAction('CREATE', 'Provider', 'provider-123', 'user-456'),
      ).resolves.toBeUndefined();

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to log data action',
        expect.any(Object),
        expect.any(Error),
        expect.objectContaining({
          action: 'CREATE',
          modelName: 'Provider',
          recordId: 'provider-123',
        }),
      );
    });

    it('should generate unique correlation IDs', async () => {
      mockAuditLogCreate.mockResolvedValue({ id: 'audit-id' });

      await auditLogger.logAction('CREATE', 'Provider', 'p1', 'user-1');
      await auditLogger.logAction('UPDATE', 'Provider', 'p2', 'user-2');

      const calls = mockLoggerInfo.mock.calls;
      const correlationId1 = (calls[0] as any[])[1].correlationId;
      const correlationId2 = (calls[1] as any[])[1].correlationId;

      expect(correlationId1).toMatch(/^audit-create-\d+$/);
      expect(correlationId2).toMatch(/^audit-update-\d+$/);
      expect(correlationId1).not.toBe(correlationId2);
    });
  });

  describe('auditLogger singleton', () => {
    it('should export a singleton instance', async () => {
      const module = await import('../auditLogger');
      expect(module.auditLogger).toBeInstanceOf(module.AuditLogger);
    });
  });
});
