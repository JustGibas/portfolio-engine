/**
 * @fileoverview Module Lifecycle System
 * 
 * This system manages the lifecycle of page modules including initialization,
 * mounting, unmounting, and caching.
 * 
 * @module ModuleLifecycleSystem
 * @requires cssLoader from ../css-loader.js
 * 
 * @design Observer Pattern - Notifies when module lifecycle states change
 */
import { cssLoader } from '../css-loader.js';
import { assetManager } from '../asset-manager.js';

const ModuleLifecycleSystem = {
  // Module cache
  _moduleCache: {},
  
  // Currently active module
  _activeModule: null,
  
  // Module event listeners
  _listeners: {
    mount: [],
    unmount: []
  },
  
  /**
   * Initialize the module lifecycle system
   */
  init() {
    console.info('ModuleLifecycleSystem: Initialized');
  },
  
  /**
   * Load a module by name
   * 
   * @param {string} moduleName - Name of the module to load
   * @param {Entity} entity - Entity to attach the module to
   * @returns {Promise<Object>} Promise that resolves to the module instance
   */
  async loadModule(moduleName, entity) {
    try {
      // Check cache first to avoid reloading modules
      if (this._moduleCache[moduleName]) {
        console.info(`ModuleLifecycleSystem: Module '${moduleName}' loaded from cache`);
        return this._createModuleInstance(this._moduleCache[moduleName], entity);
      }

      // Try multiple possible locations for the module
      let module;
      const possiblePaths = [
        // New directory structure - with subdirectories
        `../../pages/${moduleName}/${moduleName}.js`,
        // Legacy flat structure
        `../../pages/${moduleName}.js`, 
        // Other possible locations
        `./${moduleName}.js`,
        `./pages/${moduleName}.js`
      ];
      
      let successPath = null;
      for (const path of possiblePaths) {
        try {
          console.info(`ModuleLifecycleSystem: Trying to load module from: ${path}`);
          module = await import(path);
          console.info(`ModuleLifecycleSystem: Successfully loaded module from ${path}`);
          successPath = path;
          break; // Exit loop if import succeeds
        } catch (err) {
          console.warn(`ModuleLifecycleSystem: Failed to load from ${path}: ${err.message}`);
          // Continue to next path
        }
      }
      
      if (!module) {
        // If no module was loaded, create a fallback module
        console.warn(`ModuleLifecycleSystem: Could not load module '${moduleName}' from any location, using fallback`);
        module = { 
          [moduleName]: this._createFallbackModule(moduleName) 
        };
      }
      
      // Cache the module for future use
      this._moduleCache[moduleName] = module;
      
      // Load CSS based on the successful path, if found
      if (successPath) {
        this._loadModuleCSS(successPath, moduleName);
      }
      
      console.info(`ModuleLifecycleSystem: Module '${moduleName}' processing complete`);
      
      return this._createModuleInstance(module, entity);
    } catch (error) {
      console.error(`ModuleLifecycleSystem: Failed to load module '${moduleName}':`, error);
      
      // Create and return a fallback module instance
      const fallbackModule = { [moduleName]: this._createFallbackModule(moduleName) };
      this._moduleCache[moduleName] = fallbackModule;
      return this._createModuleInstance(fallbackModule, entity);
    }
  },
  
  /**
   * Load CSS for a module
   * @private
   * @param {string} jsPath - Path to the module's JS file
   * @param {string} moduleName - Name of the module
   */
  async _loadModuleCSS(jsPath, moduleName) {
    try {
      const cssPath = jsPath.replace(/\.js$/, '.css');
      await cssLoader.loadComponentCSS(cssPath).catch(() => {
        // Fall back to the standard directory structure
        return cssLoader.tryLoadCSS(`./pages/${moduleName}/${moduleName}`);
      });
    } catch (cssError) {
      console.warn(`ModuleLifecycleSystem: Could not load CSS for ${moduleName}:`, cssError.message);
    }
  },
  
  /**
   * Create a standardized module instance from a raw module
   * @private
   * @param {Object} module - The imported module
   * @param {Entity} entity - The entity to attach to
   * @returns {Object} Standardized module instance
   */
  _createModuleInstance(module, entity) {
    // Check which module format we're dealing with
    const moduleExport = module.default || module[Object.keys(module)[0]];
    
    if (!moduleExport) {
      throw new Error('Invalid module format: No export found');
    }
    
    // Create a standardized module instance
    const moduleInstance = {
      _originalModule: moduleExport,
      _entity: entity,
      
      /**
       * Initialize the module
       */
      init() {
        try {
          const container = entity?.getComponent('dom')?.container;
          
          if (!container) {
            throw new Error('Entity has no DOM container component');
          }
          
          // Handle different module initialization patterns
          if (typeof this._originalModule.init === 'function') {
            // Module has init function, check if it expects entity or container
            const paramCount = this._originalModule.init.length;
            
            if (paramCount === 1) {
              // Check if argument should be entity or container
              if (entity && this._originalModule.init.toString().includes('entity')) {
                this._originalModule.init(entity);
              } else {
                this._originalModule.init(container);
              }
            } else {
              // Call with no arguments and hope for the best
              this._originalModule.init();
            }
          } else if (typeof this._originalModule === 'function') {
            // Module itself is a function
            this._originalModule(container);
          } else {
            throw new Error('Incompatible module format - no init method');
          }
          
          return this;
        } catch (error) {
          console.error(`ModuleLifecycleSystem: Error initializing module: ${error.message}`);
          throw error;
        }
      },
      
      /**
       * Mount the module (make it visible and active)
       */
      mount() {
        // If the module has a mount method, call it
        if (typeof this._originalModule.mount === 'function') {
          this._originalModule.mount();
        }
        
        // Ensure the container is visible
        const container = entity?.getComponent('dom')?.container;
        if (container) {
          container.classList.remove('hidden');
        }
        
        // Set as active module
        ModuleLifecycleSystem._activeModule = this;
        
        // Notify listeners
        ModuleLifecycleSystem._notifyListeners('mount', {
          module: this,
          entity: entity
        });
        
        return this;
      },
      
      /**
       * Unmount the module (hide it)
       */
      unmount() {
        // If the module has an unmount method, call it
        if (typeof this._originalModule.unmount === 'function') {
          this._originalModule.unmount();
        }
        
        // Hide the container
        const container = entity?.getComponent('dom')?.container;
        if (container) {
          container.classList.add('hidden');
        }
        
        // Notify listeners
        ModuleLifecycleSystem._notifyListeners('unmount', {
          module: this,
          entity: entity
        });
        
        return this;
      }
    };
    
    return moduleInstance;
  },
  
  /**
   * Create a fallback module when loading fails
   * @private
   * @param {string} moduleName - Name of the failed module
   * @returns {Object} A simple fallback module
   */
  _createFallbackModule(moduleName) {
    return {
      content: {
        title: `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Page`,
        errorMessage: `Failed to load the ${moduleName} module. Please check your configuration.`
      },
      
      init(entityOrContainer) {
        let container;
        
        if (entityOrContainer.getComponent) {
          // It's an entity
          container = entityOrContainer.getComponent('dom')?.container;
        } else {
          // It's a container
          container = entityOrContainer;
        }
        
        if (container) {
          this.render(container);
        }
      },
      
      render(container) {
        container.innerHTML = `
          <div class="error-container">
            <h2>${this.content.title}</h2>
            <div class="error-message">
              <p>${this.content.errorMessage}</p>
              <p>This is a fallback page created automatically because the original module failed to load.</p>
            </div>
          </div>
        `;
      },
      
      mount() {
        console.log(`Fallback ${moduleName} module mounted`);
      },
      
      unmount() {
        console.log(`Fallback ${moduleName} module unmounted`);
      }
    };
  },
  
  /**
   * Switch to a new module
   * 
   * @param {string} moduleName - Name of the module to load
   * @param {Entity} entity - Entity to attach the module to
   * @returns {Promise<Object>} Promise that resolves to the new module instance
   */
  async switchToModule(moduleName, entity) {
    try {
      // Unmount current module if exists
      if (this._activeModule) {
        this._activeModule.unmount();
      }
      
      // Load and initialize new module
      const newModule = await this.loadModule(moduleName, entity);
      
      // Initialize and mount the new module
      return newModule.init().mount();
    } catch (error) {
      console.error(`ModuleLifecycleSystem: Error switching to module '${moduleName}':`, error);
      throw error;
    }
  },
  
  /**
   * Update the content of a module and re-render it
   * 
   * @param {string} moduleName - Name of the module to update
   * @param {Object} newContent - New content object to merge with existing content
   * @returns {Promise<Object>} Promise that resolves to the updated module export
   */
  async updateModuleContent(moduleName, newContent) {
    try {
      // First try to get the module from cache
      const moduleObj = this._moduleCache[moduleName];
      if (!moduleObj) {
        throw new Error(`Module '${moduleName}' is not loaded yet`);
      }
      
      const moduleExport = moduleObj.default || moduleObj[Object.keys(moduleObj)[0]];
      
      // Check if the module has a content property
      if (!moduleExport?.content) {
        throw new Error(`Module '${moduleName}' does not have a content property`);
      }
      
      // Merge the new content with the existing content
      Object.assign(moduleExport.content, newContent);
      
      // Re-render if this is the active module
      if (this._activeModule && this._activeModule._originalModule === moduleExport) {
        const container = this._activeModule._entity?.getComponent('dom')?.container;
        if (container && typeof moduleExport.render === 'function') {
          moduleExport.render(container);
        }
      }
      
      return moduleExport;
    } catch (error) {
      console.error(`ModuleLifecycleSystem: Failed to update module content for '${moduleName}':`, error);
      throw error;
    }
  },
  
  /**
   * Add a lifecycle event listener
   * 
   * @param {string} event - Event name ('mount' or 'unmount')
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event].push(callback);
    }
  },
  
  /**
   * Remove a lifecycle event listener
   * 
   * @param {string} event - Event name ('mount' or 'unmount')
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this._listeners[event]) {
      const index = this._listeners[event].indexOf(callback);
      if (index !== -1) {
        this._listeners[event].splice(index, 1);
      }
    }
  },
  
  /**
   * Notify all listeners of an event
   * @private
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  _notifyListeners(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`ModuleLifecycleSystem: Error in ${event} listener:`, error);
        }
      });
    }
  },
  
  /**
   * Get the currently active module
   * @returns {Object|null} The active module or null
   */
  getActiveModule() {
    return this._activeModule;
  },
  
  /**
   * Clear the module cache (useful for development/debugging)
   */
  clearCache() {
    this._moduleCache = {};
    console.info('ModuleLifecycleSystem: Module cache cleared');
  }
};

export { ModuleLifecycleSystem };
