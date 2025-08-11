# Deployment Checklist

## Purpose
Ensure safe and successful deployments to production with minimal risk and downtime.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing locally (`pnpm test`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Type checking passing (`pnpm typecheck`)
- [ ] Build successful (`pnpm build`)
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or secrets

### Database
- [ ] Database migrations tested in staging
- [ ] Rollback script prepared if migrations involved
- [ ] Database backup completed
- [ ] Connection pool settings verified

### Environment
- [ ] Environment variables updated in Vercel
- [ ] Feature flags configured if needed
- [ ] API keys and secrets verified
- [ ] Rate limits configured

### Testing
- [ ] Smoke tests passing in staging
- [ ] Critical user journeys tested
- [ ] API endpoints tested
- [ ] Payment flow tested (if affected)

### Communication
- [ ] Team notified of deployment window
- [ ] Maintenance window scheduled if needed
- [ ] Release notes prepared
- [ ] Customer support team briefed

## Deployment Procedure

### 1. Final Checks
```bash
# Run final test suite
pnpm test

# Check for any uncommitted changes
git status

# Verify correct branch
git branch --show-current
```

### 2. Create Release
```bash
# Tag the release
git tag -a v1.0.x -m "Release v1.0.x: [brief description]"
git push origin v1.0.x
```

### 3. Deploy to Production
```bash
# Merge to main branch
git checkout main
git merge --no-ff release/v1.0.x

# Push to trigger deployment
git push origin main
```

### 4. Monitor Deployment
- Watch Vercel deployment dashboard
- Monitor build logs for errors
- Check deployment URL when ready

## Post-Deployment Verification

### Immediate Checks (First 5 minutes)
- [ ] Application loads successfully
- [ ] Login/authentication working
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] No error spikes in logs

### Functional Verification (First 30 minutes)
- [ ] Search functionality working
- [ ] Provider pages loading
- [ ] Payment processing functional
- [ ] Email notifications sending
- [ ] Admin panel accessible

### Performance Monitoring (First hour)
- [ ] Response times within SLA
- [ ] No memory leaks detected
- [ ] CPU usage normal
- [ ] Database query performance stable
- [ ] CDN cache hit ratio normal

### Business Verification
- [ ] Key metrics tracking correctly
- [ ] Analytics events firing
- [ ] Conversion funnel working
- [ ] No customer complaints

## Rollback Triggers

Initiate rollback if any of these occur:
- Application fails to start
- Database connection errors
- Payment processing failures
- Error rate > 5%
- Response time > 3 seconds P95
- Critical functionality broken

## Rollback Procedure

See [Rollback Procedure](./rollback-procedure.md)

## Escalation

### Primary Contact
- Engineering Lead: [Contact]
- On-call Engineer: Check PagerDuty

### Secondary Contact
- CTO: [Contact]
- DevOps Team: [Contact]

## Post-Deployment Tasks

- [ ] Update status page
- [ ] Send deployment notification
- [ ] Update release notes
- [ ] Archive deployment artifacts
- [ ] Schedule retrospective if issues occurred