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

      // In a real implementation, we would store this in a separate audit database
      // For now, we'll just log it. When implementing, create an AuditLog table:
      /*
      await db.auditLog.create({
        data: {
          eventType,
          userId: details.userId,
          email: details.email,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent,
          correlationId: context.correlationId,
          metadata: details.metadata,
          result: details.result,
          errorMessage: details.errorMessage,
        },
      });
      */
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
    // Placeholder for when we have the database table
    // This would query the audit log table with appropriate filters
    logger.info(
      'Audit log query requested',
      {
        correlationId: `audit-query-${Date.now()}`,
      } as LogContext,
      { filters },
    );

    return [];
  }

  /**
   * Get failed login attempts for a user/IP
   */
  async getFailedLoginAttempts(
    identifier: { email?: string; ipAddress?: string },
    sinceMinutes: number = 30,
  ): Promise<number> {
    const _since = new Date(Date.now() - sinceMinutes * 60 * 1000);
>>>>>>> origin/main

    // Placeholder - would query the audit log table
    logger.info(
      'Failed login attempt check',
      {
        correlationId: `login-check-${Date.now()}`,
      } as LogContext,
      { identifier, sinceMinutes },
    );

    return 0;
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

    logger.info(`Data Action: ${action} ${modelName}`, context, {
      action,
      modelName,
      recordId,
      userId,
      details,
      journey: 'data-audit',
    });

    // In production, this would write to an audit log table
    // For now, just log it for monitoring
  }
}

export const auditLogger = new AuditLogger();
