/**
 * =====================================================================
 * Task.js - Foundation for Executable Units
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the Task class hierarchy which forms the basis
 * for all executable units in the engine's task scheduling system.
 * 
 * Tasks represent discrete units of work that can be scheduled, prioritized,
 * depended upon, and executed by the engine's task scheduler.
 */

/**
 * Base Task class for all scheduled executable units
 */
class Task {
  /**
   * Create a new task
   * @param {Object} [options={}] - Task options
   */
  constructor(options = {}) {
    /**
     * Unique task identifier
     * @type {string}
     */
    this.id = options.id || crypto.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    /**
     * Task name for identification
     * @type {string}
     */
    this.name = options.name || 'Anonymous Task';
    
    /**
     * Execution priority (lower numbers run first)
     * @type {number}
     */
    this.priority = options.priority || 0;
    
    /**
     * Task dependencies by ID or name
     * @type {Array<string>}
     */
    this.dependencies = options.dependencies || [];
    
    /**
     * Whether the task is enabled
     * @type {boolean}
     */
    this.enabled = options.enabled !== false;
    
    /**
     * Group name for logical organization
     * @type {string}
     */
    this.group = options.group || 'default';
    
    /**
     * Task state
     * @type {string}
     */
    this.state = 'created';
    
    /**
     * Last execution time
     * @type {number}
     */
    this.lastExecuted = 0;
    
    /**
     * Last execution duration
     * @type {number}
     */
    this.executionTime = 0;
    
    /**
     * Execution error, if any
     * @type {Error|null}
     */
    this.error = null;
    
    /**
     * Additional tags for filtering
     * @type {Set<string>}
     */
    this.tags = new Set(options.tags || []);
  }

  /**
   * Execute the task
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @returns {Promise<boolean>} Success status
   */
  async execute(deltaTime) {
    if (!this.enabled) return false;
    
    const start = performance.now();
    this.state = 'executing';
    this.error = null;
    
    try {
      // Actual work happens in _perform, which subclasses override
      await this._perform(deltaTime);
      
      this.state = 'completed';
      this.lastExecuted = Date.now();
      this.executionTime = performance.now() - start;
      return true;
    } catch (error) {
      this.state = 'failed';
      this.error = error;
      this.executionTime = performance.now() - start;
      
      console.error(`Task '${this.name}' failed:`, error);
      return false;
    }
  }
  
  /**
   * Internal method to perform the actual task work
   * @param {number} deltaTime - Time elapsed since last frame
   * @protected
   */
  async _perform(deltaTime) {
    // Base implementation does nothing
    // Subclasses should override this method
  }
  
  /**
   * Reset the task state
   */
  reset() {
    this.state = 'created';
    this.error = null;
    this.executionTime = 0;
  }
  
  /**
   * Enable the task
   * @returns {Task} This task for chaining
   */
  enable() {
    this.enabled = true;
    return this;
  }
  
  /**
   * Disable the task
   * @returns {Task} This task for chaining
   */
  disable() {
    this.enabled = false;
    return this;
  }
  
  /**
   * Add a tag to the task
   * @param {string} tag - Tag to add
   * @returns {Task} This task for chaining
   */
  addTag(tag) {
    this.tags.add(tag);
    return this;
  }
  
  /**
   * Remove a tag from the task
   * @param {string} tag - Tag to remove
   * @returns {Task} This task for chaining
   */
  removeTag(tag) {
    this.tags.delete(tag);
    return this;
  }
  
  /**
   * Check if task has a specific tag
   * @param {string} tag - Tag to check
   * @returns {boolean} Whether the task has the tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }
}

/**
 * Task implementation for wrapping system update methods
 */
class SystemTask extends Task {
  /**
   * Create a new system task
   * @param {Object} system - The system to wrap
   * @param {Object} [options={}] - Task options
   */
  constructor(system, options = {}) {
    super({
      name: system.name || system.constructor?.name || 'Unknown System',
      ...options
    });
    
    /**
     * The wrapped system
     * @type {Object}
     */
    this.system = system;
  }
  
  /**
   * Perform the system update
   * @param {number} deltaTime - Time elapsed since last frame
   * @protected
   */
  async _perform(deltaTime) {
    // Skip if system is explicitly disabled
    if (this.system.enabled === false) return;
    
    if (typeof this.system.update === 'function') {
      // Support both synchronous and asynchronous update methods
      return await Promise.resolve(this.system.update(deltaTime));
    }
  }
  
  /**
   * Override the enable method to also enable the system
   * @returns {SystemTask} This task for chaining
   */
  enable() {
    super.enable();
    if (this.system && typeof this.system.enabled !== 'undefined') {
      this.system.enabled = true;
      
      // Call system's enable method if it exists
      if (typeof this.system.enable === 'function') {
        try {
          this.system.enable();
        } catch (error) {
          console.error(`Error enabling system '${this.name}':`, error);
        }
      }
    }
    return this;
  }
  
  /**
   * Override the disable method to also disable the system
   * @returns {SystemTask} This task for chaining
   */
  disable() {
    super.disable();
    if (this.system && typeof this.system.enabled !== 'undefined') {
      this.system.enabled = false;
      
      // Call system's disable method if it exists
      if (typeof this.system.disable === 'function') {
        try {
          this.system.disable();
        } catch (error) {
          console.error(`Error disabling system '${this.name}':`, error);
        }
      }
    }
    return this;
  }
}

export { Task, SystemTask };
