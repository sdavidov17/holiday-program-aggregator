#!/bin/bash
# detect_hardcoded_secrets.sh - Detect hardcoded API keys, tokens, passwords
# Returns exit code 2 to block if secrets detected

TOOL_INPUT=$(cat)

# Extract the new content being written (try multiple field names)
NEW_TEXT=$(echo "$TOOL_INPUT" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    # Try different possible field names
    content = data.get('tool_input', {}).get('new_string', '')
    if not content:
        content = data.get('tool_input', {}).get('content', '')
    if not content:
        content = data.get('new_string', '')
    if not content:
        content = data.get('content', '')
    print(content)
except:
    pass
" 2>/dev/null || echo "$TOOL_INPUT")

# Pattern matching for common secret formats
# API keys, tokens, passwords with actual values (not placeholders)
if echo "$NEW_TEXT" | grep -qE '(API_KEY|APIKEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY)\s*[=:]\s*["\047][A-Za-z0-9_\-+/]{16,}["\047]'; then
    # Check if it's likely a placeholder (contains 'your', 'xxx', 'placeholder', etc.)
    if ! echo "$NEW_TEXT" | grep -qiE '(your_|xxx|placeholder|example|REPLACE|TODO|CHANGEME)'; then
        echo "🔐 BLOCKED: Hardcoded secret detected in file content" >&2
        echo "Found pattern matching API_KEY, SECRET, TOKEN, or PASSWORD with a real value." >&2
        echo "Use environment variables instead:" >&2
        echo "  - Store in .env file (not committed)" >&2
        echo "  - Reference as process.env.API_KEY in code" >&2
        echo "  - Use .env.example with placeholder values for documentation" >&2
        exit 2
    fi
fi

# Check for AWS keys (more specific pattern)
if echo "$NEW_TEXT" | grep -qE 'AKIA[0-9A-Z]{16}'; then
    echo "🔐 BLOCKED: AWS Access Key detected" >&2
    echo "This appears to be a real AWS access key starting with AKIA" >&2
    exit 2
fi

# Check for GitHub tokens (ghp_, gho_, etc.)
if echo "$NEW_TEXT" | grep -qE 'gh[ps]_[A-Za-z0-9]{36,}'; then
    echo "🔐 BLOCKED: GitHub token detected" >&2
    echo "Found pattern matching GitHub personal access token" >&2
    exit 2
fi

# Check for private keys
if echo "$NEW_TEXT" | grep -qE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY'; then
    echo "🔐 BLOCKED: Private key detected in file content" >&2
    echo "Private keys should never be committed or stored in code" >&2
    exit 2
fi

# Check for JWT tokens (basic pattern)
if echo "$NEW_TEXT" | grep -qE 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'; then
    echo "🔐 BLOCKED: JWT token detected" >&2
    echo "Found pattern matching JSON Web Token" >&2
    exit 2
fi

exit 0
