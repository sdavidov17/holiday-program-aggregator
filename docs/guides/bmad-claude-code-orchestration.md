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
| 🧠 BMAD Master | Main Claude instance | Overall orchestration, DoR/DoD enforcement |
| 🎯 Task Orchestrator | Task tool (general-purpose) | Complex multi-step tasks |
| 📊 Product Manager | Task tool for research | Requirements analysis, BDD scenario collaboration |
| 🔍 Business Analyst | Task tool for analysis | Data modeling, BDD scenario definition |
| 🏗️ Solution Architect | Task tool for design | Architecture decisions, technical approach review |
| 💻 Developer | Direct Claude Code | Implementation, BDD scenario collaboration |
| 🧪 QA Engineer | Task tool for testing | BDD scenario leadership, test planning & execution |
| 🎨 UX Expert | Task tool for UX | Design research & analysis, UI acceptance criteria |
| 🔧 DevOps | Task tool for infra | CI/CD, monitoring setup |
| 📝 Scrum Master | Task tool for process | DoR/DoD facilitation, Three Amigos sessions |

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
- Include DoR/DoD requirements in agent prompts

### 3. Workflow Optimization
```
DoR Check → Research (Subagent) → BDD Scenarios (PM/BA+QA+Dev) → 
Design (Subagent) → Implement (Direct) → Test (Subagent) → DoD Check
```

### 4. Parallel Processing
- Launch multiple subagents concurrently when tasks are independent
- Use single message with multiple Task tool invocations

### 5. DoR/DoD Enforcement
- **ALWAYS** check Definition of Ready before starting development
- **NEVER** mark story complete without meeting all DoD criteria
- Use story template for consistent formatting
- Facilitate Three Amigos sessions for BDD scenario creation
- Ensure 100% test pass rate before completion

## Implementation Workflow

### Epic Development Flow with DoR/DoD

#### Phase 1: Story Preparation (Definition of Ready)
1. **Requirements Gathering**
   - PM subagent researches user needs and writes initial story
   - Analyst subagent creates acceptance criteria
   - **Three Amigos Session**: PM/BA + QA + Dev collaborate on BDD scenarios

2. **BDD Scenario Definition**
   - QA subagent leads scenario creation in Given/When/Then format
   - Developer validates technical feasibility
   - PM/BA ensures business value alignment
   - All scenarios documented in story template

3. **Technical Design & Review**
   - Architect subagent designs solution and reviews approach
   - UX subagent provides designs and validates UI criteria
   - DevOps subagent identifies infrastructure needs
   - **DoR Checkpoint**: SM facilitates review that all criteria are met

#### Phase 2: Implementation & Testing
4. **Development**
   - Developer implements all acceptance criteria
   - BDD scenarios are coded as tests (Unit/Integration/E2E)
   - Code follows project standards

5. **Quality Assurance**
   - QA subagent verifies all BDD scenarios pass (100% pass rate)
   - Test coverage validated (>80% for new code)
   - Security subagent reviews implementation
   - Performance benchmarks verified

#### Phase 3: Completion (Definition of Done)
6. **Verification & Deployment**
   - All DoD criteria checked and verified
   - Code review completed and approved
   - Deployed to staging for UAT
   - Product Owner sign-off obtained
   - **DoD Checkpoint**: Story marked complete only when ALL criteria met

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
- [ ] Automated DoR/DoD compliance checking
- [ ] BDD scenario generation assistance

## Related Documents

- [Definition of Ready](../project/definition-of-ready.md)
- [Definition of Done](../project/definition-of-done.md)
- [Story Template](../project/story-template.md)
- [Team Guidelines](../project/team-guidelines.md)
- [Testing Strategy](./testing-strategy.md)