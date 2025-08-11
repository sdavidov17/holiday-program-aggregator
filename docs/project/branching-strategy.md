# Simplified Branching Strategy (Trunk-Based Development)

## Overview

We use a simplified trunk-based development approach optimized for speed and safety, leveraging Vercel's Preview and Production environments.

## Core Principle

```
Feature Branch → PR → main → Production
       ↓               ↓          ↓
   Preview URL    Automatic   Immediate
```

## Branch Strategy

### Main Branch (`main`)
- **Purpose**: Single source of truth
- **Protection**: PR required, tests must pass
- **Deployments**: Automatic to production after checks pass
- **Direct commits**: Not allowed

### Feature Branches
- **Naming**: `feature/<description>` or `story/<epic>-<story>`
- **Created from**: `main`
- **Merged to**: `main` via PR
- **Preview**: Automatic Vercel preview on push
- **Lifetime**: Delete after merge

### Hotfix Branches
- **Naming**: `hotfix/<description>`
- **Purpose**: Emergency fixes only
- **Fast-track**: Simplified review process
- **Testing**: Preview → Production

## Deployment Pipeline

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/add-search-filters

# Work and commit
git add .
git commit -m "feat: add search filters"
git push origin feature/add-search-filters

# Vercel creates preview URL automatically
# Create PR when ready
```

### 2. Main Branch Pipeline
When merged to `main`:
1. **All checks run** (2-3 minutes)
   - Quality checks (lint, types, tests)
   - Security scans
   - License compliance
2. **Deploy to production** (2-3 minutes)
3. **Health checks** on production
4. **Auto-tag release** (v2025.08.07-abc123)
5. **Create GitHub release**

Total time: ~5-6 minutes from merge to production

### 3. Emergency Rollback
```bash
# Option 1: Vercel Dashboard (Instant)
# Go to Deployments → Previous deployment → Promote

# Option 2: Git revert
./scripts/rollback.sh
```

## Safety Features

### 1. Preview Deployments
- **URL**: Auto-generated per PR
- **Purpose**: Test features before merge
- **Trigger**: Only after all checks pass
- **Isolation**: Each PR gets its own environment

### 2. Automated Version Tags
- **Format**: `v<year>.<month>.<day>-<commit>`
- **Example**: `v2025.08.07-a3f89c2`
- **Purpose**: Easy rollback reference

### 3. Health Checks
```yaml
# Automatic checks before production:
- /api/health/live - Service is running
- /api/health/ready - Database connected
```

### 4. Simple Changelog
- Generated from commit messages
- Groups by type (features, fixes, etc.)
- Attached to GitHub releases

## Commit Message Format

Keep it simple but descriptive:
- `feat: add user authentication`
- `fix: resolve payment processing error`
- `docs: update API documentation`
- `chore: upgrade dependencies`

## Release Process

### Automatic Releases
Every push to `main` creates a release:
1. Run tests
2. Deploy to staging
3. Validate health
4. Deploy to production
5. Tag version
6. Create GitHub release

### Manual Release Notes
For major releases, edit the auto-generated GitHub release to add:
- Screenshots
- Migration steps
- Breaking changes
- Special instructions

## When to Use Feature Flags

Instead of long-lived branches, use feature flags for:
- Incomplete features
- A/B testing
- Gradual rollouts
- Quick disable without deployment

Example:
```typescript
if (process.env.NEXT_PUBLIC_ENABLE_NEW_SEARCH === 'true') {
  return <NewSearchComponent />
}
return <OldSearchComponent />
```

## Best Practices

1. **Small PRs**: Easier to review and less risky
2. **Frequent merges**: Multiple times per day is fine
3. **Write tests**: Catch issues before staging
4. **Monitor staging**: 5 minutes is enough to catch most issues
5. **Use preview URLs**: Share with stakeholders before merging
6. **Trust the pipeline**: If tests pass, ship it

## Migration Path

If you need more control later:
1. **Add approval gate**: Require manual approval for production
2. **Extend staging time**: Increase from 5 minutes to hours/days
3. **Add environments**: Dev → Staging → UAT → Production
4. **Switch to Git Flow**: When you have 5+ developers

## Emergency Procedures

### Production Issue
1. **Check staging first** - Is it also broken there?
2. **Rollback if critical** - Use Vercel dashboard (instant)
3. **Fix forward if minor** - Create hotfix branch
4. **Communicate** - Update status page/users

### Rollback Steps
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click your project
3. Go to "Deployments"
4. Find last stable deployment
5. Click "..." → "Promote to Production"
6. Done in 30 seconds!

## Why This Works

- **Simple**: One branch, one pipeline
- **Fast**: 10 minutes to production
- **Safe**: Staging catches issues
- **Flexible**: Easy to add complexity later
- **Proven**: Used by Google, Facebook, Netflix

This approach gives you 90% of the safety with 10% of the complexity!