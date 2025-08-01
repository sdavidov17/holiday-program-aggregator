# Epic Mapping: PRD vs GitHub Issues

## Current State Analysis

There's a discrepancy between the epic structure in the PRD and the GitHub Issues. Here's the mapping:

### PRD Epic Structure (from docs/Specs/prd/)
1. **Epic 1**: Foundation - Provider Management & Subscriptions (Hybrid Approach)
2. **Epic 2**: Parent-Facing Search & Discovery
3. **Epic 3**: Proactive Suggestions & User Preferences
4. **Epic 4**: Security, SRE & Observability

### GitHub Issues Epic Structure
1. **Epic 1**: Initial Project Setup & Infrastructure (Issue #2) ✅
2. **Epic 2**: Provider Management System (Issue #3)
3. **Epic 3**: Search & Discovery (Issue #6)
4. **Epic 4**: Security, SRE & Observability (Issue #7)
5. **Epic 5**: Provider Portal & Self-Service (Issue #9)
6. **Epic 6**: Subscription & Payment Processing (Issue #9)
7. **Epic 7**: Communication Hub (Issue #48)
8. **Epic 8**: Analytics & Business Intelligence (Issue #53)
9. **Epic 9**: Mobile & Offline Support (Issue #58)
10. **Epic 10**: Advanced Features & Integrations (Issue #62)

## Key Differences

1. **Epic 1 Scope**: 
   - PRD: Includes provider management, user accounts, and subscriptions
   - GitHub: Only initial setup and infrastructure (already completed)

2. **Provider Management**:
   - PRD: Part of Epic 1
   - GitHub: Separate Epic 2

3. **Search & Discovery**:
   - PRD: Epic 2
   - GitHub: Epic 3

4. **Suggestions & Preferences**:
   - PRD: Epic 3
   - GitHub: Not explicitly an epic (might be part of Epic 3 or Epic 10)

5. **Additional Epics in GitHub**:
   - Epic 5: Provider Portal (not in original PRD)
   - Epic 6: Subscription & Payment (was part of Epic 1 in PRD)
   - Epic 7-10: Advanced features beyond MVP

## Stories Created vs GitHub Issues

### Epic 2 (PRD) / Epic 3 (GitHub) - Search & Discovery
Stories created in `/docs/stories/`:
- epic-2-story-1-search-filter-interface.md → Should map to GitHub Story 3.x
- epic-2-story-2-display-search-results.md → Should map to GitHub Story 3.x
- epic-2-story-3-interactive-map-view.md → Should map to GitHub Story 3.x
- epic-2-story-4-provider-profile-page.md → Should map to GitHub Story 3.x

GitHub Stories (Issue #17-22):
- Story 3.1: Basic Search Implementation
- Story 3.2: Geospatial Search with PostGIS
- Story 3.3: Advanced Filter System
- Story 3.4: Search Results UI & Map View
- Story 3.5: Saved Searches & Alerts
- Story 3.6: Search Analytics & Optimization

### Epic 3 (PRD) - Proactive Suggestions
Stories created in `/docs/stories/`:
- epic-3-story-1-user-preference-center.md
- epic-3-story-2-proactive-email-generation.md
- epic-3-story-3-email-delivery-scheduling.md

No corresponding GitHub issues found - these might need to be created as part of Epic 10 (Advanced Features) or a new epic.

## Recommendations

1. **Align Documentation**: Update either the PRD or GitHub issues to have consistent epic numbering
2. **Create Missing Issues**: The proactive suggestions stories need GitHub issues
3. **Update Milestones**: Ensure milestones reflect the actual implementation order
4. **Story Mapping**: Map PRD stories to appropriate GitHub epic numbers