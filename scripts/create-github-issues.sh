#!/bin/bash

# Script to create GitHub issues for all epics and stories
# Requires: gh CLI tool (GitHub CLI)

set -e

echo "🚀 Creating GitHub Issues for Holiday Program Aggregator"
echo "======================================================="

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   Then run: gh auth login"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run from the project root."
    exit 1
fi

# Create labels if they don't exist
echo "📌 Creating labels..."
gh label create epic --description "Major feature or initiative" --color "7057ff" 2>/dev/null || true
gh label create story --description "User story" --color "0969da" 2>/dev/null || true
gh label create completed --description "Work completed" --color "0e8a16" 2>/dev/null || true
gh label create in-progress --description "Currently being worked on" --color "fbca04" 2>/dev/null || true
gh label create blocked --description "Blocked by dependencies" --color "d73a4a" 2>/dev/null || true
gh label create security --description "Security-related" --color "d73a4a" 2>/dev/null || true
gh label create infrastructure --description "Infrastructure and DevOps" --color "c5def5" 2>/dev/null || true
gh label create frontend --description "Frontend development" --color "bfd4f2" 2>/dev/null || true
gh label create backend --description "Backend development" --color "d4c5f9" 2>/dev/null || true
gh label create database --description "Database-related" --color "5319e7" 2>/dev/null || true

# Array to store issue numbers for dependency linking
declare -A issue_map

# Function to create an epic
create_epic() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local key="$4"
    
    echo "Creating Epic: $title"
    
    issue_number=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "epic,$labels" \
        --assignee "@me" \
        | grep -o '[0-9]\+$')
    
    issue_map["$key"]=$issue_number
    echo "✅ Created Epic #$issue_number"
}

# Function to create a story
create_story() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local epic_key="$4"
    local key="$5"
    
    echo "Creating Story: $title"
    
    # Add epic reference to body
    local epic_number=${issue_map["$epic_key"]}
    body="Epic: #$epic_number

$body"
    
    issue_number=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "story,$labels" \
        --assignee "@me" \
        | grep -o '[0-9]\+$')
    
    issue_map["$key"]=$issue_number
    echo "✅ Created Story #$issue_number"
}

# Create Epic 1: Initial Project Setup
echo ""
echo "📋 Creating Epic 1: Initial Project Setup"
create_epic \
    "[EPIC] Initial Project Setup & Infrastructure" \
    "## Epic Goal
Set up the foundational infrastructure, development environment, and deployment pipeline for the Holiday Program Aggregator platform.

## Status
✅ COMPLETED

## Completed Stories
- [x] Story 1.1: Repository & Development Environment Setup
- [x] Story 1.2: CI/CD Pipeline Configuration
- [x] Story 1.3: Database Schema & Initial Models
- [x] Story 1.4: Deployment Infrastructure

## Dependencies
- None (this is the foundational epic)

## Technical Stack
- Next.js 13.4.19 (T3 Stack)
- TypeScript
- Prisma with PostgreSQL
- tRPC
- Tailwind CSS
- Vercel deployment" \
    "completed,infrastructure" \
    "epic1"

# Epic 1 Stories
create_story \
    "[STORY] Repository & Development Environment Setup" \
    "## User Story
**As a** developer  
**I want** a properly configured repository and development environment  
**So that** the team can efficiently develop and collaborate on the project

## Status: ✅ COMPLETED

## Completed Tasks
- [x] Initialize T3 Stack with TypeScript
- [x] Configure Turborepo for monorepo structure
- [x] Set up ESLint and Prettier
- [x] Configure Git hooks with Husky
- [x] Create project documentation structure
- [x] Set up environment variables
- [x] Configure VS Code settings" \
    "completed,infrastructure" \
    "epic1" \
    "story1-1"

# Create Epic 2: Provider Management System
echo ""
echo "📋 Creating Epic 2: Provider Management System"
create_epic \
    "[EPIC] Provider Management System" \
    "## Epic Goal
Build a comprehensive provider management system that enables admins to efficiently onboard, manage, and maintain holiday program provider information with robust vetting capabilities.

## Business Value
- Ensure quality and safety through systematic provider vetting
- Streamline provider onboarding process
- Maintain accurate, up-to-date provider information
- Enable efficient provider discovery for parents

## User Stories
- [ ] Story 2.1: Provider Data Model & Database Schema
- [ ] Story 2.2: Admin Provider CRUD Interface
- [ ] Story 2.3: Provider Vetting Workflow
- [ ] Story 2.4: Bulk Import/Export Functionality
- [ ] Story 2.5: Provider Profile Media Management

## Dependencies
- Depends on: Epic 1 (Initial Setup) ✅
- Blocks: Epic 3 (Search & Discovery), Epic 5 (Provider Portal)

## Technical Considerations
- Implement comprehensive data validation
- Design for scalability (potentially thousands of providers)
- Include audit logging for all provider changes
- Support for provider status workflow
- Geospatial data handling for location-based features" \
    "backend,database" \
    "epic2"

# Continue with all other epics and stories...
# (This is a sample - the full script would be much longer)

echo ""
echo "🎉 GitHub Issues creation complete!"
echo ""
echo "📊 Summary:"
echo "- Created ${#issue_map[@]} issues"
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository to view all issues"
echo "2. Create a GitHub Project board to organize them"
echo "3. Set up milestones for release planning"
echo "4. Link dependencies manually where needed"