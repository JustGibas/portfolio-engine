# Project Wildcards/Slides System Design

## Overview

The Project Wildcards/Slides system is a specialized feature of the Portfolio Engine that enables dynamic, interactive project showcases beyond traditional static cards. Each project can have its own unique presentation, behavior, and interactions while maintaining a consistent interface and integration with the overall system.

## Core Concepts

### Project Wildcard

A "wildcard" is an enhanced project representation that can:
- Render in multiple display modes (card, expanded, slide)
- Contain interactive elements or demos
- Implement custom behaviors and animations
- Support project-specific interactions
- Maintain its own internal state

### Slide System

The slide system provides:
- Full-screen presentation of projects
- Navigation between projects (next/previous)
- Transition effects and animations
- Keyboard navigation and gestures
- Optional auto-play functionality

## Architecture

The wildcards/slides system follows the same ECS architecture as the rest of the Portfolio Engine:

### Components

1. **ProjectComponent**:
   ```javascript
   {
     id: 'unique-project-id',
     title: 'Project Title',
     description: 'Project description...',
     technologies: ['Tech1', 'Tech2'],
     wildcardType: 'standard', // or 'interactive', 'webgl', 'demo', etc.
     wildcardConfig: {}, // Type-specific configuration
     media: [], // Images, videos, etc.
     links: [], // External links
     featured: false // Is this a featured project?
   }
   ```

2. **SlideComponent**:
   ```javascript
   {
     active: false, // Is this slide currently active?
     index: 0, // Position in slide sequence
     transitionIn: 'fade', // Transition effect when appearing
     transitionOut: 'fade', // Transition effect when leaving
     autoPlayDuration: null // For auto-advancing slides (null = no auto-play)
   }
   ```

### Systems

1. **ProjectSystem**:
   - Manages project entities
   - Loads appropriate wildcard implementations
   - Handles project filtering and sorting
   - Manages project card display modes

2. **SlideSystem**:
   - Controls slide navigation
   - Manages transitions between slides
   - Handles keyboard shortcuts and gestures
   - Controls slide mode activation/deactivation

### Wildcard Implementation

Each wildcard type will implement a standard interface:

```javascript
class ProjectWildcard {
  /**
   * Initialize the wildcard
   * @param {HTMLElement} container - DOM container for this wildcard
   * @param {Object} projectData - Data from the ProjectComponent
   */
  constructor(container, projectData) {
    this.container = container;
    this.data = projectData;
    this.state = { mode: 'card' }; // Internal state
  }

  /**
   * Render the wildcard in the specified mode
   * @param {string} mode - 'card', 'expanded', or 'slide'
   */
  render(mode) {
    this.state.mode = mode;
    // Implementation depends on wildcard type
  }

  /**
   * Handle interactions with the wildcard
   * @param {Event} event - DOM event
   */
  handleInteraction(event) {
    // Implementation depends on wildcard type
  }

  /**
   * Clean up resources before removal
   */
  cleanup() {
    // Remove event listeners
    // Release resources (e.g., WebGL contexts)
  }

  /**
   * Get metrics about this wildcard (for layout)
   */
  getMetrics() {
    return {
      height: /* calculated height */,
      expandedHeight: /* height when expanded */
    };
  }
}
```

## Wildcard Types

### 1. StandardProjectCard

Basic implementation with image, description, and links.

```javascript
class StandardProjectCard extends ProjectWildcard {
  render(mode) {
    if (mode === 'card') {
      this.container.innerHTML = `
        <div class="project-card">
          <div class="project-image">
            <img src="${this.data.media[0]}" alt="${this.data.title}">
          </div>
          <div class="project-content">
            <h3>${this.data.title}</h3>
            <p>${this.data.description}</p>
            <div class="project-tech">
              ${this.data.technologies.map(tech => 
                `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
            <a href="${this.data.links[0].url}" class="project-link">
              View Project
            </a>
          </div>
        </div>
      `;
    } else if (mode === 'expanded') {
      // Expanded view implementation
    } else if (mode === 'slide') {
      // Slide view implementation
    }
  }
}
```

### 2. InteractiveProjectCard

Includes interactive elements that respond to user input.

```javascript
class InteractiveProjectCard extends ProjectWildcard {
  constructor(container, projectData) {
    super(container, projectData);
    this.interactionState = {
      // State for interactive elements
    };
  }

  render(mode) {
    // Render interactive elements
    // Set up event listeners
  }

  handleInteraction(event) {
    // Handle user interactions
    // Update interactive elements
  }
}
```

### 3. WebGLProjectCard

Uses WebGL for 3D previews or effects.

```javascript
class WebGLProjectCard extends ProjectWildcard {
  constructor(container, projectData) {
    super(container, projectData);
    this.canvas = null;
    this.gl = null;
    this.scene = null;
    // WebGL setup
  }

  render(mode) {
    // Set up canvas
    // Initialize WebGL context
    // Create scene
    // Start render loop
  }

  cleanup() {
    // Dispose of WebGL resources
    cancelAnimationFrame(this.animationFrame);
    this.gl = null;
  }
}
```

### 4. DemoProjectCard

Embeds a running demo of the project.

```javascript
class DemoProjectCard extends ProjectWildcard {
  constructor(container, projectData) {
    super(container, projectData);
    this.demoIframe = null;
  }

  render(mode) {
    if (mode === 'card') {
      // Show preview image with play button
    } else if (mode === 'expanded' || mode === 'slide') {
      // Create iframe with demo
      this.demoIframe = document.createElement('iframe');
      this.demoIframe.src = this.data.wildcardConfig.demoUrl;
      this.container.appendChild(this.demoIframe);
    }
  }

  cleanup() {
    if (this.demoIframe) {
      this.demoIframe.remove();
      this.demoIframe = null;
    }
  }
}
```

## Slide Controller

The Slide Controller manages navigation between project slides:

```javascript
class SlideController {
  constructor(projects, container) {
    this.projects = projects; // Array of project entities
    this.container = container;
    this.currentIndex = 0;
    this.wildcards = []; // Array of instantiated wildcards
    
    // Set up navigation controls
    this.prevButton = document.createElement('button');
    this.prevButton.className = 'slide-nav prev';
    this.prevButton.addEventListener('click', () => this.prev());
    
    this.nextButton = document.createElement('button');
    this.nextButton.className = 'slide-nav next';
    this.nextButton.addEventListener('click', () => this.next());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'Escape') this.close();
    });
  }

  open(startIndex = 0) {
    this.container.classList.add('active');
    this.currentIndex = startIndex;
    this.showSlide(this.currentIndex);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  close() {
    this.container.classList.remove('active');
    document.body.style.overflow = '';
    this.cleanup();
  }

  next() {
    const newIndex = (this.currentIndex + 1) % this.projects.length;
    this.transitionToSlide(newIndex);
  }

  prev() {
    const newIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    this.transitionToSlide(newIndex);
  }

  showSlide(index) {
    // Create slide container
    const slideContainer = document.createElement('div');
    slideContainer.className = 'project-slide';
    this.container.appendChild(slideContainer);
    
    // Get project data
    const project = this.projects[index];
    const projectData = project.getComponent('project');
    
    // Create appropriate wildcard
    const WildcardClass = this.getWildcardClass(projectData.wildcardType);
    const wildcard = new WildcardClass(slideContainer, projectData);
    wildcard.render('slide');
    
    this.wildcards.push(wildcard);
  }

  transitionToSlide(newIndex) {
    // Handle transition animation
    // Remove old slide
    // Show new slide
    this.currentIndex = newIndex;
  }

  cleanup() {
    // Clean up wildcards
    this.wildcards.forEach(wildcard => wildcard.cleanup());
    this.wildcards = [];
    this.container.innerHTML = '';
  }

  getWildcardClass(type) {
    // Return appropriate wildcard class based on type
    const wildcardMap = {
      'standard': StandardProjectCard,
      'interactive': InteractiveProjectCard,
      'webgl': WebGLProjectCard,
      'demo': DemoProjectCard
    };
    return wildcardMap[type] || StandardProjectCard;
  }
}
```

## Integration with ECS

The project wildcards/slides system will be integrated with the ECS architecture:

```javascript
// Create slide system
class SlideSystem extends System {
  constructor() {
    super();
    this.slideController = null;
    this.slideContainer = null;
  }

  init(entities) {
    // Find entities with project components
    this.entities = entities.filter(entity => 
      entity.hasComponent('project')
    );
    
    // Create slide container
    this.slideContainer = document.createElement('div');
    this.slideContainer.className = 'slide-container';
    document.body.appendChild(this.slideContainer);
    
    // Initialize slide controller
    this.slideController = new SlideController(
      this.entities, 
      this.slideContainer
    );
    
    // Listen for slide activation events
    document.addEventListener('activateSlide', (event) => {
      const { projectId, index } = event.detail;
      const startIndex = projectId ? 
        this.findProjectIndex(projectId) : 
        (index || 0);
      this.slideController.open(startIndex);
    });
  }

  findProjectIndex(projectId) {
    for (let i = 0; i < this.entities.length; i++) {
      const projectData = this.entities[i].getComponent('project');
      if (projectData.id === projectId) return i;
    }
    return 0;
  }

  update() {
    // Any dynamic updates needed for slide system
  }
}
```

## CSS Example

```css
/* Base styles for project cards */
.project-card {
  /* ... existing styles ... */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Slide container */
.slide-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: none;
}

.slide-container.active {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Project slide */
.project-slide {
  width: 80%;
  height: 80%;
  position: relative;
}

/* Navigation buttons */
.slide-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.3s ease;
}

.slide-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.slide-nav.prev {
  left: 20px;
}

.slide-nav.next {
  right: 20px;
}

/* Close button */
.slide-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

/* Transitions */
.slide-transition-enter {
  opacity: 0;
  transform: translateX(50px);
}

.slide-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.3s, transform 0.3s;
}

.slide-transition-exit {
  opacity: 1;
  transform: translateX(0);
}

.slide-transition-exit-active {
  opacity: 0;
  transform: translateX(-50px);
  transition: opacity 0.3s, transform 0.3s;
}
```

## Implementation Plan

1. **Phase 1: Base Infrastructure**
   - Define component interfaces
   - Create basic wildcard implementations
   - Implement slide container and controller

2. **Phase 2: Standard Project Card**
   - Implement StandardProjectCard with all view modes
   - Create smooth transitions between modes
   - Implement project filtering and sorting

3. **Phase 3: Advanced Wildcards**
   - Implement InteractiveProjectCard
   - Implement WebGLProjectCard
   - Implement DemoProjectCard

4. **Phase 4: Slide System**
   - Implement slide navigation
   - Add keyboard shortcuts and gestures
   - Create transition effects
   - Add fullscreen and presentation modes

5. **Phase 5: Integration & Polish**
   - Connect with rest of the Portfolio Engine
   - Add responsive design adaptations
   - Optimize performance
   - Add accessibility features

## File Documentation Example

Here's an example of how a file in the project wildcards system should be documented:

```javascript
/**
 * @fileoverview Project Wildcard Base Class
 * 
 * This file defines the base class for all project wildcards. 
 * A wildcard is a dynamic, interactive representation of a project
 * that can be displayed in multiple modes (card, expanded, or slide).
 * 
 * The base class provides a common interface for all wildcard types
 * and handles basic functionality like rendering and interaction.
 * Specific wildcard types should extend this class and implement
 * their own specialized behavior.
 * 
 * @module ProjectWildcard
 * 
 * @design Implements the Template Method pattern, where the base class
 * defines the overall structure and subclasses implement specific steps.
 * 
 * @example
 * // Create a wildcard instance
 * const wildcard = new ProjectWildcard(container, projectData);
 * wildcard.render('card');
 */
```

By implementing this design, the Portfolio Engine will have a powerful, flexible system for showcasing projects in various interactive formats while maintaining a consistent, maintainable codebase.
