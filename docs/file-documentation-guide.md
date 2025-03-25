# File Documentation Guide

This guide provides templates and examples for properly documenting files in the Portfolio Engine project. Consistent, comprehensive documentation ensures that the codebase remains maintainable and accessible to all developers.

## Why Document Files?

Proper file documentation:

1. Explains the purpose and role of each file in the system
2. Helps new developers understand the codebase
3. Makes dependencies and relationships clear
4. Documents design decisions and patterns
5. Provides usage examples
6. Creates a foundation for auto-generated documentation

## File Header Template

Every file should start with a comprehensive header comment that follows this structure:

```javascript
/**
 * @fileoverview [Brief description of the file]
 * 
 * [Detailed description explaining the role of this file in the system.
 * May span multiple lines and provide context and rationale.]
 * 
 * @module [Module name]
 * @requires [List of dependencies]
 * 
 * @design [Design patterns or architectural decisions]
 * 
 * @example
 * // Example usage
 * import { X } from './path/to/file.js';
 * X.doSomething();
 */
```

## Templates by File Type

### Module Files

```javascript
/**
 * @fileoverview [Module Name] Module
 * 
 * This module provides [brief description of functionality].
 * It is responsible for [detailed explanation of responsibilities].
 * 
 * @module [ModuleName]
 * @requires [Dependencies if any]
 * 
 * @design This module follows a simple object pattern with an init method
 * that receives an entity and initializes the module based on entity components.
 * 
 * @example
 * // Initialize the module with an entity
 * import { moduleName } from './modules/module-name.js';
 * const entity = ecs.createEntity();
 * entity.addComponent('dom', { container: document.getElementById('container') });
 * moduleName.init(entity);
 */

const moduleName = {
  init(entity) {
    // Implementation
  }
};

export { moduleName };
```

### System Files

```javascript
/**
 * @fileoverview [System Name] System
 * 
 * This system is responsible for [brief description].
 * It operates on entities with [required components]
 * and implements [functionality details].
 * 
 * @module [SystemName]
 * @requires System from ../engine/system.js
 * @requires [Other dependencies]
 * 
 * @design Extends the base System class and implements the init and update methods.
 * Uses [design patterns] for [specific functionality].
 * 
 * @example
 * // Register the system with the ECS
 * import { SystemName } from './systems/SystemName.js';
 * ecs.registerSystem(new SystemName());
 */

import { System } from '../engine/system.js';

class SystemName extends System {
  constructor() {
    super();
    // Initialization
  }

  init(entities) {
    // System initialization
  }

  update(entities) {
    // Update logic
  }
}

export { SystemName };
```

### Component-Related Files

```javascript
/**
 * @fileoverview Component Factory for [Component Type]
 * 
 * Provides factory functions for creating [component type] components.
 * These components represent [description of what the component represents].
 * 
 * @module [ComponentName]Components
 * 
 * @design Uses factory functions to create standardized component objects.
 * 
 * @example
 * // Create a component
 * import { createComponentName } from './components/component-name.js';
 * const component = createComponentName(param1, param2);
 * entity.addComponent('componentName', component);
 */

/**
 * Creates a [component name] component
 * @param {type} param1 - Description of param1
 * @param {type} param2 - Description of param2
 * @returns {Object} The component object
 */
export function createComponentName(param1, param2) {
  return {
    property1: param1,
    property2: param2
  };
}
```

### Utility Files

```javascript
/**
 * @fileoverview Utility Functions for [Functionality Area]
 * 
 * This file contains utility functions for [specific area of functionality].
 * These functions are used across multiple parts of the application to [purpose].
 * 
 * @module [Area]Utils
 * 
 * @design Implements pure functions with no side effects for predictable behavior.
 * 
 * @example
 * // Use a utility function
 * import { utilityFunction } from './utils/utility-name.js';
 * const result = utilityFunction(input);
 */

/**
 * [Function description]
 * @param {type} param - Description of param
 * @returns {type} Description of return value
 */
export function utilityFunction(param) {
  // Implementation
}
```

### Configuration Files

```javascript
/**
 * @fileoverview Configuration Settings for the Portfolio Engine
 * 
 * This file contains global configuration settings that control
 * the behavior and features of the Portfolio Engine. It provides
 * centralized control over themes, modules, systems, and routing.
 * 
 * @module config
 * 
 * @design Uses a single object with nested properties for organization.
 * Settings are grouped by functional area.
 * 
 * @example
 * // Access configuration
 * import config from './config.js';
 * const defaultTheme = config.theme.default;
 */

const config = {
  // Configuration properties
};

export default config;
```

## Documentation Best Practices

1. **Be Comprehensive**: Explain not just what the code does, but why it exists
2. **Update When Changing**: Keep documentation in sync with code changes
3. **Document Parameters**: Explain all parameters and return values
4. **Include Examples**: Show how to use the code
5. **Explain Design Decisions**: Document why certain approaches were chosen
6. **Maintain Relationships**: Document how files relate to one another
7. **Use Markdown**: Format comments with Markdown for readability

## JSDoc Tags Reference

| Tag            | Purpose                                     |
|----------------|---------------------------------------------|
| @fileoverview  | Overview of the entire file                 |
| @module        | Name of the module                          |
| @requires      | Dependencies required by the module         |
| @param         | Parameter description                       |
| @returns       | Return value description                    |
| @example       | Example usage                               |
| @design        | Design patterns or decisions                |
| @see           | Reference to related documentation          |
| @todo          | Future tasks                                |
| @deprecated    | Marked for removal in future versions       |

## Example-Driven Documentation

When documenting complex functionality, provide complete examples:

```javascript
/**
 * @example
 * // Create a project entity with components
 * const projectEntity = ecs.createEntity();
 * 
 * // Add required components
 * projectEntity.addComponent('dom', { 
 *   container: document.getElementById('project-container') 
 * });
 * 
 * projectEntity.addComponent('project', {
 *   id: 'project-1',
 *   title: 'Amazing Project',
 *   description: 'This is an amazing project that does amazing things',
 *   technologies: ['JavaScript', 'WebGL', 'CSS'],
 *   wildcardType: 'interactive'
 * });
 * 
 * // Initialize the project module
 * projects.init(projectEntity);
 */
```

By following these documentation guidelines, we ensure that the Portfolio Engine codebase remains well-documented, maintainable, and accessible to all developers working on the project.
