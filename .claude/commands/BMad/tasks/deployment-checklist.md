# Deployment Checklist Task

Execute this task to perform a comprehensive deployment verification.

## Task Configuration

```yaml
task:
  id: deployment-checklist
  name: Deployment Checklist
  description: Complete deployment workflow with pre/post verification
  agent: devops
  elicit: true
  interactive: true
```

## Execution Instructions

When this task is invoked, follow these steps exactly:

### Phase 1: Pre-Deployment Verification

Present and verify each item:

```
## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or credentials

### Security
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Dependencies up to date (no critical npm audit issues)
- [ ] No exposed debug endpoints
- [ ] Rate limiting configured on auth endpoints

### Database
- [ ] Migrations tested in staging first
- [ ] Rollback script prepared and tested
- [ ] Database backup completed
- [ ] Connection pool configured correctly

### Feature Readiness
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring alerts set up for new features
- [ ] Documentation updated
- [ ] Stakeholders notified of deployment

### Rollback Plan
- [ ] Previous version tagged and available
- [ ] Rollback procedure documented
- [ ] Kill switch ready for immediate rollback
- [ ] Database rollback tested (if migrations involved)
```

ASK USER: "Please confirm each item above. Are there any blockers?"

### Phase 2: Deployment Execution

```
## Deployment Steps

1. **Merge to main branch**
   - Ensure all CI checks pass
   - Get final approval if required

2. **Monitor Deployment**
   - Watch Vercel deployment logs
   - Verify build completes successfully
   - Check for any deployment errors

3. **Initial Health Check**
   - Verify application loads at production URL
   - Check health endpoint responds
   - Verify database connections work
```

### Phase 3: Post-Deployment Verification

```
## Immediate Checks (0-5 minutes)

- [ ] Application loads successfully
- [ ] Authentication working (test login)
- [ ] Core API endpoints responding
- [ ] No spike in error rates

## Short-term Monitoring (5-30 minutes)

- [ ] Response times within SLA (< 200ms p95)
- [ ] Error rate stable (< 1%)
- [ ] No memory leaks detected
- [ ] Database connections stable

## Extended Monitoring (30-60 minutes)

- [ ] All critical user journeys working
- [ ] Payment processing functional (if applicable)
- [ ] Email sending working (if applicable)
- [ ] No degradation in performance metrics
```

### Phase 4: Completion

If all checks pass:
```
## Deployment Complete

- [ ] Update deployment log
- [ ] Notify stakeholders of successful deployment
- [ ] Update any relevant documentation
- [ ] Close deployment ticket/issue
```

If issues detected:
```
## Issues Detected - Rollback Decision

If critical issues are found:
1. Initiate rollback procedure immediately
2. Notify stakeholders of rollback
3. Document issues encountered
4. Schedule post-mortem review
```

## Related Resources

- Rollback procedure: `/docs/runbooks/rollback-procedure.md`
- Incident response: `/docs/runbooks/incident-response.md`
- Monitoring alerts: `/docs/runbooks/monitoring-alerts.md`
