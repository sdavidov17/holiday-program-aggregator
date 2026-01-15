---
# Skill Front Matter - Claude Code 2.10+ Features
# context: fork - Runs in isolated context (reflection shouldn't pollute main chat)
context: fork
---

# /reflect Command

Process captured learnings from recent sessions and update CLAUDE.md with approved improvements.

## Purpose

This skill implements a self-improving loop by:
1. Reviewing corrections and feedback captured during sessions
2. Presenting learnings for your approval
3. Updating CLAUDE.md with approved patterns

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Self-Improving Loop                  │
├─────────────────────────────────────────────────────────┤
│  During Session:                                        │
│  - You correct Claude ("no, use X instead")             │
│  - You praise ("that's exactly right")                  │
│  - You specify ("remember: always do Y")                │
│       ↓                                                 │
│  [Corrections captured to .claude/learnings.json]       │
│       ↓                                                 │
│  You run: /reflect                                      │
│       ↓                                                 │
│  Claude presents learnings for review                   │
│       ↓                                                 │
│  You approve relevant ones                              │
│       ↓                                                 │
│  CLAUDE.md updated → Future sessions remember           │
└─────────────────────────────────────────────────────────┘
```

## Activation Instructions

When `/reflect` is invoked:

### Step 1: Load Learnings Queue
Read the file `.claude/learnings.json` if it exists. If not, inform user no learnings have been captured yet.

### Step 2: Analyze Current CLAUDE.md
Read `CLAUDE.md` to understand existing patterns and avoid duplicates.

### Step 3: Present Learnings for Review
Display each learning in a table format:

| # | Learning | Confidence | Scope | Status |
|---|----------|------------|-------|--------|
| 1 | Use BaseRepository for all DB access | 0.90 | project | new |
| 2 | Always add audit logging for user data access | 0.85 | project | exists |

### Step 4: Get User Approval
Ask user which learnings to apply:
- "Apply all"
- "Select specific numbers (e.g., 1, 3, 5)"
- "Skip all"

### Step 5: Update CLAUDE.md
For approved learnings:
1. Find appropriate section in CLAUDE.md
2. Add learning as a bullet point or rule
3. Preserve existing formatting

### Step 6: Clear Processed Learnings
Remove applied learnings from the queue.

## Commands

- `/reflect` - Review and process queued learnings
- `/reflect --dry-run` - Preview changes without applying
- `/reflect --clear` - Clear all queued learnings without applying
- `/reflect --show` - Show current queue without processing

## Learning Detection Patterns

The capture system looks for:

### Corrections (High Confidence: 0.85-0.95)
- "no, use X instead"
- "that's wrong, it should be"
- "don't do X, do Y"
- "actually, prefer X"

### Explicit Markers (Highest Confidence: 0.95)
- "remember:"
- "always:"
- "never:"
- "rule:"

### Positive Reinforcement (Medium Confidence: 0.70-0.80)
- "that's exactly right"
- "perfect, keep doing that"
- "yes, always do it that way"

### Preferences (Medium Confidence: 0.65-0.75)
- "I prefer X"
- "use X for this project"
- "our convention is X"

## Learning Categories

When adding to CLAUDE.md, learnings are categorized:

| Category | CLAUDE.md Section | Example |
|----------|-------------------|---------|
| Architecture | Key Architectural Patterns | "Use repository pattern" |
| Security | Security Requirements | "Encrypt all PII" |
| Testing | Testing Commands | "Run integration tests with X" |
| Code Style | Code Quality Standards | "Prefer early returns" |
| Workflow | Development Rules | "Always create GitHub issue" |

## Example Session

```
You: /reflect

Claude: I found 3 learnings in the queue:

| # | Learning | Confidence | Scope |
|---|----------|------------|-------|
| 1 | Use `ctx.session.user.id` not `ctx.user.id` | 0.90 | project |
| 2 | Run `pnpm typecheck` before committing | 0.85 | project |
| 3 | Provider vetting requires admin approval | 0.75 | project |

Which would you like to apply?
1. Apply all
2. Select specific (enter numbers)
3. Skip all

You: 1, 2

Claude: Applied 2 learnings to CLAUDE.md:
- Added to "Code Quality Standards": Use ctx.session.user.id for user identification
- Added to "Development Commands": Run pnpm typecheck before commits

Remaining learning (#3) kept in queue for future review.
```

## Manual Learning Addition

You can also manually add learnings:

```
You: remember: Always use Zod schemas for tRPC input validation

Claude: I'll add this learning to the queue with high confidence (0.95).
Run /reflect to review and apply it to CLAUDE.md.
```

## Integration with Hooks

This skill works with the capture hook that runs on each prompt:
- Hook detects correction patterns in your messages
- Learnings are queued to `.claude/learnings.json`
- Run `/reflect` periodically to process the queue

## Learnings File Format

```json
{
  "learnings": [
    {
      "id": "uuid",
      "content": "Use BaseRepository for database access",
      "confidence": 0.90,
      "scope": "project",
      "source": "correction",
      "timestamp": "2025-01-06T10:30:00Z",
      "context": "User said: 'no, always use the repository pattern'"
    }
  ],
  "lastProcessed": "2025-01-05T09:00:00Z"
}
```
