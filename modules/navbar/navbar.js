/**
 * @fileoverview Navigation Bar Component
 * 
 * Renders a navigation menu from a list of sections.
 * 
 * FEATURES:
 * - Self-contained component that loads its own CSS
 * - Can work with or without ECS integration
 * - Automatically discovers pages via resource system if available
 * - Adds DevTools button in development mode
 * - Fully responsive design
 */
import config from '../../config.js';
import { cssLoader } from '../../engine/utils/css-loader.js';

/**
 * Navigation Bar Component
 * 
 * Renders navigation buttons and handles navigation events.
 * Can be used standalone or as part of the Header.
 */
class Navbar {
  constructor(options = {}) {
    this.options = Object.assign({
      container: null,
      ecs: null,
      sections: null
    }, options);
    
    this.container = this.options.container; // Must be provided
    this.ecs = this.options.ecs;
    
    // Get sections from options, config, or use defaults
    this.sections = this.options.sections || config.sections || [
      { id: 'about', title: 'About', route: 'about', showInNav: true },
      { id: 'projects', title: 'Projects', route: 'projects', showInNav: true },
      { id: 'contact', title: 'Contact', route: 'contact', showInNav: true }
    ];
    
    // Load component-specific CSS
    this._loadCSS();
  }
  
  async _loadCSS() {
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
      console.info('Navbar CSS loaded successfully');
    } catch (error) {
      console.warn('Could not load navbar CSS:', error);
    }
  }
  
  async init() {
    if (!this.container) {
      console.error('Navbar initialization failed: No container provided');
      return;
    }
    
    // Try to load section metadata from resource discovery if ECS is provided
    // Note: Now using getPageMetadata which is faster than full page discovery
    if (this.ecs && !this.options.sections) {
      try {
        const resourceSystem = this.ecs.getSystem('resourceDiscovery');
        if (resourceSystem) {
          // First check if we can get just metadata (faster)
          if (typeof resourceSystem.getPageMetadata === 'function') {
            console.info('Navbar: Getting page metadata from resource system');
            this.sections = await resourceSystem.getPageMetadata();
          }
          // Fall back to full discovery if needed
          else if (typeof resourceSystem.discoverPages === 'function') {
            console.info('Navbar: Discovering pages from resource system');
            this.sections = await resourceSystem.discoverPages();
          }
        }
      } catch (error) {
        console.warn('Failed to load sections from resource discovery:', error);
      }
    }
    
    this.render();
    
    // Register for section updates
    if (this.ecs && this.ecs.getSystem('event')) {
      const eventSystem = this.ecs.getSystem('event');
      eventSystem.on('sections:updated', data => {
        if (data.sections) {
          console.info('Navbar: Updating sections from event');
          this.sections = data.sections;
          this.render();
        }
      });
    }
    
    return this;
  }
  
  render() {
    if (!this.container) return;
    
    // Store rendered section IDs to avoid duplicates
    const renderedSections = new Set();
    
    let navHTML = '<ul class="navbar-list">';
    this.sections.forEach(section => {
      if (section.showInNav) {
        if (section.id.toLowerCase() === 'devtools' && renderedSections.has('devtools')) {
          return;
        }
        navHTML += `<li><button class="nav-btn${section.id.toLowerCase() === 'devtools' ? ' nav-btn-devtools' : ''}" 
                     data-route="${section.route}">${section.title}</button></li>`;
        renderedSections.add(section.id.toLowerCase());
      }
    });
    navHTML += '</ul>';
    this.container.innerHTML = navHTML;
    
    // Wire up click handlers for navigation buttons with detailed logging
    const buttons = this.container.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetRoute = btn.getAttribute('data-route');
        console.info(`Navbar: Navigating to route "${targetRoute}" via button press.`);
        window.location.hash = targetRoute;
      });
    });
    
    // If dev mode is enabled and DevTools button not rendered, add it
    const isDevMode = localStorage.getItem('devMode') === 'true' || 
                     (config.environment === 'development' && config.advanced?.debug);
    if ((isDevMode || config.environment === 'development') && !renderedSections.has('devtools')) {
      this._addDevToolsButton();
    }
  }
  
  /**
   * Add a DevTools button to the navbar if applicable
   * @private
   */
  _addDevToolsButton() {
    const existingDevTools = this.container.querySelector('.nav-btn-devtools');
    if (existingDevTools) return;
    
    const list = this.container.querySelector('.navbar-list');
    if (!list) return;
    
    const li = document.createElement('li');
    const devToolsBtn = document.createElement('button');
    devToolsBtn.className = 'nav-btn nav-btn-devtools';
    devToolsBtn.textContent = 'DevTools';
    devToolsBtn.setAttribute('data-route', 'devtools');
    
    devToolsBtn.addEventListener('click', () => {
      console.info('Navbar: DevTools button pressed. Navigating to devtools.');
      window.location.hash = 'devtools';
      if (window.DevTools) {
        window.DevTools.enable();
      }
    });
    
    li.appendChild(devToolsBtn);
    list.appendChild(li);
  }
}

export { Navbar };
