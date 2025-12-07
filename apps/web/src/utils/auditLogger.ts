import { db } from '~/server/db';
import { type LogContext, logger } from './logger';

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_SIGNUP'
  | 'AUTH_PASSWORD_RESET_REQUEST'
  | 'AUTH_PASSWORD_RESET_COMPLETE'
  | 'AUTH_EMAIL_VERIFIED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId: string;
  metadata?: Record<string, any>;
  result: 'success' | 'failure';
  errorMessage?: string;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  async logEvent(
    eventType: AuditEventType,
    context: LogContext,
    details: {
      userId?: string;
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      result: 'success' | 'failure';
      metadata?: Record<string, any>;
      errorMessage?: string;
    },
  ): Promise<void> {
    const auditEvent: Omit<AuditEvent, 'id'> = {
      timestamp: new Date(),
      eventType,
      correlationId: context.correlationId,
      ...details,
    };

    try {
      // Log to structured logger first (for real-time monitoring)
      logger.info(`Audit Event: ${eventType}`, context, {
        auditEvent,
        journey: 'authentication',
      });

      // Persist to database
      await db.auditLog.create({
        data: {
          eventType,
          userId: details.userId,
          email: details.email,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent,
          correlationId: context.correlationId,
          metadata: details.metadata ? JSON.stringify(details.metadata) : null,
          result: details.result,
          errorMessage: details.errorMessage,
        },
      });
    } catch (error) {
      // Never let audit logging failure break the main flow
      logger.error('Failed to log audit event', context, error as Error, {
        eventType,
        originalEvent: auditEvent,
      });
    }
  }

  /**
   * Query audit logs (for compliance reporting)
   */
  async queryAuditLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    eventType?: AuditEventType;
    result?: 'success' | 'failure';
  }): Promise<AuditEvent[]> {
    try {
      const where: any = {};

      if (filters.startDate) {
        where.timestamp = { gte: filters.startDate };
      }

      if (filters.endDate) {
        where.timestamp = { ...where.timestamp, lte: filters.endDate };
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.eventType) {
        where.eventType = filters.eventType;
      }

      if (filters.result) {
        where.result = filters.result;
      }

      const logs = await db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 100, // Limit to 100 for now
      });

      return logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        eventType: log.eventType as AuditEventType,
        userId: log.userId || undefined,
        email: log.email || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        correlationId: log.correlationId || '',
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
        result: log.result as 'success' | 'failure',
        errorMessage: log.errorMessage || undefined,
      }));
    } catch (error) {
      logger.error('Failed to query audit logs', { correlationId: 'query' }, error as Error);
      return [];
    }
  }

  /**
   * Get failed login attempts for a user/IP
   */
  async getFailedLoginAttempts(
    identifier: { email?: string; ipAddress?: string },
    sinceMinutes: number = 30,
  ): Promise<number> {
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

    try {
      const where: any = {
        eventType: 'AUTH_LOGIN_FAILED',
        timestamp: { gte: since },
      };

      if (identifier.email) {
        where.email = identifier.email;
      } else if (identifier.ipAddress) {
        where.ipAddress = identifier.ipAddress;
      } else {
        return 0;
      }

      return await db.auditLog.count({ where });
    } catch (error) {
      logger.error('Failed to count failed logins', { correlationId: 'security-check' }, error as Error);
      return 0;
    }
  }

  /**
   * Log a data action for audit trail
   */
  async logAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    modelName: string,
    recordId: string,
    userId: string,
    details?: Record<string, any>,
  ): Promise<void> {
    const context: LogContext = {
      correlationId: `audit-${action.toLowerCase()}-${Date.now()}`,
    };

    try {
      logger.info(`Data Action: ${action} ${modelName}`, context, {
        action,
        modelName,
        recordId,
        userId,
        details,
        journey: 'data-audit',
      });

      // Persist to database
      await db.auditLog.create({
        data: {
          eventType: `DATA_${action}`,
          userId,
          correlationId: context.correlationId,
          metadata: JSON.stringify({
            modelName,
            recordId,
            details,
          }),
          result: 'success',
        },
      });
    } catch (error) {
      logger.error('Failed to log data action', context, error as Error, {
        action,
        modelName,
        recordId,
      });
    }
  }
}

export const auditLogger = new AuditLogger();
