# Parent Pilot - Project Roadmap

## Overview
This document consolidates all project planning for the Parent Pilot platform (formerly Holiday Hero).

**Last Updated**: January 16, 2026

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
| P2 | Epic 12: Direct Booking & Payments | Not Started | No |
| Cont | Epic UI: Design System | In Progress | No (parallel) |

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

### Epic 12: Direct Booking & Payments (NEW)
- **Issue**: TBD
- **Stories**:
  - [ ] 12.1: Provider Availability Calendar
  - [ ] 12.2: Real-Time Availability Display
  - [ ] 12.3: Booking Flow UI
  - [ ] 12.4: Booking Payment Integration
  - [ ] 12.5: Parent Booking Management
  - [ ] 12.6: Provider Booking Dashboard
  - [ ] 12.7: Booking Notifications
  - [ ] 12.8: Booking Analytics
- **Status**: Not Started (P2)
- **Prerequisites**: Epic 6 (Provider Dashboard)

### Epic UI: Design System & UI Polish (Continuous)
- **Issue**: TBD
- **Stories**:
  - [ ] UI.1: Glassmorphism Component Library
  - [ ] UI.2: Gradient System Enhancement
  - [ ] UI.3: Animation Library (Framer Motion)
  - [ ] UI.4: Component Consistency Audit
  - [ ] UI.5: Dark Mode Support
  - [ ] UI.6: Micro-interactions
  - [ ] UI.7: Responsive Polish
  - [ ] UI.8: Accessibility Audit
- **Status**: In Progress (Akiflow-inspired refresh underway)
- **Note**: Runs in parallel with all other work

---

## Critical Path

```
Epic 1 ✅ → Epic 2 (Search) → Epic 4 (Security) → MVP LAUNCH
                                                      │
    ┌─────────────────────────────────────────────────┤
    │                                                 │
    ▼                                                 ▼
Epic 5 (Agent) ──────────────────────────► Epic 6 (Provider Portal)
    │                                                 │
    ▼                                                 ▼
Epic 3 (Proactive) ──────────────────────► Epic 12 (Booking)
    │                                                 │
    ▼                                                 │
Epic 8 (Reviews) ◄────────────────────────────────────┘
    │
    ▼
Epic 9 (Communities) ──► Epic 11 (Native) ──► Epic 10 (Sports)

Epic UI (Design) ─────── Parallel to ALL ──────
```

**Phase Summary:**
- **P0 MVP**: Epics 1, 2, 4 (subset)
- **P1 V1.0**: Epics 5, 3, 6, 7
- **P2 V2.0**: Epics 8, 9 (partial), 11
- **P2 V2.5**: Epics 12, 9 (advanced)
- **P3 V3.0**: Epic 10
- **Continuous**: Epic UI

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

| Milestone | Version | Epics | Target | Key Deliverable |
|-----------|---------|-------|--------|-----------------|
| **MVP Launch** | 1.0 | 1, 2, 4 (subset) | Q1 2026 | Parents can search & subscribe |
| **Agent System** | 1.1 | 5 | Q2 2026 | Automated provider discovery |
| **Growth Platform** | 1.2 | 3, 6, 7 | Q2 2026 | Proactive emails, provider portal |
| **Social Proof** | 2.0 | 8, 9 (partial), 11 | Q3-Q4 2026 | Reviews, social basics, native app |
| **Direct Booking** | 2.5 | 12, 9 (advanced) | Q1 2027 | In-platform booking & payments |
| **Expansion** | 3.0 | 10 | 2027+ | Year-round activities |
| **Design System** | - | UI | Ongoing | Premium UI polish (continuous) |

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

### Epic 8 (Reviews) - NEW
| Story | Issue | Status |
|-------|-------|--------|
| 8.1 Review Submission | TBD | Planned |
| 8.2 Review Display & Moderation | TBD | Planned |
| 8.3 Post-Program Review Prompts | TBD | Planned |
| 8.4 Provider Review Response | TBD | Planned |
| 8.5 Review Verification Badge | TBD | Planned |

### Epic 9 (Communities) - NEW
| Story | Issue | Status |
|-------|-------|--------|
| 9.1 Contact-Based Friend Discovery | TBD | Planned |
| 9.2 Friend Connections | TBD | Planned |
| 9.3 Parent Groups | TBD | Planned |
| 9.4 AI Group Planning | TBD | Planned |
| 9.5 Activity Sharing | TBD | Planned |
| 9.6 Group Messaging | TBD | Planned |

### Epic 12 (Direct Booking) - NEW
| Story | Issue | Status |
|-------|-------|--------|
| 12.1 Provider Availability Calendar | TBD | Planned |
| 12.2 Real-Time Availability Display | TBD | Planned |
| 12.3 Booking Flow UI | TBD | Planned |
| 12.4 Booking Payment Integration | TBD | Planned |
| 12.5 Parent Booking Management | TBD | Planned |
| 12.6 Provider Booking Dashboard | TBD | Planned |
| 12.7 Booking Notifications | TBD | Planned |
| 12.8 Booking Analytics | TBD | Planned |

### Epic UI (Design System) - NEW
| Story | Issue | Status |
|-------|-------|--------|
| UI.1 Glassmorphism Component Library | TBD | Planned |
| UI.2 Gradient System Enhancement | TBD | Planned |
| UI.3 Animation Library | TBD | Planned |
| UI.4 Component Consistency Audit | TBD | Planned |
| UI.5 Dark Mode Support | TBD | Planned |
| UI.6 Micro-interactions | TBD | Planned |
| UI.7 Responsive Polish | TBD | Planned |
| UI.8 Accessibility Audit | TBD | Planned |

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
