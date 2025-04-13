/**
 * @fileoverview Page System for ECS
 * 
 * Manages loading and rendering different pages based on the current route.
 */
import { System } from '../core/system.js';
import { cssLoader } from '../modules/css-loader.js'; // Add this import

/**
 * PageSystem - Handles page loading and rendering
 */
class PageSystem extends System {
  init(world, options = {}) {
    super.init(world);
    
    this.currentPage = null;
    this.currentPageEntity = null;
    this.container = document.getElementById('root');
    this.pageModules = new Map();
    this.isInitialized = false;
    this.cssLoader = cssLoader; // Store reference to CSS loader
    
    // Listen for hash changes to handle page navigation
    window.addEventListener('hashchange', this._handleRouteChange.bind(this));
    
    console.info('PageSystem: Initialized');
    return this;
  }
  
  /**
   * Start the page system and load initial page
   */
  start() {
    if (!this.isInitialized) {
      this._handleRouteChange();
      this.isInitialized = true;
    }
  }
  
  /**
   * Handle route changes when the hash changes
   * @private
   */
  _handleRouteChange() {
    // Get the current route from the URL hash
    let route = window.location.hash.substring(1); // Remove the # character
    
    // Default to home if no route specified
    if (!route) {
      route = 'home';
    }
    
    console.info(`PageSystem: Navigating to route "${route}"`);
    this.loadPage(route);
  }
  
  /**
   * Load a page by its route name
   * @param {string} route - The route name for the page to load
   */
  async loadPage(route) {
    try {
      // Clean up previous page if it exists
      if (this.currentPageEntity) {
        // Call unmount on the page module if it exists
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
          this.currentPage.unmount();
        }
        
        // Clean up the page entity
        this.world.destroyEntity(this.currentPageEntity);
        this.currentPageEntity = null;
        this.currentPage = null;
      }
      
      // Create a container for the new page
      if (!this.container) {
        this.container = document.getElementById('root');
        
        if (!this.container) {
          console.error('PageSystem: Root container not found');
          return;
        }
      }
      
      // Clear the container
      this.container.innerHTML = '';
      
      // Create a loading indicator
      const loadingElement = document.createElement('div');
      loadingElement.className = 'page-loading';
      loadingElement.textContent = `Loading ${route} page...`;
      this.container.appendChild(loadingElement);
      
      // Try to import the page module
      try {
        // Check if we already have the module loaded
        let pageModule = this.pageModules.get(route);
        
        if (!pageModule) {
          // Dynamically import the page module
          const module = await import(`/pages/${route}/${route}.js`);
          
          // Handle different export formats (class or object)
          if (module.default) {
            pageModule = module.default;
          } else if (module.HomePage) {
            // For pages exporting a class like HomePage
            pageModule = new module.HomePage(this.world.engine);
          } else {
            // Try to use whatever is exported
            const exportedItem = Object.values(module)[0];
            if (typeof exportedItem === 'function') {
              // It's likely a class constructor
              pageModule = new exportedItem(this.world.engine);
            } else {
              pageModule = exportedItem;
            }
          }
          
          // Store for future use
          this.pageModules.set(route, pageModule);
          
          // Automatically load corresponding CSS file
          const cssPath = `/pages/${route}/${route}.css`;
          await this.cssLoader.loadCSS(cssPath).catch(err => {
            console.warn(`CSS for page "${route}" not found or failed to load.`);
          });
        }
        
        // Create an entity for the page
        const pageEntityId = this.world.createEntity();
        
        // Create page container element
        const pageElement = document.createElement('div');
        pageElement.id = `page-${route}`;
        pageElement.className = 'page-container';
        
        // Remove loading indicator and add page element
        this.container.innerHTML = '';
        this.container.appendChild(pageElement);
        
        // Add necessary components
        this.world.addComponent(pageEntityId, 'page', {
          route: route,
          active: true
        });
        
        this.world.addComponent(pageEntityId, 'domElement', {
          element: pageElement,
          container: pageElement
        });
        
        // Initialize the page - pass world as parameter instead of setting ecs property
        if (typeof pageModule.init === 'function') {
          await pageModule.init({
            world: this.world,
            engine: this.world.engine,
            getComponent: (type) => this.world.getComponent(pageEntityId, type),
            addComponent: (type, data) => this.world.addComponent(pageEntityId, type, data)
          });
        }
        
        // Call mount if it exists
        if (typeof pageModule.mount === 'function') {
          pageModule.mount();
        }
        
        // Update references
        this.currentPageEntity = pageEntityId;
        this.currentPage = pageModule;
        
        console.info(`PageSystem: Loaded page "${route}"`);
        
        // Notify via event system
        if (this.world.getSystem('event')) {
          this.world.getSystem('event').emit('page:loaded', {
            route: route,
            entityId: pageEntityId
          });
        }
      } catch (error) {
        console.error(`PageSystem: Failed to load page "${route}":`, error);
        
        // Show error to user
        this.container.innerHTML = `
          <div class="page-error">
            <h2>Error Loading Page</h2>
            <p>Failed to load the "${route}" page.</p>
            <pre>${error.message}</pre>
          </div>
        `;
      }
    } catch (error) {
      console.error('PageSystem: Error in loadPage:', error);
    }
  }
  
  update() {
    // Nothing to do in the update loop for now
    // This system is primarily event-driven
  }
}

export { PageSystem };