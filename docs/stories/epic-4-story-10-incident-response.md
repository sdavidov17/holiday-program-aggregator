# Epic 4: Security, SRE & Observability
## Story 4.10: Incident Response & Runbooks

**Dependencies:** 
- Epic 4, Stories 4.1-4.9 - Need monitoring in place to detect incidents
- All Epic 1 stories - Need core features to create runbooks for

**Can be implemented:** After monitoring and core features are live

*As an on-call engineer, I want runbooks for common scenarios, so that I can respond quickly and effectively to incidents.*

### Acceptance Criteria
1. Runbooks created for:
   - Database outage
   - Payment processing failures
   - Authentication service issues
   - High error rates
   - Performance degradation
2. Runbooks include step-by-step remediation
3. Contact escalation paths documented
4. Post-mortem template created
5. On-call rotation established

### Development Tasks
- [ ] Create incident response framework
- [ ] Write runbooks for common scenarios
- [ ] Set up on-call rotation schedule
- [ ] Create escalation policies
- [ ] Build incident management dashboard
- [ ] Implement automated runbook execution
- [ ] Create post-mortem template
- [ ] Set up incident communication channels
- [ ] Build incident timeline tracker
- [ ] Create knowledge base system

### Technical Details

#### Incident Response Framework
```typescript
// incident/framework.ts
export interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'detected' | 'acknowledged' | 'investigating' | 'mitigating' | 'resolved';
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  affectedServices: string[];
  runbook?: string;
  responders: Responder[];
  timeline: TimelineEvent[];
  rootCause?: string;
  actionItems?: ActionItem[];
}

export interface Runbook {
  id: string;
  title: string;
  scenario: string;
  severity: string;
  steps: RunbookStep[];
  contacts: Contact[];
  verification: VerificationStep[];
}

export interface RunbookStep {
  order: number;
  description: string;
  command?: string;
  expectedOutcome: string;
  rollbackProcedure?: string;
  notes?: string;
}
```

#### Runbook: Database Outage
```yaml
# runbooks/database-outage.yaml
id: database-outage
title: Database Connection Failure
scenario: Primary database is unreachable or returning errors
severity: P1

steps:
  - order: 1
    description: Verify the database outage
    command: |
      # Check database health endpoint
      curl -f https://app.holiday-aggregator.com/api/health/ready | jq '.checks.database'
      
      # Try direct connection
      psql $DATABASE_URL -c "SELECT 1"
    expectedOutcome: Connection failure or timeout
    
  - order: 2
    description: Check database provider status
    command: |
      # Check Supabase/Neon status page
      curl https://status.supabase.com/api/v2/status.json
    expectedOutcome: Identify if provider-wide issue
    
  - order: 3
    description: Enable read-only mode
    command: |
      # Set feature flag for read-only mode
      vercel env pull
      vercel env add READONLY_MODE true
      vercel deploy --prod
    expectedOutcome: Site in read-only mode within 2 minutes
    
  - order: 4
    description: Scale down background workers
    command: |
      # Pause all background jobs
      curl -X POST https://app.holiday-aggregator.com/api/admin/jobs/pause \
        -H "Authorization: Bearer $ADMIN_TOKEN"
    expectedOutcome: Background jobs paused
    
  - order: 5
    description: Implement database failover (if available)
    command: |
      # Switch to replica if configured
      vercel env add DATABASE_URL $DATABASE_REPLICA_URL
      vercel deploy --prod
    expectedOutcome: Connected to replica database
    
  - order: 6
    description: Monitor recovery
    command: |
      # Watch health checks
      watch -n 10 'curl -s https://app.holiday-aggregator.com/api/health/ready | jq'
    expectedOutcome: Database status returns to healthy

verification:
  - description: Verify database connectivity
    command: curl https://app.holiday-aggregator.com/api/health/ready
    expected: checks.database.status = "healthy"
    
  - description: Test basic functionality
    command: curl https://app.holiday-aggregator.com/api/trpc/healthz.healthz
    expected: HTTP 200 response

contacts:
  - role: Database Admin
    name: DBA Team
    phone: +61-xxx-xxx-xxx
    slack: #database-oncall
    
  - role: Provider Support
    name: Supabase Support
    email: support@supabase.io
    priority: P1 ticket
```

#### Runbook: Payment Processing Failure
```yaml
# runbooks/payment-failure.yaml
id: payment-failure
title: Stripe Payment Processing Failure
scenario: Users unable to complete subscription payments
severity: P1

steps:
  - order: 1
    description: Verify payment failure pattern
    command: |
      # Check recent payment logs
      curl https://app.holiday-aggregator.com/api/admin/logs/payments?last=10m \
        -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.failureRate'
    expectedOutcome: High failure rate (>10%)
    
  - order: 2
    description: Check Stripe API status
    command: |
      # Test Stripe connectivity
      curl https://api.stripe.com/v1/charges \
        -u "$STRIPE_SECRET_KEY:" \
        -d limit=1
        
      # Check Stripe status
      curl https://status.stripe.com/api/v2/status.json
    expectedOutcome: Identify if Stripe-wide issue
    
  - order: 3
    description: Enable payment retry queue
    command: |
      # Enable automatic retry for failed payments
      curl -X POST https://app.holiday-aggregator.com/api/admin/payments/enable-retry \
        -H "Authorization: Bearer $ADMIN_TOKEN"
    expectedOutcome: Failed payments queued for retry
    
  - order: 4
    description: Notify affected users
    command: |
      # Send notification to users with failed payments
      curl -X POST https://app.holiday-aggregator.com/api/admin/notifications/payment-issue \
        -H "Authorization: Bearer $ADMIN_TOKEN"
    expectedOutcome: Notifications sent
    
  - order: 5
    description: Implement Stripe fallback (if configured)
    command: |
      # Switch to backup Stripe account if available
      vercel env add STRIPE_SECRET_KEY $STRIPE_BACKUP_KEY
      vercel deploy --prod
    expectedOutcome: Using backup payment processor

verification:
  - description: Test payment flow
    command: |
      # Use test card to verify payments working
      curl -X POST https://app.holiday-aggregator.com/api/trpc/payment.testCharge \
        -H "Authorization: Bearer $TEST_TOKEN"
    expected: Payment successful
```

#### Automated Incident Detection
```typescript
// incident/detection.ts
export class IncidentDetector {
  private readonly rules: DetectionRule[] = [
    {
      name: 'Database Outage',
      condition: async () => {
        const health = await checkHealth();
        return health.checks.database.status === 'unhealthy';
      },
      severity: 'P1',
      runbook: 'database-outage',
    },
    {
      name: 'High Error Rate',
      condition: async () => {
        const errorRate = await getErrorRate('5m');
        return errorRate > 0.05; // 5% error rate
      },
      severity: 'P2',
      runbook: 'high-error-rate',
    },
    {
      name: 'Payment Failures',
      condition: async () => {
        const paymentStats = await getPaymentStats('10m');
        return paymentStats.failureRate > 0.1; // 10% failure rate
      },
      severity: 'P1',
      runbook: 'payment-failure',
    },
  ];
  
  async detectIncidents() {
    for (const rule of this.rules) {
      const triggered = await rule.condition();
      
      if (triggered) {
        await this.createIncident(rule);
      }
    }
  }
  
  private async createIncident(rule: DetectionRule) {
    const incident = await incidentManager.create({
      title: rule.name,
      severity: rule.severity,
      runbook: rule.runbook,
      detectedBy: 'automated',
    });
    
    // Page on-call
    await pagerDuty.trigger({
      incidentId: incident.id,
      severity: rule.severity,
      title: rule.name,
    });
  }
}
```

#### Post-Mortem Template
```markdown
# Incident Post-Mortem: [INCIDENT-ID]

## Incident Summary
- **Date**: [Date]
- **Duration**: [Start Time] - [End Time] ([Total Duration])
- **Severity**: [P1/P2/P3/P4]
- **Impact**: [User-facing impact description]
- **Affected Services**: [List of services]

## Timeline
| Time | Event | Actor |
|------|-------|-------|
| HH:MM | Incident detected by [monitoring/user report] | System |
| HH:MM | On-call engineer paged | PagerDuty |
| HH:MM | Initial investigation began | [Engineer] |
| HH:MM | Root cause identified | [Engineer] |
| HH:MM | Mitigation started | [Engineer] |
| HH:MM | Service restored | [Engineer] |
| HH:MM | Incident resolved | [Engineer] |

## Root Cause Analysis

### What Happened?
[Detailed description of what went wrong]

### Why Did It Happen?
[Root cause analysis using 5 Whys technique]

### How Was It Detected?
[Detection method and time to detection]

### How Was It Resolved?
[Steps taken to resolve the incident]

## Impact Analysis
- **Users Affected**: [Number]
- **Revenue Impact**: $[Amount]
- **SLO Impact**: [Percentage of error budget consumed]
- **Customer Complaints**: [Number]

## What Went Well?
- [List positive aspects of incident response]

## What Could Be Improved?
- [List areas for improvement]

## Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Action description] | [Person] | [Date] | [P1/P2/P3] |

## Lessons Learned
- [Key takeaways for the team]
```

#### On-Call Rotation Setup
```typescript
// oncall/rotation.ts
export const ON_CALL_SCHEDULE = {
  primary: {
    schedule: 'weekly',
    engineers: [
      { name: 'Engineer 1', phone: '+61-xxx-xxx-xx1', timezone: 'Australia/Sydney' },
      { name: 'Engineer 2', phone: '+61-xxx-xxx-xx2', timezone: 'Australia/Sydney' },
      { name: 'Engineer 3', phone: '+61-xxx-xxx-xx3', timezone: 'Australia/Sydney' },
    ],
    handoffTime: 'Monday 09:00 AEST',
  },
  secondary: {
    schedule: 'weekly',
    engineers: [
      { name: 'Senior 1', phone: '+61-xxx-xxx-xx4', timezone: 'Australia/Sydney' },
      { name: 'Senior 2', phone: '+61-xxx-xxx-xx5', timezone: 'Australia/Sydney' },
    ],
    escalationAfter: 15, // minutes
  },
};
```

### Testing Checklist
- [ ] Verify all runbooks are accessible
- [ ] Test automated incident detection
- [ ] Verify PagerDuty integration works
- [ ] Test escalation paths
- [ ] Run incident response drill
- [ ] Verify post-mortem template is complete
- [ ] Test runbook commands work
- [ ] Verify on-call schedule rotates correctly

### Definition of Done
- [ ] All critical runbooks written
- [ ] Automated incident detection configured
- [ ] On-call rotation established
- [ ] Escalation policies documented
- [ ] Post-mortem template created
- [ ] Incident communication channels set up
- [ ] Team trained on incident response
- [ ] Runbooks tested in drill
- [ ] Documentation completed
- [ ] Deployed to production