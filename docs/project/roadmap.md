# Parent Pilot - Project Roadmap

## Overview
This document consolidates all project planning for the Parent Pilot platform (formerly Holiday Hero).

**Last Updated**: January 10, 2026

---

## MVP Definition

**MVP Goal**: Enable paying subscribers to search and discover vetted holiday programs.

| Priority | Epic | Status | Required for MVP |
|----------|------|--------|------------------|
| P0 | Epic 1: Foundation & Subscriptions | 85% | Yes (core done) |
| P0 | Epic 2: Search & Discovery | Not Started | **Yes - Core MVP** |
| P0 | Epic 4: Security (priority stories) | 33% | Yes (subset) |
| P1 | Epic 5: Agentic Provider Discovery | Designed | No - Post-MVP |
| P1 | Epic 3: Proactive Suggestions | Not Started | No |
| P2 | Epic 6-9: Growth Features | Not Started | No |
| P2 | Epic 11: Native Mobile App | Not Started | No |

---

## Epic Structure

### Epic 0: Initial Setup (COMPLETED)
- **Issue**: #2
- **Status**: ✅ Complete

### Epic 1: Foundation & Subscriptions (85% Complete)
- **Issue**: #99
- **Stories**:
  - [x] 1.1: Initial Project & CI/CD Setup (#92)
  - [x] 1.2: User Account System (#93)
  - [x] 1.3: Subscription & Payment Integration (#94)
  - [x] 1.4: Subscription Lifecycle Management (#95)
  - [x] 1.5: Manual Provider Onboarding Tool (#96)
  - [x] 1.8: Progressive Web App (PWA) Configuration (#243)
- **Deferred to Epic 5**:
  - Story 1.6: Crawler-Assisted Data Entry (#97) → Merged into Epic 5
  - Story 1.7: Automated Data Refresh (#98) → Merged into Epic 5

> **Note**: Stories 1.6-1.7 require the same infrastructure as Epic 5 (job queues, AI integration). They are now part of the Agentic Provider Discovery epic.

### Epic 2: Search & Discovery (MVP Priority)
- **Issue**: #104
- **Stories**:
  - [ ] 2.1: Search & Filter Interface (#100)
  - [ ] 2.2: Display Program Search Results (#101)
  - [ ] 2.3: Interactive Map View (#102)
  - [ ] 2.4: Detailed Provider Profile Page (#103)
- **Status**: Not Started - **NEXT PRIORITY**

### Epic 3: Proactive Suggestions
- **Issue**: #105
- **Stories**: #83-85
- **Status**: Not Started (P1)

### Epic 4: Security & Observability
- **Issue**: #7
- **Priority Stories for MVP**:
  - [ ] 4.1: Security Headers & CSP (#23)
  - [ ] 4.4: Critical Journey Monitoring (#26)
  - [ ] Rate Limiting (#8)
- **Full Stories**: #23-33, #89-91, #137-138, #147
- **Status**: 33% complete

### Epic 5: Agentic Provider Discovery
- **Issue**: #82 (Epic 11 legacy) - needs new epic issue
- **Infrastructure Issues**: #230-236
- **Stories**:
  - [ ] 5.1: Research Agent Infrastructure
  - [ ] 5.2: Google Places & Web Discovery
  - [ ] 5.3: Provider Lead Queue
  - [ ] 5.4: Transparent Outreach Workflow
  - [ ] 5.5: Term Confirmation System
- **Includes**: Former Stories 1.6-1.7 functionality
- **Status**: Designed, Not Started (P1)

### Epic 6-10: Growth & Expansion
- Provider Portal, Smart Profiles, Reviews, Communities, Sports
- **Status**: Not Started (P1-P3)

### Epic 11: Native Mobile App
- **Issues**: #237-242
- **Status**: Planned (P2)
- **Prerequisite**: PWA (Story 1.8) ✅ provides interim mobile support

---

## Critical Path

```
Epic 1 ✅ → Epic 2 (Search) → Epic 4 (Security) → Epic 5 (Agent) → Epic 3 → Epic 11
    │           │                   │
    │           │                   └── Run in parallel where possible
    │           └── MVP LAUNCH GATE
    └── Foundation complete (85%)
```

---

## Current Sprint Focus

### Completed This Sprint
- [x] Story 1.8: PWA Implementation (#243)

### Next Sprint Priority
1. **Epic 2 - Story 2.1**: Search & Filter Interface (#100)
2. **Epic 2 - Story 2.2**: Display Search Results (#101)
3. **Epic 4 - Security Headers**: (#23) - can run in parallel

### Backlog (Post-MVP)
- Epic 5: Agent System (#230-236)
- Epic 3: Proactive Suggestions
- Epic 6+: Growth features

---

## Milestone Timeline

| Milestone | Epics | Key Deliverable |
|-----------|-------|-----------------|
| **MVP Launch** | 1, 2, 4 (subset) | Parents can search & subscribe |
| **Agent System** | 5 | Automated provider discovery |
| **Engagement** | 3, 6, 7 | Proactive emails, provider portal |
| **Community** | 8, 9, 11 | Reviews, groups, native app |
| **Expansion** | 10 | Year-round activities |

---

## Story-to-Issue Mapping

### Epic 1 (Foundation)
| Story | Issue | Status |
|-------|-------|--------|
| 1.1 Initial Setup | #92 | ✅ Closed |
| 1.2 User Accounts | #93 | ✅ Closed |
| 1.3 Subscription Payment | #94 | ✅ Closed |
| 1.4 Subscription Lifecycle | #95 | ✅ Closed |
| 1.5 Manual Provider Onboarding | #96 | ✅ Closed |
| 1.6 Crawler-Assisted Entry | #97 | ⏸️ Deferred to Epic 5 |
| 1.7 Automated Data Refresh | #98 | ⏸️ Deferred to Epic 5 |
| 1.8 PWA Configuration | #243 | ✅ Closed |

### Epic 2 (Search - MVP)
| Story | Issue | Status |
|-------|-------|--------|
| 2.1 Search & Filter | #100 | 🔜 Next |
| 2.2 Search Results | #101 | Open |
| 2.3 Map View | #102 | Open |
| 2.4 Provider Profile | #103 | Open |

### Epic 5 (Agent System)
| Phase | Issue | Status |
|-------|-------|--------|
| 1.1 Database Schema | #230 | Open |
| 1.2 Job Queue | #231 | Open |
| 1.3 Cron Infrastructure | #232 | Open |
| 1.4 Environment Config | #233 | Open |
| 1.5 Trigger.dev Setup | #235 | Open |
| 2.5 Observability | #236 | Open |
| Docs: Journey Maps | #234 | Open |

---

## Technical Stack

- Next.js 16.1.1 / React 19.2.3
- tRPC v11 / Prisma v7
- NextAuth v4
- TypeScript 5.9.3
- Tailwind CSS 4.x
- Biome 2.x
- PWA via next-pwa

---

## Related Documents

- **PRD**: `/docs/reference/prd.md`
- **Implementation Status**: `/docs/project/implementation-status.md`
- **Agent Architecture**: `/docs/architecture/agent-system.md`
- **Agent Journey Maps**: `/docs/architecture/agent-journey-map.md`
