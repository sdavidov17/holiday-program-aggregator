# Incident Response Task

Execute this task to handle production incidents systematically.

## Task Configuration

```yaml
task:
  id: incident-response
  name: Incident Response
  description: Structured incident response workflow
  agent: devops
  elicit: true
  interactive: true
  priority: critical
```

## Execution Instructions

When this task is invoked, follow these steps exactly:

### Step 1: Incident Detection & Assessment

ASK USER: "Describe the incident. What symptoms are you observing?"

After receiving description, assess severity:

```
## Severity Assessment

### SEV1 - Critical (Immediate response required)
- Complete service outage
- Payment processing down
- Data loss or corruption suspected
- Security breach detected
- All users affected

### SEV2 - High (30-minute response)
- Major feature unavailable
- Performance degradation > 50%
- Authentication/authorization issues
- Subset of users affected

### SEV3 - Medium (2-hour response)
- Minor feature broken
- Non-critical API errors
- Intermittent issues
- Few users affected

### SEV4 - Low (Next business day)
- Cosmetic issues
- Minor UX problems
- Documentation errors
```

ASK USER: "Based on symptoms, what severity level is this incident? (SEV1/SEV2/SEV3/SEV4)"

### Step 2: Communication

Based on severity, recommend communication:

```
## Communication Template

**Incident Title**: [Brief description]
**Severity**: [SEV level]
**Status**: Investigating / Identified / Monitoring / Resolved
**Impact**: [Who/what is affected]
**Start Time**: [When first detected]

**Current Actions**:
- [What is being done now]

**Next Update**: [Time of next update]
```

For SEV1/SEV2: "Notify team immediately via Slack/PagerDuty"

### Step 3: Quick Mitigations

Present mitigation options:

```
## Quick Mitigation Options

1. **Rollback Deployment**
   - If recently deployed, revert to last known good version
   - Command: Check Vercel dashboard for rollback option

2. **Enable Maintenance Mode**
   - Redirect users to maintenance page
   - Prevents further impact while investigating

3. **Scale Resources**
   - If performance-related, scale up infrastructure
   - Check Vercel/Neon dashboards

4. **Disable Feature Flag**
   - If specific feature causing issues, disable via feature flag
   - Isolates problem without full rollback

5. **Clear Cache**
   - If caching-related, purge cache
   - Vercel Edge Cache or application cache

6. **Database Actions**
   - Kill long-running queries
   - Check connection pool status
   - Verify database health
```

ASK USER: "Which mitigation action would you like to take?"

### Step 4: Investigation

```
## Investigation Checklist

### Check Application Logs
- [ ] Review Vercel function logs for errors
- [ ] Check for stack traces or error patterns
- [ ] Note correlation IDs for tracing

### Check Infrastructure
- [ ] Vercel deployment status
- [ ] Neon database status
- [ ] Third-party service status (Stripe, Google OAuth)

### Check Recent Changes
- [ ] Recent deployments (last 24-48 hours)
- [ ] Configuration changes
- [ ] Database migrations
- [ ] Dependency updates

### Common Database Issues
```bash
# Check database health
npx prisma db execute --stdin <<< "SELECT 1"

# Check active connections
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity"

# Check for long-running queries
npx prisma db execute --stdin <<< "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'"
```
```

### Step 5: Resolution

Once issue is identified and fixed:

```
## Resolution Checklist

- [ ] Root cause identified
- [ ] Fix implemented and deployed
- [ ] Verify fix resolves the issue
- [ ] Monitor for recurrence (30 minutes minimum)
- [ ] Update incident status to "Resolved"
- [ ] Notify stakeholders of resolution
```

### Step 6: Post-Incident

```
## Post-Incident Actions

### Within 24 hours:
- [ ] Mark incident as resolved in tracking system
- [ ] Notify customers if they were impacted
- [ ] Brief summary to leadership (SEV1/SEV2)

### Within 48 hours:
- [ ] Draft post-mortem document
- [ ] Identify action items to prevent recurrence
- [ ] Schedule retrospective meeting

### Within 1 week:
- [ ] Complete post-mortem review
- [ ] Update runbooks if needed
- [ ] Implement preventive measures
- [ ] Close incident ticket

## Post-Mortem Template

**Incident Summary**: [Brief description]
**Duration**: [Start to resolution time]
**Impact**: [Users/revenue affected]
**Root Cause**: [What caused the incident]
**Resolution**: [How it was fixed]
**Timeline**: [Key events during incident]
**Action Items**: [What will prevent recurrence]
**Lessons Learned**: [What we learned]
```

## Related Resources

- Monitoring alerts playbook: `/docs/runbooks/monitoring-alerts.md`
- Deployment checklist: `/docs/runbooks/deployment-checklist.md`
- Rollback procedure: `/docs/runbooks/rollback-procedure.md`
