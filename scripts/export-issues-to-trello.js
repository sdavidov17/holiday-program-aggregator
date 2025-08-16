#!/usr/bin/env node

/**
 * Export GitHub Issues to Trello-compatible format
 * This script extracts issues, epics, and milestones for import to Trello
 */

const fs = require('node:fs');
const path = require('node:path');

// Configure logging based on environment
const isVerbose = process.env.VERBOSE === 'true' || process.argv.includes('--verbose');
const isSilent = process.env.SILENT === 'true' || process.argv.includes('--silent');

const log = {
  info: (...args) => !isSilent && console.log(...args),
  error: (...args) => console.error(...args), // Always show errors
  verbose: (...args) => isVerbose && console.log(...args)
};

// Trello Board Structure Recommendation
const TRELLO_STRUCTURE = {
  // Option 1: Epic-based Board Structure
  epicBasedBoard: {
    name: "Holiday Heroes - Development",
    lists: [
      "Backlog",
      "Sprint Planning",
      "In Progress", 
      "In Review",
      "Testing",
      "Done"
    ],
    labels: [
      { name: "Epic 1: Core MVP", color: "green" },
      { name: "Epic 2: Provider Exp", color: "blue" },
      { name: "Epic 3: Parent Exp", color: "purple" },
      { name: "Epic 4: Post-MVP", color: "orange" },
      { name: "M1: Foundation", color: "red" },
      { name: "M2: Core Features", color: "yellow" },
      { name: "M3: Enhanced UX", color: "lime" },
      { name: "M4: Scale & Optimize", color: "pink" },
      { name: "Bug", color: "red" },
      { name: "Enhancement", color: "sky" }
    ]
  },

  // Option 2: Milestone-based Board Structure  
  milestoneBasedBoards: [
    {
      name: "M1: Foundation Sprint",
      lists: ["Backlog", "In Progress", "Review", "Done"],
      description: "Database, Auth, Provider Management"
    },
    {
      name: "M2: Core Features Sprint", 
      lists: ["Backlog", "In Progress", "Review", "Done"],
      description: "Search, Booking, Payments"
    },
    {
      name: "M3: Enhanced UX Sprint",
      lists: ["Backlog", "In Progress", "Review", "Done"],
      description: "Notifications, Admin, Monitoring"
    },
    {
      name: "M4: Scale & Optimize Sprint",
      lists: ["Backlog", "In Progress", "Review", "Done"],
      description: "Performance, Testing, Production"
    }
  ]
};

// Read all story documents
function readStoryDocuments() {
  const storiesDir = path.join(__dirname, '../docs/stories');
  const stories = [];
  
  try {
    // Check if directory exists first
    if (!fs.existsSync(storiesDir)) {
      log.error(`Stories directory not found: ${storiesDir}`);
      return stories;
    }
    
    const files = fs.readdirSync(storiesDir);
    
    files.forEach(file => {
      if (file.endsWith('.md')) {
        try {
          const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');
          const story = parseStoryDocument(file, content);
          stories.push(story);
        } catch (fileError) {
          log.error(`Error reading file ${file}:`, fileError.message);
          // Continue processing other files
        }
      }
    });
  } catch (error) {
    log.error('Error accessing stories directory:', error.message);
    process.exit(1); // Exit with error code if can't read directory
  }
  
  return stories;
}

// Parse story document to extract key information
function parseStoryDocument(filename, content) {
  const story = {
    filename,
    title: '',
    epic: '',
    milestone: '',
    description: '',
    acceptanceCriteria: [],
    effort: '',
    priority: '',
    dependencies: []
  };
  
  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) story.title = titleMatch[1];
  
  // Extract epic
  const epicMatch = filename.match(/epic-(\d+)/);
  if (epicMatch) story.epic = `Epic ${epicMatch[1]}`;
  
  // Extract milestone - try multiple patterns
  const milestonePatterns = [
    /Milestone\s+(\d+):/i,                    // "Milestone 2:" or "Milestone 3:"
    /Milestone:\s*(\d+)/i,                     // "Milestone: 2"
    /###?\s*Milestone\s+(\d+)/i,              // "### Milestone 2"
    /Sprint\/Milestone[\s\S]*?Milestone\s+(\d+)/i  // "Sprint/Milestone\nMilestone 2"
  ];
  
  for (const pattern of milestonePatterns) {
    const match = content.match(pattern);
    if (match) {
      // Map milestone numbers to descriptive names
      const milestoneMap = {
        '1': 'M1: Foundation',
        '2': 'M2: Core Features', 
        '3': 'M3: Enhanced UX',
        '4': 'M4: Scale & Optimize'
      };
      story.milestone = milestoneMap[match[1]] || `M${match[1]}`;
      break;
    }
  }
  
  // Extract description (first paragraph after title)
  const descMatch = content.match(/^#\s+.+\n\n(.+?)(?:\n\n|$)/m);
  if (descMatch) story.description = descMatch[1];
  
  // Extract acceptance criteria
  const acMatch = content.match(/##\s*Acceptance Criteria\n([\s\S]*?)(?:\n##|$)/);
  if (acMatch) {
    const criteria = acMatch[1].match(/^\s*[-*]\s+.+$/gm);
    if (criteria) {
      story.acceptanceCriteria = criteria.map(c => c.replace(/^\s*[-*]\s+/, ''));
    }
  }
  
  // Extract effort
  const effortMatch = content.match(/Effort:\s*(\d+)\s*story points/i);
  if (effortMatch) story.effort = effortMatch[1] + ' points';
  
  // Extract priority  
  const priorityMatch = content.match(/Priority:\s*(High|Medium|Low)/i);
  if (priorityMatch) story.priority = priorityMatch[1];
  
  return story;
}

// Generate Trello card format
function generateTrelloCard(story) {
  const card = {
    name: story.title,
    desc: `${story.description}\n\n**File:** ${story.filename}\n**Effort:** ${story.effort}\n**Priority:** ${story.priority}`,
    labels: [],
    checklist: []
  };
  
  // Add epic label
  if (story.epic) {
    card.labels.push(story.epic);
  }
  
  // Add milestone label
  if (story.milestone) {
    card.labels.push(story.milestone);
  }
  
  // Add acceptance criteria as checklist items
  if (story.acceptanceCriteria.length > 0) {
    card.checklist = {
      name: "Acceptance Criteria",
      items: story.acceptanceCriteria
    };
  }
  
  return card;
}

// Generate CSV for Trello import
function generateTrelloCSV(stories) {
  const timestamp = new Date().toISOString();
  const csvHeader = `# Generated on: ${timestamp}\n# Total stories: ${stories.length}\n`;
  
  const headers = ['Card Name', 'Card Description', 'Labels', 'List Name', 'Checklist Items'];
  const rows = [headers];
  
  stories.forEach(story => {
    const card = generateTrelloCard(story);
    const row = [
      card.name,
      card.desc,
      card.labels.join(','),
      'Backlog', // Default list
      card.checklist.items ? card.checklist.items.join('; ') : ''
    ];
    rows.push(row);
  });
  
  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  return csvHeader + csvContent;
}

// Generate JSON for manual import or API
function generateTrelloJSON(stories) {
  const timestamp = new Date().toISOString();
  const board = {
    name: "Holiday Heroes - Project Management",
    desc: "Complete project tracking with Epics and Milestones",
    generatedAt: timestamp,
    totalStories: stories.length,
    lists: TRELLO_STRUCTURE.epicBasedBoard.lists.map(name => ({ name })),
    labels: TRELLO_STRUCTURE.epicBasedBoard.labels,
    cards: stories.map(story => {
      const card = generateTrelloCard(story);
      return {
        ...card,
        list: "Backlog"
      };
    })
  };
  
  return JSON.stringify(board, null, 2);
}

// Generate markdown summary for verification
function generateSummary(stories) {
  const timestamp = new Date().toISOString();
  const epicGroups = {};
  const milestoneGroups = {};
  
  stories.forEach(story => {
    // Group by epic
    if (!epicGroups[story.epic]) epicGroups[story.epic] = [];
    epicGroups[story.epic].push(story);
    
    // Group by milestone
    if (!milestoneGroups[story.milestone]) milestoneGroups[story.milestone] = [];
    milestoneGroups[story.milestone].push(story);
  });
  
  let summary = `# Project Structure Summary\n\n`;
  summary += `_Generated on: ${timestamp}_\n`;
  summary += `_Total stories: ${stories.length}_\n\n`;
  
  summary += '## Stories by Epic\n\n';
  Object.keys(epicGroups).sort().forEach(epic => {
    summary += `### ${epic || 'Unassigned'}\n`;
    epicGroups[epic].forEach(story => {
      summary += `- ${story.title} (${story.milestone})\n`;
    });
    summary += '\n';
  });
  
  summary += '## Stories by Milestone\n\n';
  Object.keys(milestoneGroups).sort().forEach(milestone => {
    summary += `### ${milestone || 'Unassigned'}\n`;
    milestoneGroups[milestone].forEach(story => {
      summary += `- ${story.title} (${story.epic})\n`;
    });
    summary += '\n';
  });
  
  return summary;
}

// Main execution
function main() {
  log.info('📋 Reading story documents...');
  const stories = readStoryDocuments();
  log.info(`✅ Found ${stories.length} stories\n`);
  
  // Generate outputs
  const outputDir = path.join(__dirname, '../trello-export');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate CSV for Trello import
  log.info('📝 Generating Trello CSV...');
  const csv = generateTrelloCSV(stories);
  fs.writeFileSync(path.join(outputDir, 'trello-import.csv'), csv);
  log.info('✅ Created: trello-import.csv');
  
  // Generate JSON for API import
  log.info('📝 Generating Trello JSON...');
  const json = generateTrelloJSON(stories);
  fs.writeFileSync(path.join(outputDir, 'trello-board.json'), json);
  log.info('✅ Created: trello-board.json');
  
  // Generate summary
  log.info('📝 Generating summary...');
  const summary = generateSummary(stories);
  fs.writeFileSync(path.join(outputDir, 'project-summary.md'), summary);
  log.info('✅ Created: project-summary.md');
  
  // Generate Trello setup instructions
  const instructions = `# Trello Setup Instructions

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
`;
  
  fs.writeFileSync(path.join(outputDir, 'TRELLO_SETUP.md'), instructions);
  log.info('✅ Created: TRELLO_SETUP.md\n');
  
  log.info('📊 Summary:');
  log.info(`- Total Stories: ${stories.length}`);
  log.info(`- Output directory: ${outputDir}`);
  log.info('\n✨ Export complete! Check the trello-export directory for files.');
  
  // Verbose output
  log.verbose('\nDetailed breakdown:');
  log.verbose(`- Files processed: ${stories.filter(s => s.title).length}`);
  log.verbose(`- Stories with milestones: ${stories.filter(s => s.milestone).length}`);
  log.verbose(`- Stories with epics: ${stories.filter(s => s.epic).length}`);
}

// Run the script
main();