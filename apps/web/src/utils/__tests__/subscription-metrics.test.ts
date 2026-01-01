/**
 * Subscription Metrics Collector Test Suite
 * Tests for metrics collection and alert logging during subscription lifecycle processing
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { SubscriptionMetricsCollector } from '../subscription-metrics';

describe('SubscriptionMetricsCollector', () => {
  let collector: SubscriptionMetricsCollector;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    collector = new SubscriptionMetricsCollector();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with zero metrics', () => {
      const metrics = collector.getMetrics();

      expect(metrics.remindersQueued).toBe(0);
      expect(metrics.remindersSent).toBe(0);
      expect(metrics.remindersFailed).toBe(0);
      expect(metrics.subscriptionsExpired).toBe(0);
      expect(metrics.expirationNoticesSent).toBe(0);
      expect(metrics.expirationNoticesFailed).toBe(0);
      expect(metrics.totalErrors).toBe(0);
    });

    it('should set timestamp on initialization', () => {
      const metrics = collector.getMetrics();

      expect(metrics.timestamp).toBeDefined();
      expect(new Date(metrics.timestamp).getTime()).not.toBeNaN();
    });

    it('should track start time for processing duration', () => {
      const metrics = collector.getMetrics();

      expect(metrics.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('incrementRemindersQueued', () => {
    it('should increment by 1 when called without argument', () => {
      collector.incrementRemindersQueued();

      const metrics = collector.getMetrics();
      expect(metrics.remindersQueued).toBe(1);
    });

    it('should increment by specified count', () => {
      collector.incrementRemindersQueued(5);

      const metrics = collector.getMetrics();
      expect(metrics.remindersQueued).toBe(5);
    });

    it('should accumulate multiple calls', () => {
      collector.incrementRemindersQueued(3);
      collector.incrementRemindersQueued(2);
      collector.incrementRemindersQueued();

      const metrics = collector.getMetrics();
      expect(metrics.remindersQueued).toBe(6);
    });
  });

  describe('incrementRemindersSent', () => {
    it('should increment by 1 when called without argument', () => {
      collector.incrementRemindersSent();

      const metrics = collector.getMetrics();
      expect(metrics.remindersSent).toBe(1);
    });

    it('should increment by specified count', () => {
      collector.incrementRemindersSent(10);

      const metrics = collector.getMetrics();
      expect(metrics.remindersSent).toBe(10);
    });

    it('should accumulate multiple calls', () => {
      collector.incrementRemindersSent(5);
      collector.incrementRemindersSent(3);

      const metrics = collector.getMetrics();
      expect(metrics.remindersSent).toBe(8);
    });
  });

  describe('incrementRemindersFailed', () => {
    it('should increment remindersFailed by 1 when called without argument', () => {
      collector.incrementRemindersFailed();

      const metrics = collector.getMetrics();
      expect(metrics.remindersFailed).toBe(1);
    });

    it('should also increment totalErrors', () => {
      collector.incrementRemindersFailed();

      const metrics = collector.getMetrics();
      expect(metrics.totalErrors).toBe(1);
    });

    it('should increment both counters by specified count', () => {
      collector.incrementRemindersFailed(3);

      const metrics = collector.getMetrics();
      expect(metrics.remindersFailed).toBe(3);
      expect(metrics.totalErrors).toBe(3);
    });

    it('should accumulate with other error types', () => {
      collector.incrementRemindersFailed(2);
      collector.incrementExpirationNoticesFailed(3);

      const metrics = collector.getMetrics();
      expect(metrics.remindersFailed).toBe(2);
      expect(metrics.expirationNoticesFailed).toBe(3);
      expect(metrics.totalErrors).toBe(5);
    });
  });

  describe('incrementSubscriptionsExpired', () => {
    it('should increment by 1 when called without argument', () => {
      collector.incrementSubscriptionsExpired();

      const metrics = collector.getMetrics();
      expect(metrics.subscriptionsExpired).toBe(1);
    });

    it('should increment by specified count', () => {
      collector.incrementSubscriptionsExpired(7);

      const metrics = collector.getMetrics();
      expect(metrics.subscriptionsExpired).toBe(7);
    });

    it('should not affect totalErrors', () => {
      collector.incrementSubscriptionsExpired(5);

      const metrics = collector.getMetrics();
      expect(metrics.totalErrors).toBe(0);
    });
  });

  describe('incrementExpirationNoticesSent', () => {
    it('should increment by 1 when called without argument', () => {
      collector.incrementExpirationNoticesSent();

      const metrics = collector.getMetrics();
      expect(metrics.expirationNoticesSent).toBe(1);
    });

    it('should increment by specified count', () => {
      collector.incrementExpirationNoticesSent(4);

      const metrics = collector.getMetrics();
      expect(metrics.expirationNoticesSent).toBe(4);
    });
  });

  describe('incrementExpirationNoticesFailed', () => {
    it('should increment expirationNoticesFailed by 1 when called without argument', () => {
      collector.incrementExpirationNoticesFailed();

      const metrics = collector.getMetrics();
      expect(metrics.expirationNoticesFailed).toBe(1);
    });

    it('should also increment totalErrors', () => {
      collector.incrementExpirationNoticesFailed();

      const metrics = collector.getMetrics();
      expect(metrics.totalErrors).toBe(1);
    });

    it('should increment both counters by specified count', () => {
      collector.incrementExpirationNoticesFailed(4);

      const metrics = collector.getMetrics();
      expect(metrics.expirationNoticesFailed).toBe(4);
      expect(metrics.totalErrors).toBe(4);
    });
  });

  describe('getMetrics', () => {
    it('should return a copy of metrics', () => {
      collector.incrementRemindersSent(5);

      const metrics1 = collector.getMetrics();
      const metrics2 = collector.getMetrics();

      expect(metrics1).not.toBe(metrics2);
      expect(metrics1).toEqual(metrics2);
    });

    it('should calculate processingTimeMs from start time', async () => {
      // Wait a small amount to ensure measurable time difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const metrics = collector.getMetrics();

      expect(metrics.processingTimeMs).toBeGreaterThanOrEqual(10);
    });

    it('should include all metric fields', () => {
      const metrics = collector.getMetrics();

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('remindersQueued');
      expect(metrics).toHaveProperty('remindersSent');
      expect(metrics).toHaveProperty('remindersFailed');
      expect(metrics).toHaveProperty('subscriptionsExpired');
      expect(metrics).toHaveProperty('expirationNoticesSent');
      expect(metrics).toHaveProperty('expirationNoticesFailed');
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics).toHaveProperty('processingTimeMs');
    });
  });

  describe('logMetrics', () => {
    it('should log metrics to console', () => {
      collector.logMetrics();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Subscription Lifecycle Metrics:',
        expect.stringContaining('"remindersQueued"'),
      );
    });

    it('should return metrics object', () => {
      const result = collector.logMetrics();

      expect(result).toHaveProperty('remindersQueued');
      expect(result).toHaveProperty('processingTimeMs');
    });

    describe('alert conditions', () => {
      it('should log error when totalErrors > 0', () => {
        collector.incrementRemindersFailed(2);

        collector.logMetrics();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ALERT: 2 errors occurred during subscription lifecycle processing',
        );
      });

      it('should not log error when totalErrors is 0', () => {
        collector.incrementRemindersSent(5);

        collector.logMetrics();

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('errors occurred'),
        );
      });

      it('should log warning when processingTimeMs > 30000', () => {
        // Mock Date.now to simulate long processing time
        const originalDateNow = Date.now;
        const startTime = Date.now();

        // Create new collector and immediately mock Date.now to return future time
        const slowCollector = new SubscriptionMetricsCollector();

        // Mock Date.now to return 35 seconds after start
        jest.spyOn(Date, 'now').mockReturnValue(startTime + 35000);

        slowCollector.logMetrics();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('ALERT: Subscription lifecycle processing took'),
        );

        // Restore
        Date.now = originalDateNow;
      });

      it('should not log warning when processingTimeMs <= 30000', () => {
        collector.logMetrics();

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should log error when remindersFailed > remindersSent', () => {
        collector.incrementRemindersFailed(5);
        collector.incrementRemindersSent(2);

        collector.logMetrics();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ALERT: More reminder failures than successes',
        );
      });

      it('should not log failure ratio error when remindersFailed <= remindersSent', () => {
        collector.incrementRemindersFailed(2);
        collector.incrementRemindersSent(5);

        collector.logMetrics();

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          'ALERT: More reminder failures than successes',
        );
      });

      it('should log multiple alerts when multiple conditions are met', () => {
        collector.incrementRemindersFailed(10);
        collector.incrementRemindersSent(2);

        collector.logMetrics();

        // Should have both: totalErrors alert and failure ratio alert
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ALERT: 10 errors occurred during subscription lifecycle processing',
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ALERT: More reminder failures than successes',
        );
      });
    });
  });

  describe('full workflow', () => {
    it('should track a complete subscription lifecycle run', () => {
      // Simulate a lifecycle run
      collector.incrementRemindersQueued(10);
      collector.incrementRemindersSent(8);
      collector.incrementRemindersFailed(2);
      collector.incrementSubscriptionsExpired(5);
      collector.incrementExpirationNoticesSent(4);
      collector.incrementExpirationNoticesFailed(1);

      const metrics = collector.getMetrics();

      expect(metrics.remindersQueued).toBe(10);
      expect(metrics.remindersSent).toBe(8);
      expect(metrics.remindersFailed).toBe(2);
      expect(metrics.subscriptionsExpired).toBe(5);
      expect(metrics.expirationNoticesSent).toBe(4);
      expect(metrics.expirationNoticesFailed).toBe(1);
      expect(metrics.totalErrors).toBe(3); // 2 reminder failures + 1 expiration notice failure
    });

    it('should properly log complete workflow metrics', () => {
      collector.incrementRemindersQueued(5);
      collector.incrementRemindersSent(5);
      collector.incrementSubscriptionsExpired(3);
      collector.incrementExpirationNoticesSent(3);

      const result = collector.logMetrics();

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(result.remindersQueued).toBe(5);
      expect(result.remindersSent).toBe(5);
      expect(result.subscriptionsExpired).toBe(3);
      expect(result.expirationNoticesSent).toBe(3);
      expect(result.totalErrors).toBe(0);
    });
  });
});
