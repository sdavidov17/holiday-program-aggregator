# Documentation Reorganization Plan

## Current Issues
1. Documentation scattered across multiple subdirectories
2. Inconsistent organization (Specs vs guides vs architecture)
3. Missing critical documentation (API docs, runbooks, incident response)
4. Outdated information in implementation status

## Proposed Structure

```
docs/
├── README.md                    # Documentation hub with navigation
├── architecture/                # System design & technical architecture
│   ├── README.md                # Architecture overview
│   ├── high-level-design.md    # System design (from Specs/architecture/)
│   ├── tech-stack.md           # Technology choices
│   ├── data-models.md          # Database schema
│   ├── api-specification.md    # API patterns
│   ├── project-structure.md    # Monorepo organization
│   ├── reviews/                # Architecture & QA reviews
│   │   ├── architecture-review-2025-01.md
│   │   └── qa-comprehensive-review-2025-01.md
│   └── decisions/              # ADRs
│       └── README.md
├── api/                        # API documentation
│   ├── README.md               # API overview
│   ├── reference.md            # Endpoint documentation
│   ├── authentication.md      # Auth guide
│   ├── errors.md              # Error codes
│   └── examples/              # Code examples
├── guides/                     # How-to guides
│   ├── README.md
│   ├── deployment.md
│   ├── local-setup.md
│   ├── database-setup.md
│   ├── testing.md
│   ├── troubleshooting.md
│   └── development-workflow.md
├── runbooks/                   # Operational procedures
│   ├── README.md
│   ├── incident-response.md
│   ├── deployment-checklist.md
│   ├── rollback-procedure.md
│   └── monitoring-alerts.md
├── reference/                  # BMAD & specifications (preserved)
│   ├── README.md              # Reference overview
│   ├── prd/                   # Product requirements
│   │   └── [all PRD files]
│   ├── product-brief.md
│   ├── ux-design/             # UX specifications
│   │   └── [design files]
│   └── dependency-map.md
├── stories/                    # Development stories
│   ├── README.md              # Stories overview
│   └── [all story files]      # Epic stories
├── project/                    # Project management
│   ├── README.md
│   ├── roadmap.md             # Project roadmap
│   ├── implementation-status.md
│   ├── epic-mapping.md
│   ├── branching-strategy.md
│   └── team-guidelines.md
└── legacy/                     # Outdated docs for reference
    └── [archived files]
```

## Migration Steps

### Phase 1: Create New Structure
1. Create new directories: runbooks, reference, project, legacy
2. Create README.md files for each major section

### Phase 2: Move Files
1. Move Specs/architecture/* → architecture/
2. Move Specs/prd/* → reference/prd/
3. Move guides files to appropriate locations
4. Move project management files to project/
5. Archive outdated files to legacy/

### Phase 3: Update References
1. Update CLAUDE.md with new paths
2. Update all internal documentation links
3. Update README files with navigation

### Phase 4: Create Missing Documentation
1. Create runbooks for operational procedures
2. Expand API documentation
3. Add incident response procedures
4. Create monitoring and alerting guides

## Files to Move

### To architecture/
- Specs/architecture/*.md → architecture/
- architecture/*.md → architecture/reviews/

### To reference/
- Specs/prd/* → reference/prd/
- Specs/UX Design Guide/* → reference/ux-design/
- product-brief.md → reference/
- Specs/dependency-map.md → reference/

### To project/
- project-roadmap.md → project/roadmap.md
- implementation-status.md → project/
- epic-mapping.md → project/
- branching-strategy.md → project/
- team-guidelines.md → project/

### To guides/
- All current guides/* files remain
- developer-onboarding.md stays
- testing-strategy.md stays

### To legacy/
- squad-review-2025-08-06.md
- implementation-plan-schema-fix.md
- story-1-4-technical-plan.md
- stripe-setup-complete.md
- ux-improvements.md

## Benefits
1. Clear separation of concerns
2. Easy navigation for different roles
3. Preserves BMAD reference materials
4. Removes outdated/duplicate content
5. Creates space for missing documentation