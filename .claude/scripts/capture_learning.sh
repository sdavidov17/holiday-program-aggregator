#!/bin/bash
# capture_learning.sh - Capture corrections and learnings from user prompts
# This hook runs on UserPromptSubmit to detect correction patterns

LEARNINGS_FILE="${HOME}/.claude/learnings.json"
PROJECT_LEARNINGS=".claude/learnings.json"

# Use project-specific file if in a git repo
if [ -d ".git" ]; then
    LEARNINGS_FILE="$PROJECT_LEARNINGS"
fi

# Initialize learnings file if it doesn't exist
if [ ! -f "$LEARNINGS_FILE" ]; then
    mkdir -p "$(dirname "$LEARNINGS_FILE")"
    echo '{"learnings": [], "lastProcessed": null}' > "$LEARNINGS_FILE"
fi

# Read the user's prompt from stdin (passed by Claude Code hook)
USER_PROMPT=$(cat)

# Detection patterns with confidence scores
# High confidence corrections
if echo "$USER_PROMPT" | grep -qiE "(no,? (use|do|prefer|always)|that'?s wrong|don'?t do that|actually,? (use|prefer|do)|instead of .+,? use)"; then
    CONFIDENCE="0.90"
    SOURCE="correction"
# Explicit markers - highest confidence
elif echo "$USER_PROMPT" | grep -qiE "^(remember:|always:|never:|rule:)"; then
    CONFIDENCE="0.95"
    SOURCE="explicit"
# Positive reinforcement
elif echo "$USER_PROMPT" | grep -qiE "(that'?s (exactly )?right|perfect,? (keep|always)|yes,? always)"; then
    CONFIDENCE="0.75"
    SOURCE="reinforcement"
# Preferences
elif echo "$USER_PROMPT" | grep -qiE "(I prefer|use .+ for this project|our convention is|we always)"; then
    CONFIDENCE="0.70"
    SOURCE="preference"
else
    # No learning detected, exit cleanly
    exit 0
fi

# Generate a simple UUID-like ID
LEARNING_ID=$(date +%s)-$$

# Get timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Extract the learning content (first 200 chars of prompt)
CONTENT=$(echo "$USER_PROMPT" | head -c 200 | tr '\n' ' ' | sed 's/"/\\"/g')

# Create the learning JSON object
LEARNING_JSON=$(cat <<EOF
{
    "id": "$LEARNING_ID",
    "content": "$CONTENT",
    "confidence": $CONFIDENCE,
    "scope": "project",
    "source": "$SOURCE",
    "timestamp": "$TIMESTAMP",
    "context": "Detected from user prompt"
}
EOF
)

# Add to learnings file using jq if available, otherwise use simple append
if command -v jq &> /dev/null; then
    # Use jq for proper JSON manipulation
    TMP_FILE=$(mktemp)
    jq ".learnings += [$LEARNING_JSON]" "$LEARNINGS_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LEARNINGS_FILE"
else
    # Fallback: simple file-based tracking
    echo "$LEARNING_JSON" >> "${LEARNINGS_FILE}.pending"
fi

# Silent exit - don't interrupt user flow
exit 0
