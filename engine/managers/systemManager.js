/**
 * =====================================================================
 * SystemManager.js - ECS System Management
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the SystemManager class which manages all system
 * registration, initialization, and organization in the ECS architecture.
 * 
 * It extends the base Manager class to maintain consistent interfaces
 * across all managers in the engine.
 */

import { Manager } from '../core/manager.js';
import { System } from '../core/system.js';
import { TaskManager } from './taskManager.js';


/**
 * SystemManager - Manages system registration and organization
 * @extends Manager
 */
class SystemManager extends Manager {
  /**
   * Create a new system manager
   * @param {Object} options - Manager options
   * @param {World} options.world - Reference to the world
   */
  constructor({ world }) {
    // Initialize the base Manager class
    super({ world });
    
    // SystemManager specific properties
    this.systems = new Map(); // name -> system info
    this.systemsByType = new Map(); // type -> systems[]
    
    // Create the task manager
    this.scheduler = new TaskManager({ world });
    
    // Make scheduler available to the world
    if (world) {
      world.scheduler = this.scheduler;
      world.systemRegistry = this;
    }
    
    console.log('SystemManager: Created');
  }
  
  /**
   * Initialize the SystemManager
   * @param {Object} [options={}] - Initialization options
   * @returns {SystemManager} This manager instance for chaining
   */
  init(options = {}) {
    // Call parent init
    super.init(options);
    
    console.log('SystemManager: Initialized');
    return this;
  }
  
  /**
   * Register a system with the manager
   * @param {Object} system - The system to register
   * @param {Object} [options={}] - Registration options
   * @param {string} [options.name] - System name
   * @param {string} [options.type] - System type/category
   * @param {string} [options.group] - Scheduler group
   * @param {number} [options.priority=0] - System priority
   * @param {Array<string>} [options.dependencies=[]] - System dependencies
   * @returns {SystemManager} This manager for chaining
   */
  registerSystem(system, options = {}) {
    const systemName = options.name || system.constructor.name;
    const systemType = options.type || 'core';
    
    // Store in systems map
    this.systems.set(systemName, {
      instance: system,
      name: systemName,
      type: systemType,
      group: options.group || null,
      priority: options.priority || 0,
      dependencies: options.dependencies || [],
      initialized: false
    });
    
    // Add to type grouping
    if (!this.systemsByType.has(systemType)) {
      this.systemsByType.set(systemType, new Set());
    }
    this.systemsByType.get(systemType).add(systemName);
    
    // Connect to world
    if (system.world !== this.world) {
      system.world = this.world;
    }
    
    return this;
  }
  
  /**
   * Initialize all registered systems
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   */
  async initializeSystems() {
    if (this.initialized) {
      console.warn('SystemManager: Systems already initialized');
      return;
    }
    
    // Determine initialization order by sorting systems by dependency
    const systemEntries = Array.from(this.systems.entries());
    
    // Set world's systems array directly - this makes them available in World.getSystem() etc.
    if (this.world && this.world.systems) {
      this.world.systems = systemEntries.map(([name, info]) => info.instance);
    }
    
    // First pass: Initialize systems without dependencies
    const initialPromises = [];
    
    for (const [name, systemInfo] of systemEntries) {
      const { instance, dependencies } = systemInfo;
      
      if (dependencies.length === 0) {
        const initPromise = (async () => {
          try {
            if (typeof instance.init === 'function') {
              await Promise.resolve(instance.init(this.world));
              systemInfo.initialized = true;
              console.info(`SystemManager: System "${name}" initialized successfully`);
            } else {
              // Mark as initialized even if it has no init method
              systemInfo.initialized = true;
            }
          } catch (error) {
            console.error(`SystemManager: Failed to initialize system "${name}":`, error);
            // Don't mark as initialized if it failed
          }
        })();
        
        initialPromises.push(initPromise);
      }
    }
    
    // Wait for all initial systems to initialize in parallel
    await Promise.all(initialPromises);
    
    // Make systems available directly in world object for convenience
    for (const [name, systemInfo] of systemEntries) {
      if (systemInfo.initialized && this.world) {
        const systemName = name.charAt(0).toLowerCase() + name.slice(1);
        if (!this.world[systemName]) {
          this.world[systemName] = systemInfo.instance;
        }
      }
    }
    
    // Second pass: Initialize systems with dependencies
    let remainingSystems = systemEntries.filter(([name, info]) => !info.initialized);
    let lastRemaining = remainingSystems.length;
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Prevent infinite loops
    
    while (remainingSystems.length > 0 && iterations < MAX_ITERATIONS) {
      const currentIterationPromises = [];
      
      for (const [name, systemInfo] of remainingSystems) {
        const { instance, dependencies } = systemInfo;
        
        const allDependenciesInitialized = dependencies.every(depName => {
          const depInfo = this.systems.get(depName);
          return depInfo && depInfo.initialized;
        });
        
        if (allDependenciesInitialized) {
          const initPromise = (async () => {
            try {
              if (typeof instance.init === 'function') {
                await Promise.resolve(instance.init(this.world));
                systemInfo.initialized = true;
                console.info(`SystemManager: System "${name}" initialized successfully`);
              } else {
                // Mark as initialized even if it has no init method
                systemInfo.initialized = true;
              }
            } catch (error) {
              console.error(`SystemManager: Failed to initialize system "${name}":`, error);
              // Don't mark as initialized if it failed
            }
          })();
          
          currentIterationPromises.push(initPromise);
        }
      }
      
      // Wait for all systems in this iteration to initialize
      await Promise.all(currentIterationPromises);
      
      remainingSystems = systemEntries.filter(([name, info]) => !info.initialized);
      
      // Check if we made progress
      if (remainingSystems.length === lastRemaining && currentIterationPromises.length === 0) {
        console.warn(`SystemManager: Dependency resolution stalled with ${remainingSystems.length} systems remaining`);
        // List the remaining systems and their dependencies for debugging
        console.warn('Remaining systems:', remainingSystems.map(([name, info]) => {
          return {
            name,
            dependencies: info.dependencies,
            missingDependencies: info.dependencies.filter(depName => {
              const depInfo = this.systems.get(depName);
              return !depInfo || !depInfo.initialized;
            })
          };
        }));
        break;
      }
      
      lastRemaining = remainingSystems.length;
      iterations++;
    }
    
    // Add systems to task manager
    for (const [name, systemInfo] of this.systems.entries()) {
      const { instance, group, priority, dependencies, initialized } = systemInfo;
      
      // Only add initialized systems to the task manager
      if (initialized) {
        this.scheduler.addTask(instance, {
          name,
          group: group || 'update',
          priority,
          dependencies,
          enabled: instance.enabled !== false
        });
      }
    }
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Reset the manager to its initial state
   * @returns {SystemManager} This manager instance for chaining
   */
  reset() {
    super.reset();
    
    // Tell all systems to reset if they support it
    for (const [name, systemInfo] of this.systems.entries()) {
      const { instance } = systemInfo;
      if (typeof instance.reset === 'function') {
        try {
          instance.reset();
        } catch (error) {
          console.error(`SystemManager: Error resetting system "${name}":`, error);
        }
      }
    }
    
    return this;
  }
  
  /**
   * Clear all systems and release resources
   * @returns {SystemManager} This manager instance for chaining
   */
  clear() {
    super.clear();
    
    this.systems.clear();
    this.systemsByType.clear();
    this.scheduler.clear();
    
    return this;
  }
  
  /**
   * Get a system by name
   * @param {string} name - System name
   * @returns {Object|null} The requested system or null if not found
   */
  getSystem(name) {
    const systemInfo = this.systems.get(name);
    return systemInfo ? systemInfo.instance : null;
  }
  
  /**
   * Get all systems of a specific type
   * @param {string} type - System type
   * @returns {Array} Array of system instances
   */
  getSystemsByType(type) {
    const systemNames = this.systemsByType.get(type);
    if (!systemNames) return [];
    
    return Array.from(systemNames)
      .map(name => this.getSystem(name))
      .filter(Boolean);
  }
  
  /**
   * Get all systems
   * @returns {Array} Array of system instances
   */
  getAllSystems() {
    return Array.from(this.systems.values()).map(info => info.instance);
  }
  
  /**
   * Remove a system
   * @param {string} name - System name
   * @returns {boolean} True if system was found and removed
   */
  removeSystem(name) {
    const systemInfo = this.systems.get(name);
    if (!systemInfo) return false;
    
    // Remove from type grouping
    if (this.systemsByType.has(systemInfo.type)) {
      this.systemsByType.get(systemInfo.type).delete(name);
    }
    
    // Remove from world.systems for backward compatibility
    if (this.world && this.world.systems) {
      const index = this.world.systems.indexOf(systemInfo.instance);
      if (index !== -1) {
        this.world.systems.splice(index, 1);
      }
    }
    
    // Call unmount if available
    if (typeof systemInfo.instance.unmount === 'function') {
      try {
        systemInfo.instance.unmount();
      } catch (error) {
        console.error(`SystemManager: Error unmounting system "${name}":`, error);
      }
    }
    
    // Remove from systems map
    this.systems.delete(name);
    
    return true;
  }
  
  /**
   * Mount a system (call its mount method)
   * @param {string} name - System name
   * @returns {boolean} True if system was found and mounted
   */
  mountSystem(name) {
    const systemInfo = this.systems.get(name);
    if (!systemInfo) return false;
    
    if (typeof systemInfo.instance.mount === 'function') {
      try {
        systemInfo.instance.mount();
        return true;
      } catch (error) {
        console.error(`SystemManager: Error mounting system "${name}":`, error);
      }
    }
    
    return false;
  }
  
  /**
   * Unmount a system (call its unmount method)
   * @param {string} name - System name
   * @returns {boolean} True if system was found and unmounted
   */
  unmountSystem(name) {
    const systemInfo = this.systems.get(name);
    if (!systemInfo) return false;
    
    if (typeof systemInfo.instance.unmount === 'function') {
      try {
        systemInfo.instance.unmount();
        return true;
      } catch (error) {
        console.error(`SystemManager: Error unmounting system "${name}":`, error);
      }
    }
    
    return false;
  }
  
  /**
   * Get the task manager
   * @returns {TaskManager} The task manager
   */
  getScheduler() {
    return this.scheduler;
  }
  
  /**
   * Enable or disable a system
   * @param {string} name - System name
   * @param {boolean} enabled - Whether to enable or disable
   * @returns {boolean} Success status
   */
  setSystemEnabled(name, enabled) {
    const systemInfo = this.systems.get(name);
    if (!systemInfo) return false;
    
    const instance = systemInfo.instance;
    if (typeof instance.enabled !== 'undefined') {
      instance.enabled = enabled;
      
      // Update the corresponding task in the task manager
      const task = this.scheduler.getTask(name);
      if (task) {
        if (enabled) {
          task.enable();
        } else {
          task.disable();
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Enable or disable a system group
   * @param {string} groupName - Group name
   * @param {boolean} enabled - Whether to enable or disable
   * @returns {boolean} Success status
   */
  setGroupEnabled(groupName, enabled) {
    // Use the task manager's group management
    return this.scheduler.setGroupEnabled(groupName, enabled);
  }
}

export { SystemManager };
