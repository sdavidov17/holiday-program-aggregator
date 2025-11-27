# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference (Actual Stack Versions)

> **IMPORTANT**: Keep these versions synchronized with actual package.json

| Package | Actual Version | Notes |
|---------|---------------|-------|
| Next.js | 15.4.6 | App Router + Pages Router |
| React | 19.1.1 | Latest stable |
| Prisma | 6.13.0 | PostgreSQL ORM |
| NextAuth | 4.24.11 | NOT v5 - uses JWT sessions |
| tRPC | 11.4.4 | Type-safe API layer |
| Jest | 30.0.5 | NOT Vitest |
| Playwright | 1.54.2 | E2E testing |
| Biome | 1.9.4 | Linting + formatting |

## Critical Path Warnings

| Feature | Status | Notes |
|---------|--------|-------|
| PostGIS geospatial search | IMPLEMENTED | Schema + repository + router endpoints ready |
| Web Crawler system | NOT IMPLEMENTED | FR2/FR3 not built |
| Email suggestions | NOT IMPLEMENTED | Proactive suggestion system missing |
| Test coverage | 23% ACTUAL | Target is 80% - critical gap |
| OpenTelemetry | NOT CONFIGURED | Observability stack incomplete |

## BMAD Agent Commands

Access specialized AI team members via slash commands:

| Command | Agent | Role |
|---------|-------|------|
| `/bmad-orchestrator` | BMad Orchestrator | Master coordinator, workflow guidance |
| `/dev` | James | Full Stack Developer |
| `/qa` | QA Engineer | Quality Assurance |
| `/pm` | Product Manager | Product planning |
| `/architect` | System Architect | Architecture decisions |
| `/analyst` | Business Analyst | Requirements analysis |
| `/po` | Product Owner | Backlog management |
| `/sm` | Scrum Master | Process facilitation |
| `/ux-expert` | UX Designer | User experience |
| `/devops` | Morgan | DevOps/SRE Engineer |
| `/security` | Alex | Application Security |

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
  - Product Requirements Document (complete PRD)
  - Product brief and business case
  - UX design specifications

### Project Management
- **Project**: `/docs/project/` - Planning and process documentation
  - Roadmap and milestones
  - Implementation status
  - Team guidelines and branching strategy

### Operations
- **Runbooks**: `/docs/runbooks/` - Operational procedures
  - Incident response
  - Deployment checklist
  - Rollback procedures

### Development
- **Stories**: `/docs/stories/` - All epic stories with acceptance criteria

## Development Commands

Based on T3 Stack + Turborepo:

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint && pnpm typecheck  # Code quality checks

# Database (Prisma)
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run Jest tests
pnpm test:coverage    # Generate coverage report
pnpm test:ci          # CI mode with reporters
pnpm test:e2e         # Run Playwright E2E tests

# Monorepo
pnpm dev:web          # Web app only
pnpm build:web        # Build web app only
```

## Project Structure

```
/holiday-program-aggregator/
├── /apps/web/                 # Next.js application
│   ├── /src/
│   │   ├── /pages/           # Next.js pages
│   │   ├── /server/          # tRPC API, auth, db
│   │   ├── /repositories/    # Data access layer
│   │   ├── /services/        # Business logic
│   │   ├── /components/      # React components
│   │   ├── /hooks/           # Custom React hooks
│   │   ├── /utils/           # Utilities
│   │   ├── /lib/             # Shared libs (rate-limiter, monitoring)
│   │   └── /__tests__/       # Test files
│   └── /prisma/              # Database schema
├── /docs/                     # All documentation (101 files)
├── /.claude/commands/BMad/   # BMAD agent definitions
└── /.github/workflows/       # CI/CD pipelines
```

## Key File Locations

| Purpose | Location |
|---------|----------|
| tRPC procedures | `apps/web/src/server/api/trpc.ts` |
| API routers | `apps/web/src/server/api/routers/` |
| Authentication | `apps/web/src/server/auth.ts` |
| Security middleware | `apps/web/src/middleware.ts` |
| Rate limiting | `apps/web/src/lib/rate-limiter.ts` |
| Database schema | `apps/web/prisma/schema.prisma` |
| Environment validation | `apps/web/src/env.mjs` |
| Test factories | `apps/web/src/__tests__/factories/` |
| Security tests | `apps/web/src/__tests__/security/` |

## Development Rules

### Pre-Commit Checklist
Before every commit, run:
```bash
pnpm lint && pnpm typecheck && pnpm test
```

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
- Ensure test coverage remains above 80% (current: 23% - needs improvement)
- Follow repository pattern for database operations
- Use proper error handling with AppError classes
- Never commit sensitive information or debug endpoints
- Write tests FIRST or alongside code (TDD/BDD approach)

### Security Standards
- All user input must be validated with Zod schemas
- Use parameterized queries (Prisma handles this)
- Never log PII or sensitive data
- All secrets must be in environment variables
- Review OWASP Top 10 for any auth/input changes
- Rate limiting required on auth endpoints

## Common Troubleshooting

### Prisma Issues
```bash
# Reset database
pnpm db:push --force-reset

# Generate client after schema changes
npx prisma generate
```

### Test Issues
```bash
# Clear Jest cache
pnpm test --clearCache

# Run specific test file
pnpm test -- path/to/test.ts
```

### Type Errors
```bash
# Regenerate types
npx prisma generate
pnpm typecheck
```

## Architecture Patterns

- **Repository Pattern**: All database operations go through repositories (`/repositories/`)
- **Service Layer**: Business logic in services (`/services/`)
- **tRPC Procedures**: API layer with progressive auth (public → protected → admin → premium)
- **Middleware Chain**: Logging → Auth → Rate Limiting → Business Logic

Refer to documentation in `/docs/` for all implementation details, requirements, and architectural decisions.
