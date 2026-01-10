#!/bin/bash
# protect_sensitive_files.sh - Protect .env and other sensitive files
# Returns exit code 2 to block writes to sensitive files

TOOL_INPUT=$(cat)

# Extract file_path from the JSON input
FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' || echo "")

if [ -z "$FILE_PATH" ]; then
    # Try alternate field names
    FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"path"\s*:\s*"\K[^"]+' || echo "")
fi

# Protect .env files (any .env variant)
if echo "$FILE_PATH" | grep -qE '\.env($|\.|\/)'; then
    # Allow .env.example files
    if echo "$FILE_PATH" | grep -qE '\.env\.example'; then
        exit 0
    fi

    echo "🚫 BLOCKED: Attempted to modify .env file" >&2
    echo "File: $FILE_PATH" >&2
    echo ".env files contain secrets and should not be edited by AI." >&2
    echo "Use .env.example with placeholder values instead." >&2
    exit 2
fi

# Protect credential files
if echo "$FILE_PATH" | grep -qiE '(credentials|secrets|keys|tokens)\.(json|yaml|yml|txt)'; then
    echo "🚫 BLOCKED: Attempted to modify credentials file" >&2
    echo "File: $FILE_PATH" >&2
    echo "Credential files should be managed manually, not by AI." >&2
    exit 2
fi

# Protect specific sensitive config files
PROTECTED_FILES=(
    ".npmrc"
    ".pypirc"
    "id_rsa"
    "id_ecdsa"
    "id_ed25519"
    ".aws/credentials"
    ".ssh/config"
)

for protected in "${PROTECTED_FILES[@]}"; do
    if echo "$FILE_PATH" | grep -qF "$protected"; then
        echo "🚫 BLOCKED: Attempted to modify protected file: $protected" >&2
        echo "File: $FILE_PATH" >&2
        exit 2
    fi
done

exit 0
