# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Reference

All project specifications are maintained in `/docs/`:

### Core Documentation
- **Quick Start**: `/docs/README.md` - Documentation hub with role-based navigation
- **Product Requirements**: `/docs/Specs/prd.md` - Complete PRD with functional/non-functional requirements
- **Project Roadmap**: `/docs/project-roadmap.md` - Timeline, milestones, and progress tracking
- **Implementation Status**: `/docs/implementation-status.md` - Current development status

### Technical Documentation
- **Architecture**: `/docs/Specs/architecture/` - System design, tech stack, data models
- **API Reference**: `/docs/api-reference.md` - Complete tRPC endpoint documentation
- **Developer Onboarding**: `/docs/developer-onboarding.md` - 30-minute quick start guide
- **Testing Strategy**: `/docs/testing-strategy.md` - Testing guidelines and patterns
- **Deployment Guide**: `/docs/deployment-guide.md` - Deployment procedures

### Process Documentation
- **Development Stories**: `/docs/stories/` - All epic stories with acceptance criteria
- **Team Guidelines**: `/docs/team-guidelines.md` - Communication and process guidelines
- **Branching Strategy**: `/docs/branching-strategy.md` - Git workflow

## Development Commands

Based on T3 Stack + Turborepo (see `/docs/Specs/architecture/tech-stack.md` for versions):

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

### Code Quality Standards
- Always run `pnpm lint && pnpm typecheck` before committing
- Ensure test coverage remains above 75%
- Follow repository pattern for database operations
- Use proper error handling with AppError classes
- Never commit sensitive information or debug endpoints

Refer to documentation in `/docs/` for all implementation details, requirements, and architectural decisions.