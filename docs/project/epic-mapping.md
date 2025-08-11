# Epic Mapping: PRD vs GitHub Issues

## Current State (Updated: August 2, 2025)

After reorganization, we now have a clear epic structure that aligns the PRD with GitHub Issues.

### Final Epic Structure

#### Epic 0: Initial Project Setup & Infrastructure ✅
- **GitHub Issue**: #2 (renamed from Epic 1)
- **Status**: COMPLETED
- **Stories**: 0.1-0.4 (Issues #10-13)
- **Note**: Pre-PRD work completed before formal planning

#### Epic 1: Foundation, Provider Management & Subscriptions
- **GitHub Issue**: #99
- **PRD**: `docs/Specs/prd/06-epic-1-foundation-provider-management-subscriptions-hybrid-approach.md`
- **Stories**: 1.1-1.7 (Issues #92-98)
- **Milestone**: Phase 1: Foundation

#### Epic 2: Parent-Facing Search & Discovery
- **GitHub Issue**: #104
- **PRD**: `docs/Specs/prd/07-epic-2-parent-facing-search-discovery.md`
- **Stories**: 2.1-2.4 (Issues #100-103)
- **Milestone**: MVP Launch

#### Epic 3: Proactive Suggestions & User Preferences
- **GitHub Issue**: #105
- **PRD**: `docs/Specs/prd/08-epic-3-proactive-suggestions-user-preferences.md`
- **Stories**: 3.1-3.3 (Issues #83-85)
- **Milestone**: Phase 4: Growth Features

#### Epic 4: Security, SRE & Observability
- **GitHub Issue**: #7
- **PRD**: `docs/Specs/prd/09-epic-4-security-sre-observability.md`
- **Stories**: 4.1-4.15 (Various issues)
- **Milestone**: Phase 2 & 3

### Additional GitHub Epics (Future Work)

These epics exist in GitHub but are not yet defined in the PRD:

5. **Epic 5**: Provider Portal & Self-Service (Issue #37)
6. **Epic 6**: Subscription & Payment Processing (Issue #9) - Note: Partially covered in Epic 1
7. **Epic 7**: Communication Hub (Issue #48)
8. **Epic 8**: Analytics & Business Intelligence (Issue #53)
9. **Epic 9**: Mobile & Offline Support (Issue #58)
10. **Epic 10**: Advanced Features & Integrations (Issue #62)
11. **Epic 11**: Proactive Suggestions (Issue #82) - Duplicate of Epic 3

## Story Mapping

### Complete Story List by Epic

#### Epic 0 (Completed):
- Story 0.1: Repository Setup → Issue #10 ✅
- Story 0.2: CI/CD Pipeline → Issue #11 ✅
- Story 0.3: Database Schema → Issue #12 ✅
- Story 0.4: Deployment Infrastructure → Issue #13 ✅

#### Epic 1:
- Story 1.1: Initial Project & CI/CD Setup → Issue #92
- Story 1.2: User Account System → Issue #93
- Story 1.3: Subscription & Payment Integration → Issue #94
- Story 1.4: Subscription Lifecycle Management → Issue #95
- Story 1.5: Manual Provider Onboarding → Issue #96
- Story 1.6: Crawler-Assisted Data Entry → Issue #97
- Story 1.7: Automated Data Refresh → Issue #98

#### Epic 2:
- Story 2.1: Search & Filter Interface → Issue #100
- Story 2.2: Display Search Results → Issue #101
- Story 2.3: Interactive Map View → Issue #102
- Story 2.4: Provider Profile Page → Issue #103

#### Epic 3:
- Story 3.1: User Preference Center → Issue #83
- Story 3.2: Proactive Email Generation → Issue #84
- Story 3.3: Email Delivery & Scheduling → Issue #85

#### Epic 4:
- Story 4.1-4.15: See `docs/epic-story-structure.md` for full list

## Cleanup Actions Completed

1. **Renamed Epic 1 → Epic 0**: The initial setup work is now Epic 0
2. **Created New Epic 1**: Aligns with PRD definition
3. **Created Epic 2 & 3 Issues**: Now properly numbered (#104, #105)
4. **Updated All Story Numbers**: Stories now match their epic numbers
5. **Created Missing Story Files**: All PRD stories have corresponding files
6. **Updated Milestones**: All due dates start from July 27, 2025

## Old Issues to Archive

The following issues use old numbering and should be closed/archived:
- Issue #3: [EPIC 2] Provider Management (now part of Epic 1)
- Issue #6: [EPIC 3] Search & Discovery (replaced by #104)
- Issue #9: [EPIC 6] Subscription (covered in Epic 1)
- Issue #82: [EPIC 11] Suggestions (duplicate of #105)

## File Structure

```
docs/
├── Specs/prd/
│   ├── 06-epic-1-*.md
│   ├── 07-epic-2-*.md
│   ├── 08-epic-3-*.md
│   └── 09-epic-4-*.md
└── stories/
    ├── epic-0-story-*.md (4 files)
    ├── epic-1-story-*.md (7 files)
    ├── epic-2-story-*.md (4 files)
    ├── epic-3-story-*.md (3 files)
    └── epic-4-story-*.md (15 files)
```

## Next Steps

1. **Close duplicate issues**: Archive old epic issues that have been replaced
2. **Update issue references**: Ensure all stories reference correct epic issues
3. **Begin Phase 1**: Start with Epic 1, Story 1.1 (Issue #92)
4. **Regular sync**: Keep this mapping document updated as work progresses