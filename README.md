# PORTFOLIO ENGINE

A modular, component-based portfolio system built with the Entity-Component-System (ECS) architecture.

## Project Overview

- **Architecture:**  
  The project uses the ECS pattern for maximum separation of concerns. Entities are containers for components, and systems encapsulate logic.
  
- **Modular CSS:**  
  Global styles are now in `styles/base.css`, and all component-specific CSS is contained in individual files (e.g., `modules/header/header-base.css`, `pages/projects/projects.css`, etc.). This separation keeps styling maintainable and extensible.

- **Directory Structure:**  
  ```
  portfolio-engine/
  │
  ├── engine/                # Core ECS and system files
  │   ├── ecs.js
  │   ├── entity.js
  │   ├── system.js
  │   └── css-loader.js
  │
  ├── modules/               # Reusable UI modules (e.g., header, footer, page)
  │   ├── header/
  │   │   ├── header-base/
  │   │   │   └── header-base.js
  │   │   └── submodules/
  │   │       ├── navigaton/
  │   │       │   └── navigation.js
  │   │       └── theme-selector/
  │   │           └── theme-selector.js
  │   ├── footer/
  │   │   └── footer.js
  │   └── page/
  │       └── page.js
  │
  ├── pages/                 # Content pages
  │   ├── about/
  │   │   ├── about.js
  │   │   └── about.css
  │   ├── projects/
  │   │   ├── projects.js
  │   │   └── projects.css
  │   └── contact/
  │       ├── contact.js
  │       └── contact.css
  │
  ├── config.js              # Global configuration
  ├── themes.css             # Theme definitions (moved to root)
  ├── app.js                 # Application entry point
  └── index.html             # Main HTML file
  ```

## Development Roadmap

- **Documentation Update:**  
  This document details the new modular structure and ECS flow. Future iterations will include more details on system lifecycles, advanced settings, and project-specific documentation.
  
- **Modular System Enhancements:**  
  Continue to extract styling and logic into separate modules (for both CSS and JavaScript) for easier testing and maintenance.
  
- **Additional Features:**  
  Explore improvements in lazy loading, error handling in module loading and dynamic project discoveries.

## How to Contribute

1. Clone the repository.
2. Follow the updated documentation and modular approach.
3. Raise issues or propose changes via pull requests.

## File Documentation Standard

All files should include a header that explains:
1. Purpose of the file
2. Dependencies
3. Design patterns used
4. Usage examples

Example:
```javascript
/**
 * @fileoverview Brief description
 * @module ModuleName
 * @requires Dependencies
 * @design Design patterns used
 */
```
