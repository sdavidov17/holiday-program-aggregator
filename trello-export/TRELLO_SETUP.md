# Trello Setup Instructions

## Quick Setup (Recommended)

### Option 1: Single Board with Epic/Milestone Labels
1. Create a new Trello board called "Holiday Heroes - Development"
2. Create these lists (columns):
   - Backlog
   - Sprint Planning
   - In Progress
   - In Review
   - Testing
   - Done

3. Create labels for Epics (use colors):
   - Epic 1: Core MVP (green)
   - Epic 2: Provider Experience (blue)
   - Epic 3: Parent Experience (purple)
   - Epic 4: Post-MVP (orange)

4. Create labels for Milestones (use different colors):
   - M1: Foundation (red)
   - M2: Core Features (yellow)
   - M3: Enhanced UX (lime)
   - M4: Scale & Optimize (pink)

5. Import cards from CSV:
   - Use a Chrome extension like "Import for Trello" or "Trello CSV Import"
   - Upload the trello-import.csv file

### Option 2: Multiple Boards by Milestone
Create 4 separate boards, one for each milestone:
- M1: Foundation Sprint
- M2: Core Features Sprint
- M3: Enhanced UX Sprint
- M4: Scale & Optimize Sprint

Each board has the same lists and epic labels.

## Visualization Tips

### To View by Epic:
1. Use Trello's filter feature (press 'F' or click Filter)
2. Select the epic label you want to view
3. Only cards with that epic label will be shown

### To View by Milestone:
1. Use Trello's filter feature
2. Select the milestone label
3. Only cards in that milestone will be shown

### Advanced Organization (Power-Up):
Consider using the free "Custom Fields" Power-Up to add:
- Story Points field
- Priority field
- Sprint field

## Trello Keyboard Shortcuts:
- **F** - Open filter menu
- **Q** - Filter to cards assigned to me
- **L** - Open label picker
- **Space** - Assign/unassign yourself
- **/** - Search cards

## Alternative: GitHub Projects (Free)
If you want to stay within GitHub:
1. Create a new Project (beta) in your repo
2. Use Board view with custom fields
3. Sync automatically with Issues
4. Create views filtered by Epic and Milestone

This keeps everything in one place and auto-syncs with PRs.
