# BMAD Agent Registry for Claude Code

## Core Agents
- **analyst** - Market research and analysis
- **pm** - Product management and requirements  
- **architect** - System architecture and design
- **sm** - Scrum master and story management
- **dev** - Software development and implementation
- **qa** - Quality assurance and testing
- **po** - Product owner and backlog management
- **ux-expert** - UX/UI design and user experience

## Expansion Pack Agents  
- **infra-devops-platform** - DevOps/SRE and infrastructure (from bmad-infrastructure-devops pack)
- **security** - Security engineering and compliance (from security pack)

## Usage in Claude Code
Use agent commands to work with BMAD squad:
- View agents: `npx bmad-method list-agents`
- Start squad: `npx bmad-method start-squad`
- In tmux sessions, agents will be available in separate panes

## TMUX Session Structure
When running the BMAD squad in tmux:
1. **Orchestrator** (Window 0) - Main coordination pane
2. **Analyst** (Window 1) - Market and requirements analysis
3. **PM** (Window 2) - Product management and strategy
4. **Architect** (Window 3) - Technical design and architecture
5. **SM** (Window 4) - Scrum master and agile processes
6. **Dev** (Window 5) - Implementation and coding
7. **QA** (Window 6) - Testing and quality assurance
8. **DevOps** (Window 7) - Infrastructure and deployment
9. **Security** (Window 8) - Security and compliance

## Agent File Locations
- Core agents: `./web-bundles/agents/`
- DevOps agent: `./web-bundles/expansion-packs/bmad-infrastructure-devops/agents/`
- Security agent: `./web-bundles/expansion-packs/security/agents/`