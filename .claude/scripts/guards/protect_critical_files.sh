#!/bin/bash
# protect_critical_files.sh - Protect critical project files from accidental modification
# Returns exit code 2 to block, or 0 to allow with warning

TOOL_INPUT=$(cat)
FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' || echo "")

if [ -z "$FILE_PATH" ]; then
    FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"path"\s*:\s*"\K[^"]+' || echo "")
fi

# Protect Prisma schema (critical for database)
if echo "$FILE_PATH" | grep -qE 'prisma/schema\.prisma$'; then
    echo "⚠️  CRITICAL: Prisma schema modification detected" >&2
    echo "File: $FILE_PATH" >&2
    echo "" >&2
    echo "Schema changes require:" >&2
    echo "  1. Understanding of data model relationships" >&2
    echo "  2. Migration strategy (db:migrate, not db:push for production)" >&2
    echo "  3. Consideration of existing data" >&2
    echo "  4. Review of all affected queries and repositories" >&2
    echo "" >&2
    echo "Allowing with warning. Review carefully." >&2
    exit 0
fi

# Protect package.json (dependency changes are critical)
if echo "$FILE_PATH" | grep -qE 'package\.json$'; then
    echo "⚠️  WARNING: package.json modification detected" >&2
    echo "Dependency changes can introduce security vulnerabilities or breaking changes." >&2
    echo "Review changes carefully and run: pnpm install && pnpm test" >&2
    exit 0
fi

# Protect tsconfig.json (TypeScript config is critical)
if echo "$FILE_PATH" | grep -qE 'tsconfig.*\.json$'; then
    echo "⚠️  WARNING: TypeScript config modification" >&2
    echo "Config changes affect type checking across the entire project." >&2
    exit 0
fi

# Protect turbo.json (monorepo config)
if echo "$FILE_PATH" | grep -qE 'turbo\.json$'; then
    echo "⚠️  WARNING: Turbo config modification" >&2
    echo "Changes affect build pipeline and caching strategy." >&2
    exit 0
fi

# Protect CI/CD files
if echo "$FILE_PATH" | grep -qE '\.github/workflows/|\.gitlab-ci\.yml|\.circleci/'; then
    echo "⚠️  WARNING: CI/CD configuration modification" >&2
    echo "Changes affect automated testing and deployment." >&2
    exit 0
fi

# Protect core documentation structure
if echo "$FILE_PATH" | grep -qE 'docs/(README|CLAUDE)\.md$'; then
    echo "⚠️  WARNING: Core documentation modification" >&2
    echo "These files guide AI behavior and project understanding." >&2
    exit 0
fi

exit 0
