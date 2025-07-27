# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Reference

All project specifications are maintained in `/docs/`:

- **Product Requirements**: `/docs/Specs/prd.md` - Complete PRD with functional/non-functional requirements
- **Architecture**: `/docs/Specs/architecture/` - High-level architecture, tech stack, data models, API specs
- **Development Stories**: `/docs/stories/` - Epic breakdowns with acceptance criteria and tasks

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

Refer to documentation in `/docs/` for all implementation details, requirements, and architectural decisions.