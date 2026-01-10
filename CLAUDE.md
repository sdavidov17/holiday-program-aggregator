# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Reference

All project documentation is organized in `/docs/` with the following structure:

### Quick Navigation
- **Documentation Hub**: `/docs/README.md` - Start here for role-based navigation

### Technical Documentation
- **Architecture**: `/docs/architecture/` - System design, tech stack, data models
- **API Reference**: `/docs/api/` - Complete API documentation and examples
- **Guides**: `/docs/guides/` - How-to guides including:
  - Developer onboarding (30-minute quick start)
  - Local setup and deployment
  - Testing strategy and database setup

### Business & Product
- **Reference**: `/docs/reference/` - BMAD artifacts, PRD, UX designs

### Project Management
- **Project**: `/docs/project/` - Planning and process documentation
  - Roadmap and milestones
  - Implementation status
  - Team guidelines and branching strategy

### Development
- **Stories**: `/docs/stories/` - All epic stories with acceptance criteria

## Project Architecture

### Monorepo Structure
This is a **Turborepo monorepo** with a single Next.js app (no packages directory):

```
holiday-program-aggregator/
├── apps/
│   └── web/                    # Next.js 15 application (T3 Stack)
│       ├── src/
│       │   ├── pages/         # Next.js Pages Router
│       │   ├── server/        # tRPC API layer
│       │   │   ├── api/       # tRPC routers (user, subscription, provider, admin, healthz)
│       │   │   ├── auth.ts    # NextAuth configuration
│       │   │   └── db.ts      # Prisma client
│       │   ├── repositories/  # Database access layer (BaseRepository pattern)
│       │   ├── services/      # Business logic layer
│       │   ├── utils/         # Shared utilities (encryption, logger, auditLogger)
│       │   ├── components/    # React components
│       │   ├── hooks/         # Custom React hooks
│       │   └── types/         # TypeScript type definitions
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   └── seed*.ts       # Database seeding scripts
│       └── __tests__/         # Jest test files
├── docs/                      # Comprehensive documentation
└── turbo.json                 # Turborepo configuration
```

### Tech Stack (see `/docs/architecture/tech-stack.md`)
- **Frontend**: Next.js 15.4.6, React 19.1.1, TypeScript 5.9.2
- **Backend**: tRPC 11.4.4 for type-safe APIs
- **Database**: PostgreSQL 16.3 with Prisma 6.13.0 ORM
- **Auth**: NextAuth v4.24.11
- **Styling**: Tailwind CSS 3.4.17, Shadcn/UI + Radix UI
- **State**: TanStack Query 5.84.2, Zustand
- **Testing**: Jest 30.0.5 (unit/integration), Playwright 1.54.2 (E2E)
- **Linting**: Biome 2.2.0 (replaces ESLint)
- **CI/CD**: Vercel deployment, GitHub Actions

### Key Architectural Patterns

#### Repository Pattern
All database access uses the BaseRepository pattern (`src/repositories/base.repository.ts`):
- Provides standard CRUD operations
- Includes automatic audit logging
- Supports transactions
- Example: `ProviderRepository` extends `BaseRepository<Provider>`

#### tRPC API Structure
API routers are in `src/server/api/routers/`:
- `user.ts` - User management
- `subscription.ts` - Subscription/Stripe integration
- `provider.ts` - Provider and program management
- `admin.ts` - Admin operations
- `healthz.ts` - Health checks

All routers are assembled in `src/server/api/root.ts` as `appRouter`.

#### Database Schema
Core models in `prisma/schema.prisma`:
- **User** - Authentication and profile (NextAuth)
- **Provider** - Holiday program providers with vetting workflow
- **Program** - Holiday programs with geospatial data
- **Subscription** - Stripe subscription management
- Key features: PostGIS support planned, audit trail, soft deletes

## Development Commands

### Core Commands
```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server

# Quality Checks (run before committing)
pnpm lint             # Biome linting (non-blocking in CI)
pnpm typecheck        # TypeScript type checking
pnpm test             # Run Jest unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm test:e2e         # Run Playwright E2E tests

# Database (Prisma)
pnpm db:push          # Push schema changes (development)
pnpm db:migrate       # Create and run migrations
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed database with test data

# Docker (local PostgreSQL)
pnpm docker:up        # Start PostgreSQL container
pnpm docker:down      # Stop PostgreSQL container
pnpm docker:reset     # Reset database and container
```

### Testing Commands
```bash
# Run specific test file
cd apps/web && pnpm test -- path/to/test.test.ts

# Run tests matching pattern
cd apps/web && pnpm test -- -t "test name pattern"

# Run tests for specific file pattern
cd apps/web && pnpm test -- repositories

# E2E tests
cd apps/web && pnpm test:e2e
cd apps/web && pnpm test:e2e:ui  # Interactive UI mode
```

## Development Rules

### Story & Issue Management
**IMPORTANT**: Always keep `/docs/stories/` and GitHub Issues synchronized:
- When creating or updating a story in `/docs/stories/`, create/update the corresponding GitHub issue
- When working on a GitHub issue, ensure the story document reflects the current state
- Story documents should include GitHub issue numbers for cross-reference
- GitHub issues should link back to story documents for detailed technical specs
- Use consistent naming: `[EPIC X] Title` or `[STORY X.Y] Title` in both places
- Update implementation status in both locations when work is completed

### Definition of Ready (DoR) Compliance
**MANDATORY**: Before starting any story development:
- Verify story meets ALL Definition of Ready criteria (see `/docs/project/definition-of-ready.md`)
- Ensure BDD scenarios are defined in Given/When/Then format
- Confirm Three Amigos session completed (PM/BA + QA + Dev collaboration)
- Check test strategy is defined (Unit/Integration/E2E levels)
- Use the story template (`/docs/project/story-template.md`) for new stories

### Definition of Done (DoD) Compliance
**MANDATORY**: Before marking any story as complete:
- Verify ALL Definition of Done criteria are met (see `/docs/project/definition-of-done.md`)
- Ensure ALL BDD scenarios are implemented as tests and passing (100% pass rate)
- Confirm code coverage is >80% for new code
- Run ALL quality checks: `pnpm test && pnpm lint && pnpm typecheck`
- Obtain Product Owner sign-off

### Code Quality Standards
- Always run `pnpm lint && pnpm typecheck` before committing
- Ensure test coverage remains above 80% for new code
- Follow repository pattern for database operations (extend `BaseRepository`)
- Use audit logging via `auditLogger.logAction()` for security-relevant operations
- Never commit sensitive information or debug endpoints
- Write tests FIRST or alongside code (TDD/BDD approach)
- Use proper error handling and logging (`utils/logger.ts`)

### Security Requirements
- No hardcoded secrets (use environment variables)
- All sensitive operations must use audit logging
- Encryption for PII using `utils/encryption.ts`
- Rate limiting on public endpoints
- SQL injection protection via Prisma (never use raw SQL without parameterization)
- Authentication required for all non-public routes

### BMAD Method Integration
This project uses BMAD (Business-Model-Architecture-Development) methodology:
- Cursor rules in `.cursor/rules/` define specialized agent personas (@dev, @pm, @po, @qa, etc.)
- Core development workflows in `.bmad-core/` (not loaded during normal Claude Code operation)
- Story-driven development with strict DoR/DoD compliance
- When invoked with `@dev` in Cursor, follows strict story implementation workflow

Refer to documentation in `/docs/` for all implementation details, requirements, and architectural decisions.

## Claude Code Skills & Automation

### Available Skills
This project has specialized skills configured in `.claude/commands/`:

**BMAD Agents** (`/BMad/agents/`):
- `/dev` - Full Stack Developer (James) - Story implementation
- `/architect` - System Architect (Winston) - Architecture design
- `/pm` - Project Manager - Project planning
- `/po` - Product Owner - Product decisions
- `/qa` - QA Engineer (Quinn) - Testing and quality
- `/sm` - Scrum Master - Process facilitation
- `/analyst` - Business Analyst - Requirements analysis
- `/ux-expert` - UX Designer - User experience

**Domain Skills** (`/domain/`):
- `/security` - Security reviews, OWASP compliance, PII handling
- `/sre` - Observability, monitoring, production readiness
- `/devops` - CI/CD, GitHub Actions, deployment
- `/code-review` - Thorough code review with project conventions
- `/api-design` - tRPC router design and API patterns
- `/reflect` - Process captured learnings and update CLAUDE.md

### Self-Improving Loop
The project uses a learning capture system:
1. Corrections during sessions are detected and queued
2. Run `/reflect` to review and apply learnings to CLAUDE.md
3. Future sessions benefit from accumulated knowledge

Learnings are stored in `.claude/learnings.json` and hooks notify when pending learnings accumulate.

### Hooks Configuration

This project implements comprehensive guardrails using Claude Code hooks (see `.claude/HOOKS.md` for full documentation).

**Active Hooks in `.claude/settings.local.json`:**

**PreToolUse (Bash commands):**
- Block dangerous `rm -rf` with home/root paths
- Block `git push --force` to main/master branches
- Warn on production keywords (prod, production, DATABASE_URL)

**PreToolUse (File edits - Edit/Write):**
- Block modifications to `.env` files and credentials
- Block hardcoded secrets (API keys, tokens, passwords, AWS/GitHub tokens)
- Warn on test file modifications (anti-pattern reminders)
- Warn on critical file changes (schema.prisma, package.json, configs)

**PostToolUse:**
- Remind to run `/reflect` after git commits

**Stop (Session completion):**
- Verify tests were run if code was modified

**Quick Reference:** See `.claude/HOOKS-QUICKREF.md` for complete protection matrix.

**Installation:** These hooks are project-specific. For global terminal protection, see "Global Setup" section in `.claude/HOOKS.md`.

**Philosophy:** Hooks provide deterministic enforcement regardless of what Claude thinks it should do - far more reliable than prompt-based instructions alone.

## Observed Patterns & Preferences

### Code Conventions
- Always use `ctx.session.user.id` for user identification in tRPC routers
- Prefer `protectedProcedure` over manual auth checks
- Use Zod schemas for all tRPC input validation
- Delegate business logic to services, keep routers thin
- Use repository pattern for all database operations

### Testing Conventions
- Run `pnpm typecheck` before committing
- Test files go in `__tests__/` directory
- Use `describe/it` pattern for Jest tests
- Mock Prisma client for unit tests
- BDD scenarios must have corresponding test implementations

### Error Handling
- Log errors with context using `logger.error()`
- Use `TRPCError` with appropriate codes
- Never expose internal error details to clients
- Always include audit logging for security-sensitive operations

### Naming Conventions
- tRPC routers: `{entity}Router` (e.g., `providerRouter`)
- Repositories: `{Entity}Repository` (e.g., `ProviderRepository`)
- Services: `{Entity}Service` (e.g., `SubscriptionService`)
- Zod schemas: `{action}{Entity}Input` (e.g., `createProviderInput`)