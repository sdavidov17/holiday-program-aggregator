# Branching Strategy & Release Process

## Overview

This document outlines our Git branching strategy and release process for the Holiday Program Aggregator project.

## Branch Strategy

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Fully protected with strict rules
- **Deploys to**: Production environment
- **Direct commits**: Not allowed

### Story Branches (`story/<epic>-<story>-<description>`)
- **Purpose**: Development of individual user stories
- **Naming convention**: `story/epic-1-story-2-user-account-system`
- **Created from**: `main`
- **Merges to**: `main` via Pull Request
- **Lifetime**: Deleted after merge

### Hotfix Branches (`hotfix/<issue>-<description>`)
- **Purpose**: Critical production fixes
- **Naming convention**: `hotfix/fix-payment-processing`
- **Created from**: `main`
- **Merges to**: `main` via Pull Request
- **Lifetime**: Deleted after merge

## Workflow

1. **Start a new story**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b story/epic-2-story-1-search-interface
   ```

2. **Regular commits**:
   ```bash
   git add .
   git commit -m "feat: implement search filter component"
   git push origin story/epic-2-story-1-search-interface
   ```

3. **Create Pull Request**:
   - Target branch: `main`
   - Required reviews: 1 (or self-merge for solo developers)
   - All checks must pass

4. **After merge**:
   - Branch is automatically deleted
   - Production deployment triggered

## Release Process

### Automatic Tagging
When a deployment to production succeeds:
1. CI/CD automatically creates a Git tag
2. Tag format: `v<year>.<month>.<day>-<build-number>` (e.g., `v2025.08.01-001`)
3. Tag includes deployment metadata

### Manual Release Notes
For significant releases:
1. Create GitHub Release from tag
2. Include:
   - Features added (stories completed)
   - Bugs fixed
   - Breaking changes
   - Migration notes

## Branch Protection Rules

### `main` branch protection:
- ✅ Require pull request reviews (1 review minimum)
- ✅ Dismiss stale pull request approvals
- ✅ Require status checks to pass:
  - `test` (CI workflow)
  - `security-scan`
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require signed commits (recommended)
- ✅ Include administrators in restrictions
- ✅ Restrict who can push (only through PRs)

### Additional Rules:
- ✅ Automatically delete head branches after merge
- ✅ Allow squash merging only (keep history clean)
- ❌ Disable force pushes
- ❌ Disable branch deletion

## Commit Message Convention

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process/auxiliary changes

Example: `feat: add geospatial search for providers`

## Emergency Procedures

### Rollback Process
1. Identify the last known good tag
2. Create a revert PR or deploy previous tag
3. Tag the rollback: `v<date>-rollback-<original-tag>`

### Hotfix Process
1. Create hotfix branch from `main`
2. Fix the issue with minimal changes
3. Test thoroughly
4. Fast-track PR review
5. Deploy immediately after merge