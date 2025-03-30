/**
 * @fileoverview Module System for ECS
 * 
 * Unified module management system - handles registration, loading, 
 * lifecycle, and dependency management.
 */
import { System } from '../core/system.js';
import { ErrorSystem } from './ErrorSystem.js';

// Component Types
const MODULE = 'module';
const MODULE_RESOURCE = 'moduleResource';
const MODULE_INSTANCE = 'moduleInstance';
const MODULE_DEPENDENCY = 'moduleDependency';

/**
 * Module System - Manages modules through ECS
 */
class ModuleSystem extends System {
  init(world, config) {
    super.init(world, config);
    
    this.modules = new Map(); // name -> entityId
    this.moduleCache = new Map(); // path -> { module, timestamp }
    this.moduleInstances = new Map(); // moduleEntityId -> moduleInstance
    this.dependencyGraph = new Map(); // moduleName -> Set(dependencyNames)
    
    // Cache configuration
    this._cacheMaxSize = 10;
    this._cacheTimeToLive = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Loading state
    this.isLoading = false;
    this.loadingTimer = null;
    this.loadingDelay = 200; // milliseconds
    this.loadingIndicator = document.getElementById('loading-indicator');
    
    // Current route state
    this.currentRoute = null;

    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const normalGroup = scheduler.getGroup('normal') || scheduler.createGroup('normal', 0);
      normalGroup.addSystem(this);
    }

    console.info('ModuleSystem: Initialized');
    
    // Add event listeners for navigation
    document.addEventListener('navigation', (event) => {
      this.handleRouteChange(event.detail.route);
    });
  }
  
  // Register a module definition
  registerModule(name, modulePath) {
    // Create module entity
    const moduleEntityId = this.world.createEntity();
    
    // Add module component
    this.world.addComponent(moduleEntityId, MODULE, {
      name,
      path: modulePath,
      state: 'registered',
      loaded: false
    });
    
    // Store mapping
    this.modules.set(name, moduleEntityId);
    
    // Add module resource to trigger loading
    this.world.addComponent(moduleEntityId, MODULE_RESOURCE, {
      type: 'module',
      url: modulePath,
      loaded: false
    });
    
    console.info(`ModuleSystem: Registered module "${name}"`);
    return moduleEntityId;
  }
  
  /**
   * Register a module with the system
   * @param {string} name - Module name
   * @param {Object} moduleObject - Module implementation
   * @returns {ModuleSystem} This instance for chaining
   */
  register(name, moduleObject) {
    // Create a module entity if it doesn't exist yet
    let entityId = this.modules.get(name);
    if (!entityId) {
      entityId = this.registerModule(name, null);
    }
    
    // Get the module component
    const moduleComponent = this.world.getComponent(entityId, MODULE);
    if (!moduleComponent) {
      throw new Error(`Failed to register module "${name}": Module component not found`);
    }
    
    // Set the module implementation
    moduleComponent.module = moduleObject;
    moduleComponent.loaded = true;
    moduleComponent.state = 'loaded';
    
    console.info(`ModuleSystem: Registered module "${name}" directly`);
    return this;
  }
  
  // Activate a module (create instance)
  activateModule(moduleNameOrEntityId, parentEntityId = null) {
    // Get module entity
    let moduleEntityId = moduleNameOrEntityId;
    if (typeof moduleNameOrEntityId === 'string') {
      moduleEntityId = this.modules.get(moduleNameOrEntityId);
      if (!moduleEntityId) {
        this._createError(`Module "${moduleNameOrEntityId}" not found`, 'MODULE_NOT_FOUND');
        return null;
      }
    }
    
    // Get module data
    const moduleComponent = this.world.getComponent(moduleEntityId, MODULE);
    if (!moduleComponent) {
      this._createError(`Entity ${moduleEntityId} is not a module`, 'INVALID_MODULE');
      return null;
    }
    
    // Check if module is loaded
    if (!moduleComponent.loaded) {
      this._createError(`Module "${moduleComponent.name}" is not loaded`, 'MODULE_NOT_LOADED');
      return null;
    }
    
    try {
      // Create instance entity
      const instanceEntityId = this.world.createEntity();
      
      // Link to module definition
      this.world.addComponent(instanceEntityId, MODULE_INSTANCE, {
        moduleEntityId,
        moduleName: moduleComponent.name,
        state: 'created',
        parent: parentEntityId
      });
      
      // Invoke module init if available
      if (moduleComponent.module && typeof moduleComponent.module.init === 'function') {
        const instance = moduleComponent.module.init(this.world, instanceEntityId);
        
        // Store any returned instance data
        if (instance) {
          const instanceComponent = this.world.getComponent(instanceEntityId, MODULE_INSTANCE);
          instanceComponent.instance = instance;
        }
      }
      
      return instanceEntityId;
    } catch (error) {
      this._createError(
        `Failed to activate module "${moduleComponent.name}": ${error.message}`, 
        'MODULE_ACTIVATION_ERROR'
      );
      return null;
    }
  }
  
  // Load a module if not already loaded
  async loadModule(moduleName) {
    // Check if we've already registered this module
    const moduleEntityId = this.modules.get(moduleName);
    
    if (moduleEntityId) {
      // Get the module component
      const moduleComponent = this.world.getComponent(moduleEntityId, MODULE);
      if (moduleComponent && moduleComponent.loaded && moduleComponent.module) {
        console.info(`ModuleSystem: Using already loaded module "${moduleName}"`);
        return moduleComponent.module;
      }
    }

    try {
      // Load module dynamically from the proper path
      const modulePath = `../../pages/${moduleName}/${moduleName}.js`;
      
      console.info(`Loading module from: ${modulePath}`);
      const moduleExport = await import(modulePath);
      
      // Access the exported module
      const moduleObj = moduleExport[moduleName] || moduleExport.default || moduleExport;
      
      // Register the module
      this.register(moduleName, moduleObj);
      
      return moduleObj;
    } catch (error) {
      // Handle loading errors
      console.error(`Failed to load module "${moduleName}": ${error.message}`);
      const errorData = {
        message: `Failed to load module "${moduleName}": ${error.message}`,
        code: 'MODULE_LOAD_ERROR',
        originalError: error
      };
      this._createError(errorData);
      
      // Use the fallback mechanism
      return this._loadFallbackModule(moduleName);
    }
  }
  
  // Fix the missing _loadFallbackModule method
  /**
   * Create a fallback module when loading fails
   * @param {string} moduleName - The name of the module
   * @returns {Object} A minimal fallback module
   * @private
   */
  _loadFallbackModule(moduleName) {
    console.info(`Using fallback for module "${moduleName}"`);
    
    // Create a minimal module structure
    const fallbackModule = {
      init: (entity) => {
        console.warn(`Using fallback implementation for module "${moduleName}"`);
        return {
          entity,
          render: (container) => {
            if (container) {
              container.innerHTML = `
                <div class="module-error">
                  <h2>Module Error</h2>
                  <p>The module "${moduleName}" failed to load correctly.</p>
                  <button onclick="window.location.hash = 'devtools'">Open DevTools</button>
                </div>
              `;
            }
          },
          mount: () => console.info(`Fallback ${moduleName}: Mounted`),
          unmount: () => console.info(`Fallback ${moduleName}: Unmounted`)
        };
      }
    };
    
    // Register the fallback module
    this.register(moduleName, fallbackModule);
    
    return fallbackModule;
  }
  
  update() {
    // Check for modules that need to be loaded
    for (const entityId of this.world.getEntitiesWith(MODULE, MODULE_RESOURCE)) {
      const module = this.world.getComponent(entityId, MODULE);
      const resource = this.world.getComponent(entityId, MODULE_RESOURCE);
      
      if (!module.loaded && !resource.loading && resource.url) {
        resource.loading = true;
        
        // Start loading - but only if the module name is a string
        // This prevents random module loading attempts
        if (typeof module.name === 'string' && module.name.length > 0) {
          this.loadModule(module.name).catch(error => {
            console.error(`ModuleSystem: Failed to load module: ${error.message}`);
          });
        } else {
          console.warn(`ModuleSystem: Skipping module with invalid name: ${module.name}`);
          resource.loading = false;
        }
      }
    }
    
    // Update module instances
    for (const entityId of this.world.getEntitiesWith(MODULE_INSTANCE)) {
      const instance = this.world.getComponent(entityId, MODULE_INSTANCE);
      
      if (instance.state === 'active' && instance.instance && typeof instance.instance.update === 'function') {
        try {
          instance.instance.update();
        } catch (error) {
          console.error(`ModuleSystem: Error in module update: ${error.message}`);
          
          // Create error entity
          this._createError(
            `Error in module "${instance.moduleName}": ${error.message}`,
            'MODULE_UPDATE_ERROR'
          );
          
          // Mark instance as having error
          instance.hasError = true;
        }
      }
    }
  }
  
  // Add dependency management
  addDependency(moduleName, dependencyName) {
    if (!this.dependencyGraph.has(moduleName)) {
      this.dependencyGraph.set(moduleName, new Set());
    }
    this.dependencyGraph.get(moduleName).add(dependencyName);
  }
  
  getDependencies(moduleName) {
    return Array.from(this.dependencyGraph.get(moduleName) || []);
  }
  
  // Add module lifecycle methods
  mountModule(instanceEntityId) {
    const instance = this.world.getComponent(instanceEntityId, MODULE_INSTANCE);
    if (!instance) return false;
    
    // Update state
    instance.state = 'active';
    
    // Call mount method if it exists
    if (instance.instance && typeof instance.instance.mount === 'function') {
      try {
        instance.instance.mount();
        return true;
      } catch (error) {
        this._createError(`Error mounting module "${instance.moduleName}": ${error.message}`, 
          'MODULE_MOUNT_ERROR');
        return false;
      }
    }
    
    return true;
  }
  
  unmountModule(instanceEntityId) {
    const instance = this.world.getComponent(instanceEntityId, MODULE_INSTANCE);
    if (!instance) return false;
    
    // Update state
    instance.state = 'inactive';
    
    // Call unmount method if it exists
    if (instance.instance && typeof instance.instance.unmount === 'function') {
      try {
        instance.instance.unmount();
        return true;
      } catch (error) {
        this._createError(`Error unmounting module "${instance.moduleName}": ${error.message}`, 
          'MODULE_UNMOUNT_ERROR');
        return false;
      }
    }
    
    return true;
  }
  
  _createError(message, code = 'MODULE_ERROR', context = 'module-loading', data = {}) {
    // Find ErrorSystem if available
    for (const system of this.world.systems) {
      if (system instanceof ErrorSystem) {
        const errorEntityId = system.createError(message, code, context, data);
        system.handleError(errorEntityId);
        return errorEntityId;
      }
    }
    
    // Fallback if no ErrorSystem
    console.error(`[${code}] ${message}`, data);
    return null;
  }
  
  _createFallbackModule(moduleName) {
    return {
      name: `${moduleName} (Fallback)`,
      init(world, entityId) {
        console.warn(`Using fallback for module "${moduleName}"`);
        return {
          update() {
            // No-op
          }
        };
      }
    };
  }
  
  /**
   * Handle route changes by loading the appropriate module
   * @param {string} route - The new route
   */
  handleRouteChange(route) {
    console.info(`ModuleSystem: Handling route change to "${route}"`);
    this.currentRoute = route;
    
    // Show loading indicator
    this.showLoading();
    
    // Find the section entity for this route
    const entities = this.world.entities;
    const targetEntity = Array.from(entities.values()).find(entity => 
      entity.componentMask.has('route') && 
      this.world.getComponent(entity.id, 'route').path === route
    );
    
    if (!targetEntity) {
      console.error(`ModuleSystem: No entity found for route "${route}"`);
      this.hideLoading();
      return;
    }
    
    // Get the module name from the entity
    const moduleComponent = this.world.getComponent(targetEntity.id, 'module');
    if (!moduleComponent || !moduleComponent.name) {
      console.error('ModuleSystem: Entity has no module component or name');
      this.hideLoading();
      return;
    }
    
    // Load the module
    this.activateModuleForRoute(moduleComponent.name, targetEntity.id);
  }
  
  /**
   * Activate a module for a specific route
   * @param {string} moduleName - The name of the module to load
   * @param {number} entityId - The entity ID to attach the module to
   */
  async activateModuleForRoute(moduleName, entityId) {
    // First check if we need to unmount current module
    await this.unmountCurrentActiveModule();
    
    try {
      // Check cache first
      const cacheKey = `${moduleName}-${entityId}`;
      let instanceEntityId = null;
      
      if (this.moduleCache.has(cacheKey)) {
        const cachedData = this.moduleCache.get(cacheKey);
        
        // Check if still valid
        if (Date.now() - cachedData.timestamp < this._cacheTimeToLive) {
          instanceEntityId = cachedData.instanceEntityId;
          
          // Mount the cached instance
          this.mountModule(instanceEntityId);
          
          // Update timestamp
          cachedData.timestamp = Date.now();
          
          console.info(`ModuleSystem: Retrieved module "${moduleName}" from cache`);
        } else {
          // Cache expired
          this.moduleCache.delete(cacheKey);
        }
      }
      
      // Load if not in cache or cache expired
      if (!instanceEntityId) {
        // Get or register the module entity
        let moduleEntityId = this.modules.get(moduleName);
        if (!moduleEntityId) {
          moduleEntityId = this.registerModule(moduleName, `./pages/${moduleName}/${moduleName}.js`);
        }
        
        // Load the module code
        await this.loadModule(moduleName);
        
        // Create an instance and attach to target entity
        instanceEntityId = this.activateModule(moduleEntityId, entityId);
        if (!instanceEntityId) {
          throw new Error(`Failed to activate module: ${moduleName}`);
        }
        
        // Mount the module
        this.mountModule(instanceEntityId);
        
        // Store in cache
        this.moduleCache.set(cacheKey, {
          instanceEntityId,
          timestamp: Date.now()
        });
        
        // Manage cache size
        if (this.moduleCache.size > this._cacheMaxSize) {
          this._pruneCache();
        }
      }
      
      // Update DOM state
      if (entityId) {
        const entity = this.world.entities.get(entityId);
        if (entity && entity.componentMask.has('dom')) {
          const domComponent = this.world.getComponent(entityId, 'dom');
          if (domComponent && domComponent.container) {
            domComponent.container.classList.remove('loading', 'error');
          }
        }
      }
      
      // Hide loading indicator
      this.hideLoading();
    } catch (error) {
      console.error(`ModuleSystem: Failed to load module "${moduleName}"`, error);
      
      // Show error in DOM
      if (entityId) {
        const entity = this.world.entities.get(entityId);
        if (entity && entity.componentMask.has('dom')) {
          const domComponent = this.world.getComponent(entityId, 'dom');
          if (domComponent && domComponent.container) {
            domComponent.container.classList.remove('loading');
            domComponent.container.classList.add('error');
          }
        }
      }
      
      // Create error entity
      this._createError(`Failed to load module "${moduleName}": ${error.message}`, 'MODULE_ROUTE_ERROR');
      
      // Hide loading indicator even on error
      this.hideLoading();
    }
  }
  
  /**
   * Unmount the currently active module
   */
  async unmountCurrentActiveModule() {
    // Find active module instances
    for (const entityId of this.world.getEntitiesWith(MODULE_INSTANCE)) {
      const instance = this.world.getComponent(entityId, MODULE_INSTANCE);
      if (instance && instance.state === 'active') {
        this.unmountModule(entityId);
      }
    }
  }
  
  /**
   * Prune the least recently used items from cache when it exceeds maximum size
   * @private
   */
  _pruneCache() {
    // Convert to array for sorting
    const cacheEntries = Array.from(this.moduleCache.entries());
    
    // Sort by timestamp (oldest first)
    cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries until we're at max size - 1 (making room for newest)
    while (cacheEntries.length > this._cacheMaxSize - 1) {
      const oldestKey = cacheEntries.shift()[0];
      this.moduleCache.delete(oldestKey);
      console.info(`ModuleSystem: Removed old module "${oldestKey}" from cache`);
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
   * Get the instance of a module by its name
   * @param {string} moduleName - The name of the module
   * @returns {Object|null} The module instance or null if not found
   */
  getModuleInstance(moduleName) {
    // Find the module entity first
    const moduleEntityId = this.modules.get(moduleName);
    if (!moduleEntityId) return null;
    
    // Find all instances of this module
    for (const entityId of this.world.getEntitiesWith(MODULE_INSTANCE)) {
      const instance = this.world.getComponent(entityId, MODULE_INSTANCE);
      if (instance && instance.moduleEntityId === moduleEntityId) {
        return {
          entity: this.world.entities.get(entityId),
          instance: instance.instance
        };
      }
    }
    
    return null;
  }
}

export { ModuleSystem, MODULE, MODULE_RESOURCE, MODULE_INSTANCE, MODULE_DEPENDENCY };
