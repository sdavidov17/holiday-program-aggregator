---
# Skill Front Matter - Claude Code 2.10+ Features
# async: true - Allows running in background with Ctrl+B
# context: fork - Runs in isolated context (doesn't pollute main chat)
async: true
context: fork
---

# /verify

Run all verification checks to ensure the codebase is in a good state before committing or creating a PR.

## Verification Steps

Execute these checks in order, stopping on first failure:

### 1. TypeScript Type Check
```bash
cd apps/web && pnpm tsc --noEmit
```
- Report any type errors with file:line references
- This catches type mismatches before runtime

### 2. Linting
```bash
pnpm lint
```
- Report any lint errors (warnings are acceptable)
- Auto-fix if possible with `pnpm lint --fix`

### 3. Unit Tests
```bash
pnpm test
```
- All tests must pass
- Report failed tests with clear descriptions

### 4. Build Check
```bash
SKIP_ENV_VALIDATION=true pnpm build
```
- Ensures production build succeeds
- Catches issues that only appear in production mode

## Output Format

Report results in a clear table:

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | ✅ Pass | No errors |
| Lint | ✅ Pass | 0 errors, 3 warnings |
| Tests | ✅ Pass | 153 tests passed |
| Build | ✅ Pass | Built in 45s |

Or if there are failures:

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | ❌ Fail | 2 errors in subscription.service.ts |
| Lint | ⏭️ Skipped | Blocked by TypeScript errors |
| Tests | ⏭️ Skipped | Blocked by TypeScript errors |
| Build | ⏭️ Skipped | Blocked by TypeScript errors |

## Quick Verify

For faster feedback during development, run only the most relevant checks:

```bash
# Type check only
pnpm tsc --noEmit

# Specific test file
pnpm test -- path/to/file.test.ts
```

## Integration with /commit-push-pr

Always run `/verify` before `/commit-push-pr` to ensure CI will pass.
