# Portfolio Engine Architecture Guide


```
█▀█ █▀█ █▀█ ▀█▀ █▀▀ █▀█ █   █ █▀█   █▀▀ █▄░█ █▀▀ █ █▄░█ █▀▀
█▀▀ █▄█ █▀▄ ░█░ █▀░ █▄█ █▄▄ █ █▄█   ██▄ █░▀█ █▄█ █ █░▀█ ██▄
```

**ARCHITECTURE REFERENCE FOR AI COLLABORATION**

</div>

## Entity Component System (ECS) Architecture

The Portfolio Engine is built on an Entity Component System architecture, which separates:

### Core Concepts

1. **Entities**: Containers with unique IDs representing objects in the application
   - Examples: header, sections, footer, navigation menu

2. **Components**: Data containers attached to entities
   - Examples: layout, dom, route, header, section

3. **Systems**: Logic that operates on entities with specific components
   - Examples: EventSystem, LayoutSystem, ModuleSystem

### Architectural Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Entities   │◄────┤  Components  │─────►   Systems    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐                        ┌──────────────┐
│    World     │◄───────────────────────┤ Event System │
└──────────────┘                        └──────────────┘
```

## Core Systems

### Event System
- Central communication hub for all systems
- Allows systems to communicate without direct dependencies
- Uses event types and data payloads

### Error System
- Centralized error handling
- Error logging and reporting
- Graceful degradation strategies

### Layout System
- Manages UI layout and rendering
- Handles responsive design adaption
- Controls component visibility and positioning

### Module System
- Handles dynamic module loading
- Manages module lifecycle (init, mount, unmount)
- Provides dependency injection for modules

## File Structure

```
portfolio-engine/
├── app.js                  # Application entry point
├── config.js               # Central configuration
├── engine/                 # Core engine components
│   ├── core/               # Core systems
│   ├── systems/            # Specialized systems
│   └── utils/              # Utility functions
├── modules/                # UI modules
│   ├── header/             # Header module
│   ├── dropdown/           # Dropdown module
│   └── page/               # Page module
└── pages/                  # Content pages
    ├── about/              # About page
    ├── projects/           # Projects page
    └── devtools/           # DevTools page
```

## Key Design Patterns

### 1. Event-Driven Communication
Systems communicate through events rather than direct method calls:

```javascript
// Publishing an event
ecs.emit('route:change', { route: 'about' });

// Subscribing to an event
ecs.on('route:change', (data) => {
  // Handle route change
});
```

### 2. Fallback Mechanisms
The engine implements graceful degradation when features are unavailable:

```javascript
try {
  // Try primary implementation
  await primaryImplementation();
} catch (error) {
  // Fall back to alternative
  await fallbackImplementation();
}
```

### 3. Dynamic Loading
Components and resources are loaded on demand:

```javascript
const module = await import('./modules/some-module.js');
moduleRegistry.register('moduleName', module);
```

### 4. Configuration-Based Entity Creation
Entities are created from configuration objects:

```javascript
this.registerFactory('header', () => {
  const entityId = this.ecs.createEntity();
  this.ecs.addComponent(entityId, 'layout', { type: 'header' });
  this.ecs.addComponent(entityId, 'header', { title: this.config.site.title });
  return entityId;
});
```

## Module Integration

Modules follow a standard lifecycle:

1. **Initialization**: `init(ecs)` - Connect to ECS and initialize data
2. **Mounting**: `mount(container)` - Attach to DOM and render
3. **Updates**: Respond to events and update state
4. **Unmounting**: `unmount()` - Clean up resources

Example of a module implementation:

```javascript
export default {
  init(ecs) {
    this.ecs = ecs;
    this.eventListeners = [];
    
    // Register event listeners
    this.eventListeners.push(
      ecs.on('theme:change', this.handleThemeChange.bind(this))
    );
    
    return this;
  },
  
  mount(container) {
    this.container = container;
    this.render();
    return this;
  },
  
  unmount() {
    // Unregister event listeners
    this.eventListeners.forEach(listener => {
      this.ecs.off(listener.event, listener.handler);
    });
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    return this;
  },
  
  render() {
    // Render content to container
  }
};
```

## Development Environment

### Debug Mode
When config.advanced.debug is true:
1. Core objects are exposed to window for debugging
2. Additional console logging is enabled
3. DevTools functionality becomes available

### DevTools
The DevTools module provides:
1. Interactive console for running commands
2. Entity inspector for examining component data
3. Event monitoring for debugging event flow
4. Performance metrics for optimization

---



**This guide is maintained collaboratively by JG and AI assistants.**  
Last updated: [Current cykle]

</div>
