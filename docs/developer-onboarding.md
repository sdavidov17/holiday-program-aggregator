# Developer Onboarding Guide

## Welcome to Holiday Program Aggregator! 🚀

This guide will get you up and running with the codebase in 30 minutes.

## Prerequisites

- Node.js 20.18.2+ (use `nvm` for version management)
- pnpm 9.15.2+ (`npm install -g pnpm`)
- PostgreSQL 14+ with PostGIS extension
- Git configured with SSH keys
- VS Code or similar IDE

## Quick Start

### 1. Clone and Setup (5 min)

```bash
# Clone the repository
git clone [repository-url]
cd holiday-program-aggregator

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env

# Setup database
pnpm db:push
```

### 2. Environment Configuration (5 min)

Update `apps/web/.env` with:

```env
# Database (local development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/holiday_programs"

# NextAuth (development keys)
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (optional for dev)
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

### 3. Run Development Server (2 min)

```bash
# Start all services
pnpm dev

# Or specific services
pnpm dev:web    # Web app only (http://localhost:3000)
```

## Project Structure

```
holiday-program-aggregator/
├── apps/
│   └── web/                 # Next.js 15 application
│       ├── src/
│       │   ├── pages/      # Page routes
│       │   ├── server/     # tRPC & API logic
│       │   └── utils/      # Shared utilities
│       └── prisma/         # Database schema
├── packages/               # Shared packages
├── docs/                  # All documentation
│   ├── Specs/            # PRD & Architecture
│   └── stories/          # Development stories
└── turbo.json            # Turborepo config
```

## Development Workflow

### 1. Pick a Story

1. Check `/docs/implementation-status.md` for next priority
2. Review story file in `/docs/stories/`
3. Create feature branch: `git checkout -b epic-X-story-Y-description`

### 2. Development Commands

```bash
# Code quality (run before committing)
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm test          # Jest tests

# Database
pnpm db:studio     # Prisma Studio GUI
pnpm db:migrate    # Create migration
pnpm db:push       # Apply schema changes

# Build
pnpm build         # Production build
```

### 3. Testing

```bash
# Unit tests
pnpm test

# E2E tests (when implemented)
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### 4. Git Workflow

```bash
# Feature development
git checkout -b epic-1-story-2-user-auth
git add .
git commit -m "feat: implement user authentication with NextAuth"
git push -u origin epic-1-story-2-user-auth

# Create PR via GitHub CLI
gh pr create --title "Epic 1, Story 2: User Authentication" \
  --body "Implements NextAuth with Discord provider"
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_ctl status

# Start PostgreSQL (macOS)
brew services start postgresql@14

# Create database
createdb holiday_programs
```

### Type Errors After Dependencies Update

```bash
# Clear caches and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm typecheck
```

### Build Failures

```bash
# Clean build artifacts
rm -rf apps/web/.next
rm -rf apps/web/.turbo
pnpm build
```

## Tech Stack Reference

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.1
- **Database**: PostgreSQL + Prisma 6.1.0
- **API**: tRPC v11
- **Auth**: NextAuth v5 (beta)
- **Package Manager**: pnpm + Turborepo

## Key Concepts

### tRPC API Pattern

```typescript
// Server procedure (src/server/api/routers/example.ts)
export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}` };
    }),
});

// Client usage (src/pages/example.tsx)
const { data } = api.example.hello.useQuery({ name: "Developer" });
```

### Database Schema Updates

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:push` (development)
3. Run `pnpm db:migrate dev` (create migration)

### Authentication Check

```typescript
// Page-level auth
import { getServerAuthSession } from "~/server/auth";

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return { redirect: { destination: "/api/auth/signin" } };
  }
  return { props: {} };
}
```

## Getting Help

1. **Documentation**: Start with `/docs/Specs/` for architecture
2. **Stories**: Check `/docs/stories/` for implementation details
3. **Team**: Reach out in Slack #dev channel
4. **Issues**: Create GitHub issue with `question` label

## Next Steps

1. ✅ Complete this onboarding
2. 📖 Read `/docs/project-roadmap.md` for project overview
3. 🏗️ Pick your first "good first issue" from GitHub
4. 🤝 Introduce yourself to the team!

## Useful Links

- [Project Roadmap](/docs/project-roadmap.md)
- [Architecture Overview](/docs/Specs/architecture/high-level-architecture.md)
- [API Specification](/docs/Specs/architecture/api-specification.md)
- [Branching Strategy](/docs/branching-strategy.md)

Welcome aboard! 🎉