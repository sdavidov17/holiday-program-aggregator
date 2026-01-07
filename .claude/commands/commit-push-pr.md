# /commit-push-pr

Commit current changes, push to remote, and create a pull request in one streamlined flow.

## Pre-computed Context

Before starting, gather this context:

```bash
# Current branch and status
git branch --show-current
git status --short

# Changes to be committed
git diff --staged --stat
git diff --stat

# Recent commits for message style reference
git log -5 --oneline

# Check if branch exists on remote
git ls-remote --heads origin $(git branch --show-current)
```

## Instructions

### Step 1: Stage Changes
- Review unstaged changes with `git diff --stat`
- Stage all relevant files (exclude .env, credentials, .local files)
- Use `git add -A` for all changes, or selective staging if needed

### Step 2: Create Commit
Create a conventional commit following project standards:
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore, style, perf
- Keep subject line under 72 characters
- Add body with bullet points for significant changes
- Include the Claude Code attribution footer

Example:
```
feat(subscription): add audit logging for financial operations

- Add audit events for checkout, cancel, resume, tier change
- Include correlation IDs for request tracing
- Log to both structured logs and database

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Step 3: Push to Remote
- If branch doesn't exist on remote: `git push -u origin <branch-name>`
- If branch exists: `git push`
- Handle any push failures (rebase if needed)

### Step 4: Create Pull Request
Use `gh pr create` with:
- Clear, descriptive title matching the commit
- Body with:
  - ## Summary (2-3 bullet points of what changed)
  - ## Changes (list of files/areas modified)
  - ## Test Plan (how to verify the changes)
  - Attribution footer

Example:
```bash
gh pr create --title "feat(subscription): add audit logging" --body "$(cat <<'EOF'
## Summary
- Added audit logging for all subscription financial operations
- New event types: SUBSCRIPTION_CHECKOUT_STARTED, SUBSCRIPTION_RESUMED, SUBSCRIPTION_TIER_CHANGED
- Integrated with existing auditLogger utility

## Changes
- `apps/web/src/services/subscription.service.ts` - Added audit logging calls
- `apps/web/src/utils/auditLogger.ts` - Added new event types

## Test Plan
- [ ] Run `pnpm test -- subscription` - all tests pass
- [ ] Verify audit logs appear in database after subscription actions
- [ ] Check structured logs include correlation IDs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 5: Report Result
Return the PR URL so the user can review it.

## Error Handling

- If no changes to commit: Report "No changes to commit" and stop
- If commit fails (hooks): Fix issues and retry
- If push fails (conflicts): Offer to rebase or force push (with warning)
- If PR creation fails: Report error and provide manual command

## Quick Mode

For simple changes, this entire flow can be done in one shot:
1. `git add -A`
2. `git commit -m "message"`
3. `git push -u origin branch`
4. `gh pr create --fill`
