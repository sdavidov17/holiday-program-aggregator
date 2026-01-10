#!/bin/bash
# block_dangerous_rm.sh - Block destructive rm commands with home/root paths
# Returns exit code 2 to block the operation

# Read the tool input JSON from stdin
TOOL_INPUT=$(cat)

# Extract the command from JSON (simple grep approach, could use jq if available)
COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' || echo "")

# Check for dangerous rm -rf patterns
if echo "$COMMAND" | grep -qE 'rm\s+.*-[rR].*-[fF]|rm\s+-[fF].*-[rR]'; then
    # Check for home directory patterns
    if echo "$COMMAND" | grep -qE '(/\s|~/|\$HOME|~\s)'; then
        echo "🛑 BLOCKED: rm -rf command includes root (/) or home (~) directory path" >&2
        echo "This command could delete critical system or user files." >&2
        echo "Command attempted: $COMMAND" >&2
        exit 2
    fi

    # Check for wildcards in dangerous positions
    if echo "$COMMAND" | grep -qE 'rm\s+.*-[rRfF].*\*.*(/|~)'; then
        echo "🛑 BLOCKED: rm -rf with wildcards near home/root paths" >&2
        echo "This pattern is extremely dangerous." >&2
        echo "Command attempted: $COMMAND" >&2
        exit 2
    fi
fi

# Allow the operation
exit 0
