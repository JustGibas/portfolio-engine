/**
 * @fileoverview Page Content Manager
 * 
 * Simplified module that focuses on content delivery and fallbacks.
 * Works with other systems to provide page content and handle errors.
 * 
 * # Portfolio Engine Module System

## Overview

The module system is the heart of Portfolio Engine's UI architecture. Modules are self-contained, reusable UI components that integrate with the ECS (Entity Component System) architecture. They encapsulate specific functionality while maintaining consistent interfaces for seamless integration.

## Core Principles

- **Reusability**: Modules can be used in multiple contexts without modification
- **Dynamic Integration**: Modules automatically update through the ECS
- **Encapsulation**: Each module handles its own state and rendering
- **Standardized Interfaces**: Consistent lifecycle methods across all modules

## Module Architecture

```ascii
┌──────────────────────────────────────────────────────────────┐
│                      Module Structure                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐   ┌─────────────┐   ┌────────────────┐    │
│   │              │   │             │   │                │    │
│   │  JavaScript  │◄──┼─ Interface ─┼──►│  DOM Element   │    │
│   │  Controller  │   │  Methods    │   │  (Rendering)   │    │
│   │              │   │             │   │                │    │
│   └──────┬───────┘   └─────────────┘   └────────────────┘    │
│          │                                     ▲             │
│          │                                     │             │
│          ▼                                     │             │
│   ┌──────────────┐                     ┌───────┴──────┐      │
│   │   Module     │                     │              │      │
│   │   State      │                     │  CSS Styles  │      │
│   └──────────────┘                     │              │      │
│                                        └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Focus on Page.js

The `page.js` module is the cornerstone of content rendering in Portfolio Engine. It manages the discovery, loading, and lifecycle of page content.

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                        page.js Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌───────────────┐    ┌─────────────────┐   │
│  │ Discover     │    │ Load/Switch   │    │ Mount/Unmount   │   │
│  │ Pages/Projects│───►│ Page Module   │───►│ Content         │   │
│  └──────────────┘    └───────────────┘    └─────────────────┘   │
│         │                                          │            │
│         ▼                                          ▼            │
│  ┌──────────────┐                        ┌─────────────────┐    │
│  │ Resource     │                        │ Update Content  │    │
│  │ Discovery    │                        │ & Re-render     │    │
│  └──────────────┘                        └─────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

 * 
 * @module page
 */
import config from '../../config.js';
import { cssLoader } from '../../engine/utils/css-loader.js';

/**
 * Page content manager - simplified to focus on content display and fallbacks
 */
const page = {
  /**
   * Initialize the page module
   * @param {Object} ecs - ECS instance
   * @returns {Promise<Object>} - This module instance
   */
  async init(ecs) {
    try {
      this.ecs = ecs;
      this.state = {
        activeModule: null,
        isLoading: false,
        deferredDiscoveryDone: false
      };
      
      await cssLoader.loadLocalCSS(import.meta.url);
      
      // Connect to essential systems
      this.resourceSystem = ecs.getSystem('resourceDiscovery');
      this.moduleSystem = ecs.getSystem('module');
      this.eventSystem = ecs.getSystem('event');
      
      // Setup event listeners
      this._setupEventListeners();
      
      console.info('Page content manager initialized');
      
      // Load initial page (defer other page loading)
      this._loadInitialPage();
      
      // Add listener for page updates (for DevTools toggle)
      document.addEventListener('pages:updated', async (event) => {
        if (event.detail?.pages) {
          // Update sections based on the new pages
          if (this.eventSystem) {
            // Notify systems of updated sections
            this.eventSystem.emit('sections:updated', {
              sections: event.detail.pages
            });
          }
        }
      });
      
      // Schedule deferred tasks after initial page load
      setTimeout(() => this._performDeferredDiscovery(), 2000);
      
      return this;
    } catch (error) {
      console.error('Failed to initialize page content manager:', error);
      return this._fallbackInit(ecs);
    }
  },
  
  /**
   * Perform deferred discovery for non-critical resources
   * @private
   */
  async _performDeferredDiscovery() {
    if (this.state.deferredDiscoveryDone) return;
    
    try {
      console.info("Page: Starting deferred resource discovery");
      
      // Only discover projects if not already in progress
      if (this.resourceSystem && !this.resourceSystem._discoveryPromises.projects) {
        // Don't await - let this run in background
        this.resourceSystem.discoverProjects().catch(err => {
          console.warn("Error in deferred project discovery:", err);
        });
      }
      
      this.state.deferredDiscoveryDone = true;
    } catch (error) {
      console.warn("Error in deferred discovery:", error);
    }
  },
  
  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    if (this.eventSystem) {
      this.eventSystem.on('route:change', data => this._handleRouteChange(data));
      this.eventSystem.on('content:update', data => this._updateContent(data));
      
      // Listen for hash changes directly as a fallback
      window.addEventListener('hashchange', () => {
        try {
          const hash = window.location.hash.slice(1);
          const route = hash.split('/')[0] || 'about'; // Get base route
          console.log(`Hash changed to: ${route}`);
          
          this._loadRouteContent(route);
        } catch (error) {
          console.error('Error handling hash change:', error);
          this._showError(`Navigation error: ${error.message}`);
        }
      });
    }
  },
  
  /**
   * Load content for a route by name
   * @param {string} route - Route to load
   * @private
   */
  async _loadRouteContent(route) {
    try {
      this._setLoading(true);
      
      // First try to find entity the standard way
      const entity = this._findRouteEntity(route);
      
      if (entity) {
        this._handleRouteChange({ route, entity });
        return;
      }
      
      console.info(`Page: No entity found for route "${route}", attempting to load it`);
      
      // If no entity exists, try lazy-loading the page
      if (this.resourceSystem && typeof this.resourceSystem.loadPage === 'function') {
        const pageData = await this.resourceSystem.loadPage(route);
        
        if (pageData) {
          // Try to find entity again after loading
          const newEntity = this._findRouteEntity(route);
          
          if (newEntity) {
            this._handleRouteChange({ route, entity: newEntity });
            return;
          }
        }
      }
      
      console.warn(`No entity found for route: ${route} after loading`);
      this._showPageNotFound(route);
    } catch (error) {
      console.error(`Error loading route ${route}:`, error);
      this._showError(`Navigation error: ${error.message}`);
    } finally {
      this._setLoading(false);
    }
  },
  
  /**
   * Discover available pages in the pages directory
   * @returns {Promise<Array>} Promise that resolves to the discovered sections
   */
  async discoverPages() {
    try {
      this._setLoading(true);
      
      // Use getPageMetadata first if available to avoid costly full discovery
      if (this.resourceSystem && typeof this.resourceSystem.getPageMetadata === 'function') {
        const pages = await this.resourceSystem.getPageMetadata();
        this._setLoading(false);
        return pages;
      }
      
      // Fall back to full page discovery
      const pages = await this.getSections();
      this._setLoading(false);
      return pages;
    } catch (error) {
      console.warn('Error discovering pages:', error);
      this._setLoading(false);
      return this._getDefaultSections();
    }
  },
  
  /**
   * Discover available projects in the projects directory
   * Only perform actual discovery when showing the projects page
   * @returns {Promise<Array>} Promise that resolves to the discovered projects
   */
  async discoverProjects() {
    try {
      this._setLoading(true);
      
      // Use getProjectMetadata first if available to return basic info quickly
      if (this.resourceSystem && typeof this.resourceSystem.getProjectMetadata === 'function') {
        const projects = this.resourceSystem.getProjectMetadata();
        
        // If we're going to display projects and they're not fully loaded yet,
        // trigger background loading of full project data
        if (!this.resourceSystem._lazyState.projectsFullyLoaded) {
          this.resourceSystem.discoverProjects().catch(err => {
            console.warn("Error discovering full project data:", err);
          });
        }
        
        this._setLoading(false);
        return projects;
      }
      
      // Fall back to full project discovery
      const projects = await this.getProjects();
      this._setLoading(false);
      return projects;
    } catch (error) {
      console.warn('Error discovering projects:', error);
      this._setLoading(false);
      return [];
    }
  },
  
  /**
   * Get current content sections
   * @returns {Promise<Array>} Discovered sections
   */
  async getSections() {
    try {
      if (!this.resourceSystem) {
        return this._getDefaultSections();
      }
      return this.resourceSystem.discoverPages();
    } catch (error) {
      console.warn('Error getting sections:', error);
      return this._getDefaultSections();
    }
  },
  
  /**
   * Get project listings
   * @returns {Promise<Array>} Discovered projects
   */
  async getProjects() {
    try {
      if (!this.resourceSystem) {
        return [];
      }
      return this.resourceSystem.discoverProjects();
    } catch (error) {
      console.warn('Error getting projects:', error);
      return [];
    }
  },
  
  /**
   * Display page content for the route
   * @param {string} route - Route path
   * @param {Object} entity - Target entity
   */
  async displayContent(route, entity) {
    try {
      this._setLoading(true);
      
      const moduleName = entity.getComponent('module')?.name || route;
      if (!moduleName) {
        return this._showError(`No module associated with route: ${route}`);
      }
      
      if (this.state.activeModule) {
        await this._unmountCurrentModule();
      }
      
      console.info(`Loading page module: ${moduleName}`);
      
      if (!this.moduleSystem) {
        return this._showError('Module system unavailable');
      }
      
      const moduleInstance = await this.moduleSystem.activateModuleForRoute(moduleName, entity.id);
      
      this.state.activeModule = {
        name: moduleName,
        instance: moduleInstance
      };
      
      this._setLoading(false);
    } catch (error) {
      console.error(`Failed to display content for ${route}: ${error.message}`);
      // Fallback: load DevTools page for debugging
      this._loadDevToolsFallback();
      this._setLoading(false);
    }
  },
  
  /**
   * Handle route changes
   * @param {Object} data - Route change data
   * @private
   */
  _handleRouteChange(data) {
    const { route } = data;
    console.info(`Page: Handling route change to "${route}".`);
    const entity = this._findRouteEntity(route);
    if (!entity) {
      console.error(`Page: No entity found for route "${route}". Falling back to 404.`);
      return this._showPageNotFound(route);
    }
    this.displayContent(route, entity);
  },
  
  /**
   * Load the initial page based on URL hash or default
   * @private
   */
  _loadInitialPage() {
    console.info('Loading initial page...');
    
    try {
      // Get current route from hash or use default
      let route = window.location.hash.slice(1) || config.defaults?.route || 'about';
      
      // If route contains additional parameters (like projects/details), get the base route
      route = route.split('/')[0];
      
      console.info(`Initial route: ${route}`);
      
      // Load just this route's content
      this._loadRouteContent(route);
    } catch (error) {
      console.error('Error loading initial page:', error);
      this._showError('Failed to load the initial page');
    }
  },
  
  /**
   * Find entity for route
   * @param {string} route - Route path
   * @returns {Object|null} Matching entity or null
   * @private
   */
  _findRouteEntity(route) {
    try {
      // Method 1: Try using System.getEntitiesWith if available
      if (this.ecs && typeof this.ecs.getEntitiesWith === 'function') {
        const entityIds = this.ecs.getEntitiesWith('dom');
        for (const entityId of entityIds) {
          const entity = this.ecs.entities.get(entityId);
          if (entity) {
            const dom = this.ecs.getComponent(entityId, 'dom');
            if (dom && dom.element && dom.element.getAttribute('data-route') === route) {
              console.info(`Page: Found entity via ECS for route "${route}".`);
              return entity;
            }
          }
        }
      }
      
      // Method 2: Try iterating through entities if they're available
      if (this.ecs && this.ecs.entities && typeof this.ecs.entities.values === 'function') {
        for (const entity of this.ecs.entities.values()) {
          if (entity.getComponent && typeof entity.getComponent === 'function') {
            const dom = entity.getComponent('dom');
            if (dom && dom.element && dom.element.getAttribute('data-route') === route) {
              console.info(`Page: Found entity via ECS for route "${route}".`);
              return entity;
            }
          }
        }
      }
      
      // Method 3: Direct DOM approach as final fallback
      console.info(`Page: Falling back to direct DOM selection for route "${route}".`);
      const element = document.querySelector(`[data-route="${route}"]`);
      if (element) {
        // Create a minimal entity-like object
        return {
          id: `dom-fallback-${route}`,
          getComponent: (name) => {
            if (name === 'dom') {
              return { 
                element, 
                container: element.querySelector('.section-container') 
              };
            }
            if (name === 'module') {
              return { name: route };
            }
            return null;
          },
          ecs: this.ecs
        };
      }
    } catch (error) {
      console.error(`Page: Error finding entity for route "${route}": ${error.message}`);
      
      // Last resort fallback - direct DOM approach
      const element = document.querySelector(`[data-route="${route}"]`);
      if (element) {
        return {
          id: `dom-fallback-${route}`,
          getComponent: (name) => {
            if (name === 'dom') {
              return { 
                element, 
                container: element.querySelector('.section-container') 
              };
            }
            if (name === 'module') {
              return { name: route };
            }
            return null;
          },
          ecs: this.ecs
        };
      }
    }
    
    return null;
  },
  
  /**
   * Update content for a module
   * @param {Object} data - Content update data
   * @private 
   */
  _updateContent(data) {
    try {
      const { moduleName, content } = data;
      if (!moduleName || !content || !this.moduleSystem) return;
      
      const module = this.moduleSystem.getModuleInstance(moduleName);
      if (!module) return;
      
      // Update content component
      const contentComponent = module.entity.getComponent('content') || 
                               module.entity.addComponent('content', {});
      
      Object.assign(contentComponent, content);
      
      // Re-render if possible
      if (typeof module.instance.render === 'function') {
        const container = module.entity.getComponent('dom')?.container;
        if (container) {
          module.instance.render(container);
        }
      }
    } catch (error) {
      console.warn('Failed to update content:', error);
    }
  },
  
  /**
   * Unmount the current module
   * @private
   */
  async _unmountCurrentModule() {
    try {
      if (!this.state.activeModule || !this.state.activeModule.instance) return;
      
      await this.moduleSystem.unmountModule(
        this.state.activeModule.instance.entity.id
      );
      
      this.state.activeModule = null;
    } catch (error) {
      console.warn('Error unmounting module:', error);
    }
  },
  
  /**
   * Fallback: Load DevTools page for debug purposes.
   * @private
   */
  _loadDevToolsFallback() {
    console.info('Falling back: Loading DevTools page for debugging.');
    window.location.hash = 'devtools';
  },
  
  /**
   * Show page not found
   * @param {string} route - Route that wasn't found
   * @private
   */
  _showPageNotFound(route) {
    console.warn(`Page not found: ${route}`);
    
    // Find 404 entity or fallback container
    const notFoundContainer = document.querySelector('#main') || document.body;
    
    notFoundContainer.innerHTML = `
      <div class="error-container">
        <h1>Page Not Found</h1>
        <p>Sorry, the page "${route}" could not be found.</p>
        <button onclick="window.location.hash = ''">Go Home</button>
      </div>
    `;
    
    // Notify via event system
    if (this.eventSystem) {
      this.eventSystem.emit('notification:show', {
        type: 'warning',
        message: `Page not found: ${route}`,
        duration: 5000
      });
    }
    
    this._setLoading(false);
  },
  
  /**
   * Show error message
   * @param {string} message - Error message
   * @private 
   */
  _showError(message) {
    console.error(`Page error: ${message}`);
    
    // Notify via event system
    if (this.eventSystem) {
      this.eventSystem.emit('notification:show', {
        type: 'error',
        message,
        duration: 5000
      });
    }
    
    this._setLoading(false);
  },
  
  /**
   * Get default sections when discovery fails
   * @returns {Array} Default sections
   * @private
   */
  _getDefaultSections() {
    return config.sections || [
      { id: 'about', title: 'About', route: 'about', module: 'about', showInNav: true },
      { id: 'projects', title: 'Projects', route: 'projects', module: 'projects', showInNav: true },
      { id: 'contact', title: 'Contact', route: 'contact', module: 'contact', showInNav: true }
    ];
  },
  
  /**
   * Set loading state
   * @param {boolean} isLoading - Whether content is loading
   * @private
   */
  _setLoading(isLoading) {
    this.state.isLoading = isLoading;
    
    // Update UI loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      if (isLoading) {
        loadingIndicator.classList.remove('hidden');
      } else {
        loadingIndicator.classList.add('hidden');
      }
    }
    
    // Emit event
    if (this.eventSystem) {
      this.eventSystem.emit('page:loading', { isLoading });
    }
  },
  
  /**
   * Fallback initialization if normal init fails
   * @param {Object} ecs - ECS instance
   * @returns {Object} - DevTools module or basic implementation
   * @private
   */
  async _fallbackInit(ecs) {
    try {
      // Try to load dev tools
      const devTools = await import('../../modules/dev-tools/dev-tools.js');
      if (devTools && typeof devTools.init === 'function') {
        await devTools.init(ecs);
        return devTools;
      }
    } catch (e) {
      console.error('Could not load dev tools fallback:', e);
    }
    
    return {
      init() {},
      mount() {},
      unmount() {}
    };
  }
};

export { page };