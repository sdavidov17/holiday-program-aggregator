# Monitoring & Alerts Playbook

## Purpose
Response procedures for common monitoring alerts to ensure quick resolution and minimal downtime.

## Alert Priority Levels

### P1 - Critical (Immediate Response)
- Complete outage
- Database down
- Payment failures
- Security breach
- **Response Time**: < 5 minutes

### P2 - High (Urgent)
- Performance degradation >50%
- Error rate >5%
- Authentication issues
- **Response Time**: < 15 minutes

### P3 - Medium (Important)
- Performance degradation 25-50%
- Error rate 2-5%
- Non-critical feature down
- **Response Time**: < 1 hour

### P4 - Low (Informational)
- Minor performance issues
- Non-blocking errors
- **Response Time**: Next business day

## Common Alerts & Responses

### 🔴 High Error Rate Alert

**Trigger**: Error rate > 5% for 5 minutes

**Response Steps**:
1. Check Sentry for error patterns
2. Identify affected endpoints
3. Review recent deployments
4. Check third-party service status
5. Rollback if deployment-related
6. Scale resources if load-related

**Commands**:
```bash
# Check recent errors
vercel logs --since 30m | grep ERROR

# Check deployment history
vercel list --prod

# Monitor in real-time
vercel logs --follow
```

### 🟡 High Response Time Alert

**Trigger**: P95 latency > 3 seconds

**Response Steps**:
1. Check database query performance
2. Review Vercel function metrics
3. Check connection pool status
4. Look for N+1 queries
5. Check third-party API latency
6. Scale if needed

**Commands**:
```bash
# Check slow queries
npx prisma db execute --stdin <<< "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10"

# Check connection pool
npx prisma db execute --stdin <<< "
SELECT count(*) as connections, state 
FROM pg_stat_activity 
GROUP BY state"
```

### 💾 Database Connection Alert

**Trigger**: Connection pool exhausted or connection failures

**Response Steps**:
1. Check Neon status page
2. Verify connection string
3. Check active connections
4. Kill idle connections
5. Increase pool size if needed
6. Restart application if necessary

**Commands**:
```bash
# Check connections
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity"

# Kill idle connections
npx prisma db execute --stdin <<< "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < now() - interval '10 minutes'"
```

### 💳 Payment Processing Alert

**Trigger**: Stripe webhook failures or payment errors

**Response Steps**:
1. Check Stripe dashboard
2. Verify webhook endpoint
3. Check webhook signing secret
4. Review webhook logs
5. Replay failed webhooks
6. Contact Stripe support if needed

**Verification**:
```bash
# Check webhook endpoint
curl -X POST https://api.holidayprograms.com.au/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'

# Check environment variable
vercel env pull
grep STRIPE_WEBHOOK_SECRET .env
```

### 🔐 Authentication Failure Alert

**Trigger**: Login success rate < 90%

**Response Steps**:
1. Check NextAuth configuration
2. Verify OAuth provider status
3. Check database user table
4. Review auth logs
5. Test login flow
6. Check session storage

**Debug Commands**:
```bash
# Check recent auth attempts
vercel logs --since 1h | grep -E "(auth|login|session)"

# Verify OAuth settings
vercel env ls | grep -E "(GOOGLE|NEXTAUTH)"
```

### 📈 High Memory Usage Alert

**Trigger**: Memory usage > 90%

**Response Steps**:
1. Check for memory leaks
2. Review recent code changes
3. Check for large queries
4. Monitor garbage collection
5. Scale vertically if needed
6. Restart if necessary

### 🌐 CDN Cache Miss Alert

**Trigger**: Cache hit rate < 80%

**Response Steps**:
1. Check cache headers
2. Review cache invalidation
3. Check for cache busting
4. Verify CDN configuration
5. Purge and rebuild cache

## Alert Response Templates

### Initial Response
```
🚨 ALERT ACKNOWLEDGED
Alert: [Alert Name]
Severity: [P1/P2/P3/P4]
Status: Investigating
Lead: [Your Name]
ETA: [Time estimate]
```

### Status Update
```
📊 STATUS UPDATE
Alert: [Alert Name]
Time: [Current time]
Status: [Investigating/Mitigating/Monitoring/Resolved]
Findings: [What you've discovered]
Actions: [What you're doing]
Next Update: [Time]
```

### Resolution
```
✅ ALERT RESOLVED
Alert: [Alert Name]
Duration: [How long it lasted]
Root Cause: [Brief explanation]
Resolution: [What fixed it]
Impact: [Who/what was affected]
Follow-up: [Any required actions]
```

## Monitoring Setup

### Recommended Alerts

#### Application Health
- Error rate > 5%
- Response time P95 > 3s
- Memory usage > 90%
- CPU usage > 80%
- Failed deployments

#### Database
- Connection pool > 80%
- Query time > 1s
- Failed connections
- Replication lag > 5s

#### Business Metrics
- Login failures > 10%
- Payment failures > 2%
- Search failures > 5%
- Zero traffic for 5 minutes

### Alert Channels

1. **PagerDuty**: P1 and P2 alerts
2. **Slack #alerts**: All alerts
3. **Email**: P3 and P4 alerts
4. **Dashboard**: Real-time monitoring

## Monitoring Tools

### Internal
- Vercel Analytics: Performance metrics
- Vercel Logs: Application logs
- Prisma Metrics: Database performance

### External (To Implement)
- Sentry: Error tracking
- DataDog/New Relic: APM
- Pingdom: Uptime monitoring
- LogRocket: Session replay

## Best Practices

### DO
- Acknowledge alerts quickly
- Communicate status regularly
- Document actions taken
- Follow runbooks
- Escalate when needed

### DON'T
- Ignore alerts
- Make changes without testing
- Forget to communicate
- Skip documentation
- Panic

## Escalation Matrix

| Alert Type | First Responder | Escalation L1 | Escalation L2 |
|-----------|----------------|---------------|---------------|
| Application Error | On-call Dev | Senior Dev | Engineering Lead |
| Database Issue | On-call Dev | Database Admin | CTO |
| Payment Issue | On-call Dev | Payment Lead | CFO |
| Security Alert | On-call Dev | Security Team | CTO + Legal |
| Performance | On-call Dev | Senior Dev | Engineering Lead |

## On-Call Rotation

- **Primary**: Check PagerDuty schedule
- **Secondary**: Check PagerDuty schedule
- **Manager**: Engineering Lead

## Post-Alert Actions

### Within 24 Hours
- [ ] Close alert ticket
- [ ] Update monitoring if needed
- [ ] Document in incident log

### Within 48 Hours
- [ ] Create post-mortem if P1/P2
- [ ] Update runbooks
- [ ] Share lessons learned

### Weekly
- [ ] Review all alerts
- [ ] Tune alert thresholds
- [ ] Update on-call schedule