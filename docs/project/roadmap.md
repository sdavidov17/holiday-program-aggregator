# Parent Pilot - Project Roadmap

## Overview
This document consolidates all project planning for the Parent Pilot platform (formerly Holiday Hero).

**Last Updated**: January 10, 2026

---

## Epic Structure

### Epic 0: Initial Setup (COMPLETED)
- **Issue**: #2
- **Stories**: #10 (completed)
- Pre-PRD infrastructure work

### Epic 1: Foundation, Provider Management & Subscriptions
- **Issue**: #99
- **Stories**: #92-98, #243 (PWA)
- Authentication, subscriptions, provider management, PWA
- **Status**: 71% complete (5/7 core stories done)

### Epic 2: Parent-Facing Search & Discovery
- **Issue**: #104
- **Stories**: #100-103
- Core search functionality for MVP
- **Status**: Not Started

### Epic 3: Proactive Suggestions & User Preferences
- **Issue**: #105
- **Stories**: #83-85
- Automated recommendations and preference center
- **Status**: Not Started

### Epic 4: Security, SRE & Observability
- **Issue**: #7
- **Stories**: #23-33, #89-91, #137-138, #147
- Monitoring, security hardening, test coverage
- **Status**: 33% complete (5/15 stories done)

### Epic 5: Provider Portal
- **Issue**: #37
- **Stories**: #38-42
- Self-service provider dashboard and management
- **Status**: Not Started

### Epic 6: Subscription & Payment Processing
- **Issue**: #9
- **Stories**: #44-47
- Payment flows, billing, invoicing
- **Status**: Partially implemented in Epic 1

### Epic 7: Communication Hub
- **Issue**: #48
- **Stories**: #49-52
- Messaging, notifications, reviews
- **Status**: Not Started

### Epic 8: Analytics & Business Intelligence
- **Issue**: #53
- **Stories**: #54-57
- Admin dashboards, provider metrics, user analytics
- **Status**: Not Started

### Epic 9: Mobile & Offline Support
- **Issue**: #58
- **Stories**: #59-61
- PWA implementation, offline caching
- **Status**: In Progress (PWA work started)

### Epic 10: Advanced Features & Integrations
- **Issue**: #62
- **Stories**: #63-66
- AI recommendations, calendar integration, social features
- **Status**: Not Started

### Epic 11: Native Mobile App
- **Issue**: #82, #237-242
- **Stories**: Expo setup, navigation, friend discovery, push notifications
- **Status**: Planned

---

## Agent System (Agentic Provider Discovery)

Autonomous provider research and onboarding system with human-in-the-loop approval.

| Issue | Phase | Description | Status |
|-------|-------|-------------|--------|
| #230 | 1.1 | Database Schema for Agent System | Open |
| #231 | 1.2 | PostgreSQL-Based Job Queue | Open |
| #232 | 1.3 | Cron Endpoint Infrastructure | Open |
| #233 | 1.4 | Environment Variables & Config | Open |
| #234 | Docs | Journey Maps & Workflow Diagrams | Open |
| #235 | 1.5 | Trigger.dev Setup & Feature Toggle | Open |
| #236 | 2.5 | Observability, Logging & Testing | Open |

**Documentation**:
- Architecture: `/docs/architecture/agent-system.md`
- Journey Maps: `/docs/architecture/agent-journey-map.md`

---

## Milestone Timeline

| Phase | Target | Epic Focus | Status |
|-------|--------|------------|--------|
| **Phase 1: Foundation** | Completed | Epic 0, Epic 1 (core) | 85% |
| **Phase 2: Security & Quality** | Q1 2026 | Epic 4 (priority stories) | 33% |
| **Phase 3: MVP Search** | Q1 2026 | Epic 2 (all stories) | Not Started |
| **Phase 4: Agent System** | Q2 2026 | Agent Phases 1.1-1.5 | Designed |
| **Phase 5: Growth Features** | Q2 2026 | Epic 3, Epic 7 | Not Started |
| **Phase 6: Mobile** | Q3 2026 | Epic 9, Epic 11 | PWA Started |

---

## Critical Path

```
Epic 0 ✅ → Epic 1 🔄 → Epic 4 (Security) → Epic 2 (MVP) → Agent System → Epic 3 → Epic 11
```

---

## Current Sprint Focus

### In Progress
1. **PWA Implementation** (#243) - Story 1.8
2. **Agent System Design** - Architecture documentation complete

### Next Up
1. Complete Epic 1 remaining stories (#97, #98)
2. Epic 4 priority: Test coverage (#147), Rate limiting (#8)
3. Begin Epic 2 for MVP search functionality

---

## Progress Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Completed Stories | ~12 | 50+ |
| Test Coverage | 30% | 80% |
| Epics Completed | 1 | 5 (MVP) |
| Agent Phases Done | 0 | 6 |

---

## Technical Stack

- Next.js 15.4.6 / React 19.1.1
- tRPC v11 / Prisma v6
- NextAuth v4
- TypeScript 5.9.2
- Tailwind CSS 3.4.17
- Biome 2.2.0

---

## Story Files

All story documentation in `docs/stories/`:
- `epic-0-story-*.md` (4 files) - Completed
- `epic-1-story-*.md` (7+ files) - In Progress
- `epic-2-story-*.md` (4 files) - Planned
- `epic-3-story-*.md` (3 files) - Planned
- `epic-4-story-*.md` (15+ files) - Partial

---

## Related Documents

- **Implementation Status**: `/docs/project/implementation-status.md`
- **Epic Story Structure**: `/docs/project/epic-story-structure.md`
- **Agent Architecture**: `/docs/architecture/agent-system.md`
- **PRD**: `/docs/reference/prd/`
