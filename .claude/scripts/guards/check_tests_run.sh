#!/bin/bash
# check_tests_run.sh - Verify tests were run during the session
# This is a Stop hook that runs when Claude wants to finish
# Returns exit code 0 to allow, or warning message to stderr

TOOL_INPUT=$(cat)

# Extract transcript from JSON if available
TRANSCRIPT=$(echo "$TOOL_INPUT" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    transcript = data.get('transcript', '')
    print(transcript)
except:
    pass
" 2>/dev/null || echo "")

# Check if any test commands were run in the session
TEST_PATTERNS=(
    "pnpm test"
    "pnpm test:e2e"
    "npm test"
    "npm run test"
    "jest"
    "pytest"
    "cargo test"
    "go test"
    "pnpm typecheck"
    "tsc --noEmit"
)

TESTS_RUN=false
for pattern in "${TEST_PATTERNS[@]}"; do
    if echo "$TRANSCRIPT" | grep -qF "$pattern"; then
        TESTS_RUN=true
        break
    fi
done

# Only enforce if code changes were made
CODE_MODIFIED=$(echo "$TRANSCRIPT" | grep -qE '(Edit|Write).*\.(ts|tsx|js|jsx|py|go|rs)' && echo "true" || echo "false")

if [ "$CODE_MODIFIED" = "true" ] && [ "$TESTS_RUN" = "false" ]; then
    echo "" >&2
    echo "🧪 REMINDER: Code was modified but tests were not run" >&2
    echo "" >&2
    echo "Before completing, consider running:" >&2
    echo "  pnpm test          # Unit tests" >&2
    echo "  pnpm typecheck     # Type checking" >&2
    echo "  pnpm lint          # Linting" >&2
    echo "  pnpm test:e2e      # E2E tests" >&2
    echo "" >&2
    echo "This is a reminder, not a blocker." >&2
fi

exit 0
