# AI-Human Collaboration Workflow Guide

<div align="center">

```
█▀█ █▀█ █▀█ ▀█▀ █▀▀ █▀█ █   █ █▀█   █▀▀ █▄░█ █▀▀ █ █▄░█ █▀▀
█▀▀ █▄█ █▀▄ ░█░ █▀░ █▄█ █▄▄ █ █▄█   ██▄ █░▀█ █▄█ █ █░▀█ ██▄
```

**COLLABORATION FRAMEWORK FOR AI-HUMAN TEAMWORK**

</div>


This guide outlines how AI models and human developers can effectively collaborate on the Portfolio Engine project using the ai-user-workspace structure.

## 🔄 Collaboration Cycle

curent cykle ID = Vesrion (curently 1).Cykle(curently 1).iteration(curentlly 1)

cykles ID are used for planing adn documenting developmant.

version > cykle > iteration > session (with ai)

it might take many sessiot to make one iteration 

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Human     │─────►│     AI      │─────►│   question  │
│  Request    │      │  Response   │      │  answering  │
└─────────────┘      └─────────────┘      └─────────────┘
       ▲           ┌─────────────┐  ┌─────────────┐   │
       │           │   Human     │  │   Human     │   │
       └────────── │  testing    │──│  Feedback   │───
                   └─────────────┘  └─────────────┘                        
```

## Usage Guidelines

1. **Required Sections:**  
   - ASCII Art Header  
   - Overview  
   - Status Dashboard  
   - Core Documentation  
   - Interactive Sections

2. **Optional Sections:**  
   - Process Flow (for complex components)  
   - Performance Considerations  
   - Known Issues  
   - Future Improvements

3. **Visual Elements:**  
   - Use status bars for progress  
   - Use consistent separators (=========================================================================)  
   - Include flow diagrams  
   - Maintain consistent ASCII art styling

4. **Questions & Tasks:**  
   - Keep questions focused  
   - Update status regularly  
   - Categorize questions by type

5. **Code Examples:**  
   - Include practical usage examples  
   - Show common patterns  
   - Document edge cases

6. **Separator Usage:**
   - Primary Section Divider: =========================================================================
   - Minimal Dividers: · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 
   - Critical Information: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## 9. Troubleshooting Guide
- [ ] Regenerate troubleshooting template  
- [x] Approve current variant

    ## Troubleshooting: [Feature/Component]

    ### Common Issues

    #### Issue: [Problem description]
    Symptoms:  
    - Symptom 1  
    - Symptom 2  
    Possible Causes:  
    - Cause 1  
    - Cause 2  
    Solutions:
    1. Step-by-step solution  
    2. Alternative approach

    #### Issue: [Another problem]
    Symptoms:  
    - Symptom 1  
    Solutions:
    1. Try this  
    2. If that fails...

    ### Diagnostic Tools
    - Tool 1: Description  
    - Tool 2: Description

=========================================================================
## 🔍 Understanding Intent

To better understand human intentions, AI models should:

1. **Ask clarifying questions** when instructions are ambiguous
   - "Could you clarify what you mean by X?"
   - "I understand you want Y, is that correct?"

2. **Provide options** when multiple approaches are possible
   - "Approach A offers [benefits/drawbacks]"
   - "Approach B offers [benefits/drawbacks]"

3. **Summarize understanding** before proceeding with complex tasks
   - "I understand you want me to..."
   - "The goal appears to be..."

## 📝 Documentation Practices

### For Code Analysis
```markdown
# Component Analysis: [Component Name]

## Overview
Brief description of the component's purpose and role.

## Structure
- Key classes/functions
- Relationships between parts

## Patterns Used
- Pattern 1: Description
- Pattern 2: Description

## Integration Points
- How this connects to other components

## Potential Improvements
- Suggestion 1
- Suggestion 2
```

### For Feature Planning
```markdown
# Feature Plan: [Feature Name]

## Requirements
- What the feature needs to accomplish

## Implementation Approach
- Step 1
- Step 2

## Files to Modify
- file1.js: Changes needed
- file2.js: Changes needed

## Testing Plan
- Test case 1
- Test case 2
```

## 🚩 When Human Input Is Needed

AI models should flag situations requiring human input:

1. **Architectural decisions** that impact multiple components
2. **Unclear requirements** that cannot be inferred from context
3. **Multiple viable approaches** with different trade-offs
4. **Potential conflicts** with existing code or patterns

Use the following format to request input:
```
🟡 Human Input Needed
Question: [Clear, specific question]
Options:
- Option A: [Description and implications]
- Option B: [Description and implications]
```

## 📊 Progress Tracking

Track progress in the dev-plan.md file using the following format:

```markdown
## Feature: [Feature Name]
Status: [Planning/In Progress/Review/Complete]
Progress: [0-100%]

### Completed Tasks
- [x] Task 1
- [x] Task 2

### Pending Tasks
- [ ] Task 3
- [ ] Task 4

### Notes
- Important information about implementation
```

## 🔄 Iteration Workflow

For multi-step tasks that require iteration:

1. **Plan**: Document the approach in a planning file
2. **Implement**: Create initial implementation or suggestions
3. **Review**: Request human feedback on specific aspects
4. **Refine**: Make adjustments based on feedback
5. **Finalize**: Complete implementation and documentation

## 📚 Learning the Codebase

To quickly understand a new area of the codebase:

1. Start with README and configuration files
2. Examine imports and dependencies
3. Look for usage examples
4. Create an analysis document in the workspace
5. Ask specific questions about patterns or design decisions

## 🔁 Quick Reference Workflow

1. **Read Request** → Understand the human's intention
2. **Check Permissions** → Verify you can modify requested files
3. **Plan Response** → Organize your approach
4. **Implement Changes** → Make requested changes following project patterns
5. **Document Work** → Update dev-plan.md with progress
6. **Summarize Actions** → Provide clear summary of what you've done

## 💬 Communication Patterns

### When Creating New Files
```
📁 New File Created:
I've created [filename] in [directory] to:
- [purpose of file]
- [relationship to project]

Key contents:
- [important element]
- [important element]
```

### When Making Significant Changes
```
📋 Change Summary:
I've made the following changes to [file]:
1. [major change description]
2. [major change description]

Rationale:
[explanation for these changes]
```

### When Suggesting Improvements
```
💡 Suggested Improvements for [file]:
1. [suggestion] - [brief rationale]
2. [suggestion] - [brief rationale]

Would you like me to implement any of these?
```

## 📚 Further Reference
- For documentation standards: [documentation-template.md](./documentation-template.md) 
- For architecture understanding: [architecture-guide.md](./architecture-guide.md)
- For proposing changes: [proposals.md](./proposals.md)
