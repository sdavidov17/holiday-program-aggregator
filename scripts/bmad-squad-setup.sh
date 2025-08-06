#!/bin/bash

# BMAD Squad - Business Method Automation Design Squad
# A specialized team of AI agents for comprehensive development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}Error: tmux is not installed. Please install tmux first.${NC}"
    echo "On macOS: brew install tmux"
    echo "On Ubuntu/Debian: sudo apt-get install tmux"
    exit 1
fi

# Session name
SESSION_NAME="bmad-squad"

# Kill existing session if it exists
tmux has-session -t $SESSION_NAME 2>/dev/null && tmux kill-session -t $SESSION_NAME

echo -e "${BLUE}Starting BMAD Squad...${NC}"
echo -e "${CYAN}Business Method Automation Design Squad${NC}"
echo ""

# Create new tmux session
tmux new-session -d -s $SESSION_NAME -n "coordinator"

# Window 1: Coordinator (Main Development)
tmux send-keys -t $SESSION_NAME:coordinator "clear" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo -e '${GREEN}=== BMAD Squad Coordinator ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo ''" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo 'Role: Orchestrates the team and handles main development tasks'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo 'Focus: Code architecture, API design, and integration'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo ''" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo 'Commands:'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo '  pnpm dev - Start development server'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo '  pnpm test - Run tests'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo '  pnpm lint - Check code quality'" C-m
tmux send-keys -t $SESSION_NAME:coordinator "echo ''" C-m

# Window 2: UX Agent (User Experience & Design)
tmux new-window -t $SESSION_NAME -n "ux-agent"
tmux send-keys -t $SESSION_NAME:ux-agent "clear" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo -e '${PURPLE}=== UX Agent ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo 'Role: User Experience Designer & Frontend Specialist'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo 'Focus: UI/UX improvements, accessibility, and user flows'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo 'Current Tasks:'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  1. Improve subscription page UI/UX'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  2. Create intuitive navigation flows'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  3. Enhance form usability and validation'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  4. Implement responsive design patterns'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  5. Add loading states and error handling'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo 'Tools:'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  - CSS Modules for component styling'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  - Tailwind CSS for utility classes'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  - React hooks for state management'" C-m
tmux send-keys -t $SESSION_NAME:ux-agent "echo '  - Next.js Image for optimized images'" C-m

# Window 3: Backend Agent (API & Database)
tmux new-window -t $SESSION_NAME -n "backend-agent"
tmux send-keys -t $SESSION_NAME:backend-agent "clear" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo -e '${YELLOW}=== Backend Agent ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo 'Role: Backend Developer & Database Architect'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo 'Focus: tRPC endpoints, Prisma schemas, and data flow'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo 'Database Commands:'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo '  pnpm db:push - Push schema changes'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo '  pnpm db:studio - Open Prisma Studio'" C-m
tmux send-keys -t $SESSION_NAME:backend-agent "echo '  pnpm db:migrate - Run migrations'" C-m

# Window 4: QA Agent (Testing & Quality)
tmux new-window -t $SESSION_NAME -n "qa-agent"
tmux send-keys -t $SESSION_NAME:qa-agent "clear" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo -e '${RED}=== QA Agent ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo 'Role: Quality Assurance & Testing Specialist'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo 'Focus: Unit tests, integration tests, and e2e testing'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo 'Testing Commands:'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo '  pnpm test - Run all tests'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo '  pnpm test:watch - Run tests in watch mode'" C-m
tmux send-keys -t $SESSION_NAME:qa-agent "echo '  pnpm e2e - Run end-to-end tests'" C-m

# Window 5: DevOps Agent (Deployment & Monitoring)
tmux new-window -t $SESSION_NAME -n "devops-agent"
tmux send-keys -t $SESSION_NAME:devops-agent "clear" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo -e '${CYAN}=== DevOps Agent ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo 'Role: Deployment & Infrastructure Specialist'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo 'Focus: CI/CD, monitoring, and performance'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo ''" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo 'Deployment Commands:'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo '  pnpm build - Build for production'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo '  vercel - Deploy to Vercel'" C-m
tmux send-keys -t $SESSION_NAME:devops-agent "echo '  pnpm analyze - Analyze bundle size'" C-m

# Create split panes for real-time monitoring
tmux split-window -t $SESSION_NAME:coordinator -h -p 30
tmux send-keys -t $SESSION_NAME:coordinator.1 "# Git status monitor" C-m
tmux send-keys -t $SESSION_NAME:coordinator.1 "watch -n 5 'git status -s'" C-m

tmux split-window -t $SESSION_NAME:ux-agent -h -p 30
tmux send-keys -t $SESSION_NAME:ux-agent.1 "# Dev server logs" C-m
tmux send-keys -t $SESSION_NAME:ux-agent.1 "echo 'Run: pnpm dev'" C-m

# Display session info
echo -e "${GREEN}BMAD Squad is ready!${NC}"
echo ""
echo "Windows:"
echo "  1. Coordinator - Main development and orchestration"
echo "  2. UX Agent - User experience and frontend design"
echo "  3. Backend Agent - API and database development"
echo "  4. QA Agent - Testing and quality assurance"
echo "  5. DevOps Agent - Deployment and monitoring"
echo ""
echo "Navigation:"
echo "  - Switch windows: Ctrl+b [number]"
echo "  - Next window: Ctrl+b n"
echo "  - Previous window: Ctrl+b p"
echo "  - List windows: Ctrl+b w"
echo "  - Split horizontally: Ctrl+b %"
echo "  - Split vertically: Ctrl+b \""
echo "  - Switch panes: Ctrl+b [arrow]"
echo ""
echo -e "${BLUE}To attach to the session:${NC} tmux attach -t $SESSION_NAME"
echo -e "${BLUE}To detach from session:${NC} Ctrl+b d"
echo -e "${BLUE}To kill the session:${NC} tmux kill-session -t $SESSION_NAME"
echo ""

# Attach to the session
tmux attach -t $SESSION_NAME