# Epic 4: Security, SRE & Observability
## Story 4.5: Health Checks & Readiness Probes

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅

**Can be implemented:** NOW ✅ (IMPLEMENTED)

*As an SRE, I want comprehensive health checks, so that we can detect and respond to service degradation before users are impacted.*

### Acceptance Criteria
1. `/api/health/live` endpoint returns basic liveness
2. `/api/health/ready` checks all critical dependencies:
   - Database connectivity
   - Stripe API availability
   - Email service status
3. Health checks complete within 5 seconds
4. Vercel monitors health endpoints every 30 seconds
5. Alerts trigger within 2 minutes of failures

### Development Tasks
- [x] Create health check API routes
- [x] Implement liveness check endpoint
- [x] Implement readiness check with dependency checks
- [x] Add database connectivity check
- [ ] Add Stripe API health check (waiting for Stripe integration)
- [ ] Add email service health check (waiting for email service integration)
- [x] Implement timeout handling
- [ ] Configure monitoring in Vercel
- [ ] Set up alerting rules
- [ ] Create health check dashboard

### Technical Details

#### Liveness Check
```typescript
// pages/api/health/live.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple check that the service is running
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'holiday-aggregator',
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  });
}
```

#### Readiness Check
```typescript
// pages/api/health/ready.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { checkStripeHealth } from '~/utils/stripe';
import { checkEmailService } from '~/utils/email';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  duration: number;
  error?: string;
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    stripe: HealthCheckResult;
    email: HealthCheckResult;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadinessResponse>
) {
  const startTime = Date.now();
  const timeout = 5000; // 5 second timeout
  
  const checks = await Promise.allSettled([
    withTimeout(checkDatabase(), timeout, 'database'),
    withTimeout(checkStripe(), timeout, 'stripe'),
    withTimeout(checkEmail(), timeout, 'email'),
  ]);
  
  const [dbCheck, stripeCheck, emailCheck] = checks.map(formatCheckResult);
  
  const allHealthy = 
    dbCheck.status === 'healthy' &&
    stripeCheck.status === 'healthy' &&
    emailCheck.status === 'healthy';
  
  const response: ReadinessResponse = {
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbCheck,
      stripe: stripeCheck,
      email: emailCheck,
    },
  };
  
  res.status(allHealthy ? 200 : 503).json(response);
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Simple query to check database connectivity
    await db.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      duration: Date.now() - start,
      error: error.message,
    };
  }
}

async function checkStripe(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Check Stripe API availability
    const result = await stripe.paymentIntents.list({ limit: 1 });
    return {
      status: 'healthy',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      duration: Date.now() - start,
      error: error.message,
    };
  }
}

async function checkEmail(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Check email service connectivity
    const result = await emailService.verify();
    return {
      status: result.ok ? 'healthy' : 'unhealthy',
      duration: Date.now() - start,
      error: result.ok ? undefined : 'Email service not responding',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      duration: Date.now() - start,
      error: error.message,
    };
  }
}
```

#### Monitoring Configuration
```typescript
// vercel.json
{
  "functions": {
    "pages/api/health/*.ts": {
      "maxDuration": 10
    }
  },
  "monitoring": {
    "checks": [
      {
        "path": "/api/health/live",
        "schedule": "rate(30 seconds)",
        "method": "GET"
      },
      {
        "path": "/api/health/ready",
        "schedule": "rate(1 minute)",
        "method": "GET"
      }
    ]
  }
}
```

#### Timeout Utility
```typescript
// utils/timeout.ts
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${name} health check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}
```

### Alert Rules
- Liveness check failure: Page immediately
- Readiness check failure (any dependency): Alert on-call
- Response time >3s: Warning
- 3 consecutive failures: Page immediately
- Database unhealthy: Critical alert
- Payment service unhealthy: Critical alert

### Testing Checklist
- [x] Verify liveness endpoint returns 200 OK
- [x] Test readiness with all dependencies healthy
- [x] Test readiness with database down
- [ ] Test readiness with Stripe unavailable (waiting for Stripe integration)
- [x] Test timeout handling works correctly
- [x] Verify response time is <5 seconds
- [ ] Test monitoring alerts trigger
- [x] Verify endpoints are not cached

### Definition of Done
- [x] Health check endpoints implemented
- [x] All dependency checks working (database only for now)
- [x] Timeout handling implemented
- [ ] Monitoring configured in Vercel
- [ ] Alert rules created
- [ ] Dashboard showing health status
- [ ] Runbooks for health check failures
- [x] Documentation updated
- [x] Code reviewed and approved
- [ ] Deployed to production