# 📚 Holiday Program Aggregator Documentation

Welcome to the Holiday Program Aggregator documentation. This hub provides easy navigation to all project documentation based on your role and needs.

## 🚀 Quick Start by Role

### For Developers
- **[Developer Onboarding](./guides/developer-onboarding.md)** - Get started in 30 minutes
- **[Local Setup Guide](./guides/local-setup.md)** - Development environment setup
- **[Architecture Overview](./architecture/)** - System design and tech stack
- **[API Documentation](./api/)** - API reference and examples
- **[Development Stories](./stories/)** - User stories and acceptance criteria

### For DevOps/SRE
- **[Deployment Guide](./guides/deployment.md)** - Deployment procedures
- **[Runbooks](./runbooks/)** - Operational procedures
- **[Database Setup](./guides/database-postgresql-setup.md)** - PostgreSQL configuration
- **[Monitoring & Alerts](./runbooks/monitoring-alerts.md)** - Observability setup

### For Product/Business
- **[Product Requirements](./reference/prd/)** - Complete PRD documentation
- **[Project Roadmap](./project/roadmap.md)** - Timeline and milestones
- **[Implementation Status](./project/implementation-status.md)** - Current progress
- **[UX Design Guide](./reference/ux-design/)** - Design specifications

### For Project Management
- **[Project Overview](./project/)** - Project management documentation
- **[Epic Mapping](./project/epic-mapping.md)** - Epic to story relationships
- **[Team Guidelines](./project/team-guidelines.md)** - Team processes
- **[GitHub Issues](https://github.com/sdavidov17/holiday-program-aggregator/issues)** - Active work items

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

## 📁 Documentation Structure

```
docs/
├── architecture/        # System design & technical architecture
├── api/                # API documentation and references
├── guides/             # How-to guides and tutorials
├── runbooks/           # Operational procedures
├── reference/          # Business docs (PRD, UX, BMAD artifacts)
├── stories/            # Development stories and epics
├── project/            # Project management and planning
└── legacy/             # Archived documentation
```

## 🔍 Find What You Need

### Technical Documentation
- **[Architecture](./architecture/)** - System design, tech stack, data models
- **[API Reference](./api/api-reference.md)** - Endpoint documentation
- **[Testing Strategy](./guides/testing-strategy.md)** - Testing approach
- **[Database Schema](./architecture/data-models.md)** - Data structure

### Process Documentation
- **[Branching Strategy](./project/branching-strategy.md)** - Git workflow
- **[Deployment Process](./guides/deployment.md)** - Release procedures
- **[Incident Response](./runbooks/incident-response.md)** - Incident handling

### Business Documentation
- **[Product Brief](./reference/product-brief.md)** - Executive summary
- **[PRD](./reference/prd/)** - Detailed requirements
- **[Epic List](./reference/prd/05-epic-list.md)** - All epics

## 🎯 Current Focus

### Active Development
Check the [Implementation Status](./project/implementation-status.md) for current sprint work.

### Critical Issues
View [High Priority Issues](https://github.com/sdavidov17/holiday-program-aggregator/issues?q=is%3Aopen+label%3A%22priority%3A+critical%22) on GitHub.

### Upcoming Milestones
See the [Project Roadmap](./project/roadmap.md) for upcoming releases.

## 🛠️ Getting Started

### For New Team Members
1. Read [Team Guidelines](./project/team-guidelines.md)
2. Complete [Developer Onboarding](./guides/developer-onboarding.md)
3. Review [Project Roadmap](./project/roadmap.md)
4. Check [Implementation Status](./project/implementation-status.md)

### For Daily Work
1. Find your story in [Epic Mapping](./project/epic-mapping.md)
2. Read the detailed story file in `stories/`
3. Follow [Branching Strategy](./project/branching-strategy.md)
4. Use [API Reference](./api/api-reference.md) for endpoints
5. Follow [Testing Strategy](./guides/testing-strategy.md)

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

## 🔗 Important Links

### External Resources
- **GitHub**: [Repository](https://github.com/sdavidov17/holiday-program-aggregator)
- **Vercel Dashboard**: [Deployments](https://vercel.com/dashboard)
- **Neon Database**: [Console](https://console.neon.tech)

### Internal Tools
- **Prisma Studio**: http://localhost:5555 (local only)
- **API Playground**: http://localhost:3000/api/trpc-playground (local only)

## 📖 Documentation Standards

### Contributing to Docs
- Use Markdown for all documentation
- Include a table of contents for long documents
- Add code examples where relevant
- Keep documentation up to date with code changes
- Link related documents for easy navigation

### Documentation Review
All documentation changes should be reviewed for:
- Technical accuracy
- Clarity and completeness
- Proper formatting
- Updated cross-references

## 🆘 Need Help?

- **Technical Issues**: Check [Troubleshooting Guide](./guides/troubleshooting.md)
- **Process Questions**: See [Team Guidelines](./project/team-guidelines.md)
- **Urgent Issues**: Follow [Incident Response](./runbooks/incident-response.md)

---

*Last Updated: August 2025*
*Version: 2.0.0*
*Maintained By: Development Team*