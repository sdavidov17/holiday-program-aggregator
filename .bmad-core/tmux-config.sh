#!/bin/bash
# BMAD Squad TMUX Configuration for Claude Code

# Colors for different agents
COLOR_ORCHESTRATOR="#FF6B6B"
COLOR_ANALYST="#4ECDC4"
COLOR_PM="#F39C12"
COLOR_ARCHITECT="#45B7D1"
COLOR_SM="#27AE60"
COLOR_DEV="#96CEB4"
COLOR_QA="#FECA57"
COLOR_DEVOPS="#A55EEA"
COLOR_SECURITY="#FD79A8"

# Create BMAD Squad session
start_bmad_squad() {
    SESSION_NAME="bmad-squad"
    
    # Kill existing session if it exists
    tmux kill-session -t $SESSION_NAME 2>/dev/null
    
    # Create new session with orchestrator
    tmux new-session -d -s $SESSION_NAME -n orchestrator
    tmux send-keys -t $SESSION_NAME:orchestrator "echo 'BMAD Orchestrator Ready'" Enter
    tmux send-keys -t $SESSION_NAME:orchestrator "echo 'Coordinating: analyst, pm, architect, sm, dev, qa, devops, security'" Enter
    
    # Create analyst window
    tmux new-window -t $SESSION_NAME -n analyst
    tmux send-keys -t $SESSION_NAME:analyst "echo 'Analyst Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:analyst "echo 'Focus: Market research, requirements analysis, competitor analysis'" Enter
    
    # Create PM window
    tmux new-window -t $SESSION_NAME -n pm
    tmux send-keys -t $SESSION_NAME:pm "echo 'Product Manager Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:pm "echo 'Focus: Product strategy, roadmap, requirements prioritization'" Enter
    
    # Create architect window
    tmux new-window -t $SESSION_NAME -n architect
    tmux send-keys -t $SESSION_NAME:architect "echo 'Architect Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:architect "echo 'Focus: System design, technical architecture, patterns'" Enter
    
    # Create SM window
    tmux new-window -t $SESSION_NAME -n sm
    tmux send-keys -t $SESSION_NAME:sm "echo 'Scrum Master Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:sm "echo 'Focus: Sprint planning, agile processes, team coordination'" Enter
    
    # Create dev window
    tmux new-window -t $SESSION_NAME -n dev
    tmux send-keys -t $SESSION_NAME:dev "echo 'Developer Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:dev "echo 'Focus: Implementation, coding, debugging, refactoring'" Enter
    
    # Create QA window
    tmux new-window -t $SESSION_NAME -n qa
    tmux send-keys -t $SESSION_NAME:qa "echo 'QA Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:qa "echo 'Focus: Testing, quality assurance, test automation'" Enter
    
    # Create DevOps window
    tmux new-window -t $SESSION_NAME -n devops
    tmux send-keys -t $SESSION_NAME:devops "echo 'DevOps Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:devops "echo 'Focus: Infrastructure, CI/CD, deployment, monitoring'" Enter
    
    # Create Security window
    tmux new-window -t $SESSION_NAME -n security
    tmux send-keys -t $SESSION_NAME:security "echo 'Security Agent Ready'" Enter
    tmux send-keys -t $SESSION_NAME:security "echo 'Focus: Security, compliance, vulnerability management'" Enter
    
    # Switch back to orchestrator
    tmux select-window -t $SESSION_NAME:orchestrator
    
    echo "BMAD Squad session created: $SESSION_NAME"
    echo "To attach: tmux attach -t $SESSION_NAME"
    echo ""
    echo "Window numbers:"
    echo "  0: orchestrator (coordinator)"
    echo "  1: analyst (market research)"
    echo "  2: pm (product management)"
    echo "  3: architect (system design)"
    echo "  4: sm (scrum master)"
    echo "  5: dev (development)"
    echo "  6: qa (quality assurance)"
    echo "  7: devops (infrastructure)"
    echo "  8: security (security)"
    echo ""
    echo "Navigate: Ctrl+B then window number (0-8)"
    echo "Window list: Ctrl+B w"
    echo "Detach: Ctrl+B d"
}

# List BMAD agents
list_agents() {
    echo "=== BMAD Core Agents ==="
    echo "1. analyst - Market research and analysis"
    echo "2. pm - Product management and strategy"
    echo "3. architect - System architecture and design"
    echo "4. sm - Scrum master and agile processes"
    echo "5. dev - Software development"
    echo "6. qa - Quality assurance and testing"
    echo "7. po - Product owner"
    echo "8. ux-expert - UX/UI design"
    echo ""
    echo "=== Expansion Pack Agents ==="
    echo "9. infra-devops-platform - DevOps/SRE (from bmad-infrastructure-devops)"
    echo "10. security - Security engineering (from security pack)"
    echo ""
    echo "Note: PO and UX-Expert are available but not included in default tmux session"
}

# Execute command based on argument
case "$1" in
    "start")
        start_bmad_squad
        ;;
    "list")
        list_agents
        ;;
    *)
        echo "Usage: $0 {start|list}"
        echo "  start - Start BMAD Squad tmux session"
        echo "  list  - List available agents"
        ;;
esac