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

## Directory Structure and Responsibilities

The Portfolio Engine is structured around the Entity-Component-System (ECS) architecture, with clear separation of concerns between different parts of the system:

### Engine Directory (`/engine`)

The `engine/` directory contains the core ECS architecture and all system implementations:

- **ecs.js**: The main ECS controller that manages entities and systems
- **entity.js**: The Entity class that serves as a container for components
- **system.js**: Central entry point for all systems that defines the base System class and exports all system implementations

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
