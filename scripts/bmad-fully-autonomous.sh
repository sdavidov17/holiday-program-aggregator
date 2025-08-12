#!/bin/bash

# BMAD Fully Autonomous Squad - Claude Code Subagent Orchestration
# Implements parallel and sequential task execution using Claude Code subagents

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
PINK='\033[1;35m'
NC='\033[0m' # No Color

PROJECT_DIR=$(pwd)

echo -e "${BLUE}🚀 Starting BMAD Fully Autonomous Squad with Claude Code Subagents...${NC}"
echo -e "${CYAN}Orchestrating AI-driven development through Claude Code's Task tool${NC}"
echo ""

# Create communication infrastructure
echo -e "${YELLOW}Setting up communication infrastructure...${NC}"
mkdir -p .bmad-squad/{inbox,outbox,shared,workflows}
mkdir -p .bmad-squad/shared/{tasks,status,artifacts,stories}
mkdir -p .bmad-squad/workflows/{active,completed,failed}
mkdir -p .bmad-squad/logs

# Initialize status file
cat > .bmad-squad/shared/status/squad-status.json << EOF
{
  "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "orchestration": "claude-code-subagents",
  "agents": {
    "master": {"type": "general-purpose", "status": "ready"},
    "pm": {"type": "general-purpose", "status": "ready"},
    "analyst": {"type": "general-purpose", "status": "ready"},
    "architect": {"type": "general-purpose", "status": "ready"},
    "po": {"type": "general-purpose", "status": "ready"},
    "sm": {"type": "general-purpose", "status": "ready"},
    "dev-frontend": {"type": "general-purpose", "status": "ready"},
    "dev-backend": {"type": "general-purpose", "status": "ready"},
    "qa": {"type": "general-purpose", "status": "ready"},
    "ux": {"type": "general-purpose", "status": "ready"},
    "devops": {"type": "general-purpose", "status": "ready"}
  },
  "workflows": {
    "active": 0,
    "completed": 0,
    "failed": 0
  }
}
EOF

# Create agent task descriptions
cat > .bmad-squad/shared/tasks/agent-descriptions.md << 'EOF'
# BMAD Squad Agent Descriptions

## Master Orchestrator
Coordinates the entire BMAD squad, monitors workflows, and ensures tasks flow through the correct sequence.

## Product Manager (PM)
- Analyzes epics and requirements
- Creates user stories with acceptance criteria
- Maintains product backlog
- Syncs with GitHub issues

## Business Analyst
- Performs detailed requirement analysis
- Creates functional specifications
- Documents business rules
- Validates acceptance criteria

## Solution Architect
- Designs technical architecture
- Reviews and updates architecture documentation
- Ensures scalability and best practices
- Creates technical design documents

## Product Owner (PO)
- Validates stories against business value
- Approves acceptance criteria
- Prioritizes backlog items
- Ensures alignment with business goals

## Scrum Master (SM)
- Creates and manages sprint stories
- Facilitates workflow transitions
- Removes blockers
- Ensures agile practices

## Frontend Developer
- Implements UI components
- Ensures responsive design
- Runs frontend tests
- Maintains code quality

## Backend Developer
- Implements API endpoints
- Manages database operations
- Ensures security best practices
- Optimizes performance

## QA Engineer
- Runs unit and integration tests
- Performs E2E testing
- Reports test results
- Ensures quality standards

## UX Expert
- Reviews UI/UX implementations
- Ensures design consistency
- Performs usability analysis
- Suggests improvements

## DevOps Engineer
- Manages CI/CD pipelines
- Monitors deployments
- Ensures infrastructure health
- Handles production issues
EOF

# Create workflow configuration
cat > .bmad-squad/shared/workflows/workflow-config.json << 'EOF'
{
  "stages": [
    {
      "name": "planning",
      "agents": ["pm", "analyst"],
      "parallel": false,
      "next": "architecture"
    },
    {
      "name": "architecture",
      "agents": ["architect"],
      "parallel": false,
      "next": "story-creation"
    },
    {
      "name": "story-creation",
      "agents": ["sm", "po"],
      "parallel": true,
      "next": "development"
    },
    {
      "name": "development",
      "agents": ["dev-frontend", "dev-backend", "ux"],
      "parallel": true,
      "next": "testing"
    },
    {
      "name": "testing",
      "agents": ["qa"],
      "parallel": false,
      "next": "deployment"
    },
    {
      "name": "deployment",
      "agents": ["devops"],
      "parallel": false,
      "next": "complete"
    }
  ]
}
EOF

# Create initial epic for testing
cat > .bmad-squad/workflows/active/test-epic.json << EOF
{
  "id": "epic-001",
  "title": "Authentication and Subscription System",
  "stage": "planning",
  "status": "active",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "description": "Implement complete authentication flow with subscription management",
  "tasks": []
}
EOF

echo -e "${GREEN}✅ BMAD Squad infrastructure created!${NC}"
echo ""
echo -e "${CYAN}System Features:${NC}"
echo "  ✓ Claude Code subagent orchestration ready"
echo "  ✓ Workflow configuration established"
echo "  ✓ Communication system initialized"
echo "  ✓ Test epic created for processing"
echo ""
echo -e "${YELLOW}Active Agents (Claude Code Subagents):${NC}"
echo "  1. 🧠 Master Orchestrator"
echo "  2. 📊 Product Manager"
echo "  3. 🔍 Business Analyst"
echo "  4. 🏗️ Solution Architect"
echo "  5. 👤 Product Owner"
echo "  6. 🏃 Scrum Master"
echo "  7. 💻 Frontend Developer"
echo "  8. ⚙️ Backend Developer"
echo "  9. 🧪 QA Engineer"
echo "  10. 🎨 UX Expert"
echo "  11. 🔧 DevOps Engineer"
echo ""
echo -e "${PURPLE}Workflow Stages:${NC}"
echo "  Planning → Architecture → Story Creation → Development → Testing → Deployment"
echo ""
echo -e "${GREEN}Communication Structure:${NC}"
echo "  📁 .bmad-squad/"
echo "    ├── shared/tasks/    (agent descriptions)"
echo "    ├── shared/status/   (squad status)"
echo "    ├── workflows/       (active workflows)"
echo "    └── logs/           (activity logs)"
echo ""
echo -e "${BLUE}Instructions for Claude Code:${NC}"
echo "To start the autonomous squad, use Claude Code's Task tool to:"
echo ""
echo "1. Launch the Master Orchestrator agent:"
echo "   - Use subagent_type: 'general-purpose'"
echo "   - Task: Monitor .bmad-squad/workflows/active/ for epics and coordinate agents"
echo ""
echo "2. For each workflow stage, launch appropriate agents:"
echo "   - Check workflow-config.json for stage requirements"
echo "   - Launch agents in parallel when specified"
echo "   - Pass epic context between agents"
echo ""
echo "3. Agents should:"
echo "   - Read their tasks from agent-descriptions.md"
echo "   - Process epics according to their role"
echo "   - Update workflow status in squad-status.json"
echo "   - Pass results to next stage agents"
echo ""
echo -e "${YELLOW}Example Claude Code Task invocation:${NC}"
echo 'claude code --task "Launch BMAD Master Orchestrator to process epic-001 in .bmad-squad/workflows/active/"'
echo ""
echo -e "${GREEN}Ready to launch autonomous squad with Claude Code!${NC}"
echo "The squad will use Claude Code's native Task tool for agent orchestration."
echo "No tmux required - all coordination happens through Claude Code subagents."