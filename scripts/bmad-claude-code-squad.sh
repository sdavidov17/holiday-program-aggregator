#!/bin/bash

# BMAD Squad with Claude Code Subagents
# Breakthrough Method of Agile AI-Driven Development
# (Foundations in Agentic Agile Driven Development)
# This script sets up a BMAD squad using Claude Code's built-in subagent system

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BMAD Squad with Claude Code Subagents${NC}"
echo -e "${GREEN}Breakthrough Method of Agile AI-Driven Development${NC}"
echo -e "${CYAN}Using Claude Code's built-in Task tool for agent orchestration${NC}"
echo ""

echo -e "${GREEN}Squad Configuration:${NC}"
echo ""
echo "The BMAD squad uses Claude Code's subagent system with the Task tool."
echo "Instead of tmux sessions, we leverage Claude's built-in agent types:"
echo ""
echo "  • general-purpose: For complex multi-step tasks and research"
echo "  • statusline-setup: For configuration tasks"
echo ""

echo -e "${YELLOW}Squad Roles Mapping:${NC}"
echo ""
echo "1. 🧠 BMAD Master → Main Claude Code instance (orchestrator)"
echo "2. 🎯 Task Orchestrator → Task tool with general-purpose agent"
echo "3. 📊 Product Manager → Task tool for requirements analysis"
echo "4. 🔍 Business Analyst → Task tool for research and analysis"
echo "5. 🏗️ Solution Architect → Task tool for architecture decisions"
echo "6. 💻 Developer → Direct Claude Code implementation"
echo "7. 🧪 QA Engineer → Task tool for test planning and execution"
echo "8. 🎨 UX Expert → Task tool for UX research and design"
echo "9. 🔧 DevOps → Task tool for infrastructure tasks"
echo ""

echo -e "${CYAN}How to Use:${NC}"
echo ""
echo "1. In Claude Code, use the Task tool to delegate work to subagents:"
echo "   - For research: Task with general-purpose agent"
echo "   - For implementation: Direct Claude Code execution"
echo "   - For testing: Task with test-focused prompts"
echo ""
echo "2. Example workflow:"
echo "   a. PM Agent: Research requirements using Task tool"
echo "   b. Architect Agent: Design solution using Task tool"
echo "   c. Developer: Implement directly in Claude Code"
echo "   d. QA Agent: Test using Task tool"
echo ""

echo -e "${GREEN}Benefits over tmux:${NC}"
echo "  ✓ Native Claude Code integration"
echo "  ✓ Better context sharing between agents"
echo "  ✓ Automatic result aggregation"
echo "  ✓ No external dependencies"
echo "  ✓ Unified conversation history"
echo ""

echo -e "${BLUE}Dashboard Integration:${NC}"
echo "The BMAD dashboard at /admin/bmad-dashboard tracks:"
echo "  - Task completion status"
echo "  - Agent activity logs"
echo "  - Project metrics"
echo "  - Epic progress"
echo ""

echo -e "${GREEN}✅ BMAD Claude Code Squad Ready!${NC}"
echo ""
echo "Access the dashboard at: http://localhost:3000/admin/bmad-dashboard"
echo ""
echo "To start using the squad, simply ask Claude Code to:"
echo "  • 'Use the Task tool to research Epic 2 requirements'"
echo "  • 'Delegate UX analysis to a subagent'"
echo "  • 'Have a subagent review the architecture'"
echo ""