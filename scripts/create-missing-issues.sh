#!/bin/bash

# Script to create missing GitHub issues and update milestone assignments

echo "🚀 Creating Missing GitHub Issues and Updating Milestones"
echo "========================================================"

# First, let's create the missing Proactive Suggestions epic
echo "Creating Epic for Proactive Suggestions..."
gh issue create \
  --title "[EPIC 11] Proactive Suggestions & User Preferences" \
  --body "## Epic Goal
Transform the platform from a simple search tool into a proactive assistant by allowing parents to save preferences and receive automated, curated suggestions.

## User Stories
- [ ] Story 11.1: User Preference Center
- [ ] Story 11.2: Proactive Email Generation  
- [ ] Story 11.3: Email Delivery & Scheduling

## Dependencies
- Depends on: Epic 2 (Authentication) ✅
- Depends on: Epic 3 (Search & Discovery)

## Priority
Medium - Growth feature for Phase 6" \
  --label "epic" \
  --label "enhancement" \
  --milestone "Phase 5: Growth Features"

# Create the proactive suggestions stories
echo "Creating Story 11.1: User Preference Center..."
gh issue create \
  --title "[STORY 11.1] User Preference Center" \
  --body "## User Story
**As a** subscribed parent  
**I want** to save my preferences for activities  
**So that** the service can send me relevant suggestions automatically

## Acceptance Criteria
1. A logged-in user can access a \"Preferences\" page from their account menu
2. The preference center allows users to:
   - Set and save their preferred search radius (km from location)
   - Enter multiple locations (home, work, grandparents)
   - Select preferred activity types with multi-select
   - Enter children's details (name/nickname, age/DOB)
   - Set communication preferences (email frequency)
   - Choose preferred days of the week
   - Set budget preferences (optional)
3. Preferences are validated before saving
4. Success confirmation shown after saving
5. Users can update preferences at any time
6. Changes are reflected immediately in searches
7. Option to enable/disable automated suggestions
8. Clear privacy notice about data usage

## Technical Tasks
- [ ] Design preference center UI/UX
- [ ] Create preferences page component
- [ ] Build form with validation
- [ ] Implement location search/selection with geocoding
- [ ] Create multi-select activity type component
- [ ] Build child profile management section
- [ ] Create API endpoints for preference CRUD operations
- [ ] Update user model with preference schema
- [ ] Add preference data validation
- [ ] Implement auto-save functionality
- [ ] Add success/error notifications
- [ ] Unit test form validation and API
- [ ] E2E test preference management flow

## Story Points: 8" \
  --label "story" \
  --label "frontend" \
  --label "backend" \
  --milestone "Phase 5: Growth Features"

echo "Creating Story 11.2: Proactive Email Generation..."
gh issue create \
  --title "[STORY 11.2] Proactive Email Generation" \
  --body "## User Story
**As the** system  
**I want** to generate a personalized list of programs for each user  
**So that** they can receive a relevant, curated email with suggestions

## Acceptance Criteria
1. A backend process can be triggered for a specific user or batch of users
2. The process:
   - Retrieves the user's saved preferences
   - Identifies the upcoming school holiday period
   - Queries for matching programs within preferences
   - Applies smart ranking algorithm
3. Compiles a list of top 5-10 matches
4. Handles edge cases (no preferences, no matches, insufficient matches)
5. Generates email-ready data structure
6. Process is idempotent and can be re-run safely
7. Performance: Can process 1000 users in <5 minutes

## Technical Tasks
- [ ] Design suggestion algorithm and ranking system
- [ ] Create background job infrastructure
- [ ] Build preference retrieval service
- [ ] Implement school holiday calendar integration
- [ ] Create program matching algorithm
- [ ] Build ranking and scoring system
- [ ] Implement fallback strategies for edge cases
- [ ] Create email data generation service
- [ ] Add comprehensive logging and monitoring
- [ ] Build admin interface to trigger/monitor jobs
- [ ] Optimize database queries for batch processing
- [ ] Unit test matching and ranking algorithms
- [ ] Integration test the full pipeline

## Story Points: 13" \
  --label "story" \
  --label "backend" \
  --label "algorithm" \
  --milestone "Phase 5: Growth Features"

echo "Creating Story 11.3: Email Delivery & Scheduling..."
gh issue create \
  --title "[STORY 11.3] Email Delivery & Scheduling" \
  --body "## User Story
**As the** business  
**I want** to automatically send proactive suggestion emails to all subscribed users  
**So that** we can deliver on our core value proposition of saving parents time

## Acceptance Criteria
1. System integrates with third-party email service (SendGrid/AWS SES)
2. Professional, mobile-friendly email templates created
3. Scheduled task runs automatically 4 weeks before each school holiday
4. Email sending includes bounce handling, tracking, unsubscribe management
5. Admin dashboard shows sending progress and stats
6. Compliance with anti-spam regulations

## Technical Tasks
- [ ] Integrate email service provider API
- [ ] Design and build responsive email templates
- [ ] Create email rendering service
- [ ] Implement scheduling system
- [ ] Build timezone-aware sending logic
- [ ] Add email tracking and analytics
- [ ] Create bounce and complaint handling
- [ ] Implement unsubscribe management
- [ ] Build admin dashboard for email campaigns
- [ ] Add email preview functionality
- [ ] Create test email sending capability
- [ ] Set up email authentication (SPF, DKIM, DMARC)
- [ ] Unit test email generation
- [ ] Integration test with ESP
- [ ] Load test bulk sending capability

## Story Points: 8" \
  --label "story" \
  --label "backend" \
  --label "integration" \
  --milestone "Phase 5: Growth Features"

echo ""
echo "Now updating milestone assignments for better logical flow..."
echo ""

# Update search-related stories to Phase 4
search_stories=(17 18 19 20 21 22)
echo "Moving search stories to Phase 4: User Experience & MVP..."
for issue in "${search_stories[@]}"; do
  echo "  Updating issue #$issue..."
  gh issue edit $issue --milestone "MVP Launch"
done

# Update provider portal stories to Phase 6
provider_portal=(38 39 40 41 42)
echo "Moving provider portal stories to Phase 6: Growth Features..."
for issue in "${provider_portal[@]}"; do
  echo "  Updating issue #$issue..."
  gh issue edit $issue --milestone "Phase 4: Growth Features"
done

# Rename milestones for clarity
echo ""
echo "Updating milestone names for clarity..."
gh api --method PATCH "repos/sdavidov17/holiday-program-aggregator/milestones/3" \
  --field name="Phase 3: Provider & Content Management" \
  --field description="Set up provider management system and program catalog structure"

gh api --method PATCH "repos/sdavidov17/holiday-program-aggregator/milestones/4" \
  --field name="Phase 4: User Experience & MVP" \
  --field description="Core user-facing features including search, discovery, and payments for MVP launch"

gh api --method PATCH "repos/sdavidov17/holiday-program-aggregator/milestones/5" \
  --field name="Phase 5: Growth Features" \
  --field description="Enhanced features including provider portal, communications, and proactive suggestions"

gh api --method PATCH "repos/sdavidov17/holiday-program-aggregator/milestones/6" \
  --field name="Phase 6: Scale & Optimize" \
  --field description="Analytics, mobile optimization, and advanced AI features"

echo ""
echo "✅ Script completed!"
echo ""
echo "Summary of changes:"
echo "- Created Epic 11: Proactive Suggestions & User Preferences"
echo "- Created 3 stories for proactive suggestions feature"
echo "- Moved search stories to Phase 4 (MVP)"
echo "- Moved provider portal stories to Phase 5 (Growth)"
echo "- Updated milestone names for clarity"
echo ""
echo "Next steps:"
echo "1. Review the created issues and make any necessary adjustments"
echo "2. Update the PRD to match the GitHub epic structure"
echo "3. Ensure all team members are aware of the new milestone organization"