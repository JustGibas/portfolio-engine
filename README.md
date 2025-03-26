# Portfolio Engine

A modular portfolio system built with Entity-Component-System (ECS) architecture.

## Project Overview

This project demonstrates a modern approach to building dynamic web applications:
- Separates data (Components) from behavior (Systems)
- Uses modular, lazy-loaded pages and components
- Implements a theme system with CSS variables
- Handles assets with flexible resolution priorities

## Development Guide

### Key Directories

- `/engine` - [Core ECS implementation](./engine/README.md) and systems
- `/modules` - [Reusable UI components](./modules/README.md) 
- `/pages` - [Content pages](./pages/README.md) and project data

### Development Workflow

1. **Understanding the codebase**: Start with directory READMEs to understand each area's responsibilities
2. **Adding a page**: Create a new folder under `/pages` with the page name
3. **Creating a component**: Add to `/modules` with proper CSS isolation
4. **System modifications**: Extend or modify systems in `/engine/systems`

### Key Systems

- **ECS Core** - `engine/ecs.js`, `engine/entity.js`, `engine/system.js`
- **Module Loading** - `engine/systems/ModuleLoader.js`
- **CSS Loading** - `engine/css-loader.js`
- **Asset Management** - `engine/asset-manager.js`
- **Event System** - `engine/systems/EventSystem.js`

### Configuration

The `config.js` file controls:
- Site information
- Theme settings
- Asset resolution priorities
- Default route

## Current Development Focus

### things JG plans to change
- [ ] theme picker update
        we want on phone to colapse to smaller footprint.
- [ ]
- [ ]
- [ ]

### things is development: DEV_PLAN.md
- [ ]
- [ ]
- [ ]
- [ ]

### AI suggestions
- [ ] 
- [ ] 
- [ ] Improving responsive design
- [ ] Enhanced accessibility features

See each directory's README.md for detailed implementation documentation.
