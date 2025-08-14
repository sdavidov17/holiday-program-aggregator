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

Based on T3 Stack + Turborepo (see `/docs/architecture/tech-stack.md` for versions):

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

# Monorepo
pnpm dev:web          # Web app only
pnpm build:web        # Build web app only
```

## Project Structure

- **Monorepo**: Turborepo with `/apps/web` (Next.js) and `/packages` (shared code)
- **Architecture**: Serverless on Vercel, PostgreSQL with PostGIS, Sydney region
- **Key Features**: Provider vetting, geospatial search, subscription management, automated suggestions

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
- Ensure test coverage remains above 80% (previously 75%, now updated)
- Follow repository pattern for database operations
- Use proper error handling with AppError classes
- Never commit sensitive information or debug endpoints
- Write tests FIRST or alongside code (TDD/BDD approach)

Refer to documentation in `/docs/` for all implementation details, requirements, and architectural decisions.