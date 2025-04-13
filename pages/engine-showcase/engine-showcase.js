/**
 * @fileoverview Engine Showcase page - Demonstrates Portfolio Engine architecture
 * and components through interactive examples and explanations.
 */
import { cssLoader } from '../../engine/modules/css-loader.js';

const engineShowcasePage = {
  /**
   * Content for the engine showcase page
   */
  content: {
    title: "Portfolio Engine Architecture",
    subtitle: "Explore the technical details behind this modular component-based system",
    sections: [
      {
        id: "overview",
        title: "System Overview",
        content: `
          <p>The Portfolio Engine is built on an Entity-Component-System (ECS) architecture, which separates data from behavior. This design creates a highly modular and extensible framework for building interactive web applications.</p>
          <p>Key principles of the engine include:</p>
          <ul>
            <li><strong>Separation of concerns</strong> - Data, logic, and rendering are kept separate</li>
            <li><strong>Component-based composition</strong> - Entities are composed of reusable components</li>
            <li><strong>Declarative systems</strong> - Systems operate on components in a predictable way</li>
            <li><strong>Event-driven communication</strong> - Loose coupling between engine parts</li>
          </ul>
        `,
        code: `
// The core architecture in pseudo-code
class World {
  entities = new Map();     // Store all entities
  components = new Map();   // Store component data by type and entity
  systems = new Array();    // Systems that process entities

  createEntity() { ... }    // Creates a new entity
  addComponent(entity, componentType, data) { ... }
  removeComponent(entity, componentType) { ... }
  getComponent(entity, componentType) { ... }
  registerSystem(system) { ... }
  update(deltaTime) { ... } // Run all systems
}`
      },
      {
        id: "entities",
        title: "Entities",
        content: `
          <p>Entities are lightweight objects that serve as containers for components. An entity is essentially just an ID that components can be attached to.</p>
          <p>In Portfolio Engine, entities can represent UI elements, pages, layout sections, or even abstract concepts like a timer or animation controller.</p>
        `,
        code: `
// Creating entities
import { World } from './engine/core/world.js';

const world = new World();

// Create a new entity - returns a unique ID
const playerEntity = world.createEntity();
const uiButtonEntity = world.createEntity();

// Entities can be destroyed when no longer needed
world.destroyEntity(uiButtonEntity);`
      },
      {
        id: "components",
        title: "Components",
        content: `
          <p>Components are pure data containers with no behavior. They describe one aspect of an entity, such as its position, appearance, or functionality.</p>
          <p>The Portfolio Engine includes built-in components like Position, Appearance, DOM Element, and others. You can also create custom components for specific needs.</p>
        `,
        code: `
// Adding components to entities
// Position component
world.addComponent(playerEntity, 'position', {
  x: 100,
  y: 200,
  z: 0
});

// Appearance component
world.addComponent(playerEntity, 'appearance', {
  color: 'blue',
  width: 50,
  height: 50,
  shape: 'circle'
});

// Custom component
world.addComponent(playerEntity, 'health', {
  current: 100,
  max: 100,
  regeneration: 1
});`
      },
      {
        id: "systems",
        title: "Systems",
        content: `
          <p>Systems contain all the logic and behavior in the engine. Each system is responsible for a specific aspect of functionality and operates on entities with specific components.</p>
          <p>For example, the RenderSystem processes all entities with both Position and Appearance components to draw them on screen.</p>
        `,
        code: `
// Basic System Structure
class RenderSystem extends System {
  constructor() {
    // Define which components this system needs
    super(['position', 'appearance', 'domElement']);
  }

  update(deltaTime) {
    // Get all entities that have the required components
    const entities = this.world.getEntitiesWithComponents(
      this.requiredComponents
    );

    // Process each entity
    entities.forEach(entity => {
      const position = this.world.getComponent(entity, 'position');
      const appearance = this.world.getComponent(entity, 'appearance');
      const dom = this.world.getComponent(entity, 'domElement');
      
      // Update the DOM element based on position and appearance
      dom.element.style.left = position.x + 'px';
      dom.element.style.top = position.y + 'px';
      dom.element.style.backgroundColor = appearance.color;
    });
  }
}`
      },
      {
        id: "events",
        title: "Event System",
        content: `
          <p>The Engine uses an event system to enable communication between components and systems without creating tight coupling.</p>
          <p>Events can be triggered by user actions, systems, or external inputs, and any part of the application can listen for and respond to these events.</p>
        `,
        code: `
// Event system usage
// Register an event listener
world.events.on('playerDamaged', (data) => {
  console.log(\`Player took \${data.amount} damage!\`);
  // Update UI or trigger other effects
});

// Trigger an event
world.events.emit('playerDamaged', {
  entity: playerEntity,
  amount: 25,
  source: 'enemy'
});`
      },
      {
        id: "page-system",
        title: "Page System",
        content: `
          <p>Portfolio Engine includes a specialized PageSystem that handles navigation between different pages of the application. It works by loading page modules dynamically and managing page lifecycle.</p>
          <p>Pages are implemented as modules with standard initialization and lifecycle methods, making it easy to add new pages to the application.</p>
        `,
        code: `
// Example page module
const homePage = {
  async init(entity) {
    // Set up the page
    this.entity = entity;
    this.world = entity.world;
    
    // Load CSS for this page
    await cssLoader.loadLocalCSS(import.meta.url);
    
    // Get container to render into
    const container = entity.getComponent('domElement').container;
    this.render(container);
    
    return this;
  },
  
  render(container) {
    container.innerHTML = \`
      <div class="home-page">
        <h1>Welcome to Portfolio Engine</h1>
        <p>A modular framework for building interactive websites</p>
      </div>
    \`;
  },
  
  // Lifecycle methods
  mount() {
    console.log('Home page mounted');
    // Add animations or initialize elements
  },
  
  unmount() {
    console.log('Home page unmounted');
    // Clean up resources
  }
};

export default homePage;`
      }
    ]
  },
  
  /**
   * Initialize the engine showcase page
   * @param {Object} entity - The entity representing this page
   * @returns {Object} - This module for chaining
   */
  async init(entity) {
    this.entity = entity;
    this.world = entity.world || window.portfolioEngine?.world;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
      console.info('Engine showcase page CSS loaded');
    } catch (error) {
      console.warn('Failed to load engine showcase page CSS:', error);
    }
    
    // Get the container from the entity or fallback to direct DOM query
    const container = entity.getComponent?.('domElement')?.container || 
                      entity.getComponent?.('dom')?.container ||
                      document.querySelector('.page-container');
    
    if (!container) {
      console.error('Engine showcase page: Container not found');
      return this;
    }
    
    // Render the page content
    this.render(container);
    
    return this;
  },
  
  /**
   * Render the page content to the container
   * @param {HTMLElement} container - The container to render into
   */
  render(container) {
    if (!container) return;
    
    const content = this.content;
    
    // Generate section HTML
    const sectionsHTML = content.sections.map(section => {
      return `
        <section id="${section.id}" class="content-section">
          <h2>${section.title}</h2>
          <div class="section-content">
            <div class="section-text">
              ${section.content}
            </div>
            <div class="code-example">
              <pre><code>${this._escapeHTML(section.code.trim())}</code></pre>
            </div>
          </div>
        </section>
      `;
    }).join('');
    
    // Create navigation buttons based on sections
    const navButtons = content.sections.map(section => {
      return `<button class="nav-button" data-target="${section.id}">${section.title}</button>`;
    }).join('');
    
    container.innerHTML = `
      <div class="engine-showcase">
        <header class="showcase-header">
          <h1 class="page-title">${content.title}</h1>
          <p class="page-intro">${content.subtitle}</p>
        </header>
        
        <nav class="showcase-nav">
          <div class="nav-container">
            ${navButtons}
          </div>
        </nav>
        
        <div class="showcase-sections">
          ${sectionsHTML}
        </div>
        
        <div class="demo-section">
          <h2>Interactive Demo</h2>
          <div class="demo-container">
            <div class="demo-card">
              <h3>Entity Creator</h3>
              <div class="demo-content">
                <button id="create-entity-btn" class="demo-btn">Create Entity</button>
                <button id="destroy-entity-btn" class="demo-btn">Destroy Entity</button>
                <div class="entity-container"></div>
              </div>
            </div>
            
            <div class="demo-card">
              <h3>Component Manager</h3>
              <div class="demo-content">
                <div class="component-controls">
                  <button id="add-position-btn" class="demo-btn">Add Position</button>
                  <button id="add-appearance-btn" class="demo-btn">Add Appearance</button>
                </div>
                <div class="component-display"></div>
              </div>
            </div>
            
            <div class="demo-card">
              <h3>System Demo</h3>
              <div class="demo-content">
                <button id="run-system-btn" class="demo-btn">Run System</button>
                <div class="system-log"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cta-section">
          <h2>Ready to build with Portfolio Engine?</h2>
          <p>Explore the full documentation and source code to learn more about using and extending this framework.</p>
          <div class="cta-buttons">
            <a href="#learn" class="cta-button">Documentation</a>
            <a href="https://github.com/yourusername/portfolio-engine" target="_blank" class="cta-button secondary">GitHub Repository</a>
          </div>
        </div>
      </div>
    `;
    
    // Set up event listeners
    this._setupEventListeners();
  },
  
  /**
   * Set up event listeners for interactive elements
   * @private
   */
  _setupEventListeners() {
    // Navigation button click handlers
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const targetSection = document.getElementById(targetId);
        
        // Highlight active button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Scroll to section
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
    // Demo functionality
    this._setupEntityDemo();
    this._setupComponentDemo();
    this._setupSystemDemo();
  },
  
  /**
   * Set up the entity creation demo
   * @private
   */
  _setupEntityDemo() {
    const createBtn = document.getElementById('create-entity-btn');
    const destroyBtn = document.getElementById('destroy-entity-btn');
    const container = document.querySelector('.entity-container');
    
    const entities = [];
    
    if (createBtn && container) {
      createBtn.addEventListener('click', () => {
        const entityId = Math.floor(Math.random() * 10000);
        entities.push(entityId);
        
        const entityEl = document.createElement('div');
        entityEl.className = 'entity-item';
        entityEl.dataset.entityId = entityId;
        entityEl.innerHTML = `
          <span class="entity-id">Entity #${entityId}</span>
          <span class="entity-components">No components</span>
        `;
        
        container.appendChild(entityEl);
      });
    }
    
    if (destroyBtn && container) {
      destroyBtn.addEventListener('click', () => {
        if (entities.length > 0) {
          const entityId = entities.pop();
          const entityEl = container.querySelector(`[data-entity-id="${entityId}"]`);
          if (entityEl) {
            entityEl.classList.add('entity-removing');
            setTimeout(() => {
              entityEl.remove();
            }, 300);
          }
        }
      });
    }
  },
  
  /**
   * Set up the component demo
   * @private
   */
  _setupComponentDemo() {
    const positionBtn = document.getElementById('add-position-btn');
    const appearanceBtn = document.getElementById('add-appearance-btn');
    const display = document.querySelector('.component-display');
    
    if (positionBtn && display) {
      positionBtn.addEventListener('click', () => {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        
        const componentEl = document.createElement('div');
        componentEl.className = 'component-item position';
        componentEl.innerHTML = `
          <h4>Position Component</h4>
          <pre>{ x: ${x}, y: ${y}, z: 0 }</pre>
        `;
        
        display.appendChild(componentEl);
      });
    }
    
    if (appearanceBtn && display) {
      appearanceBtn.addEventListener('click', () => {
        const colors = ['red', 'blue', 'green', 'purple', 'orange'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const componentEl = document.createElement('div');
        componentEl.className = 'component-item appearance';
        componentEl.innerHTML = `
          <h4>Appearance Component</h4>
          <pre>{ color: '${color}', size: 50 }</pre>
        `;
        
        display.appendChild(componentEl);
      });
    }
  },
  
  /**
   * Set up the system demo
   * @private
   */
  _setupSystemDemo() {
    const runBtn = document.getElementById('run-system-btn');
    const logContainer = document.querySelector('.system-log');
    
    if (runBtn && logContainer) {
      runBtn.addEventListener('click', () => {
        const systems = ['RenderSystem', 'PhysicsSystem', 'AnimationSystem', 'InputSystem'];
        const system = systems[Math.floor(Math.random() * systems.length)];
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
          <span class="log-time">[${timestamp}]</span>
          <span class="log-message">${system}: Processing entities...</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Add a follow-up message
        setTimeout(() => {
          const entities = Math.floor(Math.random() * 20) + 1;
          const followupEntry = document.createElement('div');
          followupEntry.className = 'log-entry';
          followupEntry.innerHTML = `
            <span class="log-time">[${timestamp}]</span>
            <span class="log-message">${system}: Processed ${entities} entities</span>
          `;
          
          logContainer.appendChild(followupEntry);
          logContainer.scrollTop = logContainer.scrollHeight;
        }, 500);
      });
    }
  },
  
  /**
   * Helper method to escape HTML in code examples
   * @private
   * @param {string} html - HTML string to escape
   * @returns {string} - Escaped HTML string
   */
  _escapeHTML(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  /**
   * Called when the page is mounted/displayed
   */
  mount() {
    console.info('Engine showcase page mounted');
    
    // Set the first navigation button as active
    const firstNavButton = document.querySelector('.nav-button');
    if (firstNavButton) {
      firstNavButton.classList.add('active');
    }
    
    // Add scroll animation to sections
    const sections = document.querySelectorAll('.content-section');
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });
      
      sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
      });
    }
  },
  
  /**
   * Called when the page is unmounted/hidden
   */
  unmount() {
    console.info('Engine showcase page unmounted');
    // Clean up any resources or event listeners
  }
};

export default engineShowcasePage;