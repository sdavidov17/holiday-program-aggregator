# BMAD Squad Orchestration with Claude Code

## Overview

The BMAD (Breakthrough Method of Agile AI-Driven Development) Squad, also known as Foundations in Agentic Agile Driven Development, leverages Claude Code's built-in Task tool with subagents instead of external tools like tmux. This provides better integration, context sharing, and result aggregation.

## Why Claude Code Subagents?

### Advantages over tmux
- **Native Integration**: Direct access to Claude Code's capabilities
- **Context Preservation**: Subagents maintain conversation context
- **Automatic Aggregation**: Results are automatically collected and presented
- **No External Dependencies**: Works out of the box with Claude Code
- **Unified History**: All work tracked in one conversation

## What is BMAD?

BMAD stands for **Breakthrough Method of Agile AI-Driven Development**, representing a revolutionary approach to software development that combines:
- **Breakthrough Methods**: Innovative techniques for rapid development
- **Agile Principles**: Iterative, collaborative development practices
- **AI-Driven**: Leveraging artificial intelligence for automation and intelligence
- **Development Excellence**: Focus on quality, efficiency, and continuous improvement

Also known as **Foundations in Agentic Agile Driven Development**, BMAD establishes the groundwork for autonomous, intelligent development teams.

## Squad Architecture

### Agent Roles → Claude Code Mapping

| BMAD Role | Claude Code Implementation | Use Case |
|-----------|---------------------------|----------|
| 🧠 BMAD Master | Main Claude instance | Overall orchestration |
| 🎯 Task Orchestrator | Task tool (general-purpose) | Complex multi-step tasks |
| 📊 Product Manager | Task tool for research | Requirements analysis |
| 🔍 Business Analyst | Task tool for analysis | Data modeling, process flows |
| 🏗️ Solution Architect | Task tool for design | Architecture decisions |
| 💻 Developer | Direct Claude Code | Implementation |
| 🧪 QA Engineer | Task tool for testing | Test planning & execution |
| 🎨 UX Expert | Task tool for UX | Design research & analysis |
| 🔧 DevOps | Task tool for infra | CI/CD, monitoring setup |

## Usage Examples

### 1. Product Research Task
```
"Use the Task tool to research competitor features for Epic 2 search functionality"
```

### 2. Architecture Review
```
"Have a subagent review our PostgreSQL migration architecture and suggest improvements"
```

### 3. Test Planning
```
"Delegate test case creation for the subscription lifecycle to a subagent"
```

### 4. Parallel Analysis
```
"Use multiple Task tools concurrently to:
1. Research best practices for rate limiting
2. Analyze current security headers implementation
3. Review subscription metrics requirements"
```

## Dashboard Integration

The BMAD Dashboard (`/admin/bmad-dashboard`) provides:

### Real-time Monitoring
- Active agent status
- Current tasks and progress
- Subagent task history
- Squad health metrics

### Metrics Tracking
- Epic completion progress
- Story velocity
- Blocker identification
- Team performance indicators

### Task Management
- View pending subagent tasks
- Track in-progress work
- Review completed tasks
- Identify bottlenecks

## Best Practices

### 1. Task Delegation
- Use Task tool for research and analysis
- Implement directly in Claude Code for coding
- Batch related tasks for efficiency

### 2. Context Management
- Provide clear, detailed prompts to subagents
- Specify exactly what information to return
- Use structured output formats

### 3. Workflow Optimization
```
Research (Subagent) → Design (Subagent) → Implement (Direct) → Test (Subagent)
```

### 4. Parallel Processing
- Launch multiple subagents concurrently when tasks are independent
- Use single message with multiple Task tool invocations

## Implementation Workflow

### Epic Development Flow
1. **Requirements Gathering**
   - PM subagent researches user needs
   - Analyst subagent creates user stories

2. **Technical Design**
   - Architect subagent designs solution
   - DevOps subagent plans infrastructure

3. **Implementation**
   - Developer (main Claude) writes code
   - UX subagent reviews interface

4. **Quality Assurance**
   - QA subagent creates test plans
   - Security subagent reviews implementation

5. **Deployment**
   - DevOps subagent manages deployment
   - Monitor subagent tracks metrics

## Monitoring & Reporting

### Squad Health Indicators
- **Green (90-100%)**: All systems operational
- **Yellow (70-89%)**: Minor issues, monitoring required
- **Red (<70%)**: Critical issues need attention

### Key Metrics
- Task completion rate
- Average task duration
- Blocker resolution time
- Code quality scores
- Test coverage percentage

## Quick Start Commands

### Initialize Squad Dashboard
```bash
# Start development server
pnpm dev

# Access dashboard
open http://localhost:3000/admin/bmad-dashboard
```

### View Squad Status
```bash
# Check squad report
curl http://localhost:3000/api/admin/squad-report
```

## Troubleshooting

### Common Issues

1. **Subagent Not Responding**
   - Check Task tool parameters
   - Ensure prompt is clear and specific
   - Verify agent type is correct

2. **Context Lost Between Tasks**
   - Include necessary context in each Task prompt
   - Reference previous results explicitly
   - Use structured data formats

3. **Dashboard Not Updating**
   - Refresh browser cache
   - Check API endpoints are accessible
   - Verify authentication status

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Subagent task persistence
- [ ] Advanced analytics dashboard
- [ ] Automated workflow triggers
- [ ] Integration with GitHub Actions
- [ ] Custom subagent templates