/**
 * @fileoverview Portfolio Engine Project Configuration
 * 
 * This file provides metadata about the Portfolio Engine project for
 * display on the projects page and project details.
 */

// Export project configuration 
export const projectConfig = {
  title: "Portfolio Engine",
  description: "A modular portfolio system built with Entity-Component-System architecture. Features include dynamic module loading, theming capabilities, and plugin-based components.",
  technologies: ["JavaScript", "ECS", "CSS Custom Properties", "Dynamic Imports"],
  image: "assets/images/portfolio_engine.jpg",
  link: "#projects/Portfolio_Engine",
  github: "https://github.com/username/portfolio-engine",
  features: [
    "Entity-Component-System architecture",
    "Dynamic module loading",
    "Theming with CSS custom properties",
    "Plugin-based components",
    "Error resilience with fallbacks"
  ],
  // Add readme content if no separate README.md exists
  readme: `
# Portfolio Engine

A modular portfolio system built with Entity-Component-System (ECS) architecture.

## Features

- **Entity-Component-System Architecture**: Clean separation of data and behavior for maximum flexibility
- **Dynamic Module Loading**: Lazy load components and pages as needed
- **Theming System**: Easily switch between multiple themes with CSS custom properties
- **Plugin-Based Components**: Extend UI components with plugins that follow standard interfaces
- **Error Resilience**: Comprehensive fallback strategies ensure the site works even when components fail

## Architecture

The Portfolio Engine uses a three-layer architecture:
1. **Application Layer**: Overall configuration and initialization
2. **Engine Layer**: Core ECS implementation and systems
3. **Modules Layer**: UI components and page handlers

## Technologies Used

- Pure JavaScript (no frameworks)
- CSS Custom Properties for theming
- Dynamic ES Modules for code splitting
- Custom ECS implementation for state management
`
};

export default projectConfig;
