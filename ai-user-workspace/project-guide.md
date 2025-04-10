# Portfolio Engine Architecture Guide

**ARCHITECTURE REFERENCE FOR AI COLLABORATION**

> **IMPORTANT**: This project is in active development with frequent changes. The architecture described here represents the current state but is being continuously evolved according to the proposals in `dev-proposals/`.


index.html > app.js

app.js > config.js
         start.js

start.js > errorHandlerer

 world.js

world.js > EventSystem.js

## Architectural Evolution

The Portfolio Engine is transitioning to a multi-layered architecture with:

1. **Core Engine Layer**: Pure ECS implementation without DOM dependencies
2. **Module Layer**: Self-contained functional units with standardized interfaces
3. **Elements Layer**: Componentized UI elements with reactive properties
4. **Pages Layer**: Declarative page definitions with content management

Detailed documentation for specific components lives in JS file headers using the standardized template defined in `doc-js-template.md`.

## Engine Execution Flow

### 1. Application Initialization
1. **DOM Loading**: Browser parses HTML and creates the DOM
2. **Script Loading**: app.js is loaded as the entry point
3. **Configuration**: config.js is parsed and application settings are initialized
4. **Error Handlers**: Global error handlers are registered
5. **ECS World**: The central World instance is created as the ECS container

### 2. System Registration
1. **Core Systems**: Essential systems are registered in priority order:
   - EventSystem (communication)
   - ResourceDiscoverySystem (content discovery)
   - LayoutSystem (DOM structure)
   - RenderSystem (UI updates)
2. **System Dependencies**: Dependencies between systems are resolved
3. **System Initialization**: Each system's init() method is called in dependency order

### 3. Resource Discovery
1. **Page Discovery**: ResourceDiscoverySystem scans the pages directory
2. **Project Discovery**: Projects are discovered within the projects directory
3. **Metadata Extraction**: Page and project metadata is extracted
4. **Entity Creation**: Content entities are created with appropriate components

### 4. Layout Initialization
1. **DOM Structure**: LayoutSystem initializes the main DOM structure
2. **Header Creation**: Header entity and components are created
3. **Module Mounting**: The Header module is initialized with the header entity
4. **Navigation Setup**: Page metadata is used to populate navigation

### 5. Header and Navigation Flow
1. **Header Initialization**: 
   - Header module loads CSS
   - DOM structure is created based on configuration
   - Child modules like Navbar are initialized
2. **Navbar Population**:
   - Navbar requests page metadata from ResourceDiscoverySystem
   - Navigation links are rendered
   - Event listeners are attached for navigation
3. **Dropdown Creation**:
   - HeaderDropdown is initialized with trigger element
   - Dropdown sections are registered (ThemeSelector, Settings)
   - Event listeners are added for toggling

### 6. Content Loading
1. **Route Detection**: Initial route is extracted from URL hash
2. **Page Loading**: 
   - ResourceDiscoverySystem loads the requested page module
   - Page entity is created with DOM and content components
3. **Module Loading**: 
   - Page module is dynamically imported
   - Page module's init() method is called with the page entity
4. **Content Rendering**:
   - Page module renders content to its container
   - Mount lifecycle method is called to set up event listeners

### 7. User Interaction Flow
1. **Navigation Events**: 
   - User clicks navigation link
   - EventSystem emits 'route:change' event
   - Current page module is unmounted
   - New page module is loaded and mounted
2. **Theme Switching**:
   - User interacts with theme selector
   - Theme is changed in localStorage
   - CSS variables are updated via data-theme attribute
3. **Dropdown Interactions**:
   - User clicks dropdown trigger
   - Dropdown visibility is toggled
   - Dropdown sections handle their own interactions

### 8. Error Handling Flow
1. **Error Detection**: Errors are caught by global or system-specific handlers
2. **Fallback Behavior**: Systems implement fallback behavior when errors occur
3. **Notification**: User is notified of errors through the UI
4. **Recovery**: System attempts to recover or degrade gracefully

## Entity Component System (ECS) Architecture

### Core Concepts

1. **Entities**: Containers with unique IDs representing objects in the application
   - Simple identifiers with no inherent properties
   - Examples: header, sections, footer, elements

2. **Components**: Pure data containers attached to entities
   - Follow schema validation defined in component registry
   - No behavior, only state
   - Examples: position, appearance, behavior flags

3. **Systems**: Logic that operates on entities with specific components
   - Implement behavior based on component data
   - Run during update cycles in priority order
   - Examples: RenderSystem, InputSystem, PhysicsSystem

### Architectural Diagram
```
┌───────────────────────────────────────────────────────────────┐
│                   Portfolio Engine Architecture               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│  │             │      │             │      │             │    │
│  │   Engine    │─────►│   Modules   │─────►│  Elements   │    │
│  │             │      │             │      │             │    │
│  └─────────────┘      └─────────────┘      └─────────────┘    │
│         │                    │                   │            │
│         │                    │                   │            │
│         ▼                    ▼                   ▼            │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│  │             │      │             │      │             │    │
│  │   Systems   │◄────►│    Pages    │◄────►│    DOM      │    │
│  │             │      │             │      │             │    │
│  └─────────────┘      └─────────────┘      └─────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

=========================================================================  
**This file is maintained collaboratively by JG and AI assistants.**  
Last updated: Cycle ID 1.0.1
