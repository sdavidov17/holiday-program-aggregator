#!/bin/bash

# Simplified GitHub Issues Creation Script
# Creates all epics and stories for Holiday Program Aggregator

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

# Create temp file to store issue numbers
ISSUE_MAP="/tmp/github_issues_map.txt"
> "$ISSUE_MAP"

# Function to create epic
create_epic() {
    local epic_num="$1"
    local title="$2"
    local body="$3"
    local labels="$4"
    local milestone="$5"
    
    echo "Creating Epic $epic_num: $title"
    
    issue_url=$(gh issue create \
        --title "[EPIC $epic_num] $title" \
        --body "$body" \
        --label "$labels" \
        --milestone "$milestone" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    echo "epic$epic_num=$issue_number" >> "$ISSUE_MAP"
    echo "✅ Created Epic #$issue_number"
}

# Function to create story
create_story() {
    local epic_num="$1"
    local story_num="$2" 
    local title="$3"
    local body="$4"
    local labels="$5"
    local milestone="$6"
    
    echo "Creating Story $epic_num.$story_num: $title"
    
    issue_url=$(gh issue create \
        --title "[STORY $epic_num.$story_num] $title" \
        --body "$body" \
        --label "$labels" \
        --milestone "$milestone" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    echo "story$epic_num-$story_num=$issue_number" >> "$ISSUE_MAP"
    echo "✅ Created Story #$issue_number"
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

# Epic 1: Initial Setup (COMPLETED)
echo ""
echo "📋 Creating Epic 1: Initial Project Setup"
create_epic 1 "Initial Project Setup & Infrastructure" \
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
"epic,status: completed,area: infrastructure,priority: low" \
""

# Epic 1 Stories
create_story 1 1 "Repository & Development Environment Setup" \
"## Epic
Epic: #1

## Status: ✅ COMPLETED

## Completed Tasks
- [x] Initialize T3 Stack with TypeScript
- [x] Configure Turborepo
- [x] Set up ESLint and Prettier
- [x] Configure Git hooks
- [x] Create project documentation

$DOD" \
"story,status: completed,size: S (3-5)" \
"1"

create_story 1 2 "CI/CD Pipeline Configuration" \
"## Epic  
Epic: #1

## Status: ✅ COMPLETED

## Completed Tasks
- [x] GitHub Actions workflows
- [x] Automated testing
- [x] Deployment pipeline
- [x] Branch protection

$DOD" \
"story,status: completed,size: S (3-5)" \
"1"

create_story 1 3 "Database Schema & Initial Models" \
"## Epic
Epic: #1  

## Status: ✅ COMPLETED

## Completed Tasks
- [x] Prisma schema design
- [x] Core models created
- [x] PostGIS setup
- [x] Migrations tested

$DOD" \
"story,status: completed,size: S (3-5)" \
"1"

create_story 1 4 "Deployment Infrastructure Setup" \
"## Epic
Epic: #1

## Status: ✅ COMPLETED  

## Completed Tasks
- [x] Vercel configuration
- [x] Environment variables
- [x] Domain setup
- [x] SSL certificates

$DOD" \
"story,status: completed,size: S (3-5)" \
"1"

# Epic 2: Provider Management
echo ""
echo "📋 Creating Epic 2: Provider Management System"
create_epic 2 "Provider Management System" \
"## Epic Goal
Build comprehensive provider management with admin CRUD, vetting, and bulk operations.

## Status
⏳ Not Started

## User Stories
- [ ] Story 2.1: Provider Data Model & Database Schema
- [ ] Story 2.2: Admin Provider CRUD Interface
- [ ] Story 2.3: Provider Vetting Workflow
- [ ] Story 2.4: Bulk Import/Export Functionality
- [ ] Story 2.5: Provider Profile Media Management

## Dependencies
- Depends on: Epic 1 ✅
- Blocks: Epic 3, Epic 5

## Priority
HIGH - Required for MVP" \
"epic,status: not-started,area: backend,area: database,priority: high" \
"2"

# Epic 2 Stories
create_story 2 1 "Provider Data Model & Database Schema" \
"## Epic
Epic: #2

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
"2"

create_story 2 2 "Admin Provider CRUD Interface" \
"## Epic
Epic: #2

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
"2"

create_story 2 3 "Provider Vetting Workflow" \
"## Epic
Epic: #2

## Story Points: 8

## Acceptance Criteria  
- [ ] Vetting status states
- [ ] Document upload
- [ ] Approval workflow
- [ ] Rejection reasons
- [ ] Email notifications

## Technical Tasks
- [ ] Status state machine
- [ ] File upload system
- [ ] Workflow UI
- [ ] Email templates

$DOD" \
"story,status: not-started,size: M (8),priority: high" \
"2"

create_story 2 4 "Bulk Import/Export Functionality" \
"## Epic
Epic: #2

## Story Points: 5

## Acceptance Criteria
- [ ] CSV import with validation
- [ ] Export to CSV/Excel
- [ ] Import preview
- [ ] Error reporting
- [ ] Rollback capability

## Technical Tasks
- [ ] CSV parser
- [ ] Validation logic
- [ ] Import UI
- [ ] Export endpoints

$DOD" \
"story,status: not-started,size: S (3-5),priority: medium" \
"2"

create_story 2 5 "Provider Profile Media Management" \
"## Epic  
Epic: #2

## Story Points: 5

## Acceptance Criteria
- [ ] Image upload (logo, photos)
- [ ] Image optimization
- [ ] CDN integration
- [ ] Gallery management
- [ ] File size limits

## Technical Tasks
- [ ] S3 integration
- [ ] Image processing
- [ ] Upload UI
- [ ] Gallery component

$DOD" \
"story,status: not-started,size: S (3-5),priority: medium" \
"2"

# Epic 3: Search & Discovery
echo ""
echo "📋 Creating Epic 3: Search & Discovery"
create_epic 3 "Search & Discovery" \
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
- Depends on: Epic 2
- Blocks: Epic 6, Epic 7

## Priority
HIGH - Core user feature" \
"epic,status: not-started,area: frontend,area: backend,priority: high" \
"3"

# Epic 4: Security & Observability (COMPLETED)
echo ""
echo "📋 Creating Epic 4: Security, SRE & Observability"
create_epic 4 "Security, SRE & Observability" \
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

## Remaining Stories
- [ ] Story 4.4: Error Tracking (Sentry free tier)
- [ ] Story 4.7: Rate Limiting
- [ ] Story 4.10: Incident Response
- [ ] Story 4.12: Performance Testing
- [ ] Story 4.13-15: Free tier additions

## Dependencies
- Depends on: Epic 1 ✅
- Blocks: None

## Cost
Free tier: $0-20/month
Minimum: $122/month" \
"epic,status: completed,area: security,area: infrastructure,priority: low" \
"1"

# Create remaining Epic 4 stories that aren't completed
create_story 4 4 "Error Tracking with Sentry" \
"## Epic
Epic: #4

## Story Points: 3

## Acceptance Criteria
- [ ] Sentry SDK integrated
- [ ] Error capture working
- [ ] Source maps uploaded
- [ ] PII scrubbing configured
- [ ] Alerts configured

## Technical Tasks
- [ ] Install Sentry SDK
- [ ] Configure for Next.js
- [ ] Set up CI integration
- [ ] Test error capture

$DOD" \
"story,status: not-started,size: S (3-5),priority: medium" \
"2"

create_story 4 7 "Rate Limiting & DDoS Protection" \
"## Epic
Epic: #4

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
"2"

# Epic 5: Provider Portal
echo ""
echo "📋 Creating Epic 5: Provider Portal"
create_epic 5 "Provider Portal" \
"## Epic Goal
Self-service portal for providers to manage profiles, schedules, and bookings.

## Status
⏳ Not Started

## User Stories
- [ ] Story 5.1: Provider Authentication
- [ ] Story 5.2: Provider Profile Management
- [ ] Story 5.3: Program & Schedule Management
- [ ] Story 5.4: Booking Management
- [ ] Story 5.5: Provider Dashboard

## Dependencies
- Depends on: Epic 2
- Blocks: Epic 7

## Priority
MEDIUM - Post-MVP feature" \
"epic,status: not-started,area: frontend,area: backend,priority: medium" \
"5"

# Epic 6: Payments
echo ""
echo "📋 Creating Epic 6: Subscription & Payment Processing"
create_epic 6 "Subscription & Payment Processing" \
"## Epic Goal
Implement Stripe-based subscriptions, payment processing, and billing.

## Status
⏳ Not Started

## User Stories
- [ ] Story 6.1: Stripe Integration
- [ ] Story 6.2: Subscription Tiers
- [ ] Story 6.3: Payment Flow
- [ ] Story 6.4: Billing Management
- [ ] Story 6.5: Payment Security

## Dependencies
- Depends on: Epic 3
- Blocks: Epic 8

## Priority
HIGH - Required for monetization" \
"epic,status: not-started,area: backend,area: security,priority: high" \
"4"

# Continue with remaining epics...

echo ""
echo "🎉 Issue creation complete!"
echo ""
echo "📊 Summary:"
echo "- Created multiple epics and stories"
echo "- All issues tagged and assigned"
echo ""
echo "📌 Next Steps:"
echo "1. Check your issues at: https://github.com/sdavidov17/holiday-program-aggregator/issues"
echo "2. Create a project board to organize them"
echo "3. Link dependencies manually"
echo "4. Start with Epic 2 (Provider Management)"