# Incident Response Procedure

## Purpose
Standardized procedure for handling production incidents to minimize impact and restore service quickly.

## Incident Severity Levels

### SEV1 - Critical
- Complete service outage
- Payment processing down
- Data loss or corruption
- Security breach
- **Response Time**: Immediate
- **Escalation**: All hands

### SEV2 - High
- Major feature unavailable
- Performance severely degraded
- Authentication issues
- **Response Time**: Within 30 minutes
- **Escalation**: Engineering lead + on-call

### SEV3 - Medium
- Minor feature broken
- Non-critical API errors
- Slow response times
- **Response Time**: Within 2 hours
- **Escalation**: On-call engineer

### SEV4 - Low
- Cosmetic issues
- Non-blocking bugs
- **Response Time**: Next business day
- **Escalation**: Regular triage

## Incident Response Steps

### 1. DETECT - Identify the Issue
- Monitor alerts from:
  - Vercel monitoring
  - Database alerts
  - Error tracking (Sentry)
  - User reports
  - Synthetic monitoring

### 2. ASSESS - Determine Severity
- Check impact scope:
  - Number of users affected
  - Features impacted
  - Data integrity
  - Financial impact
- Assign severity level
- Start incident timer

### 3. COMMUNICATE - Initial Response
```
🚨 INCIDENT DETECTED
Severity: [SEV1/2/3/4]
Impact: [Brief description]
Status: Investigating
Lead: [Name]
Thread: [Link to Slack thread]
```

### 4. MITIGATE - Stop the Bleeding

#### Quick Mitigations
- [ ] Enable maintenance mode if needed
- [ ] Scale up resources if performance issue
- [ ] Disable problematic feature flag
- [ ] Revert recent deployment if related
- [ ] Clear cache if stale data issue

#### For Database Issues
```bash
# Check database status
npx prisma db execute --stdin <<< "SELECT 1"

# Check connection pool
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity"

# Kill long-running queries if needed
npx prisma db execute --stdin <<< "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '5 minutes'"
```

#### For Performance Issues
- Check Vercel functions logs
- Review recent deployments
- Check third-party service status
- Review database slow query log

### 5. INVESTIGATE - Root Cause Analysis

#### Data to Collect
- [ ] Error logs from affected timeframe
- [ ] Metrics before/during/after incident
- [ ] Recent deployments
- [ ] Configuration changes
- [ ] Third-party service status
- [ ] Database query performance

#### Investigation Commands
```bash
# Check recent deployments
git log --oneline -10

# Check error logs (Vercel CLI)
vercel logs --since 1h

# Check database status
npx prisma db execute --file check-db-health.sql
```

### 6. RESOLVE - Fix the Issue

#### Resolution Types
- **Rollback**: Revert to previous version
- **Hotfix**: Deploy emergency fix
- **Configuration**: Update environment variables
- **Scale**: Increase resources
- **Feature Flag**: Disable problematic feature

### 7. COMMUNICATE - Status Updates

#### Update Template
```
📊 INCIDENT UPDATE
Time: [Timestamp]
Severity: [Current severity]
Status: [Investigating/Mitigating/Monitoring/Resolved]
Impact: [Current impact]
Next Update: [Time]
Actions Taken:
- [Action 1]
- [Action 2]
```

### 8. DOCUMENT - Post-Incident

#### Immediate Documentation
- [ ] Timeline of events
- [ ] Actions taken
- [ ] Resolution steps
- [ ] Impact metrics

#### Post-Incident Report (within 48 hours)
- [ ] Incident summary
- [ ] Root cause analysis
- [ ] Impact assessment
- [ ] Lessons learned
- [ ] Action items

## Key Contacts

### Escalation Path
1. On-call Engineer (PagerDuty)
2. Engineering Lead
3. CTO
4. CEO (SEV1 only)

### External Communications
- Customer Support Lead: [Contact]
- Marketing/Comms: [Contact]
- Legal (security incidents): [Contact]

## Common Playbooks

### Database Connection Issues
1. Check Neon status page
2. Verify connection string in Vercel
3. Check connection pool limits
4. Restart Vercel functions if needed
5. Scale database if at capacity

### High Error Rate
1. Check Sentry for error patterns
2. Identify affected endpoints
3. Review recent deployments
4. Check third-party services
5. Deploy hotfix or rollback

### Payment Processing Down
1. Check Stripe status
2. Verify webhook endpoints
3. Check webhook signing secret
4. Review payment logs
5. Contact Stripe support if needed

### Performance Degradation
1. Check database slow queries
2. Review Vercel function metrics
3. Check cache hit rates
4. Look for N+1 queries
5. Scale resources if needed

## Tools & Access

### Monitoring
- Vercel Dashboard: [URL]
- Neon Console: [URL]
- Sentry: [URL]
- Status Page: [URL]

### Communication
- Incident Slack Channel: #incidents
- Status Page Updates: [Admin URL]
- Customer Comms Template: [Doc]

## Post-Incident Process

### Within 24 Hours
- [ ] Incident marked resolved
- [ ] Customer communication sent
- [ ] Initial timeline documented

### Within 48 Hours
- [ ] Post-incident report drafted
- [ ] Action items identified
- [ ] Retrospective scheduled

### Within 1 Week
- [ ] Retrospective completed
- [ ] Action items assigned
- [ ] Monitoring improved
- [ ] Runbooks updated