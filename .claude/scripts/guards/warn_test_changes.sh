#!/bin/bash
# warn_test_changes.sh - Warn when test files are being modified
# Returns exit code 0 (warning only, doesn't block)

TOOL_INPUT=$(cat)
FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' || echo "")

if [ -z "$FILE_PATH" ]; then
    FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"path"\s*:\s*"\K[^"]+' || echo "")
fi

# Check if this is a test file
if echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|js|tsx|jsx|py)$'; then
    echo "⚠️  WARNING: Test file modification detected" >&2
    echo "File: $FILE_PATH" >&2
    echo "" >&2
    echo "Common test anti-patterns to avoid:" >&2
    echo "  ❌ Changing assertions to match incorrect behavior" >&2
    echo "  ❌ Removing failing tests instead of fixing the code" >&2
    echo "  ❌ Making tests too specific to implementation details" >&2
    echo "" >&2
    echo "✅ Ensure test changes reflect:" >&2
    echo "  - Correct expected behavior (not current behavior)" >&2
    echo "  - Business requirements and acceptance criteria" >&2
    echo "  - Edge cases and error conditions" >&2
fi

# Check if modifying E2E tests (especially critical)
if echo "$FILE_PATH" | grep -qE 'e2e|playwright|cypress'; then
    echo "⚠️  CRITICAL: E2E test modification detected" >&2
    echo "E2E tests validate critical user flows. Changes require extra scrutiny." >&2
fi

exit 0
