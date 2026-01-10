#!/bin/bash
# warn_production.sh - Warn when production keywords detected in commands
# Returns exit code 0 (warning only, doesn't block)

TOOL_INPUT=$(cat)
COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' || echo "")

# Check for production keywords
if echo "$COMMAND" | grep -qiE '(prod|production|--prod|PROD_|DATABASE_URL.*prod)'; then
    echo "⚠️  WARNING: Production environment keyword detected" >&2
    echo "Command: $COMMAND" >&2
    echo "Verify this operation is intentional and safe for production." >&2
fi

# Check for database operations with production
if echo "$COMMAND" | grep -qiE '(psql|pg_dump|prisma.*prod|db:.*prod)'; then
    echo "⚠️  WARNING: Database operation with production context detected" >&2
    echo "Ensure you have backups and this is not a destructive operation." >&2
fi

exit 0
