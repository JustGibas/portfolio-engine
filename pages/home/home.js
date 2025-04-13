/**
 * @fileoverview Home page module that serves as the main landing page
 * and introduces visitors to the Portfolio Engine project.
 */
import { cssLoader } from '../../engine/modules/css-loader.js';

const homePage = {
  content: {
    title: "Portfolio Engine",
    subtitle: "A modular JS framework for creating interactive portfolio sites",
    description: "Welcome to my Portfolio Engine - a showcase of modern web architecture and component-based design",
    features: [
      {
        title: "Entity Component System",
        description: "Built on a flexible ECS architecture that separates data from behavior",
        icon: "🧩"
      },
      {
        title: "Modular Design",
        description: "Components and systems can be composed to create complex behaviors",
        icon: "🔧"
      },
      {
        title: "Custom Page System",
        description: "Easily create and navigate between different pages with animations",
        icon: "📄"
      },
      {
        title: "Theme Management",
        description: "Light, dark, and custom themes with dynamic switching",
        icon: "🎨"
      }
    ]
  },
  
  /**
   * Initialize the home page
   * @param {Object} entity - The entity representing this page
   * @returns {Object} - This module for chaining
   */
  async init(entity) {
    this.entity = entity;
    this.world = entity.world || window.portfolioEngine?.world;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
      console.info('Home page CSS loaded');
    } catch (error) {
      console.warn('Failed to load home page CSS:', error);
    }
    
    // Get the container from the entity or fallback to direct DOM query
    const container = entity.getComponent?.('domElement')?.container || 
                      entity.getComponent?.('dom')?.container ||
                      document.querySelector('.page-container');
    
    if (!container) {
      console.error('Home page: Container not found');
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
    
    container.innerHTML = `
      <div class="home-page">
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">${content.title}</h1>
            <p class="hero-subtitle">${content.subtitle}</p>
            <p class="hero-description">${content.description}</p>
            <div class="hero-cta">
              <a href="#engine-showcase" class="primary-button">Explore the Engine</a>
              <a href="#about" class="secondary-button">About the Developer</a>
            </div>
          </div>
          <div class="hero-illustration">
            <div class="code-block">
              <pre><code>// Portfolio Engine - Entity Component System
const world = new World();
const playerEntity = world.createEntity();

// Add components to the entity
world.addComponent(playerEntity, 'position', { x: 0, y: 0 });
world.addComponent(playerEntity, 'appearance', { 
  color: 'blue', 
  shape: 'circle' 
});

// Systems process entities automatically
world.start();</code></pre>
            </div>
          </div>
        </section>
        
        <section class="features-section">
          <h2 class="section-title">Key Features</h2>
          <div class="features-grid">
            ${content.features.map(feature => `
              <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3 class="feature-title">${feature.title}</h3>
                <p class="feature-description">${feature.description}</p>
              </div>
            `).join('')}
          </div>
        </section>
        
        <section class="portfolio-showcase">
          <h2 class="section-title">Portfolio Showcase</h2>
          <p class="section-description">This framework was created as a portfolio project to demonstrate my skills in system architecture, component design, and modern JavaScript development.</p>
          
          <div class="showcase-cards">
            <div class="showcase-card">
              <div class="card-header">
                <h3>System Architecture</h3>
              </div>
              <div class="card-body">
                <p>The Portfolio Engine demonstrates advanced architectural concepts including separation of concerns, modular design, and component-based development.</p>
                <a href="#engine-showcase" class="card-link">View Architecture →</a>
              </div>
            </div>
            
            <div class="showcase-card">
              <div class="card-header">
                <h3>Developer Projects</h3>
              </div>
              <div class="card-body">
                <p>Explore my other development projects showing expertise in various technologies, frameworks, and languages.</p>
                <a href="#projects" class="card-link">View Projects →</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
    
    // Set up any event listeners or additional behavior
    this._setupEventListeners();
  },
  
  /**
   * Set up event listeners for interactive elements
   * @private
   */
  _setupEventListeners() {
    // Example event listeners for interactive elements
    const exploreButton = document.querySelector('.primary-button');
    if (exploreButton) {
      exploreButton.addEventListener('click', (e) => {
        console.info('Explore button clicked, navigating to engine page');
      });
    }
  },
  
  /**
   * Called when the page is mounted/displayed
   */
  mount() {
    console.info('Home page mounted');
    
    // Add animation to hero section elements
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-cta');
    heroElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      // Staggered animation
      setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  },
  
  /**
   * Called when the page is unmounted/hidden
   */
  unmount() {
    console.info('Home page unmounted');
    // Clean up any resources or event listeners
  }
};

export default homePage;
