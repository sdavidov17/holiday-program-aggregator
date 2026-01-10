#!/bin/bash
# block_force_push.sh - Block git force push commands
# Returns exit code 2 to block, exit code 0 to allow

TOOL_INPUT=$(cat)
COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' || echo "")

# Check for force push patterns
if echo "$COMMAND" | grep -qE 'git\s+push.*(-f|--force|--force-with-lease)'; then
    # Check if pushing to main/master
    if echo "$COMMAND" | grep -qE '(main|master)'; then
        echo "🛑 BLOCKED: Force push to main/master branch detected" >&2
        echo "Force pushing to main/master can rewrite history and cause issues for other developers." >&2
        echo "Command attempted: $COMMAND" >&2
        exit 2
    fi

    # Warn but allow force push to feature branches
    echo "⚠️  WARNING: Force push detected to non-main branch" >&2
    echo "Ensure this is intentional and you've communicated with your team." >&2
    echo "Command: $COMMAND" >&2
fi

exit 0
