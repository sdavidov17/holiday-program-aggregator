#!/bin/bash
# post_commit_reminder.sh - Remind user to run /reflect after commits
# This hook runs after successful git commits

LEARNINGS_FILE=".claude/learnings.json"

# Check if there are pending learnings
if [ -f "$LEARNINGS_FILE" ]; then
    if command -v jq &> /dev/null; then
        COUNT=$(jq '.learnings | length' "$LEARNINGS_FILE" 2>/dev/null || echo "0")
    else
        COUNT=$(grep -c '"id"' "$LEARNINGS_FILE" 2>/dev/null || echo "0")
    fi

    if [ "$COUNT" -gt 0 ]; then
        echo ""
        echo "📝 You have $COUNT pending learning(s). Run /reflect to review and apply them to CLAUDE.md"
        echo ""
    fi
fi

exit 0
