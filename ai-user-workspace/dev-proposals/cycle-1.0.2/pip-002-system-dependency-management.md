# PIP-002: System Dependency Management and Execution Order

**Status**: 🔵 In Progress  
**Cycle ID**: 1.0.2  
**Related Task**: [Task ID TBD]

## Problem Statement

The current ECS architecture has basic system scheduling, but lacks formal dependency management between systems. This leads to potential race conditions, brittle initialization sequences, and difficulty in ensuring systems execute in the correct order. Manual management of system order increases maintenance burden and makes the codebase harder to extend.

## Proposal

Create a robust system dependency management framework that:
1. Allows systems to explicitly declare dependencies on other systems
2. Automatically resolves execution order based on these dependencies
3. Validates the dependency graph to detect cycles and missing dependencies
4. Provides visual feedback about the system execution order in the developer tools

## Benefits

1. **Reduced Errors**: Prevent race conditions and initialization errors
2. **Self-Documenting Systems**: Dependencies clearly show how systems interact
3. **Flexible System Registration**: Register systems in any order; dependencies determine execution order
4. **Enhanced DevTools**: Visualize system dependencies for easier debugging
5. **Better Error Messages**: Provide clear feedback when dependencies are missing or cyclical

## Implementation Details

### 1. Enhance System Registration

Modify the `System` class to support dependency declarations:

```javascript
class System {
  constructor(options = {}) {
    // Existing initialization code
    
    // New dependency properties
    this.dependencies = options.dependencies || []; // Systems this system depends on
    this.dependents = [];  // Systems that depend on this system
    this.initialized = false;
  }
  
  // Declare dependencies
  dependsOn(...systemNames) {
    this.dependencies.push(...systemNames);
    return this;
  }
}
```

### 2. Implement Dependency Resolution in SystemManager

Enhance the `SystemManager` to handle dependencies:

```javascript
class SystemManager {
  // Existing code
  
  registerSystem(name, system) {
    // Existing registration code
    
    // Track in systems map
    this.systems.set(name, system);
    
    // Return system for method chaining
    return system;
  }
  
  initializeSystems() {
    // Build dependency graph
    this._buildDependencyGraph();
    
    // Detect cycles
    this._detectCycles();
    
    // Get systems in dependency order
    const orderedSystems = this._getOrderedSystems();
    
    // Initialize systems in correct order
    for (const [name, system] of orderedSystems) {
      if (!system.initialized) {
        console.info(`Initializing system: ${name}`);
        system.init(this.world);
        system.initialized = true;
      }
    }
  }
  
  _buildDependencyGraph() {
    // Link dependents (reverse dependencies)
    for (const [name, system] of this.systems) {
      for (const depName of system.dependencies) {
        const depSystem = this.systems.get(depName);
        if (!depSystem) {
          console.warn(`System "${name}" depends on unknown system "${depName}"`);
          continue;
        }
        depSystem.dependents.push(name);
      }
    }
  }
  
  _detectCycles() {
    // Implement cycle detection in dependency graph
    // (using depth-first search with visited set)
  }
  
  _getOrderedSystems() {
    // Implement topological sorting of systems based on dependencies
    // Return systems in execution order
  }
}
```

### 3. Create DevTools Visualization

Add a dependency graph visualization to the DevTools:

```javascript
// Inside devtools.js or a new module
function renderSystemDependencies(container, ecs) {
  const systems = Array.from(ecs.systems.entries());
  
  // Create SVG container for the graph
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "system-dependency-graph");
  container.appendChild(svg);
  
  // Render nodes and edges based on system dependencies
  // (This would use a graph layout algorithm)
}
```

### 4. System Registration Example

```javascript
// Usage example
world.registerSystem('event', new EventSystem())
  .dependsOn(); // No dependencies

world.registerSystem('render', new RenderSystem())
  .dependsOn('layout', 'animation'); // Depends on these systems

world.registerSystem('physics', new PhysicsSystem())
  .dependsOn('collision');

// System manager will ensure correct initialization order
world.systemManager.initializeSystems();
```

## Visual Design

The dependency graph in DevTools would look like:

```
┌─ System Dependencies ──────────────────────────────┐
│                                                    │
│    ┌───────────┐         ┌───────────┐            │
│    │   Event   │         │ Animation │            │
│    └───────────┘         └─────┬─────┘            │
│          │                     │                   │
│          ▼                     │                   │
│    ┌───────────┐         ┌─────▼─────┐            │
│    │  Layout   │───────► │  Render   │            │
│    └───────────┘         └───────────┘            │
│                                                    │
│    ┌───────────┐         ┌───────────┐            │
│    │ Collision │───────► │  Physics  │            │
│    └───────────┘         └───────────┘            │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Files to Modify

1. `engine/core/system.js` - Add dependency declaration support
2. `engine/managers/systemManager.js` - Implement dependency resolution
3. `engine/modules/dev-tools/dev-tools.js` - Add dependency visualization
4. Various system implementations - Update to declare dependencies

## Success Criteria

1. Systems initialize in the correct order according to their dependencies
2. Circular dependencies are detected and reported clearly
3. Missing dependencies trigger appropriate warnings
4. DevTools displays the dependency graph in a readable format
5. System registration API is clean and intuitive

## Learning Opportunities

1. Graph theory and topological sorting algorithms
2. Dependency injection design patterns
3. Visualization of directed graphs
4. Error handling and robust initialization patterns
5. Declarative API design