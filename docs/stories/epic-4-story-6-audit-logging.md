# Epic 4: Security, SRE & Observability
## Story 4.6: Authentication Audit Logging

**Dependencies:** 
- Epic 1, Story 1.2 (User Account System) - REQUIRED (auth events to log)
- Epic 4, Story 4.2 (Structured Logging) - For consistent log format

**Can be implemented:** After Epic 1, Story 1.2

*As a compliance officer, I want all authentication events logged, so that we can meet Australian Privacy Principles requirements.*

### Acceptance Criteria
1. Log all authentication events: login, logout, failed attempts
2. Include: timestamp, userId, IP address, user agent, result
3. Failed login attempts trigger alerts after 5 attempts
4. Audit logs stored separately with 2-year retention
5. Audit log access is restricted and logged
6. Monthly compliance reports generated automatically

### Development Tasks
- [ ] Create audit log database schema
- [ ] Implement audit logging service
- [ ] Hook into NextAuth.js events
- [ ] Create failed login tracking
- [ ] Implement secure audit log storage
- [ ] Set up retention policies
- [ ] Create compliance reporting queries
- [ ] Implement audit log access controls
- [ ] Set up automated monthly reports
- [ ] Create audit log viewer UI for admins

### Technical Details

#### Audit Log Schema
```prisma
// schema.prisma
model AuditLog {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now())
  eventType     String   // login, logout, failed_login, password_reset, etc.
  userId        String?
  ipAddress     String
  userAgent     String
  result        String   // success, failure
  errorMessage  String?
  metadata      Json?    // Additional context
  correlationId String?
  
  @@index([timestamp])
  @@index([userId])
  @@index([eventType])
  @@index([ipAddress])
}

model FailedLoginAttempt {
  id            String   @id @default(cuid())
  identifier    String   // email or username
  ipAddress     String
  attemptCount  Int      @default(1)
  firstAttempt  DateTime @default(now())
  lastAttempt   DateTime @default(now())
  blocked       Boolean  @default(false)
  
  @@unique([identifier, ipAddress])
  @@index([lastAttempt])
}
```

#### Audit Logging Service
```typescript
// services/auditLog.ts
import { db } from '~/server/db';
import { getClientIp } from '~/utils/request';

export class AuditLogger {
  async logAuthEvent({
    eventType,
    userId,
    request,
    result,
    errorMessage,
    metadata,
  }: {
    eventType: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'account_locked';
    userId?: string;
    request: NextApiRequest;
    result: 'success' | 'failure';
    errorMessage?: string;
    metadata?: Record<string, any>;
  }) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const correlationId = request.headers['x-correlation-id'] as string;
    
    // Log to audit table
    await db.auditLog.create({
      data: {
        eventType,
        userId,
        ipAddress,
        userAgent,
        result,
        errorMessage,
        metadata,
        correlationId,
      },
    });
    
    // Track failed login attempts
    if (eventType === 'failed_login' && metadata?.identifier) {
      await this.trackFailedLogin(metadata.identifier as string, ipAddress);
    }
  }
  
  private async trackFailedLogin(identifier: string, ipAddress: string) {
    const existing = await db.failedLoginAttempt.findUnique({
      where: {
        identifier_ipAddress: {
          identifier,
          ipAddress,
        },
      },
    });
    
    if (existing) {
      const updated = await db.failedLoginAttempt.update({
        where: { id: existing.id },
        data: {
          attemptCount: existing.attemptCount + 1,
          lastAttempt: new Date(),
          blocked: existing.attemptCount + 1 >= 5,
        },
      });
      
      if (updated.blocked && existing.attemptCount < 5) {
        // Trigger alert for newly blocked account
        await this.alertSecurityTeam({
          type: 'account_blocked',
          identifier,
          ipAddress,
          attemptCount: updated.attemptCount,
        });
      }
    } else {
      await db.failedLoginAttempt.create({
        data: {
          identifier,
          ipAddress,
        },
      });
    }
  }
}
```

#### NextAuth.js Integration
```typescript
// pages/api/auth/[...nextauth].ts
import { AuditLogger } from '~/services/auditLog';

const auditLogger = new AuditLogger();

export default NextAuth({
  // ... other config
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      await auditLogger.logAuthEvent({
        eventType: 'login',
        userId: user.id,
        request: req,
        result: 'success',
        metadata: {
          provider: account.provider,
          isNewUser,
        },
      });
    },
    
    async signOut({ token }) {
      await auditLogger.logAuthEvent({
        eventType: 'logout',
        userId: token.sub,
        request: req,
        result: 'success',
      });
    },
  },
  
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Check if account is blocked
      const blocked = await checkIfBlocked(email || user.email);
      if (blocked) {
        await auditLogger.logAuthEvent({
          eventType: 'failed_login',
          request: req,
          result: 'failure',
          errorMessage: 'Account blocked due to multiple failed attempts',
          metadata: {
            identifier: email || user.email,
            reason: 'blocked',
          },
        });
        return false;
      }
      return true;
    },
  },
});
```

#### Compliance Reporting
```typescript
// services/complianceReports.ts
export async function generateMonthlyComplianceReport(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  const report = {
    period: {
      start: startOfMonth,
      end: endOfMonth,
    },
    summary: {
      totalLogins: await db.auditLog.count({
        where: {
          eventType: 'login',
          result: 'success',
          timestamp: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      failedLogins: await db.auditLog.count({
        where: {
          eventType: 'failed_login',
          timestamp: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      uniqueUsers: await db.auditLog.findMany({
        where: {
          eventType: 'login',
          result: 'success',
          timestamp: { gte: startOfMonth, lte: endOfMonth },
        },
        distinct: ['userId'],
      }).then(logs => logs.length),
      blockedAccounts: await db.failedLoginAttempt.count({
        where: {
          blocked: true,
          lastAttempt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    },
    securityIncidents: await getSecurityIncidents(startOfMonth, endOfMonth),
    dataAccessPatterns: await getDataAccessPatterns(startOfMonth, endOfMonth),
  };
  
  return report;
}
```

### Retention Policy Implementation
```typescript
// jobs/auditLogRetention.ts
export async function cleanupOldAuditLogs() {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  // Archive old logs before deletion
  const oldLogs = await db.auditLog.findMany({
    where: {
      timestamp: { lt: twoYearsAgo },
    },
  });
  
  if (oldLogs.length > 0) {
    // Archive to cold storage
    await archiveToS3(oldLogs);
    
    // Delete from active database
    await db.auditLog.deleteMany({
      where: {
        timestamp: { lt: twoYearsAgo },
      },
    });
  }
}
```

### Testing Checklist
- [ ] Verify login events are logged
- [ ] Verify logout events are logged
- [ ] Test failed login tracking
- [ ] Verify account blocking after 5 attempts
- [ ] Test audit log retention
- [ ] Verify compliance reports generate correctly
- [ ] Test audit log access controls
- [ ] Verify no PII in logs except where required

### Definition of Done
- [ ] Audit log schema created
- [ ] Authentication events logged
- [ ] Failed login tracking implemented
- [ ] Account blocking logic working
- [ ] Retention policy automated
- [ ] Compliance reports automated
- [ ] Access controls implemented
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to production