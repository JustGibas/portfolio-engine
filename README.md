# PORTFOLIO ENGINE – DEV GUIDE

## Overview

This project is not a traditional portfolio — it's a modular, game-inspired system that showcases the evolution of a creative technologist through dynamic scenes, real-time components, and intelligent, extendable logic.

The system is structured like a minimal game engine, using Entity-Component-System (ECS) architecture to support runtime modularity, extensibility, and visual/functional transitions — just like a game UI, but made for showcasing identity.

## Core Principles

- **Modularity**: Everything is a module — headers, project cards, scenes, logic systems.
- **Composability**: Modules can be extended or overridden. No code repetition.
- **Runtime Flexibility**: Swap and reload modules at runtime via panel or config.
- **ECS Architecture**: Behavior is separated from data. Systems run on component data.
- **Game-Like Experience**: Treat each page like a scene, each element like a game object.

## Key Concepts

### Entity

A unique element in the system (e.g., a Header, ProjectCard, ThemePanel, Scene). Each entity can hold multiple components.

### Component

A piece of data attached to an entity (e.g., theme, visibility, dom, config, animationState).

### System

A logic unit that operates on all entities with certain components (e.g., ThemeSystem, RenderSystem, SceneRouter).

## Directory Structure

```
portfolio/
├── index.html
├── app.js                 # Entry: bootstraps ECS & modules
├── config.js              # Runtime config / switches
│
├── engine/                # ECS core (extendable)
│   ├── ecs.js             # ECS lifecycle
│   ├── entity.js
│   ├── system.js
│
├── modules/               # App-level features
│   ├── header/
│   │   ├── header-base.js
│   │   └── header-extended.js
│   ├── footer.js
│   ├── projects.js
│   ├── about.js
│   └── contact.js
│
├── systems/               # Logic engines
│   ├── ThemeSystem.js
│   ├── RenderSystem.js
│   └── RoutingSystem.js
│
├── assets/
│   ├── images/
│   ├── shaders/
│   └── gifs/
│
├── styles/
│   ├── base.css
│   └── themes.css
│
└── README.md
```

## Development Notes

1. **Start Simple**

   - Load a base layout with one header and one project
   - Add ECS core + 1 system (ThemeSystem)
   - Inject DOM dynamically through dom component

2. **Add Scene Logic**

   - Treat routes like scenes: home, viewer, editor
   - Switch scenes by reinitializing scene-specific entities

3. **Implement Runtime Overrides**

   - Allow modules like header-extended to extend header-base
   - Override or append behavior without rewriting base

   ```javascript
   const headerExtended = {
     ...headerBase,
     init(container) {
       headerBase.init(container);
       container.innerHTML += `<button>Extra</button>`;
     }
   }
   ```

4. **Optional Advanced Systems**

   - WebGLRenderer: Inject GPU-powered visuals via canvas entity
   - AI Helper Agent: Logs module usage, helps with routing/debug
   - SettingsPanel: Floating dev panel to hot-switch modules

## Future Vision

This engine can evolve into:

- A platform for showcasing multiple identities or versions of yourself
- A base for procedural games or VR/AR installations
- A collaborative space for other creators to plug in their modules

## Reminders for Dev & AI Agents

- Follow ECS structure
- Keep state out of modules — systems control behavior
- Prefer extend over replace
- Keep modules pure (no global side effects)
- Write docstrings or comments for agent readability
- Only destroy what you initialized

## First Milestones

- [ ] Core ECS (Entity, Component, System, Engine)
- [ ] Register + load header-base and projects modules
- [ ] Theme system + switcher
- [ ] Scene transition logic
- [ ] Settings panel for hot module loading
