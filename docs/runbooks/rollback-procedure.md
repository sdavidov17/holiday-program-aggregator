# Rollback Procedure

## Purpose
Emergency procedure to revert a problematic deployment and restore service stability.

## When to Rollback

### Immediate Rollback Triggers
- Application fails to start
- Database connection failures
- Authentication completely broken
- Payment processing failures
- Error rate > 10%
- Response time > 5 seconds P95

### Consider Rollback
- Error rate 5-10%
- Performance degraded >50%
- Critical feature broken
- Multiple user complaints

## Rollback Decision Tree

```
Is the site completely down?
├─ YES → Immediate rollback
└─ NO → Is authentication working?
    ├─ NO → Immediate rollback
    └─ YES → Is payment processing working?
        ├─ NO → Immediate rollback
        └─ YES → Check error rate
            ├─ >10% → Immediate rollback
            ├─ 5-10% → Assess impact, consider rollback
            └─ <5% → Monitor and hotfix if possible
```

## Rollback Procedures

### Method 1: Vercel Instant Rollback (Recommended)

**Time to Recovery: 1-2 minutes**

1. **Access Vercel Dashboard**
   ```
   https://vercel.com/[team]/holiday-program-aggregator/deployments
   ```

2. **Find Previous Stable Deployment**
   - Look for the last deployment marked "Ready"
   - Verify it's from before the problematic change

3. **Promote to Production**
   - Click the three dots menu on the stable deployment
   - Select "Promote to Production"
   - Confirm the promotion

4. **Verify Rollback**
   - Check application loads
   - Test critical functions
   - Monitor error rates

### Method 2: Git Revert

**Time to Recovery: 5-10 minutes**

1. **Identify Problematic Commit**
   ```bash
   git log --oneline -10
   ```

2. **Create Revert Commit**
   ```bash
   git revert <commit-hash>
   # or for merge commits
   git revert -m 1 <merge-commit-hash>
   ```

3. **Push to Trigger Deployment**
   ```bash
   git push origin main
   ```

4. **Monitor Deployment**
   - Watch Vercel build logs
   - Verify deployment succeeds

### Method 3: Database Rollback

**Use when database migration caused issues**

1. **Identify Migration to Revert**
   ```bash
   npx prisma migrate status
   ```

2. **Create Rollback Migration**
   ```bash
   # Create a new migration that undoes the changes
   npx prisma migrate dev --name rollback_<original_migration_name>
   ```

3. **Apply Rollback in Production**
   ```bash
   DATABASE_URL=$PROD_DATABASE_URL npx prisma migrate deploy
   ```

4. **Rollback Application Code**
   - Follow Method 1 or 2 above

## Post-Rollback Actions

### Immediate (First 15 minutes)
- [ ] Verify service restored
- [ ] Check all critical functions:
  - [ ] Authentication
  - [ ] Search
  - [ ] Payment processing
  - [ ] Admin panel
- [ ] Monitor error rates
- [ ] Check database connections
- [ ] Review user reports

### Communication
- [ ] Update incident channel
- [ ] Notify stakeholders
- [ ] Update status page
- [ ] Prepare user communication if needed

### Investigation
- [ ] Preserve logs from failed deployment
- [ ] Document timeline
- [ ] Identify root cause
- [ ] Create incident report

## Rollback Verification Checklist

### Application Health
- [ ] Site loads successfully
- [ ] No 500 errors
- [ ] Response times normal
- [ ] Memory usage stable
- [ ] CPU usage normal

### Functionality
- [ ] Users can log in
- [ ] Search works
- [ ] Provider pages load
- [ ] Payments process
- [ ] Admin functions work

### Data Integrity
- [ ] No data loss
- [ ] Database queries work
- [ ] User sessions maintained
- [ ] Subscriptions intact

## Common Issues and Solutions

### Issue: Rollback deployment also fails
**Solution**: 
- Roll back further to last known good
- Check for infrastructure issues
- Verify environment variables

### Issue: Database incompatible with old code
**Solution**:
- Apply compatibility migration
- Use feature flags to disable affected features
- Implement forward-fix instead

### Issue: Third-party service changes
**Solution**:
- Check service provider status
- Update API keys if needed
- Implement compatibility layer

## Emergency Contacts

### Primary
- On-call Engineer: Check PagerDuty
- Engineering Lead: [Contact]

### Escalation
- CTO: [Contact]
- Infrastructure Team: [Contact]
- Database Admin: [Contact]

### External
- Vercel Support: support@vercel.com
- Neon Support: [Support Portal]
- Stripe Support: [Phone/Email]

## Prevention Measures

### Before Deployment
- Run full test suite
- Test in staging environment
- Review database migrations carefully
- Check environment variables
- Plan rollback strategy

### After Incidents
- Add tests for failure scenario
- Update monitoring for early detection
- Document lessons learned
- Update this runbook with new scenarios

## Recovery Time Objectives

- **Critical Outage**: < 5 minutes
- **Major Degradation**: < 15 minutes
- **Minor Issues**: < 30 minutes

## Notes

- Always prefer Vercel instant rollback for speed
- Keep calm and follow the checklist
- Communication is key during incidents
- Document everything for post-mortem
- Test rollback procedures regularly