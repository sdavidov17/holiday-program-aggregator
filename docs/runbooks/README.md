# Operational Runbooks

This directory contains operational procedures and runbooks for managing the Holiday Program Aggregator platform in production.

## Available Runbooks

### Deployment & Release
- [Deployment Checklist](./deployment-checklist.md) - Pre and post-deployment verification steps
- [Rollback Procedure](./rollback-procedure.md) - Emergency rollback instructions

### Incident Management
- [Incident Response](./incident-response.md) - Incident handling procedures
- [Monitoring & Alerts](./monitoring-alerts.md) - Alert response playbooks

## Quick Actions

### 🚨 Production Incident?
1. Follow the [Incident Response](./incident-response.md) procedure
2. Check [Monitoring & Alerts](./monitoring-alerts.md) for specific alert playbooks
3. If rollback needed, see [Rollback Procedure](./rollback-procedure.md)

### 🚀 Deploying to Production?
1. Review [Deployment Checklist](./deployment-checklist.md)
2. Ensure all tests pass
3. Follow the deployment procedure
4. Complete post-deployment verification

## Creating New Runbooks

When creating new runbooks, follow this template:

```markdown
# [Runbook Title]

## Purpose
Brief description of when and why to use this runbook

## Prerequisites
- Required access/permissions
- Tools needed
- Pre-conditions

## Procedure
1. Step-by-step instructions
2. Include specific commands
3. Add verification steps

## Rollback
How to undo changes if needed

## Escalation
Who to contact if issues arise
```

## Related Documentation

- [Deployment Guide](/docs/guides/deployment.md) - Detailed deployment documentation
- [Monitoring Dashboard](/docs/guides/monitoring.md) - Monitoring setup
- [Team Guidelines](/docs/project/team-guidelines.md) - Team processes