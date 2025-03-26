# Modules Directory

This directory contains reusable UI components that are used across the application.

## Directory Structure

```
modules/
│
├── footer/                 # Site footer implementation
│   ├── footer.js
│   └── footer.css
│
├── header/                 # Site header implementations
│   ├── header-base/        # Base header implementation
│   │   ├── header-base.js
│   │   └── header-base.css
│   ├── header-extended/    # Extended header with additional features
│   │   └── header-extended.js
│   └── submodules/         # Header subcomponents
│       ├── navigaton/      # Navigation menu
│       │   ├── navigation.js
│       │   └── navigation.css
│       └── theme-selector/ # Theme switching component
│           ├── theme-selector.js
│           └── theme-selector.css
│
└── page/                   # Page manager module
    └── page.js             # Handles page discovery and switching
```

## Module Design

Each module follows these principles:

1. **Self-contained**: Modules manage their own DOM, state, and events
2. **CSS encapsulation**: Each module has its own CSS file loaded dynamically
3. **Standard interface**: Modules implement a consistent API (init, render, mount, unmount)

## Key Modules

### Header Module

The header module is implemented as a composition of submodules:

- `header-base` - Core header structure and layout
- `navigation` - Site navigation menu that dispatches navigation events
- `theme-selector` - Theme switching controls

### Page Module

The page module (`page.js`) serves as a central manager for:

- Discovering available pages
- Loading page modules dynamically
- Managing page lifecycle events

## Usage Example

```javascript
// Initialize a module on an entity
import { headerBase } from './modules/header/header-base/header-base.js';
headerBase.init(headerEntity);
```

See individual module directories for detailed documentation.
