/**
 * @fileoverview Module Loader System
 * 
 * This system handles the dynamic loading of page modules based on routes.
 * It monitors route changes and loads the appropriate module for the current route,
 * attaching it to the corresponding entity.
 * 
 * @module ModuleLoader
 * @requires System from ../system.js
 * @requires page from ../../modules/page/page.js
 * 
 * @design Strategy Pattern - Different loading strategies based on module type
 */
import { System } from '../system.js';
import { page } from '../../modules/page/page.js';

/**
 * Module Loader System implementation
 */
class ModuleLoader extends System {
  /**
   * Create a new ModuleLoader system
   * @param {ECS} ecs - The ECS instance
   */
  constructor(ecs) {
    super();
    this.ecs = ecs;
    this.currentRoute = null;
    this.eventSystem = null;
    this.loadedModules = {};
    this.loadingIndicator = document.getElementById('loading-indicator');
    
    // Loading state tracking
    this.isLoading = false;
    this.loadingTimer = null;
    this.loadingDelay = 200; // Milliseconds to wait before showing loading indicator
  }
  
  /**
   * Initialize the module loader system
   * @param {Object} eventSystem - The event system instance
   * @param {string} initialRoute - The initial route to load
   */
  init(eventSystem, initialRoute) {
    console.info('ModuleLoader: Initializing with initial route', initialRoute);
    this.eventSystem = eventSystem;
    
    // Listen for navigation events
    document.addEventListener('navigation', (event) => {
      this.handleRouteChange(event.detail.route);
    });
    
    // Load initial module
    this.handleRouteChange(initialRoute);
  }
  
  /**
   * Handle route changes by loading the appropriate module
   * @param {string} route - The new route
   */
  handleRouteChange(route) {
    console.info(`ModuleLoader: Handling route change to "${route}"`);
    this.currentRoute = route;
    
    // Show loading indicator (with delay to prevent flashing for quick loads)
    this.showLoading();
    
    // Find the section entity for this route
    const entities = this.ecs.entities;
    const targetEntity = entities.find(entity => 
      entity.hasComponent('route') && 
      entity.getComponent('route').path === route
    );
    
    if (!targetEntity) {
      console.error(`ModuleLoader: No entity found for route "${route}"`);
      this.hideLoading();
      return;
    }
    
    // Get the module name from the entity
    const moduleName = targetEntity.getComponent('module')?.name;
    if (!moduleName) {
      console.error('ModuleLoader: Entity has no module component or name');
      this.hideLoading();
      return;
    }
    
    // Load the module
    this.loadModule(moduleName, targetEntity);
  }
  
  /**
   * Load a module and attach it to an entity
   * @param {string} moduleName - The name of the module to load
   * @param {Entity} entity - The entity to attach the module to
   */
  async loadModule(moduleName, entity) {
    console.info(`ModuleLoader: Loading module "${moduleName}" (looking in pages/${moduleName}/${moduleName}.js)`);
    
    try {
      // Add loading class to container for local loading indicators
      if (entity.hasComponent('dom')) {
        const container = entity.getComponent('dom').container;
        container.classList.add('loading');
        container.classList.remove('error');
      }
      
      // Use the page manager to load the module
      const pageInstance = await page.switchTo(moduleName, entity);
      console.info(`ModuleLoader: Successfully loaded module "${moduleName}"`);
      
      // Store the loaded module
      this.loadedModules[moduleName] = pageInstance;
      
      // Show success message
      if (entity.hasComponent('dom')) {
        const container = entity.getComponent('dom').container;
        container.classList.remove('loading', 'error');
      }
      
      // Hide loading indicator
      this.hideLoading();
    } catch (error) {
      console.error(`ModuleLoader: Failed to load module "${moduleName}" - Check both paths: pages/${moduleName}/${moduleName}.js and pages/${moduleName}.js`, error);
      
      // Show error message
      if (entity.hasComponent('dom')) {
        const container = entity.getComponent('dom').container;
        container.classList.remove('loading');
        container.classList.add('error');
      }
      
      // Hide loading indicator even on error
      this.hideLoading();
    }
  }
  
  /**
   * Show loading indicator with a delay to prevent flashing for quick loads
   * @private
   */
  showLoading() {
    // Clear any existing timer
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    
    // Set loading state
    this.isLoading = true;
    
    // Set a timer to show the indicator after a delay
    this.loadingTimer = setTimeout(() => {
      // Only show if still loading after the delay
      if (this.isLoading && this.loadingIndicator) {
        this.loadingIndicator.classList.remove('hidden');
      }
    }, this.loadingDelay);
  }
  
  /**
   * Hide loading indicator
   * @private
   */
  hideLoading() {
    // Clear any pending timer
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
    
    // Reset loading state
    this.isLoading = false;
    
    // Hide indicator
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
    }
  }
  
  /**
   * Update method called on each frame (not heavily used by this system)
   */
  update(entities) {
    // Most of the work is done in response to events
    // This update method could check for any modules that need refreshing
  }
}

export { ModuleLoader };
