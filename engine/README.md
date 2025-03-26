# Portfolio Engine Architecture

## Overview

The Portfolio Engine is built using the Entity-Component-System (ECS) architecture:
- **Entities:** Simple containers for components.
- **Components:** Pure data with no behavior.
- **Systems:** Encapsulate logic, operating on entities with specific components.

## Key Features and Recent Changes

- **Modular System Registry:**  
  All systems are aggregated in `engine/systems/index.js` for a single import point.

- **CSS Modularization:**  
  Global styles remain in `styles/base.css`. Component‐specific styling is maintained in separate files (for instance, `modules/header/header-base.css` and page-specific CSS files).

- **Directory Reorganization:**  
  Each page now resides in its own subdirectory with its styles and logic to ease maintenance.

- **Modular Asset Management:**
  Assets can now be located close to the components that use them, with project-specific assets
  stored directly in project folders. The asset manager supports configurable resolution priorities.

## Directory Structure and Responsibilities

The Portfolio Engine is structured around the Entity-Component-System (ECS) architecture, with clear separation of concerns between different parts of the system:

### Engine Directory (`/engine`)

The `engine/` directory contains the core ECS architecture and all system implementations:

- **ecs.js**: The main ECS controller that manages entities and systems
- **entity.js**: The Entity class that serves as a container for components
- **system.js**: Central entry point for all systems that defines the base System class and exports all system implementations
- **asset-manager.js**: Manages asset loading and resolution for both global and component-specific assets

#### Systems Subdirectory (`/engine/systems`)

The `engine/systems/` directory contains concrete system implementations:

- **EventSystem.js**: Centralized event management
- **EntityCreator.js**: Creates entities based on configuration
- **ModuleLoader.js**: Loads and initializes content modules

This organization puts all systems under the engine namespace, emphasizing that they are part of the core architecture.

## Relationship Between system.js and systems/ Directory

The relationship is now centralized:

1. `system.js` entry point for all other systems.
2. Files in `/engine/systems/` implement the concrete behavior

This organization provides several benefits:

- Single import point for all system functionality
- Clear hierarchy with systems as part of the engine

## ECS Architecture Flow

1. The ECS instance creates and stores entities
2. Entities are containers for components (data)
3. Systems are registered with the ECS
4. The ECS calls each system's update method on every frame
5. Systems query for entities with specific components
6. Systems operate on the matching entities' components

## How It Works

1. Create and store entities in ECS (see `engine/entity.js`).
2. Attach components (data) to entities.
3. Systems are registered (see `engine/systems/`) and continuously updated via the ECS.
4. Dynamic CSS loading is handled through `engine/css-loader.js` to support our modular approach.
5. Modular asset management is handled through `engine/asset-manager.js` to support both global and component-specific assets.

# Engine – Core ECS Implementation

This directory contains the core Entity-Component-System (ECS) architecture that powers the Portfolio Engine.

## Overview

The ECS pattern separates:
- **Entities:** Simple containers with unique IDs (implemented in `entity.js`)
- **Components:** Pure data attached to entities (no behavior)
- **Systems:** Logic that processes entities with specific components (base class in `system.js`)

## Key Files

- `ecs.js` - Main controller that manages entities and runs systems
- `entity.js` - Entity implementation with component management methods
- `system.js` - Base System class that concrete systems extend
- `css-loader.js` - Handles dynamic CSS module loading
- `asset-manager.js` - Manages and resolves asset paths
- `error-handler.js` - Centralized error handling and reporting

## Systems Directory

The `systems/` subdirectory contains concrete system implementations:

- `bootstrap.js` - Central registry that exports all system implementations
- `EntityCreator.js` - Creates entities based on configuration
- `EventSystem.js` - Manages application-wide events
- `LayoutInitializerSystem.js` - Sets up persistent UI components
- `ModuleLoader.js` - Handles dynamic loading of page modules
- `ModuleLifecycleSystem.js` - Manages module initialization and cleanup
- `ResourceDiscoverySystem.js` - Discovers available pages and projects

## Execution Flow

1. The `app.js` entry point creates an ECS instance
2. Systems are registered with the ECS controller
3. Core systems initialize (event system, entity creator, module loader)
4. The EntityCreator builds entities for UI sections
5. The ECS update loop begins, calling each system's update method
6. The ModuleLoader loads the appropriate module based on the route

## Usage Example

```javascript
// From app.js
import { ECS } from './engine/ecs.js';
import { eventSystem, EntityCreator, ModuleLoader } from './engine/systems/bootstrap.js';

// Create ECS instance
const ecs = new ECS();

// Register systems
ecs.registerSystem(new LayoutInitializerSystem());

// Initialize event system
eventSystem.init(config);

// Create entities
const entityCreator = new EntityCreator(ecs, config);
entityCreator.createAll();

// Start the ECS update loop
ecs.start();
```

See the [root README](../README.md) for overall project architecture details.
