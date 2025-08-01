#!/bin/bash

# Complete GitHub Issues and Project Setup Script
# Creates all epics, stories, milestones, and project board with proper DoD

set -e

echo "🚀 Setting up Complete GitHub Project for Holiday Program Aggregator"
echo "=================================================================="

# Configuration
REPO="sdavidov17/holiday-program-aggregator"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_FILE="$SCRIPT_DIR/github-issues-data.json"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Definition of Done template
DOD_TEMPLATE="## Definition of Done

### Code Quality
- [ ] Code follows project standards and conventions
- [ ] No linting errors (ESLint, Prettier)
- [ ] TypeScript types properly defined (no \`any\` types)
- [ ] Code is DRY and follows SOLID principles

### Testing
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] E2E tests updated if UI changed
- [ ] All tests run in CI/CD pipeline

### Security & Observability
- [ ] Security headers verified (CSP, CORS, etc.)
- [ ] No sensitive data in logs
- [ ] Correlation IDs properly propagated
- [ ] Error handling with proper logging
- [ ] Rate limiting considered if applicable

### Code Review
- [ ] PR created with clear description
- [ ] Code reviewed by at least 1 team member
- [ ] All review comments addressed
- [ ] Branch protection rules passing

### Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated if applicable
- [ ] README updated if setup changed
- [ ] CLAUDE.md updated if new patterns introduced

### Deployment
- [ ] Successfully deployed to staging
- [ ] Smoke tests passing on staging
- [ ] No performance regressions
- [ ] Database migrations tested (if applicable)

### Acceptance
- [ ] All acceptance criteria met
- [ ] Product owner/stakeholder approval
- [ ] No known bugs related to this story"

# Check requirements
echo -e "${BLUE}Checking requirements...${NC}"
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first:"
    echo "   brew install jq"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ All requirements met${NC}"

# Create comprehensive labels
echo -e "\n${BLUE}Creating labels...${NC}"
# Epic/Story types
gh label create epic --description "Major feature or initiative" --color "7057ff" 2>/dev/null || true
gh label create story --description "User story" --color "0969da" 2>/dev/null || true
gh label create task --description "Technical task" --color "0052cc" 2>/dev/null || true

# Status labels
gh label create "status: completed" --description "Work completed" --color "0e8a16" 2>/dev/null || true
gh label create "status: in-progress" --description "Currently being worked on" --color "fbca04" 2>/dev/null || true
gh label create "status: not-started" --description "Not yet started" --color "ffffff" 2>/dev/null || true
gh label create "status: blocked" --description "Blocked by dependencies" --color "d73a4a" 2>/dev/null || true
gh label create "status: deferred" --description "Deferred to later phase" --color "c5def5" 2>/dev/null || true
gh label create "status: in-review" --description "In code review" --color "ff7619" 2>/dev/null || true

# Priority labels
gh label create "priority: critical" --description "Critical priority" --color "d73a4a" 2>/dev/null || true
gh label create "priority: high" --description "High priority" --color "ff7619" 2>/dev/null || true
gh label create "priority: medium" --description "Medium priority" --color "fbca04" 2>/dev/null || true
gh label create "priority: low" --description "Low priority" --color "0e8a16" 2>/dev/null || true

# Technical area labels
gh label create "area: frontend" --description "Frontend development" --color "bfd4f2" 2>/dev/null || true
gh label create "area: backend" --description "Backend development" --color "d4c5f9" 2>/dev/null || true
gh label create "area: database" --description "Database-related" --color "5319e7" 2>/dev/null || true
gh label create "area: infrastructure" --description "Infrastructure and DevOps" --color "c5def5" 2>/dev/null || true
gh label create "area: security" --description "Security-related" --color "d73a4a" 2>/dev/null || true
gh label create "area: testing" --description "Testing-related" --color "f9d0c4" 2>/dev/null || true

# Size labels for story points
gh label create "size: XS (1-2)" --description "1-2 story points" --color "009900" 2>/dev/null || true
gh label create "size: S (3-5)" --description "3-5 story points" --color "77bb00" 2>/dev/null || true
gh label create "size: M (8)" --description "8 story points" --color "ffbb00" 2>/dev/null || true
gh label create "size: L (13)" --description "13 story points" --color "ff7700" 2>/dev/null || true
gh label create "size: XL (21+)" --description "21+ story points" --color "ff0000" 2>/dev/null || true

echo -e "${GREEN}✓ Labels created${NC}"

# Create milestones with dates
echo -e "\n${BLUE}Creating milestones...${NC}"
gh api repos/${REPO}/milestones --method POST \
    -f title="Phase 1: Foundation ✅" \
    -f description="Initial setup and security infrastructure (COMPLETED)" \
    -f due_on="2025-02-01T00:00:00Z" \
    -f state="closed" 2>/dev/null || true

gh api repos/${REPO}/milestones --method POST \
    -f title="Phase 2: Core Admin" \
    -f description="Provider management system" \
    -f due_on="2025-03-01T00:00:00Z" 2>/dev/null || true

gh api repos/${REPO}/milestones --method POST \
    -f title="Phase 3: User Experience" \
    -f description="Search, discovery, and user flows" \
    -f due_on="2025-04-01T00:00:00Z" 2>/dev/null || true

gh api repos/${REPO}/milestones --method POST \
    -f title="MVP Launch" \
    -f description="Minimum viable product with core features" \
    -f due_on="2025-05-01T00:00:00Z" 2>/dev/null || true

gh api repos/${REPO}/milestones --method POST \
    -f title="Phase 4: Growth Features" \
    -f description="Provider portal, communications, analytics" \
    -f due_on="2025-06-01T00:00:00Z" 2>/dev/null || true

gh api repos/${REPO}/milestones --method POST \
    -f title="Phase 5: Scale & Optimize" \
    -f description="Mobile, AI, and advanced features" \
    -f due_on="2025-08-01T00:00:00Z" 2>/dev/null || true

echo -e "${GREEN}✓ Milestones created${NC}"

# Arrays to track created issues
declare -a epic_numbers
declare -a story_numbers
declare -a epic_ids

# Function to get size label from points
get_size_label() {
    local points=$1
    case $points in
        1|2) echo "size: XS (1-2)" ;;
        3|4|5) echo "size: S (3-5)" ;;
        6|7|8) echo "size: M (8)" ;;
        9|10|11|12|13) echo "size: L (13)" ;;
        *) echo "size: XL (21+)" ;;
    esac
}

# Function to get milestone number
get_milestone_number() {
    local phase=$1
    case $phase in
        "1") echo "1" ;;
        "2") echo "2" ;;
        "3") echo "3" ;;
        "4") echo "5" ;;
        "5") echo "6" ;;
        *) echo "4" ;; # Default to MVP
    esac
}

# Create all epics
echo -e "\n${BLUE}Creating Epics...${NC}"
epic_count=$(jq '.epics | length' "$DATA_FILE")

for (( i=0; i<$epic_count; i++ )); do
    epic=$(jq -r ".epics[$i]" "$DATA_FILE")
    
    id=$(echo "$epic" | jq -r '.id')
    title=$(echo "$epic" | jq -r '.title')
    status=$(echo "$epic" | jq -r '.status')
    description=$(echo "$epic" | jq -r '.description')
    labels=$(echo "$epic" | jq -r '.labels | join(",")')
    
    # Determine phase based on epic number
    epic_num=$(echo "$id" | sed 's/epic//')
    case $epic_num in
        1|4) phase=1 ;;
        2) phase=2 ;;
        3) phase=3 ;;
        5|6|7) phase=4 ;;
        8|9|10) phase=5 ;;
        *) phase=3 ;;
    esac
    
    milestone=$(get_milestone_number $phase)
    
    # Build epic body
    body="## Epic Goal
$description

## Status
$([ "$status" = "completed" ] && echo "✅ COMPLETED" || echo "⏳ $status")

## Phase
Phase $phase

## Dependencies"
    
    # Add dependencies
    deps=$(echo "$epic" | jq -r '.dependencies[]' 2>/dev/null || true)
    if [ -n "$deps" ]; then
        for dep in $deps; do
            body="$body
- Depends on: $dep"
        done
    else
        body="$body
- None"
    fi
    
    # Add blocks
    body="$body

## Blocks"
    blocks=$(echo "$epic" | jq -r '.blocks[]' 2>/dev/null || true)
    if [ -n "$blocks" ]; then
        for block in $blocks; do
            body="$body
- $block"
        done
    else
        body="$body
- None"
    fi
    
    # Add stories list
    body="$body

## User Stories"
    story_count=$(echo "$epic" | jq '.stories | length')
    for (( j=0; j<$story_count; j++ )); do
        story_title=$(echo "$epic" | jq -r ".stories[$j].title")
        story_status=$(echo "$epic" | jq -r ".stories[$j].status")
        story_points=$(echo "$epic" | jq -r ".stories[$j].points")
        check=$([ "$story_status" = "completed" ] && echo "x" || echo " ")
        body="$body
- [$check] $story_title ($story_points pts)"
    done
    
    echo -e "${YELLOW}Creating Epic: [EPIC] $title${NC}"
    
    # Determine priority based on phase
    priority=$([ $phase -le 3 ] && echo "priority: high" || echo "priority: medium")
    
    # Create the issue
    issue_url=$(gh issue create \
        --title "[EPIC] $title" \
        --body "$body" \
        --label "epic,status: $status,$labels,$priority" \
        --milestone "$milestone" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    epic_numbers[$id]=$issue_number
    
    echo -e "${GREEN}✓ Created Epic #$issue_number: $title${NC}"
done

# Create all stories with enhanced details
echo -e "\n${BLUE}Creating Stories...${NC}"

for (( i=0; i<$epic_count; i++ )); do
    epic=$(jq -r ".epics[$i]" "$DATA_FILE")
    epic_id=$(echo "$epic" | jq -r '.id')
    epic_number=${epic_numbers[$epic_id]}
    
    # Determine phase
    epic_num=$(echo "$epic_id" | sed 's/epic//')
    case $epic_num in
        1|4) phase=1 ;;
        2) phase=2 ;;
        3) phase=3 ;;
        5|6|7) phase=4 ;;
        8|9|10) phase=5 ;;
        *) phase=3 ;;
    esac
    
    milestone=$(get_milestone_number $phase)
    
    story_count=$(echo "$epic" | jq '.stories | length')
    
    for (( j=0; j<$story_count; j++ )); do
        story=$(echo "$epic" | jq -r ".stories[$j]")
        
        story_id=$(echo "$story" | jq -r '.id')
        story_title=$(echo "$story" | jq -r '.title')
        story_status=$(echo "$story" | jq -r '.status')
        story_points=$(echo "$story" | jq -r '.points')
        
        # Get size label
        size_label=$(get_size_label $story_points)
        
        # Build story body with DoD
        body="## Epic
Epic: #$epic_number

## Status
$([ "$story_status" = "completed" ] && echo "✅ COMPLETED" || echo "⏳ $story_status")

## Story Points
$story_points points

## Acceptance Criteria
_To be added based on story requirements from /docs/stories/${story_id}.md_

## Technical Tasks
_To be added during sprint planning_

$DOD_TEMPLATE"
        
        echo -e "${YELLOW}Creating Story: [STORY] $story_title${NC}"
        
        # Determine priority based on epic priority and story status
        if [ "$story_status" = "completed" ]; then
            priority="priority: low"
        elif [ $phase -le 3 ]; then
            priority="priority: high"
        else
            priority="priority: medium"
        fi
        
        # Create the issue
        issue_url=$(gh issue create \
            --title "[STORY] $story_title" \
            --body "$body" \
            --label "story,status: $story_status,$size_label,$priority" \
            --milestone "$milestone" \
            --assignee "@me")
        
        issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
        story_numbers[$story_id]=$issue_number
        
        echo -e "${GREEN}✓ Created Story #$issue_number: $story_title${NC}"
    done
done

# Create GitHub Project
echo -e "\n${BLUE}Creating GitHub Project Board...${NC}"

# Create the project using gh CLI
PROJECT_ID=$(gh project create \
    --owner "${REPO%/*}" \
    --title "Holiday Program Aggregator Roadmap" \
    --body "Complete roadmap with epics, stories, and dependencies for the Holiday Program Aggregator platform.

## Overview
This project tracks the development from initial setup through MVP launch and beyond.

## Phases
1. **Foundation** (Weeks 1-2) ✅ - Setup & Security
2. **Core Admin** (Weeks 3-6) - Provider Management
3. **User Experience** (Weeks 7-10) - Search & Discovery
4. **MVP Launch** (Week 11) - Payment Integration
5. **Growth Features** (Weeks 12-22) - Portal, Comms, Analytics
6. **Scale & Optimize** (Weeks 23-30) - Mobile, AI, Advanced

## Key Metrics
- Total Stories: 54
- Completed: $(jq '[.epics[].stories[] | select(.status == "completed")] | length' "$DATA_FILE")
- In Progress: $(jq '[.epics[].stories[] | select(.status == "in_progress")] | length' "$DATA_FILE")
- Total Points: $(jq '[.epics[].stories[].points] | add' "$DATA_FILE")" 2>/dev/null | grep -o '[0-9]\+$' || echo "Project may already exist")

if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓ Created Project #$PROJECT_ID${NC}"
    
    # Add custom fields to the project
    echo -e "\n${BLUE}Configuring project fields...${NC}"
    
    # Note: Custom fields need to be added via the web UI as the API is limited
    echo -e "${YELLOW}Please configure the following custom fields in the project:${NC}"
    echo "1. Status (Single select): Not Started, In Progress, In Review, Blocked, Completed"
    echo "2. Priority (Single select): Critical, High, Medium, Low"
    echo "3. Size (Number): Story points"
    echo "4. Sprint (Iteration): For sprint planning"
    echo "5. Epic (Single select): Link to parent epic"
fi

# Summary
echo -e "\n${GREEN}🎉 GitHub Project Setup Complete!${NC}"
echo -e "\n📊 ${BLUE}Summary:${NC}"
echo "- Created ${#epic_numbers[@]} epics"
echo "- Created ${#story_numbers[@]} stories"
echo "- Total issues: $((${#epic_numbers[@]} + ${#story_numbers[@]}))"
echo "- Labels created: 26"
echo "- Milestones created: 6"

echo -e "\n📋 ${BLUE}Created Issues:${NC}"
echo -e "${YELLOW}Completed Epics:${NC}"
echo "  Epic 1 (Initial Setup): #${epic_numbers[epic1]}"
echo "  Epic 4 (Security & Observability): #${epic_numbers[epic4]}"

echo -e "\n${YELLOW}Next Priority (Phase 2):${NC}"
echo "  Epic 2 (Provider Management): #${epic_numbers[epic2]}"

echo -e "\n${YELLOW}MVP Critical Path:${NC}"
echo "  Epic 2 → Epic 3 → Epic 6"

echo -e "\n📌 ${BLUE}Next Steps:${NC}"
echo "1. Visit: https://github.com/${REPO}/issues"
echo "2. Review all created issues"
echo "3. Add detailed acceptance criteria from /docs/stories/"
echo "4. Visit the project board to organize issues"
echo "5. Set up automation rules for status transitions"
echo "6. Create your first sprint milestone"

echo -e "\n🔗 ${BLUE}Useful Links:${NC}"
echo "- Issues: https://github.com/${REPO}/issues"
echo "- Milestones: https://github.com/${REPO}/milestones"
echo "- Projects: https://github.com/${REPO}/projects"
echo "- Dependency Map: /docs/Specs/dependency-map.md"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"