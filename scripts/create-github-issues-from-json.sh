#!/bin/bash

# Script to create GitHub issues from JSON data
# Requires: gh CLI tool and jq

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_FILE="$SCRIPT_DIR/github-issues-data.json"

echo "🚀 Creating GitHub Issues for Holiday Program Aggregator"
echo "======================================================="

# Check requirements
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   Then run: gh auth login"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first:"
    echo "   brew install jq"
    exit 1
fi

if [ ! -f "$DATA_FILE" ]; then
    echo "❌ Data file not found: $DATA_FILE"
    exit 1
fi

# Create labels
echo "📌 Creating labels..."
gh label create epic --description "Major feature or initiative" --color "7057ff" 2>/dev/null || true
gh label create story --description "User story" --color "0969da" 2>/dev/null || true
gh label create completed --description "Work completed" --color "0e8a16" 2>/dev/null || true
gh label create not_started --description "Not yet started" --color "ffffff" 2>/dev/null || true
gh label create in_progress --description "Currently being worked on" --color "fbca04" 2>/dev/null || true
gh label create deferred --description "Deferred to later phase" --color "c5def5" 2>/dev/null || true
gh label create security --description "Security-related" --color "d73a4a" 2>/dev/null || true
gh label create infrastructure --description "Infrastructure and DevOps" --color "c5def5" 2>/dev/null || true
gh label create frontend --description "Frontend development" --color "bfd4f2" 2>/dev/null || true
gh label create backend --description "Backend development" --color "d4c5f9" 2>/dev/null || true
gh label create database --description "Database-related" --color "5319e7" 2>/dev/null || true

# Create milestones
echo "🎯 Creating milestones..."
gh api repos/{owner}/{repo}/milestones --method POST \
    -f title="Phase 1: Foundation" \
    -f description="Initial setup and security" \
    -f due_on="2025-02-15T00:00:00Z" 2>/dev/null || true

gh api repos/{owner}/{repo}/milestones --method POST \
    -f title="Phase 2: Core Admin" \
    -f description="Provider management system" \
    -f due_on="2025-03-15T00:00:00Z" 2>/dev/null || true

gh api repos/{owner}/{repo}/milestones --method POST \
    -f title="MVP Launch" \
    -f description="Minimum viable product" \
    -f due_on="2025-05-01T00:00:00Z" 2>/dev/null || true

# Arrays to track created issues
declare -A epic_numbers
declare -A story_numbers

# Create all epics first
echo ""
echo "📋 Creating Epics..."
epic_count=$(jq '.epics | length' "$DATA_FILE")

for (( i=0; i<$epic_count; i++ )); do
    epic=$(jq -r ".epics[$i]" "$DATA_FILE")
    
    id=$(echo "$epic" | jq -r '.id')
    title=$(echo "$epic" | jq -r '.title')
    status=$(echo "$epic" | jq -r '.status')
    description=$(echo "$epic" | jq -r '.description')
    labels=$(echo "$epic" | jq -r '.labels | join(",")')
    
    # Build epic body
    body="## Epic Goal
$description

## Status
$([ "$status" = "completed" ] && echo "✅ COMPLETED" || echo "⏳ $status")

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
    
    echo "Creating Epic: [EPIC] $title"
    
    # Create the issue
    issue_url=$(gh issue create \
        --title "[EPIC] $title" \
        --body "$body" \
        --label "epic,$status,$labels" \
        --assignee "@me")
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
    epic_numbers[$id]=$issue_number
    
    echo "✅ Created Epic #$issue_number: $title"
done

# Create all stories
echo ""
echo "📝 Creating Stories..."

for (( i=0; i<$epic_count; i++ )); do
    epic=$(jq -r ".epics[$i]" "$DATA_FILE")
    epic_id=$(echo "$epic" | jq -r '.id')
    epic_number=${epic_numbers[$epic_id]}
    
    story_count=$(echo "$epic" | jq '.stories | length')
    
    for (( j=0; j<$story_count; j++ )); do
        story=$(echo "$epic" | jq -r ".stories[$j]")
        
        story_id=$(echo "$story" | jq -r '.id')
        story_title=$(echo "$story" | jq -r '.title')
        story_status=$(echo "$story" | jq -r '.status')
        story_points=$(echo "$story" | jq -r '.points')
        
        # Build story body
        body="## Epic
Epic: #$epic_number

## Status
$([ "$story_status" = "completed" ] && echo "✅ COMPLETED" || echo "⏳ $story_status")

## Story Points
$story_points points

## Acceptance Criteria
_To be added based on story requirements_

## Technical Tasks
_To be added during sprint planning_

## Definition of Done
- [ ] Code complete and follows standards
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging"
        
        echo "Creating Story: [STORY] $story_title"
        
        # Create the issue
        issue_url=$(gh issue create \
            --title "[STORY] $story_title" \
            --body "$body" \
            --label "story,$story_status" \
            --assignee "@me")
        
        issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
        story_numbers[$story_id]=$issue_number
        
        echo "✅ Created Story #$issue_number: $story_title"
    done
done

# Create project board
echo ""
echo "📊 Creating GitHub Project Board..."
project_url=$(gh project create \
    --title "Holiday Program Aggregator Roadmap" \
    --body "Epic and story tracking for the Holiday Program Aggregator platform" \
    2>/dev/null || echo "Project may already exist")

echo ""
echo "🎉 GitHub Issues creation complete!"
echo ""
echo "📊 Summary:"
echo "- Created ${#epic_numbers[@]} epics"
echo "- Created ${#story_numbers[@]} stories"
echo "- Total issues: $((${#epic_numbers[@]} + ${#story_numbers[@]}))"
echo ""
echo "📋 Created Issues:"
echo "Epics:"
for id in "${!epic_numbers[@]}"; do
    echo "  $id: #${epic_numbers[$id]}"
done
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository to view all issues"
echo "2. Add issues to the project board"
echo "3. Link dependencies between issues"
echo "4. Add detailed acceptance criteria to stories"
echo "5. Assign stories to milestones"