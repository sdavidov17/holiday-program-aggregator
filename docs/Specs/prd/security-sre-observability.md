# Security, SRE, and Observability Strategy

## Overview
This document outlines the comprehensive security, reliability, and observability practices for the Holiday Program Aggregator platform. Our approach focuses on building these practices into the application from day one, ensuring we can monitor critical user journeys and proactively detect issues.

## Critical User Journeys

Based on the PRD, these are the critical user journeys we must monitor:

1. **User Registration & Authentication**
   - Email/password signup
   - Google OAuth login
   - Apple OAuth login
   - Session management

2. **Subscription Management**
   - Payment processing via Stripe
   - Subscription activation
   - Renewal reminders
   - Access control for expired subscriptions

3. **Program Search & Discovery**
   - Geospatial search queries
   - Filter applications
   - Program detail views
   - Provider information display

4. **User Preferences & Notifications**
   - Preference saving
   - Automated email generation
   - Notification delivery

5. **Admin Operations**
   - Provider vetting workflow
   - Data crawling operations
   - Manual data entry

## Security Implementation

### 1. Application Security Headers
```typescript
// middleware.ts
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
```

### 2. Content Security Policy (CSP)
```typescript
export const cspHeader = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.stripe.com https://*.sentry.io;
    frame-src https://js.stripe.com;
  `.replace(/\s{2,}/g, ' ').trim()
};
```

### 3. Authentication Security
- Implement secure session management with rotating tokens
- Add rate limiting on login endpoints
- Implement account lockout after failed attempts
- Audit log all authentication events
- Use Argon2 for password hashing

### 4. Input Validation & Sanitization
- Zod schemas for all API inputs
- SQL parameterized queries (via Prisma)
- HTML sanitization for user-generated content
- File upload restrictions and scanning

## SRE & Reliability

### 1. Service Level Objectives (SLOs)

#### Critical User Journey SLOs

| Journey | SLI | SLO Target | Alert Threshold |
|---------|-----|------------|-----------------|
| User Login | Success Rate | 99.9% | < 99.5% |
| User Login | P95 Latency | < 1s | > 2s |
| Payment Processing | Success Rate | 99.5% | < 99% |
| Search Queries | P95 Latency | < 500ms | > 1s |
| Search Queries | Availability | 99.9% | < 99.5% |
| Program Detail View | P95 Latency | < 300ms | > 500ms |
| Email Delivery | Success Rate | 99% | < 95% |

### 2. Health Checks & Readiness Probes

```typescript
// /api/health endpoints
export const healthChecks = {
  '/api/health/live': basicLivenessCheck,
  '/api/health/ready': comprehensiveReadinessCheck,
  '/api/health/dependencies': externalDependencyCheck
};
```

### 3. Circuit Breakers
Implement circuit breakers for:
- External API calls (Stripe, OAuth providers)
- Database connections
- Email service
- Web crawler operations

## Observability Implementation

### 1. OpenTelemetry Setup

```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'holiday-aggregator',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERSION,
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
});
```

### 2. Structured Logging

```typescript
// logger.ts
interface LogContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
  traceId?: string;
  spanId?: string;
}

export const logger = {
  info: (message: string, context: LogContext, data?: any) => {},
  warn: (message: string, context: LogContext, data?: any) => {},
  error: (message: string, context: LogContext, error?: Error) => {},
};
```

### 3. Key Metrics to Track

#### Business Metrics
- User registrations per hour
- Subscription conversions
- Search queries per minute
- Programs viewed per user
- Email open rates

#### Technical Metrics
- API endpoint latencies (P50, P95, P99)
- Database query performance
- External API response times
- Error rates by endpoint
- Cache hit rates

#### Infrastructure Metrics
- CPU and memory usage
- Database connection pool stats
- Queue depths
- Background job processing times

### 4. Error Tracking with Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^https:\/\/yourapp\.com/],
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],
  beforeSend(event, hint) {
    // Scrub PII from events
    return scrubPII(event);
  },
});
```

## Monitoring & Alerting Strategy

### 1. Critical Alerts (Page immediately)
- Authentication service down
- Payment processing failures > 5% 
- Database unreachable
- Search API errors > 10%
- Security breach indicators

### 2. Warning Alerts (Notify on-call)
- Latency degradation > 50%
- Error rate increase > 2x baseline
- Background job queue backup
- Low disk space < 20%

### 3. Synthetic Monitoring
Set up synthetic tests for critical user journeys:

```typescript
// synthetic-tests/user-journey.ts
export const criticalJourneys = [
  {
    name: 'user-signup-flow',
    steps: [
      { action: 'navigate', url: '/signup' },
      { action: 'fill', selector: '#email', value: 'test@example.com' },
      { action: 'fill', selector: '#password', value: 'TestPass123!' },
      { action: 'click', selector: '#submit' },
      { action: 'waitForNavigation', url: '/dashboard' },
    ],
    frequency: '5m',
    regions: ['ap-southeast-2'], // Sydney
  },
  {
    name: 'search-and-view-program',
    steps: [
      { action: 'navigate', url: '/search' },
      { action: 'fill', selector: '#location', value: '2000' }, // Sydney CBD
      { action: 'click', selector: '#search-button' },
      { action: 'waitForSelector', selector: '.program-card' },
      { action: 'click', selector: '.program-card:first-child' },
      { action: 'waitForSelector', selector: '.program-details' },
    ],
    frequency: '5m',
    regions: ['ap-southeast-2'],
  },
];
```

### 4. Dashboard Setup
Create operational dashboards for:

1. **User Journey Dashboard**
   - Funnel visualization for each journey
   - Success rates and drop-off points
   - Performance metrics per step

2. **System Health Dashboard**
   - Service availability
   - API latencies
   - Error rates
   - Database performance

3. **Security Dashboard**
   - Failed login attempts
   - Suspicious activity patterns
   - API rate limit violations
   - Authentication audit trail

## Implementation Priority

1. **Phase 1 (Week 1-2)**
   - Basic health checks
   - Security headers and CSP
   - Structured logging with correlation IDs
   - Sentry integration

2. **Phase 2 (Week 3-4)**
   - OpenTelemetry setup
   - Critical journey monitoring
   - Basic alerting rules
   - Authentication audit logging

3. **Phase 3 (Week 5-6)**
   - Synthetic monitoring
   - Advanced dashboards
   - Rate limiting
   - Circuit breakers

## Tools & Services Recommendations

1. **Observability Stack**
   - Tracing: Honeycomb or Datadog
   - Metrics: Prometheus + Grafana or Datadog
   - Logs: Datadog or CloudWatch
   - Error Tracking: Sentry

2. **Security Tools**
   - WAF: Cloudflare or AWS WAF
   - DDoS Protection: Cloudflare
   - Secrets Management: AWS Secrets Manager or Vercel
   - Vulnerability Scanning: Snyk or GitHub Advanced Security

3. **Monitoring Services**
   - Synthetic Monitoring: Datadog Synthetics or Checkly
   - Status Page: Statuspage.io or Instatus
   - On-call Management: PagerDuty or Opsgenie

## Compliance & Privacy

Given Australian Privacy Principles (APP) requirements:

1. **Data Minimization**
   - Only collect necessary data
   - Implement data retention policies
   - Provide data export/deletion capabilities

2. **Audit Logging**
   - Log all data access
   - Maintain audit trail for 2 years
   - Ensure logs don't contain PII

3. **Encryption**
   - TLS 1.3 for all communications
   - AES-256 for data at rest
   - Field-level encryption for sensitive data

## Incident Response

1. **Runbooks for common scenarios**
   - Database outage
   - Payment processing failure
   - Authentication service issues
   - Data breach response

2. **Post-mortem process**
   - Blameless culture
   - Root cause analysis
   - Action items tracking
   - Knowledge sharing

## Next Steps

1. Set up basic monitoring infrastructure
2. Implement security headers and CSP
3. Add structured logging to all critical paths
4. Create alerting rules for critical journeys
5. Set up synthetic monitoring for user flows