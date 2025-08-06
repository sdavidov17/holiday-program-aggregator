#!/bin/bash

# BMAD Autonomous Squad - Full Business Method Automation Design Team
# Complete setup for all BMAD agents in tmux

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

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}Error: tmux is not installed. Please install tmux first.${NC}"
    echo "On macOS: brew install tmux"
    echo "On Ubuntu/Debian: sudo apt-get install tmux"
    exit 1
fi

# Session name
SESSION_NAME="bmad-autonomous"

# Kill existing session if it exists
tmux has-session -t $SESSION_NAME 2>/dev/null && tmux kill-session -t $SESSION_NAME

echo -e "${BLUE}🚀 Starting BMAD Autonomous Squad...${NC}"
echo -e "${CYAN}Complete Business Method Automation Design Team${NC}"
echo ""

# Create new tmux session
tmux new-session -d -s $SESSION_NAME -n "bmad-master"

# Window 1: BMAD Master
tmux send-keys -t $SESSION_NAME:bmad-master "clear" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo -e '${GREEN}=== 🧠 BMAD Master ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo ''" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo 'Role: Project orchestrator and knowledge base manager'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo 'Focus: High-level planning, coordination, and decision making'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo ''" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo 'Responsibilities:'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo '  - Coordinate between all agents'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo '  - Maintain project vision and goals'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo '  - Resolve conflicts and make decisions'" C-m
tmux send-keys -t $SESSION_NAME:bmad-master "echo '  - Manage knowledge base and documentation'" C-m

# Window 2: BMAD Orchestrator
tmux new-window -t $SESSION_NAME -n "orchestrator"
tmux send-keys -t $SESSION_NAME:orchestrator "clear" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo -e '${BLUE}=== 🎯 BMAD Orchestrator ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo ''" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo 'Role: Workflow coordinator and task distributor'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo 'Focus: Task assignment, progress tracking, and workflow optimization'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo ''" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo 'Current Workflow:'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo '  - Monitor Epic 1 Story completion'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo '  - Coordinate subscription feature enhancements'" C-m
tmux send-keys -t $SESSION_NAME:orchestrator "echo '  - Track CI/CD pipeline health'" C-m

# Window 3: Product Manager (PM)
tmux new-window -t $SESSION_NAME -n "pm"
tmux send-keys -t $SESSION_NAME:pm "clear" C-m
tmux send-keys -t $SESSION_NAME:pm "echo -e '${PURPLE}=== 📊 Product Manager ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo ''" C-m
tmux send-keys -t $SESSION_NAME:pm "echo 'Role: Product strategy and roadmap management'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo 'Focus: User stories, requirements, and stakeholder communication'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo ''" C-m
tmux send-keys -t $SESSION_NAME:pm "echo 'Current Priorities:'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo '  - Epic 1: User authentication & subscription'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo '  - Epic 2: Provider vetting system'" C-m
tmux send-keys -t $SESSION_NAME:pm "echo '  - Epic 3: Search & discovery features'" C-m

# Window 4: Analyst
tmux new-window -t $SESSION_NAME -n "analyst"
tmux send-keys -t $SESSION_NAME:analyst "clear" C-m
tmux send-keys -t $SESSION_NAME:analyst "echo -e '${YELLOW}=== 🔍 Business Analyst ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:analyst "echo ''" C-m
tmux send-keys -t $SESSION_NAME:analyst "echo 'Role: Requirements analysis and business logic design'" C-m
tmux send-keys -t $SESSION_NAME:analyst "echo 'Focus: User flows, data models, and process optimization'" C-m

# Window 5: Architect
tmux new-window -t $SESSION_NAME -n "architect"
tmux send-keys -t $SESSION_NAME:architect "clear" C-m
tmux send-keys -t $SESSION_NAME:architect "echo -e '${CYAN}=== 🏗️ Solution Architect ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo ''" C-m
tmux send-keys -t $SESSION_NAME:architect "echo 'Role: System design and technical architecture'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo 'Focus: Architecture patterns, technology choices, and scalability'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo ''" C-m
tmux send-keys -t $SESSION_NAME:architect "echo 'Tech Stack:'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo '  - Next.js 15 + React 19'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo '  - tRPC + Prisma + SQLite'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo '  - NextAuth + Stripe'" C-m
tmux send-keys -t $SESSION_NAME:architect "echo '  - Vercel deployment'" C-m

# Window 6: Product Owner (PO)
tmux new-window -t $SESSION_NAME -n "po"
tmux send-keys -t $SESSION_NAME:po "clear" C-m
tmux send-keys -t $SESSION_NAME:po "echo -e '${ORANGE}=== 👤 Product Owner ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:po "echo ''" C-m
tmux send-keys -t $SESSION_NAME:po "echo 'Role: Feature prioritization and acceptance criteria'" C-m
tmux send-keys -t $SESSION_NAME:po "echo 'Focus: User value, MVP definition, and feature validation'" C-m

# Window 7: Scrum Master (SM)
tmux new-window -t $SESSION_NAME -n "sm"
tmux send-keys -t $SESSION_NAME:sm "clear" C-m
tmux send-keys -t $SESSION_NAME:sm "echo -e '${PINK}=== 🏃 Scrum Master ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:sm "echo ''" C-m
tmux send-keys -t $SESSION_NAME:sm "echo 'Role: Agile process facilitation and impediment removal'" C-m
tmux send-keys -t $SESSION_NAME:sm "echo 'Focus: Sprint planning, daily standups, and retrospectives'" C-m

# Window 8: Developer (Dev)
tmux new-window -t $SESSION_NAME -n "dev"
tmux send-keys -t $SESSION_NAME:dev "clear" C-m
tmux send-keys -t $SESSION_NAME:dev "echo -e '${GREEN}=== 💻 Developer ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:dev "echo ''" C-m
tmux send-keys -t $SESSION_NAME:dev "echo 'Role: Implementation and coding'" C-m
tmux send-keys -t $SESSION_NAME:dev "echo 'Focus: Feature development, bug fixes, and code quality'" C-m
tmux send-keys -t $SESSION_NAME:dev "echo ''" C-m
tmux send-keys -t $SESSION_NAME:dev "# Start development server" C-m
tmux send-keys -t $SESSION_NAME:dev "cd $(pwd) && pnpm dev"

# Window 9: QA Engineer
tmux new-window -t $SESSION_NAME -n "qa"
tmux send-keys -t $SESSION_NAME:qa "clear" C-m
tmux send-keys -t $SESSION_NAME:qa "echo -e '${RED}=== 🧪 QA Engineer ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:qa "echo ''" C-m
tmux send-keys -t $SESSION_NAME:qa "echo 'Role: Quality assurance and testing'" C-m
tmux send-keys -t $SESSION_NAME:qa "echo 'Focus: Test planning, execution, and automation'" C-m
tmux send-keys -t $SESSION_NAME:qa "echo ''" C-m
tmux send-keys -t $SESSION_NAME:qa "# Run tests in watch mode" C-m
tmux send-keys -t $SESSION_NAME:qa "cd $(pwd) && pnpm test:watch"

# Window 10: UX Expert
tmux new-window -t $SESSION_NAME -n "ux-expert"
tmux send-keys -t $SESSION_NAME:ux-expert "clear" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo -e '${PURPLE}=== 🎨 UX Expert ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo ''" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo 'Role: User experience design and frontend excellence'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo 'Focus: UI/UX improvements, accessibility, and user delight'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo ''" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo 'Current UX Tasks:'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo '  - Improve subscription page flow'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo '  - Enhance form validation feedback'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo '  - Add micro-interactions'" C-m
tmux send-keys -t $SESSION_NAME:ux-expert "echo '  - Implement responsive design'" C-m

# Create monitoring panes
tmux split-window -t $SESSION_NAME:bmad-master -h -p 40
tmux send-keys -t $SESSION_NAME:bmad-master.1 "# Project status monitor" C-m
tmux send-keys -t $SESSION_NAME:bmad-master.1 "watch -n 10 'echo \"📊 Project Status\"; echo; git log --oneline -5; echo; echo \"📁 Recent Changes:\"; git status -s | head -10'" C-m

tmux split-window -t $SESSION_NAME:dev -v -p 30
tmux send-keys -t $SESSION_NAME:dev.1 "# Server logs" C-m
tmux send-keys -t $SESSION_NAME:dev.1 "tail -f dev.log 2>/dev/null || echo 'Waiting for dev.log...'" C-m

tmux split-window -t $SESSION_NAME:qa -h -p 50
tmux send-keys -t $SESSION_NAME:qa.1 "# CI/CD status" C-m
tmux send-keys -t $SESSION_NAME:qa.1 "gh pr checks 2>/dev/null || echo 'No active PR'" C-m

# Display session info
echo -e "${GREEN}✅ BMAD Autonomous Squad is ready!${NC}"
echo ""
echo -e "${CYAN}Active Agents:${NC}"
echo "  1. 🧠 BMAD Master - Project orchestrator"
echo "  2. 🎯 Orchestrator - Workflow coordinator"
echo "  3. 📊 PM - Product Manager"
echo "  4. 🔍 Analyst - Business Analyst"
echo "  5. 🏗️ Architect - Solution Architect"
echo "  6. 👤 PO - Product Owner"
echo "  7. 🏃 SM - Scrum Master"
echo "  8. 💻 Dev - Developer (with server)"
echo "  9. 🧪 QA - QA Engineer (with tests)"
echo "  10. 🎨 UX - UX Expert"
echo ""
echo -e "${YELLOW}Navigation:${NC}"
echo "  Switch windows: Ctrl+b [0-9]"
echo "  Next/Previous: Ctrl+b n/p"
echo "  List windows: Ctrl+b w"
echo "  Split pane: Ctrl+b % (horizontal) or \" (vertical)"
echo "  Switch panes: Ctrl+b [arrow]"
echo "  Scroll mode: Ctrl+b ["
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  Attach: tmux attach -t $SESSION_NAME"
echo "  Detach: Ctrl+b d"
echo "  Kill: tmux kill-session -t $SESSION_NAME"
echo ""
echo -e "${GREEN}The squad is autonomous and ready to collaborate!${NC}"

# Option to attach immediately
read -p "Attach to session now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tmux attach -t $SESSION_NAME
fi