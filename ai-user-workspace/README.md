# AI-User Workspace
=========================================================================

**AI-USER COLLABORATION ENVIRONMENT**

This directory organizes resources for structured AI-user collaboration in the development process.

## AI Agent Workflow

### 1. Analysis Phase
- **Read AI-Config**: Start by reviewing [AI-Config.md](./AI-Config.md) for current permissions and priorities
- **Understand Project**: Review [project-guide.md](./project-guide.md) for architectural context
- **Analyze Codebase**: Examine relevant code files focusing on areas permitted in AI-Config
- **Identify Goals**: Determine what improvements or changes are needed

### 2. Proposal Generation Phase
- **Create Detailed Proposals**: Draft Portfolio Improvement Proposals (PIPs) following the template
- **Include Architecture Diagrams**: Use ASCII diagrams to visualize changes
- **Define Implementation Path**: Outline concrete implementation steps
- **Address Risks**: Identify potential issues and mitigation strategies

### 3. Iteration & Discussion Phase
- **Review & Refine**: Iterate on proposals based on feedback
- **Consider Alternatives**: Explore multiple approaches
- **Evaluate Tradeoffs**: Document pros and cons of different solutions
- **Document Decisions**: Record important decision points and reasoning

### 4. Task Generation Phase
- **Create Cycle Tasks**: Break down approved proposals into specific tasks
- **Prioritize Tasks**: Identify critical path items vs. nice-to-haves
- **Define Success Criteria**: Establish clear completion metrics for each task
- **Link to Proposals**: Reference the original proposals that generated tasks

### 5. Implementation Phase
- **Follow AI-Config**: Adhere strictly to the file permission system
- **Reference Dev Tasks**: Implement according to cycle-specific task documents
- **Document Changes**: Maintain comprehensive documentation of changes
- **Test Thoroughly**: Ensure implementation meets all success criteria

## Implementation Guidelines

1. **Use AI-Config + Dev Tasks**: Always implement based on the combination of:
   - Current permissions in AI-Config.md
   - Specific instructions in cycle task documents

2. **Documentation First**: Update or create documentation before implementing code:
   - Add JSDoc to all functions and classes
   - Include ASCII diagrams for complex processes 
   - Maintain README files for directories

3. **Progressive Enhancement**:
   - Implement core functionality first
   - Add advanced features only after basics work
   - Ensure graceful degradation when features are unavailable

## Directory Structure

```
ai-user-workspace/
│
├── AI-Config.md                      # Central permissions and configuration
├── ai-user-guide.md                  # Concise guide for AI collaboration
│
├── dev-tasks/                        # Implementation tasks by cycle
│    ├── README.md                     # Task directory guide
│    ├── cycle-1.0.1.md                # Current cycle tasks
│    └── cycle-1.1.1.md                # Planning for future cycle
│
├── dev-proposals/                    # Architectural proposals (PIPs)
│   ├── README.md                     # Proposal index and status
│   ├── cycle-1.1.1/                  # Current proposals
│   │   ├── pip-003-engine-core-rewrite.md  # Core architecture proposal
│   │   └── pip-004-devtools-testing-strategy.md  # Testing proposal
│   └── cycle-1.0.1/                  # Previous proposals
```

## Current Development Focus

The project is currently undergoing significant architectural changes in **Cycle 1.1.1** focusing on:

1. Complete ECS architecture rewrite with proper separation of concerns
2. Performance optimization and memory management improvements
3. Enhanced developer tools with comprehensive testing strategy
4. Standardized documentation with visual representations

## Successful Implementation Example

1. **Read AI-Config**: Identify permitted files and current focus
2. **Review Tasks**: Understand implementation requirements from cycle tasks
3. **Generate Proposal**: Create detailed proposal for complex changes
4. **Break Down Tasks**: Convert approved proposal into actionable items
5. **Implement**: Make changes according to permissions and requirements
6. **Document**: Add comprehensive JSDoc comments with diagrams

=========================================================================  
**This directory is maintained collaboratively by JG and AI assistants.**  
Last updated: Cycle ID 1.0.1
