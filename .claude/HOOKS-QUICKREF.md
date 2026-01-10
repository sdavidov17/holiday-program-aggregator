# Claude Code Hooks - Quick Reference

## 🛡️ Active Protections

| Protection | Type | Action | Hook Script |
|------------|------|--------|-------------|
| `rm -rf ~/` or `rm -rf /` | Bash | BLOCK | block_dangerous_rm.sh |
| `git push --force main` | Bash | BLOCK | block_force_push.sh |
| Edit `.env` files | Edit/Write | BLOCK | protect_sensitive_files.sh |
| Edit `credentials.json`, keys | Edit/Write | BLOCK | protect_sensitive_files.sh |
| Hardcoded `API_KEY=xyz123` | Edit/Write | BLOCK | detect_hardcoded_secrets.sh |
| AWS keys (AKIA...) | Edit/Write | BLOCK | detect_hardcoded_secrets.sh |
| GitHub tokens (ghp_...) | Edit/Write | BLOCK | detect_hardcoded_secrets.sh |
| Private keys (BEGIN RSA...) | Edit/Write | BLOCK | detect_hardcoded_secrets.sh |
| JWT tokens | Edit/Write | BLOCK | detect_hardcoded_secrets.sh |
| Production commands | Bash | WARN | warn_production.sh |
| Test file edits | Edit/Write | WARN | warn_test_changes.sh |
| `prisma/schema.prisma` | Edit/Write | WARN | protect_critical_files.sh |
| `package.json` | Edit/Write | WARN | protect_critical_files.sh |
| `tsconfig.json` | Edit/Write | WARN | protect_critical_files.sh |
| CI/CD configs | Edit/Write | WARN | protect_critical_files.sh |
| Code without tests | Stop | REMIND | check_tests_run.sh |

## 🎯 Quick Commands

```bash
# Test hooks locally
echo '{"tool_input":{"command":"rm -rf ~/"}}' | bash .claude/scripts/guards/block_dangerous_rm.sh

# View all hooks
cat .claude/settings.local.json | grep -A2 "command"

# Disable a specific hook (comment it out)
# Edit .claude/settings.local.json and add // before the hook

# Check hook permissions
ls -lh .claude/scripts/guards/

# Read full documentation
cat .claude/HOOKS.md
```

## 📝 Hook Behavior

- **BLOCK** = Exit code 2, operation prevented
- **WARN** = Exit code 0, operation allowed with warning message
- **REMIND** = Exit code 0, shown at session end

## 🔧 Emergency Override

If you need to bypass hooks temporarily:

1. Rename settings file: `mv .claude/settings.local.json .claude/settings.local.json.disabled`
2. Perform operation
3. Re-enable: `mv .claude/settings.local.json.disabled .claude/settings.local.json`

**⚠️ Only do this if absolutely necessary and you understand the risks!**

## 📚 More Info

- Full docs: `.claude/HOOKS.md`
- Article: https://paddo.dev/blog/claude-code-hooks-guardrails/
- Official docs: https://code.claude.com/docs/en/hooks
