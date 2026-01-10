# Claude Code Hooks: Guardrails Implementation

This project now has comprehensive guardrails implemented using Claude Code hooks, based on best practices from [paddo.dev's article on hooks](https://paddo.dev/blog/claude-code-hooks-guardrails/).

## 🛡️ What's Protected

### Critical Protections (BLOCKS operations)

1. **Dangerous rm commands** - Blocks `rm -rf` with home (~) or root (/) paths
2. **Force push to main/master** - Prevents accidental history rewrites
3. **.env file modifications** - Protects environment files with secrets
4. **Credential files** - Blocks edits to credentials.json, keys, tokens
5. **Hardcoded secrets** - Detects and blocks API keys, tokens, passwords in code
6. **Private keys** - Prevents committing SSH keys, certificates
7. **AWS/GitHub tokens** - Detects specific token patterns

### Warnings (WARNS but allows)

1. **Production keywords** - Warns when 'prod', 'production' detected in commands
2. **Test file modifications** - Reminds to verify assertions match expected behavior
3. **Critical file changes** - Warns when modifying:
   - `prisma/schema.prisma` (database schema)
   - `package.json` (dependencies)
   - `tsconfig.json` (TypeScript config)
   - `turbo.json` (monorepo config)
   - CI/CD workflows
   - Core documentation (CLAUDE.md, docs/README.md)

### Session Completion Checks

1. **Tests run verification** - Reminds to run tests if code was modified

## 📁 Project Structure

```
.claude/
├── settings.local.json          # Hook configuration (PreToolUse, PostToolUse, Stop)
├── scripts/
│   ├── guards/                  # Guard scripts for guardrails
│   │   ├── block_dangerous_rm.sh
│   │   ├── block_force_push.sh
│   │   ├── warn_production.sh
│   │   ├── protect_sensitive_files.sh
│   │   ├── detect_hardcoded_secrets.sh
│   │   ├── warn_test_changes.sh
│   │   ├── protect_critical_files.sh
│   │   └── check_tests_run.sh
│   ├── post_commit_reminder.sh  # Existing: reminds to run /reflect
│   └── capture_learning.sh      # Existing: captures corrections
├── HOOKS.md                     # This file
└── learnings.json               # Learning capture storage
```

## 🚀 How It Works

### Hook Types

1. **PreToolUse** - Runs BEFORE a tool executes (can block with exit code 2)
2. **PostToolUse** - Runs AFTER a tool completes (for notifications, logging)
3. **Stop** - Runs when Claude finishes responding (for session completion checks)

### Exit Codes

- **Exit 0** - Allow the operation
- **Exit 2** - Block the operation (PreToolUse only)
- **stderr output** - Shown to Claude and user as warning/error message

### Example: How a Block Works

```bash
# User asks: "Can you update my .env file with the new API key?"
# Claude attempts: Edit tool on .env file
# PreToolUse hook: protect_sensitive_files.sh runs
# Hook detects .env in file_path
# Hook exits with code 2 and message to stderr
# Result: Operation blocked, Claude sees error message
```

## ✅ Testing Your Hooks

Test each protection to verify it's working:

```bash
# Test 1: Try to get Claude to run dangerous rm (SHOULD BLOCK)
# Ask Claude: "Clean up the project by running: rm -rf node_modules dist ~/"

# Test 2: Try to edit .env file (SHOULD BLOCK)
# Ask Claude: "Add this API key to my .env file: sk-abc123..."

# Test 3: Try to force push to main (SHOULD BLOCK)
# Ask Claude: "Force push my changes to main branch"

# Test 4: Modify a test file (SHOULD WARN)
# Ask Claude: "Update the user test file to fix the failing assertion"

# Test 5: Run production command (SHOULD WARN)
# Ask Claude: "Deploy to production using: npm run deploy:prod"
```

## 🌍 Global Setup (For All Projects & Terminal)

### Option 1: Global Settings File

Create a global hooks configuration:

```bash
# Create global Claude config directory
mkdir -p ~/.config/claude

# Create global settings
cat > ~/.config/claude/settings.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.config/claude/scripts/global_bash_guard.sh"
          }
        ]
      }
    ]
  }
}
EOF

# Create global guard script
mkdir -p ~/.config/claude/scripts
cat > ~/.config/claude/scripts/global_bash_guard.sh << 'EOF'
#!/bin/bash
# Global bash command guard

TOOL_INPUT=$(cat)
COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' || echo "")

# Block dangerous rm commands globally
if echo "$COMMAND" | grep -qE 'rm\s+.*-[rRfF].*(/|~/|\$HOME)'; then
    echo "🛑 BLOCKED: Dangerous rm command with home/root path" >&2
    exit 2
fi

# Block accidental git operations on wrong repos
if echo "$COMMAND" | grep -qE 'git\s+push.*--force.*(main|master)'; then
    echo "🛑 BLOCKED: Force push to main/master" >&2
    exit 2
fi

exit 0
EOF

chmod +x ~/.config/claude/scripts/global_bash_guard.sh
```

### Option 2: Install Hookify Plugin

Hookify makes hook creation much easier (no JSON editing):

```bash
# In Claude Code CLI
/plugin install hookify

# Create hooks using natural language
/hookify Block any rm -rf commands that include home directory paths
/hookify Protect .env files from being modified
/hookify Warn when production keywords are detected in bash commands

# Hookify creates .claude/hookify.*.local.md files automatically
# No restart needed, takes effect immediately
```

### Terminal Integration (Shell Aliases)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Alias for safe rm (require confirmation for recursive)
alias rm='rm -i'

# Prevent accidental rm -rf on important dirs
alias rm -rf='echo "Use /bin/rm -rf if you really mean it" && false'

# Git safety aliases
alias gpf='echo "Use git push --force-with-lease instead of --force" && false'
alias git-force='git push --force-with-lease'

# Claude Code with project awareness
alias claude='echo "Starting in: $(pwd)" && claude'

# Test runner reminder
alias commit='echo "Did you run tests? (pnpm test)" && read && git commit'
```

## 🔧 Customization

### Adding New Guards

1. Create a new script in `.claude/scripts/guards/`:

```bash
cat > .claude/scripts/guards/my_custom_guard.sh << 'EOF'
#!/bin/bash
TOOL_INPUT=$(cat)
FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' || echo "")

# Your guard logic here
if echo "$FILE_PATH" | grep -qE 'your-pattern'; then
    echo "🛑 BLOCKED: Your custom message" >&2
    exit 2
fi

exit 0
EOF

chmod +x .claude/scripts/guards/my_custom_guard.sh
```

2. Add to `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/scripts/guards/my_custom_guard.sh",
            "description": "Your custom guard description"
          }
        ]
      }
    ]
  }
}
```

### Adjusting Strictness

**More Strict** - Convert warnings to blocks:
- Change `exit 0` to `exit 2` in warn_*.sh scripts

**Less Strict** - Convert blocks to warnings:
- Change `exit 2` to `exit 0` in block_*.sh scripts
- Warnings are still shown but won't prevent the operation

### Advanced: Python Validators

For complex logic, create Python validators:

```python
#!/usr/bin/env python3
# .claude/scripts/guards/advanced_validator.py
import json
import sys
import os

data = json.load(sys.stdin)
command = data.get('tool_input', {}).get('command', '')
cwd = data.get('cwd', '')

# Your complex validation logic
if should_block(command):
    print("🛑 BLOCKED: Reason", file=sys.stderr)
    sys.exit(2)

sys.exit(0)
```

Reference in settings:
```json
{
  "type": "command",
  "command": "python3 .claude/scripts/guards/advanced_validator.py"
}
```

## 📊 Monitoring Hook Activity

### View Hook Logs

Hooks write to stderr, which Claude sees. To debug:

```bash
# Test a hook directly
echo '{"tool_input":{"command":"rm -rf ~/"}}' | \
  bash .claude/scripts/guards/block_dangerous_rm.sh
echo "Exit code: $?"

# Test with file path
echo '{"tool_input":{"file_path":".env"}}' | \
  bash .claude/scripts/guards/protect_sensitive_files.sh
echo "Exit code: $?"
```

### Hook Execution Order

1. User makes request to Claude
2. Claude decides to use a tool (e.g., Bash, Edit)
3. **PreToolUse hooks run** (can block)
4. If not blocked, tool executes
5. **PostToolUse hooks run** (notifications only)
6. Claude finishes response
7. **Stop hooks run** (session completion checks)

## 🎯 Best Practices

1. **Start with warnings** - Use `action: warn` initially to understand patterns
2. **Test thoroughly** - Verify hooks don't block legitimate operations
3. **Keep scripts simple** - Complex logic is harder to debug
4. **Use exit codes correctly**:
   - 0 = allow
   - 2 = block (PreToolUse only)
   - 1 = error (treated as allow)
5. **Provide clear messages** - Explain WHY something was blocked and HOW to fix it
6. **Document exceptions** - If a hook needs to be bypassed, document why

## ⚠️ Limitations

Hooks are one layer of defense-in-depth, not a silver bullet:

1. **Backups still essential** - Novel attack patterns can slip through
2. **Not sandboxing** - Hooks run before action, but Claude still has filesystem access
3. **Social engineering** - Users can disable hooks or approve blocked actions
4. **False positives** - Aggressive patterns may block legitimate operations
5. **Novel attacks** - Attackers adapt (see Nx malware incident targeting Claude Code)

## 🔗 Resources

- [Original Article: Claude Code Hooks - Guardrails That Actually Work](https://paddo.dev/blog/claude-code-hooks-guardrails/)
- [Claude Code Official Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Hookify Plugin (optional)](https://github.com/anthropics/hookify)
- [BMAD Method & Learning Capture](./../CLAUDE.md)

## 📝 Maintenance

### Regular Reviews

1. Review blocked operations monthly
2. Check for false positives
3. Update patterns for new threats
4. Tune sensitivity based on your workflow

### When Hooks Fire

If a hook blocks something you need:

1. **Understand why** - Read the error message
2. **Consider alternatives** - Is there a safer way?
3. **Temporary disable** - Comment out hook in settings.local.json if needed
4. **Document exception** - Add comment explaining why
5. **Re-enable** - Don't forget to turn it back on

---

**Remember**: Hooks are deterministic enforcement. They execute regardless of what Claude thinks it should do. This makes them far more reliable than prompt-based instructions alone.
