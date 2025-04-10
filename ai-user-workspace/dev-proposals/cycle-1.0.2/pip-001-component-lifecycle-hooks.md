# PIP-001: Component Lifecycle Hooks

**Status**: 🔵 In Progress  
**Cycle ID**: 1.0.2  
**Related Task**: [Task ID TBD]

## Problem Statement

The current ECS architecture efficiently manages entities and components, but lacks standardized lifecycle hooks for components. This makes it difficult to implement consistent initialization and cleanup logic, resulting in scattered implementation patterns across the codebase.

## Proposal

Implement a standardized component lifecycle hook system that allows components to define initialization, update, and cleanup methods that are automatically called at the appropriate times in the component's lifecycle.

## Benefits

1. **Standardization**: Consistent patterns for component setup and teardown
2. **Better Resource Management**: Proper cleanup of resources when components are removed
3. **Reduced Boilerplate**: Less repetitive code in systems that process components
4. **Improved Debugging**: Clearer component lifecycle makes debugging easier

## Implementation Details

### 1. Define Component Lifecycle Interface

Add optional lifecycle methods to all components:

```javascript
// Component lifecycle interface (conceptual)
{
  // Called when the component is first added to an entity
  onAttach(entity, world) {},
  
  // Called when component data is updated
  onUpdate(oldData, newData, entity, world) {},
  
  // Called when the component is removed from an entity
  onDetach(entity, world) {}
}
```

### 2. Update Component Manager

Modify the `ComponentManager` to handle these lifecycle methods:

```javascript
// Inside ComponentManager.js
addComponent(entityId, componentType, componentData) {
  // Existing component creation logic
  
  // Call onAttach if it exists
  if (componentData.onAttach) {
    componentData.onAttach(entityId, this.world);
  }
}

removeComponent(entityId, componentType) {
  const component = this.getComponent(entityId, componentType);
  
  // Call onDetach if it exists
  if (component && component.onDetach) {
    component.onDetach(entityId, this.world);
  }
  
  // Existing component removal logic
}

updateComponent(entityId, componentType, newData) {
  const oldData = this.getComponent(entityId, componentType);
  
  // Call onUpdate if it exists
  if (oldData && oldData.onUpdate) {
    oldData.onUpdate(oldData, newData, entityId, this.world);
  }
  
  // Existing component update logic
}
```

### 3. Update World Class

Update the `World` class methods to delegate to the ComponentManager:

```javascript
// Inside World.js
addComponent(entityId, componentType, componentData) {
  if (this.componentManager) {
    return this.componentManager.addComponent(entityId, componentType, componentData);
  }
  
  // Fallback to current implementation
}

removeComponent(entityId, componentType) {
  if (this.componentManager) {
    return this.componentManager.removeComponent(entityId, componentType);
  }
  
  // Fallback to current implementation
}
```

### 4. Create Sample Components with Lifecycle Hooks

```javascript
// Example DOM element component with lifecycle hooks
world.addComponent(entityId, 'domElement', {
  element: document.createElement('div'),
  
  onAttach(entityId, world) {
    // Add to DOM when component is attached
    document.body.appendChild(this.element);
    console.log(`DOM element attached for entity ${entityId}`);
  },
  
  onDetach(entityId, world) {
    // Remove from DOM when component is detached
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    console.log(`DOM element detached for entity ${entityId}`);
  }
});
```

## Visual Design

```
┌─ Entity Lifecycle ──────────┐
│                             │
│  Created                    │
│     │                       │
│     ▼                       │
│  Component Added            │
│     │  ┌──────────────┐    │
│     ├─►│  onAttach()  │    │
│     │  └──────────────┘    │
│     ▼                       │
│  Component Updated          │
│     │  ┌──────────────┐    │
│     ├─►│  onUpdate()  │    │
│     │  └──────────────┘    │
│     ▼                       │
│  Component Removed          │
│     │  ┌──────────────┐    │
│     ├─►│  onDetach()  │    │
│     │  └──────────────┘    │
│     ▼                       │
│  Entity Destroyed           │
│                             │
└─────────────────────────────┘
```

## Files to Modify

1. `engine/managers/componentManager.js` - Add lifecycle method handling
2. `engine/core/world.js` - Update component methods to use componentManager
3. `engine/core/component.js` - Add documentation for lifecycle interface (if exists)

## Success Criteria

1. Components can define lifecycle methods that are correctly called at the appropriate times
2. Resources are properly cleaned up when components are removed
3. Systems can rely on component initialization being complete
4. Performance impact is minimal (benchmark before and after)

## Learning Opportunities

1. JavaScript object lifecycle management
2. Observer pattern implementation
3. Event-driven programming
4. Resource cleanup patterns