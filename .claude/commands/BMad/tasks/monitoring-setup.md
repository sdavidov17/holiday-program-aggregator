# Monitoring Setup Task

Execute this task to set up or review monitoring and observability configuration.

## Task Configuration

```yaml
task:
  id: monitoring-setup
  name: Monitoring Setup
  description: Configure comprehensive monitoring and alerting
  agent: devops
  elicit: true
  interactive: true
```

## Execution Instructions

When this task is invoked, follow these steps:

### Step 1: Current State Assessment

ASK USER: "What aspect of monitoring would you like to configure or review?"

Present options:
```
1. Application Metrics (response times, error rates)
2. Infrastructure Monitoring (database, serverless functions)
3. Alerting Configuration (PagerDuty, Slack)
4. Logging Setup (structured logging, log aggregation)
5. Real User Monitoring (RUM)
6. Synthetic Monitoring (uptime checks)
7. Full Stack Review (all of the above)
```

### Step 2: Monitoring Stack Recommendations

Based on current project setup:

```
## Recommended Monitoring Stack

### Current (Already Configured)
- Vercel Analytics: Basic performance metrics
- Vercel Logs: Function execution logs
- GitHub Actions: CI/CD pipeline visibility

### Recommended Additions

#### Error Tracking - Sentry (Priority: HIGH)
Purpose: Capture and track application errors with context

Implementation:
1. Install: `pnpm add @sentry/nextjs`
2. Configure in `sentry.client.config.ts` and `sentry.server.config.ts`
3. Add to `next.config.js` with Sentry webpack plugin
4. Set SENTRY_DSN environment variable

#### Structured Logging - Pino (Priority: HIGH)
Purpose: JSON-formatted logs for better searchability

Implementation:
1. Install: `pnpm add pino pino-pretty`
2. Create logger utility in `src/lib/logger.ts`
3. Replace console.log with structured logger
4. Include correlation IDs in all log entries

#### Synthetic Monitoring - Checkly (Priority: MEDIUM)
Purpose: Uptime monitoring and synthetic checks

Implementation:
1. Create Checkly account
2. Configure checks for critical endpoints:
   - Homepage availability
   - API health endpoint
   - Authentication flow
   - Payment flow (test mode)

#### APM - Vercel Speed Insights (Priority: MEDIUM)
Purpose: Core Web Vitals and performance monitoring

Implementation:
1. Enable in Vercel dashboard
2. Add `@vercel/speed-insights` package
3. Include SpeedInsights component in app
```

### Step 3: Key Metrics Definition

```
## Application Metrics (SLOs)

### Availability
- Target: 99.9% uptime
- Measurement: Successful responses / Total requests
- Alert threshold: < 99.5% over 5 minutes

### Latency
- Target: p95 < 200ms for API calls
- Target: p95 < 2s for page loads
- Alert threshold: p95 > 500ms for 5 minutes

### Error Rate
- Target: < 1% error rate
- Measurement: 5xx errors / Total requests
- Alert threshold: > 2% for 5 minutes

### Throughput
- Baseline: Establish current RPS
- Alert: > 200% of baseline (potential attack)
- Alert: < 50% of baseline (potential outage)
```

### Step 4: Alerting Configuration

```
## Alert Priority Matrix

| Metric | P1 Threshold | P2 Threshold | P3 Threshold |
|--------|-------------|--------------|--------------|
| Error Rate | > 10% | > 5% | > 2% |
| Latency (p95) | > 5s | > 2s | > 500ms |
| Availability | < 95% | < 99% | < 99.5% |
| DB Connections | Pool exhausted | > 80% pool | > 60% pool |

## Alert Routing

### P1 - Critical
- Channel: PagerDuty (immediate page)
- Slack: #incidents (auto-post)
- Response: < 5 minutes

### P2 - High
- Channel: Slack #alerts + PagerDuty (low urgency)
- Response: < 15 minutes

### P3 - Medium
- Channel: Slack #alerts
- Response: < 1 hour

### P4 - Low
- Channel: Email digest
- Response: Next business day
```

### Step 5: Logging Standards

```
## Structured Logging Format

{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info|warn|error|debug",
  "correlationId": "uuid-v4",
  "service": "holiday-program-aggregator",
  "environment": "production|staging|development",
  "message": "Human readable message",
  "context": {
    "userId": "optional",
    "action": "api.provider.search",
    "duration": 150,
    "statusCode": 200
  },
  "error": {
    "name": "ErrorType",
    "message": "Error details",
    "stack": "Stack trace (non-prod only)"
  }
}

## Log Levels

- ERROR: Application errors requiring attention
- WARN: Potential issues, degraded behavior
- INFO: Significant business events (login, payment, etc.)
- DEBUG: Detailed technical info (non-prod only)

## Security Event Logging

Always log these security events:
- Authentication attempts (success/failure)
- Authorization failures
- Rate limit triggers
- Suspicious patterns (enumeration attempts)
- Admin actions
- Data access to sensitive records
```

### Step 6: Implementation Checklist

```
## Monitoring Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Sentry for error tracking
- [ ] Implement structured logging with Pino
- [ ] Add correlation IDs to all requests
- [ ] Configure basic Vercel Analytics

### Phase 2: Alerting (Week 2)
- [ ] Define SLOs and error budgets
- [ ] Configure Slack alerts integration
- [ ] Set up critical path alerts
- [ ] Document on-call procedures

### Phase 3: Observability (Week 3)
- [ ] Add synthetic monitoring (Checkly)
- [ ] Enable Vercel Speed Insights
- [ ] Create monitoring dashboard
- [ ] Test alert routing

### Phase 4: Optimization (Week 4)
- [ ] Review and tune alert thresholds
- [ ] Add custom business metrics
- [ ] Document runbooks for common alerts
- [ ] Conduct monitoring review
```

## Related Resources

- Monitoring alerts playbook: `/docs/runbooks/monitoring-alerts.md`
- Incident response: `/docs/runbooks/incident-response.md`
- Architecture observability: `/docs/architecture/observability.md`
