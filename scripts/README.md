# GitHub Project Management Scripts

This directory contains scripts to set up GitHub Issues and Project boards for the Holiday Program Aggregator.

## Prerequisites

1. Install GitHub CLI:
   ```bash
   brew install gh
   ```

2. Install jq (JSON processor):
   ```bash
   brew install jq
   ```

3. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

4. Make sure you're in the project root directory

## Files

- **github-issues-data.json**: Contains all epic and story data
- **create-github-issues-from-json.sh**: Creates GitHub issues from the JSON data
- **create-github-issues.sh**: Alternative script (partial implementation)

## Usage

1. Review and update the data in `github-issues-data.json` if needed

2. Run the script to create all issues:
   ```bash
   ./scripts/create-github-issues-from-json.sh
   ```

3. The script will:
   - Create all necessary labels
   - Create milestones for project phases
   - Create epic issues with dependencies
   - Create story issues linked to epics
   - Create a project board

## Manual Steps After Running

1. **Link Dependencies**: 
   - Go to each epic and update the dependency links with actual issue numbers
   - Use GitHub's "Development" section to link blocking/blocked issues

2. **Project Board Setup**:
   - Go to your repository's Projects tab
   - Find "Holiday Program Aggregator Roadmap"
   - Add custom fields:
     - Status (Not Started, In Progress, Completed, Blocked)
     - Story Points (Number field)
     - Sprint (Iteration field)
     - Priority (High, Medium, Low)

3. **Add Issues to Board**:
   - Use the project board's "Add items" to bulk add all issues
   - Set up automation rules for status changes

4. **Assign to Milestones**:
   - Assign epics and stories to appropriate milestones
   - Phase 1: Epic 1 & 4 (completed)
   - Phase 2: Epic 2
   - MVP: Epic 2, 3, 6

## Issue Structure

### Epics
- Title format: `[EPIC] Epic Name`
- Labels: `epic`, status label, category labels
- Contains: Goal, dependencies, blocking issues

### Stories  
- Title format: `[STORY] Story Name`
- Labels: `story`, status label
- Contains: Epic link, status, story points, AC placeholder

## Status Labels

- `completed` - Work is done ✅
- `in_progress` - Currently being worked on 🚧
- `not_started` - Not yet begun ⏳
- `deferred` - Postponed to later phase 📅

## Epic Dependencies

See `/docs/Specs/dependency-map.md` for the complete dependency graph and implementation roadmap.

## Customization

To add or modify epics/stories:

1. Edit `github-issues-data.json`
2. Update the epic/story objects
3. Run the script again (it will skip existing labels/milestones)

## Troubleshooting

- **"Label already exists"**: This is normal, the script continues
- **"Not authenticated"**: Run `gh auth login`
- **"Repository not found"**: Make sure you're in the git repository
- **Rate limits**: If you hit API limits, wait a few minutes and try again