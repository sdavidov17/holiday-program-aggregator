# Holiday Program Aggregator Documentation

Welcome to the Holiday Program Aggregator documentation. This guide helps different team members find the information they need quickly.

## Quick Links by Role

### 🎯 Product Managers
- [Product Requirements](./Specs/prd.md) - Complete PRD with all requirements
- [Product Brief](./Specs/product-brief.md) - Executive summary
- [Project Roadmap](./project-roadmap.md) - Timeline and milestones
- [Implementation Status](./implementation-status.md) - Current progress

### 🏃 Scrum Masters
- [Epic Story Structure](./epic-story-structure.md) - All stories organized by epic
- [Team Guidelines](./team-guidelines.md) - Process and communication
- [Branching Strategy](./branching-strategy.md) - Git workflow
- [Stories Folder](./stories/) - Individual story details

### 💻 Developers
- [Developer Onboarding](./developer-onboarding.md) - **START HERE** for new devs
- [Architecture Overview](./Specs/architecture/high-level-architecture.md) - System design
- [API Reference](./api-reference.md) - tRPC API documentation
- [Testing Strategy](./testing-strategy.md) - Test guidelines
- [Deployment Guide](./deployment-guide.md) - Deploy procedures

### 🎨 Designers
- [UI Design Goals](./Specs/prd/03-user-interface-design-goals.md) - Design principles
- [Front-end Spec](./Specs/front-end-spec.md) - Component specifications

## Project Overview

**Holiday Program Aggregator** is a platform connecting Sydney parents with verified holiday programs for their children.

### Key Features
- 🔍 Location-based search with filters
- 🗺️ Interactive map view
- 💳 Subscription management (Free/Premium/Family)
- 📧 Proactive email suggestions
- ✅ Verified provider system

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: tRPC v11, Prisma, PostgreSQL
- **Auth**: NextAuth v5
- **Hosting**: Vercel (Sydney region)

## Documentation Structure

```
docs/
├── README.md                    # This file
├── project-roadmap.md          # Master timeline
├── implementation-status.md    # Progress tracking
├── epic-story-structure.md     # Story mapping
│
├── Onboarding & Guidelines/
│   ├── developer-onboarding.md
│   ├── team-guidelines.md
│   └── branching-strategy.md
│
├── Technical Docs/
│   ├── api-reference.md
│   ├── testing-strategy.md
│   └── deployment-guide.md
│
├── Specs/
│   ├── prd.md                  # Product requirements
│   ├── architecture/           # Technical architecture
│   └── prd/                    # Detailed PRD sections
│
└── stories/                    # All 33 story files
    ├── epic-0-story-*.md      # Completed setup
    ├── epic-1-story-*.md      # Foundation
    ├── epic-2-story-*.md      # Search & Discovery
    ├── epic-3-story-*.md      # Suggestions
    └── epic-4-story-*.md      # Security & SRE
```

## Current Status (August 2025)

- **Completed**: Epic 0 (Initial Setup) ✅
- **Next Up**: Epic 1, Story 1 - Initial Project Setup
- **Target MVP**: October 31, 2025

## Getting Started

### For New Team Members
1. Read [Team Guidelines](./team-guidelines.md)
2. Complete [Developer Onboarding](./developer-onboarding.md)
3. Review [Project Roadmap](./project-roadmap.md)
4. Check [Implementation Status](./implementation-status.md)

### For Daily Work
1. Find your story in [Epic Story Structure](./epic-story-structure.md)
2. Read the detailed story file in `stories/`
3. Follow [Branching Strategy](./branching-strategy.md)
4. Use [API Reference](./api-reference.md) for endpoints
5. Follow [Testing Strategy](./testing-strategy.md)

## Key Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm test            # Run tests
pnpm lint            # Check code quality

# Database
pnpm db:push         # Update schema
pnpm db:studio       # View database

# Deployment
vercel              # Deploy preview
vercel --prod       # Deploy production
```

## Important Links

- **GitHub**: [Repository](#) (update with actual link)
- **Staging**: https://staging-holidayprograms.com.au
- **Production**: https://holidayprograms.com.au
- **Figma**: [Design System](#) (update with actual link)

## Communication

- **Slack**: #holiday-program-dev
- **Issues**: Use GitHub Issues
- **PRs**: Follow PR template
- **Urgent**: Use #urgent channel

## Need Help?

1. Check relevant documentation above
2. Ask in Slack #dev channel
3. Create GitHub issue with `question` label
4. Schedule pairing session with team member

---

**Last Updated**: August 2, 2025  
**Maintained By**: Development Team