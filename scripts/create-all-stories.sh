#!/bin/bash

# Create ALL Stories for existing Epics
# This script creates all remaining stories from the documentation

set -e

echo "🚀 Creating ALL Stories for Holiday Program Aggregator"
echo "===================================================="

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    exit 1
fi

# Epic issue numbers from previous creation
EPIC1=2  # Initial Setup
EPIC2=3  # Provider Management
EPIC3=6  # Search & Discovery
EPIC4=7  # Security & Observability
EPIC5=""  # Provider Portal (not created yet)
EPIC6=9  # Payments
EPIC7=""  # Communication Hub (not created yet)
EPIC8=""  # Analytics (not created yet)
EPIC9=""  # Mobile (not created yet)
EPIC10="" # Advanced Features (not created yet)

# Function to create story
create_story() {
    local epic_num="$1"
    local story_num="$2"
    local title="$3"
    local points="$4"
    local status="$5"
    local priority="$6"
    local milestone="$7"
    local epic_issue="$8"
    
    # Skip if already created
    case "$epic_num.$story_num" in
        "2.1"|"2.2"|"4.7") 
            echo "⏭️  Skipping Story $epic_num.$story_num (already created)"
            return
            ;;
    esac
    
    echo "Creating Story $epic_num.$story_num: $title"
    
    # Determine size label
    case $points in
        1|2) size_label="size: XS (1-2)" ;;
        3|4|5) size_label="size: S (3-5)" ;;
        8) size_label="size: M (8)" ;;
        13) size_label="size: L (13)" ;;
        *) size_label="size: XL (21+)" ;;
    esac
    
    # Build story body
    body="## Epic
Epic: #$epic_issue

## Story Points: $points

## Status: $status

## Acceptance Criteria
_To be defined based on /docs/stories/epic-$epic_num-story-$story_num-*.md_

## Technical Tasks
_To be added during sprint planning_

## Definition of Done

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
    
    # Create the issue
    if [ -n "$milestone" ]; then
        issue_url=$(gh issue create \
            --title "[STORY $epic_num.$story_num] $title" \
            --body "$body" \
            --label "story,status: $status,$size_label,priority: $priority" \
            --milestone "$milestone" \
            --assignee "@me" 2>&1)
    else
        issue_url=$(gh issue create \
            --title "[STORY $epic_num.$story_num] $title" \
            --body "$body" \
            --label "story,status: $status,$size_label,priority: $priority" \
            --assignee "@me" 2>&1)
    fi
    
    if [[ $issue_url == *"https://"* ]]; then
        issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
        echo "✅ Created Story #$issue_number"
    else
        echo "❌ Failed to create story: $issue_url"
    fi
}

# Epic 1 Stories (all completed)
echo ""
echo "📋 Epic 1: Initial Setup Stories (Completed)"
create_story 1 1 "Repository & Development Environment Setup" 3 "completed" "low" "" "$EPIC1"
create_story 1 2 "CI/CD Pipeline Configuration" 5 "completed" "low" "" "$EPIC1"
create_story 1 3 "Database Schema & Initial Models" 5 "completed" "low" "" "$EPIC1"
create_story 1 4 "Deployment Infrastructure Setup" 3 "completed" "low" "" "$EPIC1"

# Epic 2 Stories (Provider Management)
echo ""
echo "📋 Epic 2: Provider Management Stories"
# 2.1 and 2.2 already created
create_story 2 3 "Provider Vetting Workflow" 8 "not-started" "high" "Phase 2: Core Admin" "$EPIC2"
create_story 2 4 "Bulk Import/Export Functionality" 5 "not-started" "medium" "Phase 2: Core Admin" "$EPIC2"
create_story 2 5 "Provider Profile Media Management" 5 "not-started" "medium" "Phase 2: Core Admin" "$EPIC2"

# Epic 3 Stories (Search & Discovery)
echo ""
echo "📋 Epic 3: Search & Discovery Stories"
create_story 3 1 "Basic Search Implementation" 5 "not-started" "high" "Phase 3: User Experience" "$EPIC3"
create_story 3 2 "Geospatial Search with PostGIS" 8 "not-started" "high" "Phase 3: User Experience" "$EPIC3"
create_story 3 3 "Advanced Filter System" 8 "not-started" "high" "Phase 3: User Experience" "$EPIC3"
create_story 3 4 "Search Results UI & Map View" 8 "not-started" "high" "Phase 3: User Experience" "$EPIC3"
create_story 3 5 "Saved Searches & Alerts" 5 "not-started" "medium" "Phase 3: User Experience" "$EPIC3"
create_story 3 6 "Search Analytics & Optimization" 5 "not-started" "medium" "Phase 3: User Experience" "$EPIC3"

# Epic 4 Stories (Security - remaining stories)
echo ""
echo "📋 Epic 4: Security & Observability Stories (Remaining)"
create_story 4 1 "Security Headers & CSP Implementation" 3 "completed" "low" "" "$EPIC4"
create_story 4 2 "Structured Logging with Correlation IDs" 5 "completed" "low" "" "$EPIC4"
create_story 4 3 "OpenTelemetry Distributed Tracing" 8 "deferred" "low" "" "$EPIC4"
create_story 4 4 "Error Tracking with Sentry" 3 "not-started" "medium" "Phase 2: Core Admin" "$EPIC4"
create_story 4 5 "Health Checks & Readiness Probes" 3 "completed" "low" "" "$EPIC4"
create_story 4 6 "Authentication Audit Logging" 5 "completed" "low" "" "$EPIC4"
# 4.7 already created
create_story 4 8 "SLO Definition & Monitoring" 5 "deferred" "low" "" "$EPIC4"
create_story 4 9 "Synthetic Monitoring Implementation" 5 "deferred" "low" "" "$EPIC4"
create_story 4 10 "Incident Response & Runbooks" 3 "not-started" "medium" "Phase 2: Core Admin" "$EPIC4"
create_story 4 11 "Security Vulnerability Scanning" 2 "completed" "low" "" "$EPIC4"
create_story 4 12 "Performance Testing & Optimization" 5 "not-started" "medium" "Phase 3: User Experience" "$EPIC4"
create_story 4 13 "Basic Alerting System (Free Tier)" 3 "not-started" "medium" "Phase 2: Core Admin" "$EPIC4"
create_story 4 14 "Log Rotation & Retention (Free Tier)" 3 "not-started" "low" "Phase 2: Core Admin" "$EPIC4"
create_story 4 15 "Simple Monitoring Dashboard (Free Tier)" 5 "not-started" "low" "Phase 3: User Experience" "$EPIC4"

# Create Epic 5: Provider Portal
echo ""
echo "📋 Creating Epic 5: Provider Portal"
EPIC5=$(gh issue create \
    --title "[EPIC 5] Provider Portal" \
    --body "## Epic Goal
Self-service portal for providers to manage profiles, schedules, and bookings.

## Status
⏳ Not Started

## User Stories
- [ ] Story 5.1: Provider Authentication & Registration
- [ ] Story 5.2: Provider Profile Management
- [ ] Story 5.3: Program & Schedule Management
- [ ] Story 5.4: Booking & Availability Management
- [ ] Story 5.5: Provider Dashboard & Analytics

## Dependencies
- Depends on: Epic 2 (#$EPIC2)
- Blocks: Epic 7

## Priority
MEDIUM - Post-MVP feature" \
    --label "epic,status: not-started,area: frontend,area: backend,priority: medium" \
    --milestone "Phase 4: Growth Features" \
    --assignee "@me" | grep -o '[0-9]\+$')

echo "✅ Created Epic #$EPIC5"

# Epic 5 Stories
echo ""
echo "📋 Epic 5: Provider Portal Stories"
create_story 5 1 "Provider Authentication & Registration" 5 "not-started" "medium" "Phase 4: Growth Features" "$EPIC5"
create_story 5 2 "Provider Profile Management" 5 "not-started" "medium" "Phase 4: Growth Features" "$EPIC5"
create_story 5 3 "Program & Schedule Management" 8 "not-started" "medium" "Phase 4: Growth Features" "$EPIC5"
create_story 5 4 "Booking & Availability Management" 8 "not-started" "medium" "Phase 4: Growth Features" "$EPIC5"
create_story 5 5 "Provider Dashboard & Analytics" 5 "not-started" "medium" "Phase 4: Growth Features" "$EPIC5"

# Epic 6 Stories (Payments)
echo ""
echo "📋 Epic 6: Payment Processing Stories"
create_story 6 1 "Stripe Integration & Configuration" 5 "not-started" "high" "MVP Launch" "$EPIC6"
create_story 6 2 "Subscription Tiers & Pricing" 5 "not-started" "high" "MVP Launch" "$EPIC6"
create_story 6 3 "Payment Flow Implementation" 8 "not-started" "high" "MVP Launch" "$EPIC6"
create_story 6 4 "Billing & Invoice Management" 5 "not-started" "high" "MVP Launch" "$EPIC6"
create_story 6 5 "Payment Security & Compliance" 5 "not-started" "high" "MVP Launch" "$EPIC6"

# Create Epic 7: Communication Hub
echo ""
echo "📋 Creating Epic 7: Communication Hub"
EPIC7=$(gh issue create \
    --title "[EPIC 7] Communication Hub" \
    --body "## Epic Goal
Messaging, notifications, and review system for user engagement.

## Status
⏳ Not Started

## User Stories
- [ ] Story 7.1: Internal Messaging System
- [ ] Story 7.2: Email Notification System
- [ ] Story 7.3: Booking Confirmation & Reminders
- [ ] Story 7.4: Review & Rating System

## Dependencies
- Depends on: Epic 3 (#$EPIC3), Epic 5 (#$EPIC5)
- Blocks: Epic 8

## Priority
MEDIUM - Growth feature" \
    --label "epic,status: not-started,area: frontend,area: backend,priority: medium" \
    --milestone "Phase 4: Growth Features" \
    --assignee "@me" | grep -o '[0-9]\+$')

echo "✅ Created Epic #$EPIC7"

# Epic 7 Stories
echo ""
echo "📋 Epic 7: Communication Hub Stories"
create_story 7 1 "Internal Messaging System" 8 "not-started" "medium" "Phase 4: Growth Features" "$EPIC7"
create_story 7 2 "Email Notification System" 5 "not-started" "medium" "Phase 4: Growth Features" "$EPIC7"
create_story 7 3 "Booking Confirmation & Reminders" 5 "not-started" "medium" "Phase 4: Growth Features" "$EPIC7"
create_story 7 4 "Review & Rating System" 8 "not-started" "medium" "Phase 4: Growth Features" "$EPIC7"

# Create Epic 8: Analytics
echo ""
echo "📋 Creating Epic 8: Analytics & Business Intelligence"
EPIC8=$(gh issue create \
    --title "[EPIC 8] Analytics & Business Intelligence" \
    --body "## Epic Goal
Comprehensive analytics for admins, providers, and business insights.

## Status
⏳ Not Started

## User Stories
- [ ] Story 8.1: Admin Analytics Dashboard
- [ ] Story 8.2: Provider Performance Metrics
- [ ] Story 8.3: Revenue & Financial Reports
- [ ] Story 8.4: User Behavior Analytics

## Dependencies
- Depends on: Epic 6 (#$EPIC6), Epic 7 (#$EPIC7)
- Blocks: Epic 9, Epic 10

## Priority
LOW - Future enhancement" \
    --label "epic,status: not-started,area: backend,area: frontend,priority: low" \
    --milestone "Phase 5: Scale & Optimize" \
    --assignee "@me" | grep -o '[0-9]\+$')

echo "✅ Created Epic #$EPIC8"

# Epic 8 Stories
echo ""
echo "📋 Epic 8: Analytics Stories"
create_story 8 1 "Admin Analytics Dashboard" 8 "not-started" "low" "Phase 5: Scale & Optimize" "$EPIC8"
create_story 8 2 "Provider Performance Metrics" 5 "not-started" "low" "Phase 5: Scale & Optimize" "$EPIC8"
create_story 8 3 "Revenue & Financial Reports" 5 "not-started" "low" "Phase 5: Scale & Optimize" "$EPIC8"
create_story 8 4 "User Behavior Analytics" 8 "not-started" "low" "Phase 5: Scale & Optimize" "$EPIC8"

echo ""
echo "🎉 Story creation complete!"
echo ""
echo "📊 Summary:"
echo "- Created all stories for Epics 1-8"
echo "- Total: ~45 stories across 8 epics"
echo ""
echo "📌 Next Steps:"
echo "1. Review all issues at: https://github.com/sdavidov17/holiday-program-aggregator/issues"
echo "2. Update the Epic issues with links to their stories"
echo "3. Add detailed acceptance criteria from /docs/stories/"
echo "4. Focus on Phase 2 stories first"
echo ""
echo "🚀 Current Sprint (Phase 2) Stories:"
echo "- Story 2.1: Provider Schema (Already created)"
echo "- Story 2.2: Admin CRUD (Already created)"
echo "- Story 2.3: Provider Vetting"
echo "- Story 2.4: Bulk Import/Export"
echo "- Story 2.5: Media Management"
echo "- Story 4.7: Rate Limiting (Already created)"