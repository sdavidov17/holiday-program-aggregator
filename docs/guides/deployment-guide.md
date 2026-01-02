# Deployment Guide

## Overview

This guide covers deployment procedures for the Holiday Program Aggregator. We use **GitHub Actions with Vercel CLI** for controlled deployments that only proceed after all CI checks pass.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                           │
│                                                                  │
│  Push to main ──► GitHub Actions Workflows                      │
│                         │                                        │
│         ┌───────────────┼───────────────────┐                   │
│         ▼               ▼                   ▼                   │
│   ┌──────────┐   ┌──────────┐       ┌────────────┐             │
│   │ Quality  │   │   E2E    │       │  Security  │             │
│   │ Checks   │   │  Tests   │       │   Scan     │             │
│   └────┬─────┘   └────┬─────┘       └─────┬──────┘             │
│        │              │                   │                     │
│        └──────────────┴───────────────────┘                     │
│                       │                                          │
│                       ▼  All checks pass                        │
│              ┌────────────────┐                                 │
│              │  Deploy to     │                                 │
│              │    Vercel      │                                 │
│              └───────┬────────┘                                 │
│                      │                                          │
│                      ▼                                          │
│         ┌────────────────────────┐                              │
│         │ Create Release Tag     │                              │
│         │ Create GitHub Release  │                              │
│         └────────────────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │    Vercel      │
              │  Production    │
              └────────────────┘
```

## Environments

| Environment | Trigger | Purpose |
|------------|---------|---------|
| Preview | Pull Request to `main` | Feature testing, review |
| Production | Push to `main` (after CI passes) | Live system |

## CI/CD Pipeline

### Required Status Checks

The production deployment **waits for all three checks** to pass:

1. **Quality Checks** (`ci.yml`)
   - TypeScript type checking
   - Biome linting
   - Unit tests with Jest
   - Code coverage

2. **E2E Tests** (`e2e.yml`)
   - Playwright browser tests
   - Database integration tests

3. **Security Scan** (`security-scan.yml`)
   - Dependency vulnerability scan
   - License compliance check
   - SAST with CodeQL
   - Secret scanning

### Deployment Workflow

The `.github/workflows/deploy.yml` workflow:

```yaml
# Triggered on push/PR to main
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# For PRs: Deploy preview immediately
# For pushes to main: Wait for CI, then deploy production
```

## Deployment Process

### 1. Preview Deployments (Pull Requests)

When you open a PR to `main`:
- GitHub Actions automatically deploys a preview
- Preview URL is commented on the PR
- No need to wait for CI (allows quick visual review)

```bash
# Create feature branch
git checkout -b feature/my-feature
git push origin feature/my-feature

# Open PR → Automatic preview deployment
```

### 2. Production Deployment (Push to main)

When code is merged/pushed to `main`:

1. **CI Pipeline Runs** (parallel)
   - Quality Checks
   - E2E Tests
   - Security Scan

2. **Deploy Workflow Waits**
   - Waits for all three checks to pass
   - If any check fails, deployment is blocked

3. **Production Deploy**
   - Pulls Vercel environment
   - Builds with `vercel build --prod`
   - Deploys with `vercel deploy --prebuilt --prod`

4. **Release Created**
   - Creates version tag: `v2026.01.02-abc1234`
   - Creates GitHub Release with changelog

### 3. Manual Deployment (Emergency)

If needed, you can deploy directly via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (one-time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token (from Account Settings → Tokens) |
| `VERCEL_ORG_ID` | Team/Org ID (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Project ID (from `.vercel/project.json`) |

### Getting Vercel IDs

```bash
# Run in project root
vercel link

# View the IDs
cat .vercel/project.json
# Output: {"projectId":"prj_XXX","orgId":"team_XXX"}
```

## Vercel Configuration

### Dashboard Settings

1. **Git Integration**: Connected to GitHub repo
2. **Ignored Build Step**: Set to "Don't build anything"
   - We handle builds via GitHub Actions for more control
3. **Environment Variables**: Set in Vercel dashboard
   - DATABASE_URL, NEXTAUTH_SECRET, etc.

### vercel.json

```json
{
  "buildCommand": "turbo run build --filter=web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds locally (`SKIP_ENV_VALIDATION=true pnpm build`)

### Database
- [ ] Schema changes pushed (`pnpm db:push`)
- [ ] Seed data updated if needed
- [ ] Rollback plan documented

### Configuration
- [ ] Environment variables updated in Vercel dashboard
- [ ] Feature flags configured

## Rollback Procedures

### Via Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Via Git

```bash
# Revert the problematic commit
git revert HEAD
git push origin main

# This triggers a new deployment with the reverted code
```

## Monitoring Deployments

### GitHub Actions

```bash
# List recent deploy runs
gh run list --workflow=deploy.yml

# Watch a specific run
gh run watch <run-id>

# View logs for failed run
gh run view <run-id> --log-failed
```

### Vercel

```bash
# View production logs
vercel logs --prod --follow

# Check deployment status
vercel inspect [deployment-url]
```

## Troubleshooting

### Build Failures in GitHub Actions

```bash
# Check the failed logs
gh run view <run-id> --log-failed

# Common issues:
# - SKIP_ENV_VALIDATION not set → Add to workflow
# - Prisma generate fails → Check DATABASE_URL placeholder
```

### "Project not found" Error

```bash
# Verify IDs are correct
vercel link

# Update GitHub secrets with values from:
cat .vercel/project.json
```

### CI Checks Not Passing

The deploy workflow waits indefinitely for checks. To unblock:
1. Fix the failing check
2. Or cancel the deploy workflow and fix later

## Version Tagging

Every production deployment creates:
- **Tag**: `v<year>.<month>.<day>-<short-sha>`
  - Example: `v2026.01.02-abc1234`
- **GitHub Release**: With recent commit changelog

## Related Documentation

- [Branching Strategy](../project/branching-strategy.md)
- [CI/CD Strategy](./ci-cd-strategy.md)
- [Testing Strategy](./testing-strategy.md)
