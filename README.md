# PORTFOLIO ENGINE – COMPREHENSIVE DOCUMENTATION

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Component Design](#component-design)
4. [Module System](#module-system)
5. [Routing & Navigation](#routing--navigation)
6. [Theming System](#theming-system)
7. [Project Showcases](#project-showcases)
8. [Development Roadmap](#development-roadmap)
9. [File Documentation Standards](#file-documentation-standards)
10. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

The Portfolio Engine is built on Entity-Component-System (ECS) architecture, inspired by game development patterns. This architecture was chosen for several key benefits:

- **Separation of Data and Logic**: Components store data while systems implement behavior
- **Composability**: Entities can mix and match components for flexible feature sets
- **Runtime Flexibility**: Systems can be hot-swapped and components can be added/removed dynamically
- **Predictable Data Flow**: Clear paths for data transformation and state management
- **Scalability**: Easy to extend without complex inheritance hierarchies

This architecture creates a portfolio that feels alive and interactive - more like a game environment than a static website. Each section of the portfolio is an entity with components that define its behavior, appearance, and state.

## Core Concepts

### Entity

An entity represents a distinct element in our portfolio, such as a header, project card, or entire section. Entities are essentially containers for components - they have no behavior of their own.

**Example Entities:**
- Header entity
- Navigation entity
- Project showcase entity
- Theme selector entity

### Component

Components are pure data containers attached to entities. They define what an entity "has" or "is", but not what it "does".

**Key Components:**
- `dom` - References to DOM elements
- `theme` - Theme-related data
- `route` - Routing information
- `renderable` - Visibility and rendering properties
- `project` - Project-specific data

### System

Systems contain all the logic that operates on entities with specific component combinations. They implement behaviors that transform component data.

**Core Systems:**
- `ThemeSystem` - Manages theme switching and application
- `RenderSystem` - Handles DOM rendering and updates
- `RoutingSystem` - Manages route changes and section visibility
- `NavSystem` - Handles navigation interactions

## Component Design

Each component is designed to be:

1. **Pure Data**: No methods or behavior in components
2. **Serializable**: Can be saved/loaded from storage
3. **Composable**: Works well with other components
4. **Minimal**: Focused on a single aspect of functionality

Components are registered with entities through the `addComponent` method:

```javascript
entity.addComponent('dom', { container: document.getElementById('header') });
entity.addComponent('theme', { currentTheme: 'dark' });
```

Components should be designed to support future extensions without breaking existing functionality.

## Module System

Modules are reusable, encapsulated units of functionality that can be loaded dynamically. Each module exports an object with an `init` method that receives an entity.

**Module structure:**
```javascript
const moduleExample = {
  init(entity) {
    // Access component data
    const container = entity.getComponent('dom').container;
    
    // Implement module-specific logic
    container.innerHTML = `<div>Module content</div>`;
    
    // Set up event listeners if needed
    container.addEventListener('click', () => {
      // Handle interactions
    });
  }
};

export { moduleExample };
```

Modules are loaded in `app.js` and initialized with their corresponding entities.

## Routing & Navigation

The routing system enables seamless navigation between different sections without page reloads. Key elements:

1. **Route Components**: Entities with `route` components define navigable sections
2. **NavSystem**: Handles navigation logic and route changes
3. **URL Hash**: Routes are reflected in URL hashes for deep linking
4. **Section Visibility**: Automatically manages which sections are visible

When a navigation event occurs:
1. NavSystem receives the event
2. Updates the URL hash
3. Updates route components on relevant entities
4. Shows/hides sections based on active route
5. Updates active state in navigation links

## Theming System

The theming system provides runtime theme switching with smooth transitions:

1. **Theme Definitions**: CSS variables defined in `themes.css`
2. **Theme Components**: Entities with theme preferences
3. **Theme Selector**: UI for switching themes
4. **ThemeSystem**: Applies themes and handles transitions
5. **LocalStorage**: Persists theme preferences

Themes are applied through CSS variables and data attributes:
```html
<html data-theme="dark">
```

## Project Showcases

The project showcase is designed to highlight work in an engaging way:

### Current Implementation
- Grid layout of project cards
- Images, descriptions, technologies, and links
- Interactive hover effects
- Technology tag displays

### Planned Dynamic Project Cards (Wildcards)
- **Interactive Previews**: Mini demos embedded in cards
- **Card Expansions**: Cards that expand to full views
- **Carousel Mode**: Slide-based project navigation
- **Filter System**: Sort by technology, type, date
- **Custom Interactions**: Project-specific interactions

## Development Roadmap

### Phase 1: Core Architecture (Complete)
- ✅ ECS Implementation
- ✅ Basic modules (header, about, projects, skills)
- ✅ Theme system
- ✅ Navigation system

### Phase 2: Enhanced Components (Current)
- 🔄 Dynamic project cards
- 🔄 Interactive skills visualization
- 🔄 Animations and transitions
- 🔄 Responsive design enhancements

### Phase 3: Advanced Features (Upcoming)
- ⬜ Project wildcards/slides system
- ⬜ Interactive canvas backgrounds
- ⬜ WebGL-powered effects
- ⬜ Content management system
- ⬜ Performance optimizations

### Phase 4: Extensibility (Future)
- ⬜ Plugin system
- ⬜ Custom editors
- ⬜ Export/import configurations
- ⬜ Theme creator

## Project Wildcards/Slides System

The project wildcards/slides system will be a major focus of the next development phase. This system will:

1. Allow each project to have custom interactive elements
2. Support multiple display modes (card, slide, expanded)
3. Enable project-specific behaviors and demos
4. Create a unified API for handling diverse project types

### Wildcard Implementation Plan

1. **Define Wildcard Interface**:
   ```javascript
   // Common interface for all project wildcards
   const ProjectWildcard = {
     init(container, data) {},
     render(mode) {},
     handleInteraction(event) {},
     cleanup() {}
   };
   ```

2. **Create Base Implementations**:
   - StandardProjectCard
   - InteractiveProjectCard
   - WebGLProjectCard
   - DemoProjectCard

3. **Dynamic Loading System**:
   - Load project-specific JS modules on demand
   - Inject project-specific CSS
   - Initialize appropriate wildcard based on project type

4. **Slide Controller**:
   - Navigation between projects in slide mode
   - Transition effects between slides
   - Fullscreen mode support

5. **Integration with ECS**:
   - Create ProjectSystem to manage wildcards
   - Define ProjectWildcardComponent to store slide data
   - Connect with existing navigation system

## File Documentation Standards

All files should include a comprehensive header that explains:

1. Purpose of the file
2. Dependencies and relationships
3. Design decisions and patterns used
4. Usage examples if applicable

### File Header Template

```javascript
/**
 * @fileoverview [Brief description of file purpose]
 * 
 * [Detailed description explaining the role of this file in the system]
 * 
 * @module [Module name]
 * @requires [Dependencies]
 * 
 * @design [Design patterns or architectural decisions]
 * 
 * @example
 * // Example usage
 * import { X } from './path/to/file.js';
 * X.doSomething();
 */
```

### Example Implementation

```javascript
/**
 * @fileoverview Theme System for the Portfolio Engine
 * 
 * This system manages theme selection, application, and persistence.
 * It operates on entities with theme components and updates the DOM
 * when theme changes occur. The system listens for theme change events
 * and applies CSS variables through data attributes.
 * 
 * @module ThemeSystem
 * @requires System from ../engine/system.js
 * @requires config from ../config.js
 * 
 * @design Uses the Observer pattern to react to theme change events.
 * Implements a transition system for smooth theme switching.
 * 
 * @example
 * // Register theme system
 * import { ThemeSystem } from './systems/ThemeSystem.js';
 * ecs.registerSystem(new ThemeSystem());
 */
```

## Contributing Guidelines

When contributing to this project:

1. **Follow ECS Principles**: Keep data in components, logic in systems
2. **Document Everything**: Add comprehensive documentation for new code
3. **Test Interactively**: Ensure components work well together
4. **Design for Extension**: Make code extensible for future needs
5. **Respect Separation of Concerns**: Modules should have a single purpose
6. **Use Events for Communication**: Systems should communicate via events
7. **Optimize Responsibly**: Balance performance with maintainability

## Directory Structure Reference

```
portfolio-engine/
├── app.js                 # Application bootstrap and initialization
├── config.js              # Global configuration and settings
├── index.html             # Main HTML entry point
│
├── engine/                # ECS architecture core
│   ├── ecs.js             # ECS main controller
│   ├── entity.js          # Entity implementation
│   └── system.js          # Base System class
│
├── modules/               # Reusable feature modules
│   ├── header/            # Header components
│   │   ├── header-base.js
│   │   └── header-extended.js
│   ├── about.js           # About section module
│   ├── contact.js         # Contact form module
│   ├── footer.js          # Footer module
│   ├── navigation.js      # Navigation menu module  
│   ├── projects.js        # Projects showcase module
│   ├── skills.js          # Skills visualization module
│   └── theme-selector.js  # Theme switching UI module
│
├── systems/               # System implementations
│   ├── NavSystem.js       # Navigation and routing system
│   ├── RenderSystem.js    # DOM rendering system
│   ├── RoutingSystem.js   # URL and route management
│   └── ThemeSystem.js     # Theme management system
│
├── styles/                # CSS styles
│   ├── base.css           # Core styles and layout
│   └── themes.css         # Theme definitions and variables
│
└── assets/                # Static assets
    └── images/            # Image resources
```

---

By following these documentation standards and development plans, we ensure that the Portfolio Engine remains maintainable, extensible, and well-documented throughout its development lifecycle.
