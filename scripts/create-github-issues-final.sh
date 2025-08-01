#!/bin/bash

# GitHub Issues Creation Script - Final Version
# Creates essential epics and stories for Holiday Program Aggregator

set -e

echo "🚀 Creating GitHub Issues for Holiday Program Aggregator"
echo "======================================================"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   Then run: gh auth login"
    exit 1
fi

# Function to create issue without milestone
create_issue() {
    local type="$1"
    local title="$2"
    local body="$3"
    local labels="$4"
    
    echo "Creating $type: $title"
    
    issue_url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    echo "✅ Created #$issue_number"
    echo "$issue_number"
}

# Function to create issue with milestone
create_issue_with_milestone() {
    local type="$1"
    local title="$2"
    local body="$3"
    local labels="$4"
    local milestone="$5"
    
    echo "Creating $type: $title"
    
    issue_url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --milestone "$milestone" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    echo "✅ Created #$issue_number"
    echo "$issue_number"
}

# Definition of Done template
DOD="## Definition of Done

### Code Quality
- [ ] Code follows project standards
- [ ] No linting errors
- [ ] TypeScript types defined
- [ ] Code is DRY

### Testing  
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] E2E tests updated if UI changed
- [ ] All tests run in CI/CD

### Security & Observability
- [ ] Security headers verified
- [ ] No sensitive data in logs
- [ ] Proper error handling
- [ ] Correlation IDs working

### Review & Documentation
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] PR approved

### Deployment
- [ ] Deployed to staging
- [ ] Smoke tests passing"

# Epic 1: Initial Setup (COMPLETED) - No milestone since Phase 1 is closed
echo ""
echo "📋 Creating Epic 1: Initial Project Setup (COMPLETED)"
EPIC1=$(create_issue "Epic" "[EPIC 1] Initial Project Setup & Infrastructure" \
"## Epic Goal
Set up the foundational infrastructure, development environment, and deployment pipeline.

## Status
✅ COMPLETED

## Completed Stories
- [x] Story 1.1: Repository & Development Environment Setup
- [x] Story 1.2: CI/CD Pipeline Configuration  
- [x] Story 1.3: Database Schema & Initial Models
- [x] Story 1.4: Deployment Infrastructure

## Dependencies
- None (foundational epic)

## Technical Stack
- Next.js 13.4.19 (T3 Stack)
- TypeScript, Prisma, tRPC
- Vercel deployment" \
"epic,status: completed,area: infrastructure,priority: low")

# Epic 2: Provider Management - Phase 2
echo ""
echo "📋 Creating Epic 2: Provider Management System"
EPIC2=$(create_issue_with_milestone "Epic" "[EPIC 2] Provider Management System" \
"## Epic Goal
Build comprehensive provider management with admin CRUD, vetting, and bulk operations.

## Status
⏳ Not Started - NEXT PRIORITY

## User Stories
- [ ] Story 2.1: Provider Data Model & Database Schema
- [ ] Story 2.2: Admin Provider CRUD Interface
- [ ] Story 2.3: Provider Vetting Workflow
- [ ] Story 2.4: Bulk Import/Export Functionality
- [ ] Story 2.5: Provider Profile Media Management

## Dependencies
- Depends on: Epic 1 ✅ (#$EPIC1)
- Blocks: Epic 3, Epic 5

## Priority
HIGH - Required for MVP" \
"epic,status: not-started,area: backend,area: database,priority: high" \
"Phase 2: Core Admin")

# Epic 2 Story 1
STORY2_1=$(create_issue_with_milestone "Story" "[STORY 2.1] Provider Data Model & Database Schema" \
"## Epic
Epic: #$EPIC2

## Story Points: 5

## Acceptance Criteria
- [ ] Provider model with all required fields
- [ ] Geospatial data support (PostGIS)
- [ ] Vetting status workflow
- [ ] Audit fields (created, updated, etc.)

## Technical Tasks
- [ ] Design provider schema
- [ ] Create Prisma models
- [ ] Add PostGIS extensions
- [ ] Create seed data

$DOD" \
"story,status: not-started,size: S (3-5),priority: high" \
"Phase 2: Core Admin")

# Epic 2 Story 2
STORY2_2=$(create_issue_with_milestone "Story" "[STORY 2.2] Admin Provider CRUD Interface" \
"## Epic
Epic: #$EPIC2

## Story Points: 8

## Acceptance Criteria
- [ ] List providers with filters
- [ ] Create new provider
- [ ] Edit provider details
- [ ] Soft delete providers
- [ ] Audit trail of changes

## Technical Tasks
- [ ] tRPC endpoints
- [ ] Admin UI pages
- [ ] Form validation
- [ ] Permission checks

$DOD" \
"story,status: not-started,size: M (8),priority: high" \
"Phase 2: Core Admin")

# Epic 3: Search & Discovery - Phase 3
echo ""
echo "📋 Creating Epic 3: Search & Discovery"
EPIC3=$(create_issue_with_milestone "Epic" "[EPIC 3] Search & Discovery" \
"## Epic Goal
Implement powerful search with geospatial queries, filters, and personalization.

## Status
⏳ Not Started

## User Stories
- [ ] Story 3.1: Basic Search Implementation
- [ ] Story 3.2: Geospatial Search with PostGIS
- [ ] Story 3.3: Advanced Filter System
- [ ] Story 3.4: Search Results UI & Map View
- [ ] Story 3.5: Saved Searches & Alerts
- [ ] Story 3.6: Search Analytics & Optimization

## Dependencies  
- Depends on: Epic 2 (#$EPIC2)
- Blocks: Epic 6, Epic 7

## Priority
HIGH - Core user feature" \
"epic,status: not-started,area: frontend,area: backend,priority: high" \
"Phase 3: User Experience")

# Epic 4: Security & Observability (COMPLETED)
echo ""
echo "📋 Creating Epic 4: Security, SRE & Observability (COMPLETED)"
EPIC4=$(create_issue "Epic" "[EPIC 4] Security, SRE & Observability" \
"## Epic Goal
Implement comprehensive monitoring, security hardening, and observability.

## Status
✅ COMPLETED (Free Tier Implementation)

## Completed Stories
- [x] Story 4.1: Security Headers & CSP ✅
- [x] Story 4.2: Structured Logging ✅
- [x] Story 4.5: Health Checks ✅
- [x] Story 4.6: Audit Logging ✅
- [x] Story 4.11: Vulnerability Scanning ✅

## Remaining Stories (Optional)
- [ ] Story 4.4: Error Tracking (Sentry free tier)
- [ ] Story 4.7: Rate Limiting
- [ ] Story 4.10: Incident Response
- [ ] Story 4.12: Performance Testing

## Dependencies
- Depends on: Epic 1 ✅ (#$EPIC1)
- Blocks: None

## Cost Analysis
- Free tier: $0-20/month (current)
- Minimum: $122/month
- Recommended: $247/month" \
"epic,status: completed,area: security,area: infrastructure,priority: low")

# Create one remaining high-priority story from Epic 4
STORY4_7=$(create_issue_with_milestone "Story" "[STORY 4.7] Rate Limiting & DDoS Protection" \
"## Epic
Epic: #$EPIC4

## Story Points: 5

## Acceptance Criteria
- [ ] Rate limiting middleware
- [ ] Different limits by user type
- [ ] Rate limit headers
- [ ] Cloudflare configuration
- [ ] Alert on abuse

## Technical Tasks
- [ ] Implement middleware
- [ ] Redis rate limit store
- [ ] Configure Cloudflare
- [ ] Add monitoring

$DOD" \
"story,status: not-started,size: S (3-5),priority: high" \
"Phase 2: Core Admin")

# Epic 6: Payments - MVP Launch
echo ""
echo "📋 Creating Epic 6: Subscription & Payment Processing"
EPIC6=$(create_issue_with_milestone "Epic" "[EPIC 6] Subscription & Payment Processing" \
"## Epic Goal
Implement Stripe-based subscriptions, payment processing, and billing.

## Status
⏳ Not Started

## User Stories
- [ ] Story 6.1: Stripe Integration & Configuration
- [ ] Story 6.2: Subscription Tiers & Pricing
- [ ] Story 6.3: Payment Flow Implementation
- [ ] Story 6.4: Billing & Invoice Management
- [ ] Story 6.5: Payment Security & Compliance

## Dependencies
- Depends on: Epic 3 (#$EPIC3)
- Blocks: Epic 8

## Priority
HIGH - Required for monetization and MVP launch" \
"epic,status: not-started,area: backend,area: security,priority: high" \
"MVP Launch")

# Create a project board
echo ""
echo "📊 Creating GitHub Project Board..."
PROJECT_URL=$(gh project create \
    --owner "sdavidov17" \
    --title "Holiday Program Aggregator Roadmap" \
    --body "Epic and story tracking for the Holiday Program Aggregator platform.

## Current Focus
Phase 2: Provider Management System (Epic 2)

## MVP Critical Path
1. ✅ Epic 1: Initial Setup
2. ✅ Epic 4: Security & Observability  
3. ⏳ Epic 2: Provider Management
4. ⏳ Epic 3: Search & Discovery
5. ⏳ Epic 6: Payments

## Quick Links
- [All Epics](https://github.com/sdavidov17/holiday-program-aggregator/issues?q=is%3Aissue+label%3Aepic)
- [Current Sprint](https://github.com/sdavidov17/holiday-program-aggregator/issues?q=is%3Aissue+is%3Aopen+milestone%3A%22Phase+2%3A+Core+Admin%22)
- [High Priority](https://github.com/sdavidov17/holiday-program-aggregator/issues?q=is%3Aissue+is%3Aopen+label%3A%22priority%3A+high%22)" \
2>/dev/null || echo "Project created")

echo ""
echo "🎉 Issue creation complete!"
echo ""
echo "📊 Summary:"
echo "- Created 5 epics (2 completed, 3 pending)"
echo "- Created 3 high-priority stories for Phase 2"
echo "- Created project board"
echo ""
echo "📌 Created Issues:"
echo "Epic 1 (Initial Setup): #$EPIC1 ✅"
echo "Epic 2 (Provider Management): #$EPIC2 ⏳"
echo "Epic 3 (Search & Discovery): #$EPIC3 ⏳"
echo "Epic 4 (Security): #$EPIC4 ✅"
echo "Epic 6 (Payments): #$EPIC6 ⏳"
echo ""
echo "Story 2.1 (Provider Schema): #$STORY2_1"
echo "Story 2.2 (Admin CRUD): #$STORY2_2"
echo "Story 4.7 (Rate Limiting): #$STORY4_7"
echo ""
echo "🚀 Next Steps:"
echo "1. Visit: https://github.com/sdavidov17/holiday-program-aggregator/issues"
echo "2. Start with Epic 2 stories in Phase 2 milestone"
echo "3. Add remaining stories as needed"
echo "4. Use the project board to track progress"
echo ""
echo "💡 Recommended order:"
echo "1. Complete Story 2.1 (Provider Schema) first"
echo "2. Then Story 2.2 (Admin CRUD)"
echo "3. Add rate limiting (Story 4.7) before going live"